const Produit = require('../models/produit.model');
const Ingredient = require('../models/ingredient.model');
const mongoose = require('mongoose');

// ─── HELPERS ────────────────────────────────────────────────────────────────

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const toObjectIdOrNull = (value) => {
  if (!value) return null;
  const str = String(value);
  return mongoose.Types.ObjectId.isValid(str) ? new mongoose.Types.ObjectId(str) : null;
};

const scoreBucket = (scoreBio) => {
  const s = Number(scoreBio);
  if (!Number.isFinite(s)) return 'Moyen';
  if (s >= 80) return 'Excellent';
  if (s >= 65) return 'Bon';
  if (s >= 50) return 'Moyen';
  return 'Mauvais';
};

const isAdditiveName = (name) => /^e\d{3,4}$/i.test(String(name || '').trim());

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b'];

const inferAdditiveSeverity = (codeRaw) => {
  const code = String(codeRaw || '').trim().toUpperCase();
  const high = new Set(['E621', 'E951', 'E250', 'E249', 'E128', 'E102']);
  const low = new Set(['E330', 'E300', 'E322', 'E460', 'E414']);
  if (high.has(code)) return 'Élevée';
  if (low.has(code)) return 'Faible';
  return 'Moyenne';
};

// ─── 1. DASHBOARD AGENT ─────────────────────────────────────────────────────

exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const agentObjectId = toObjectIdOrNull(agentId);
    if (!agentObjectId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const today = startOfToday();

    const totalProducts = await Produit.countDocuments({ status: 'approved' });
    const alerts = await Produit.countDocuments({ status: 'pending' });

    const scansToday = await Produit.countDocuments({
      validatedBy: agentObjectId,
      validatedAt: { $gte: today },
      status: 'approved',
    });

    const agentApproved = await Produit.find({
      validatedBy: agentObjectId,
      status: 'approved',
    })
      .select('nom scoreBio createdAt validatedAt ingredients')
      .populate({ path: 'ingredients', select: 'nom', options: { maxTimeMS: 8000 } })
      .sort({ validatedAt: -1 })
      .limit(50);

    const avgScoreRaw =
      agentApproved.length === 0
        ? 0
        : agentApproved.reduce((sum, p) => sum + Number(p.scoreBio || 0), 0) / agentApproved.length;
    const avgScore = Math.round(avgScoreRaw);

    const nutritionCounts = { Excellent: 0, Bon: 0, Moyen: 0, Mauvais: 0 };
    for (const p of agentApproved) {
      const bucket = scoreBucket(p.scoreBio);
      nutritionCounts[bucket] = (nutritionCounts[bucket] || 0) + 1;
    }

    const totalNutrition = Object.values(nutritionCounts).reduce((a, b) => a + b, 0) || 1;
    const nutritionData = [
      { name: 'Excellent', value: Math.round((nutritionCounts.Excellent / totalNutrition) * 100), color: '#10b981' },
      { name: 'Bon', value: Math.round((nutritionCounts.Bon / totalNutrition) * 100), color: '#3b82f6' },
      { name: 'Moyen', value: Math.round((nutritionCounts.Moyen / totalNutrition) * 100), color: '#f59e0b' },
      { name: 'Mauvais', value: Math.round((nutritionCounts.Mauvais / totalNutrition) * 100), color: '#ef4444' },
    ];

    const additiveCounts = new Map();
    for (const p of agentApproved) {
      const ings = Array.isArray(p.ingredients) ? p.ingredients : [];
      for (const ing of ings) {
        const n = ing?.nom || ing;
        if (!isAdditiveName(n)) continue;
        const key = String(n).trim().toUpperCase();
        additiveCounts.set(key, (additiveCounts.get(key) || 0) + 1);
      }
    }

    const additiveData = Array.from(additiveCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const activityRows = agentApproved.slice(0, 8).map((p) => ({
      product: p.nom,
      date: (p.validatedAt || p.createdAt || new Date()).toLocaleDateString('fr-FR'),
      score: Math.round(Number(p.scoreBio || 0)),
      status: Number(p.scoreBio || 0) >= 70 ? 'Validé' : 'À vérifier',
    }));

    return res.json({
      kpis: { totalProducts, scansToday, alerts, avgScore },
      nutritionData,
      additiveData,
      activityRows,
    });
  } catch (error) {
    console.error('❌ getAgentDashboard:', error);
    return res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

// ─── 2. ANALYSE IA ──────────────────────────────────────────────────────────

exports.getAgentAiAnalysis = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    const agentObjectId = toObjectIdOrNull(agentId);
    if (!agentObjectId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    // ── 1. FILE D'ATTENTE ──────────────────────────────────────────────────
    const mapLowRow = (p, isPending) => {
      const score = Number(p.scoreBio || 0);
      const confidence = isPending
        ? 15
        : Math.max(8, Math.min(48, Math.round(100 - score)));
      const d = p.validatedAt || p.updatedAt || p.createdAt || new Date();
      return {
        id: String(p._id),
        name: p.nom,
        category: p.risque || p.origine || '—',
        confidence,
        lastSeen: new Date(d).toLocaleString('fr-FR'),
        productStatus: p.status,
        scoreBio: score,
        ingredientsText: Array.isArray(p.ingredients) ? p.ingredients.map(i => i.nom).join(', ') : ''
      };
    };

    const [pending, lowApproved] = await Promise.all([
      Produit.find({ status: 'pending' })
        .populate('ingredients', 'nom')
        .sort({ updatedAt: -1 }).limit(30).lean(),
      Produit.find({ status: 'approved', scoreBio: { $lt: 55 }, validatedBy: agentObjectId })
        .populate('ingredients', 'nom')
        .sort({ validatedAt: -1 }).limit(30).lean(),
    ]);

    const seen = new Set();
    const lowConfidence = [];
    for (const row of [
      ...pending.map((p) => mapLowRow(p, true)),
      ...lowApproved.map((p) => mapLowRow(p, false)),
    ]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      lowConfidence.push(row);
      if (lowConfidence.length >= 25) break;
    }

    // ── 2. MÉTRIQUES ───────────────────────────────────────────────────────
    const agentApproved = await Produit.find({
      validatedBy: agentObjectId,
      status: 'approved',
    }).select('scoreBio').lean();

    const accuracy =
      agentApproved.length === 0
        ? 0
        : Math.round(
          agentApproved.reduce((sum, p) => sum + Number(p.scoreBio || 0), 0) /
          agentApproved.length
        );

    const approvedCount = await Produit.countDocuments({ status: 'approved' });
    const timings = [
      { name: 'Extraction', ms: Math.min(850, 95 + Math.round(approvedCount * 0.12)) },
      { name: 'Modèles', ms: Math.min(1400, 150 + Math.round(approvedCount * 0.20)) },
      { name: 'Synthèse', ms: Math.min(700, 75 + Math.round(approvedCount * 0.08)) },
    ];

    const categoryAgg = await Produit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: { $ifNull: ['$risque', 'Non renseigné'] }, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]);

    const categories = categoryAgg.length
      ? categoryAgg.map((c, i) => ({
        name: c._id || '—',
        value: c.value,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }))
      : [{ name: 'Aucune donnée', value: 1, color: '#94a3b8' }];

    // ── 3. DICTIONNAIRE ADDITIFS ───────────────────────────────────────────
    const ingredients = await Ingredient.find({ nom: { $regex: /^e\d{2,4}\b/i } })
      .select('nom description')
      .limit(400)
      .lean();

    const additives = ingredients.map((ing) => {
      const match = String(ing.nom || '').match(/^(e\d{2,4})\b/i);
      const code = (match ? match[1] : ing.nom).toUpperCase();
      const name = ing.description?.trim() || String(ing.nom).trim();
      return {
        _id: String(ing._id),
        code,
        name,
        severity: inferAdditiveSeverity(code),
      };
    });

    // ── 4. RÉPONSE ─────────────────────────────────────────────────────────
    return res.json({
      lowConfidence,
      metrics: { accuracy, timings, categories },
      additives,
    });
  } catch (error) {
    console.error('❌ getAgentAiAnalysis:', error);
    return res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};