import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertOctagon,
    BadgeCheck,
    BookOpen,
    CheckCircle2,
    FlaskConical,
    Gauge,
    Pencil,
    PieChart as PieChartIcon,
    Search,
    Sparkles,
    Timer,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, AuthExpiredError } from '../../utils/apiFetch';
import ResultatAnalyse from '../../components/Shared/ResultatAnalyse';
import './AiAnalysisTab.css';

const API = 'http://localhost:5000/api';

const cx = (...parts) => parts.filter(Boolean).join(' ');

// ─── UI DE BASE ──────────────────────────────────────────────────────────────

const Pill = ({ children, tone = 'slate' }) => (
    <span className={cx('aiPill', tone && `aiPill--${tone}`)}>{children}</span>
);

const Section = ({ title, subtitle, icon: Icon, right, children }) => (
    <section className="aiSection">
        <div className="aiSectionHead">
            <div className="aiSectionHeadInner">
                <div className="aiIconWrap"><Icon size={20} /></div>
                <div style={{ minWidth: 0 }}>
                    <h3 className="aiSectionTitle">{title}</h3>
                    {subtitle ? <p className="aiSectionSubtitle">{subtitle}</p> : null}
                </div>
            </div>
            {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
        </div>
        <div className="aiSectionBody">{children}</div>
    </section>
);

// ─── DÉTECTION LOCALE DES TAGS ───────────────────────────────────────────────

const detectTags = (rawText) => {
    const text = String(rawText || '').toLowerCase();
    const tags = [];
    const add = (key, label, tone) => { if (text.includes(key)) tags.push({ label, tone }); };
    add('gluten', 'Gluten', 'amber');
    add('lait', 'Lait', 'blue');
    add('arachide', 'Arachide', 'red');
    add('sucre', 'Sucre', 'amber');
    add('huile de palme', 'Huile de palme', 'red');
    add('émulsifiant', 'Émulsifiants', 'violet');
    add('conservateur', 'Conservateurs', 'violet');
    const eMatches = text.match(/\be\d{2,4}\b/gi) || [];
    const uniqueE = Array.from(new Set(eMatches.map((x) => x.toUpperCase()))).slice(0, 8);
    for (const code of uniqueE) tags.push({ label: `Additif ${code}`, tone: 'slate' });
    if (tags.length === 0 && text.trim()) tags.push({ label: 'Aucun tag évident', tone: 'slate' });
    return tags;
};

const predictionsToTags = (predictions) => {
    if (!predictions || typeof predictions !== 'object') return [];
    const out = [];
    const push = (label, tone = 'slate') => out.push({ label, tone });
    if (predictions.bioscore !== undefined) push(`Bio-score prédit : ${predictions.bioscore}`, 'green');
    if (predictions.cardio_risk != null) push(`Risque cardio : ${predictions.cardio_risk === 1 ? 'Élevé' : 'Faible'}${predictions.cardio_risk_proba != null ? ` (${predictions.cardio_risk_proba}%)` : ''}`, predictions.cardio_risk === 1 ? 'red' : 'blue');
    if (predictions.diabetes_risk != null) push(`Risque diabète : ${predictions.diabetes_risk === 1 ? 'Élevé' : 'Faible'}${predictions.diabetes_risk_proba != null ? ` (${predictions.diabetes_risk_proba}%)` : ''}`, predictions.diabetes_risk === 1 ? 'red' : 'amber');

    return out;
};

// ✅ Payload minimal — le backend/Python calcule TOUTES les features automatiquement
const buildMinimalPayload = (text) => ({
    ingredients_text: String(text || '').slice(0, 2000),
});

// ─── JAUGE SEMI-CIRCULAIRE ───────────────────────────────────────────────────

const SemiGauge = ({ value = 0, label = 'Accuracy' }) => {
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    const data = [{ name: 'value', value: v }, { name: 'rest', value: 100 - v }];
    const color = v >= 85 ? '#10b981' : v >= 70 ? '#f59e0b' : '#ef4444';
    return (
        <div className="aiGaugeWrap">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" startAngle={180} endAngle={0}
                        innerRadius="70%" outerRadius="95%" paddingAngle={2} stroke="transparent">
                        <Cell fill={color} />
                        <Cell fill="#cbd5e1" />
                    </Pie>
                    <Tooltip formatter={(x) => `${x}%`} />
                </PieChart>
            </ResponsiveContainer>
            <div className="aiGaugeCenter">
                <div>
                    <div className="aiGaugeVal">{v}%</div>
                    <div className="aiGaugeLbl">{label}</div>
                </div>
            </div>
        </div>
    );
};

// ─── SANDBOX ─────────────────────────────────────────────────────────────────

const IngredientLLMAnalyzer = ({
    ingredientQuery,
    setIngredientQuery,
    llmResult,
    setLlmResult,
    isLlmAnalyzing,
    setIsLlmAnalyzing,
    llmError,
    setLlmError
}) => {
    const [waitMsg, setWaitMsg] = useState('');

    useEffect(() => {
        let timer;
        if (isLlmAnalyzing) {
            timer = setTimeout(() => {
                setWaitMsg("Le modèle est actuellement très sollicité. Des tentatives automatiques sont en cours, merci de patienter...");
            }, 3000);
        } else {
            setWaitMsg('');
        }
        return () => clearTimeout(timer);
    }, [isLlmAnalyzing]);

    const onAnalyzeIngredientLLM = async () => {
        if (!ingredientQuery.trim()) return;
        setIsLlmAnalyzing(true);
        setLlmResult(null);
        setLlmError('');
        try {
            const query = ingredientQuery.trim();
            const ingList = query.split(',').map((s) => s.trim()).filter((s) => s);

            // ✅ Payload minimal — le backend calcule les features automatiquement
            const res = await apiFetch(`${API}/analyses/predict-ingredients-llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients_text: query,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);

            const predictions = data.predictions || {};
            const llmData = predictions.llm || null;

            const customProduct = {
                nom: "Analyse des ingrédients",
                description: `Ingrédients analysés : ${query}`,
                ingredients: ingList.map((nom) => ({ nom, estBio: false })),
                ai_predictions: {
                    ...predictions,
                    llm: llmData,
                },
                scoreBio: predictions.bioscore || 0,
                nova_group: predictions.nova_group || 1,
                image: null,
                origine: 'Analyse personnalisée',
                marque: 'BioScan AI',
            };

            setLlmResult(customProduct);
        } catch (err) {
            setLlmError(err.message || 'Échec analyse LLM');
        } finally {
            setIsLlmAnalyzing(false);
        }
    };

    return (
        <Section
            title="Analyse LLM Ingrédient "
            subtitle="Nom d'un ingrédient → analyse dynamique structurée (origine, NOVA, danger, recos ciblées)."
            icon={Sparkles}
            right={
                <button
                    type="button"
                    onClick={onAnalyzeIngredientLLM}
                    disabled={isLlmAnalyzing || !ingredientQuery.trim()}
                    className="aiBtn aiBtn--primary"
                >
                    <Sparkles size={16} />
                    {isLlmAnalyzing ? 'Analyse LLM…' : 'Analyser '}
                </button>
            }
        >
            {llmError && (
                <div className="aiError" style={{ marginBottom: 12 }}>
                    <span>Erreur LLM : {llmError}</span>
                    <button type="button" onClick={() => setLlmError('')}>Fermer</button>
                </div>
            )}
            {waitMsg && !llmError && isLlmAnalyzing && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #fde68a', display: 'flex', alignItems: 'center' }}>
                    <Timer size={16} style={{ marginRight: '8px' }} />
                    {waitMsg}
                </div>
            )}
            <div className="aiGrid2">
                <div className="aiPanel">
                    <label className="aiLabel" htmlFor="ingredient-llm">Nom ingrédient</label>
                    <input
                        id="ingredient-llm"
                        type="text"
                        value={ingredientQuery}
                        onChange={(e) => setIngredientQuery(e.target.value)}
                        className="aiInput"
                        placeholder="Ex: E621, glutamate monosodique, sucre, huile de palme..."
                    />
                </div>
                <div className="aiPanel aiPanel--light">
                    <span className="aiLabel" style={{ marginBottom: 0 }}>Résultat attendu</span>
                    {llmResult ? (
                        <div style={{ marginTop: '12px' }}>
                            <ResultatAnalyse product={llmResult} isIngredientSearch={true} />
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Tapez un ingrédient et cliquez "Analyser"
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
};

const Sandbox = () => {
    const [rawIngredients, setRawIngredients] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [tags, setTags] = useState([]);
    const [sandboxError, setSandboxError] = useState('');

    const [sandboxResult, setSandboxResult] = useState(null);

    const onAnalyze = async () => {
        if (!rawIngredients.trim()) return;
        setIsAnalyzing(true);
        setTags([]);
        setSandboxError('');
        setSandboxResult(null);
        try {
            const query = rawIngredients.trim();
            const ingList = query.split(',').map((s) => s.trim()).filter((s) => s);

            // ✅ Même API ML que Home : POST /api/analyses/predict (sans LLM)
            const res = await apiFetch(`${API}/analyses/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients_text: query,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);

            const predictions = data.predictions || {};

            // Build tags from model + local detection
            const fromModel = predictionsToTags(predictions);
            const fromText = detectTags(rawIngredients);
            const seen = new Set();
            const uniq = [];
            for (const t of [...fromModel, ...fromText]) {
                if (seen.has(t.label)) continue;
                seen.add(t.label);
                uniq.push(t);
            }
            setTags(uniq.slice(0, 24));

            // Build customProduct for ResultatAnalyse display
            const customProduct = {
                nom: "Analyse des ingrédients",
                description: `Ingrédients analysés : ${query}`,
                ingredients: ingList.map((nom) => ({ nom, estBio: false })),
                ai_predictions: predictions,
                scoreBio: predictions.bioscore || 0,
                nova_group: predictions.nova_group || 1,
                image: null,
                origine: 'Analyse personnalisée',
                marque: 'BioScan AI',
            };
            setSandboxResult(customProduct);
        } catch (err) {
            setSandboxError(err.message || 'Échec de la prédiction');
            setTags(detectTags(rawIngredients));
        } finally {
            setIsAnalyzing(false);
        }
    };



    return (
        <Section
            title="Laboratoire de Test "
            subtitle="Collez des ingrédients bruts : appel du modèle /api/analyses/predict + tags locaux."
            icon={FlaskConical}
            right={
                <button type="button" onClick={onAnalyze}
                    disabled={isAnalyzing || !rawIngredients.trim()}
                    className="aiBtn aiBtn--primary">
                    <Sparkles size={16} />
                    {isAnalyzing ? 'Analyse…' : "Analyser"}
                </button>
            }
        >
            {sandboxError && (
                <div className="aiError" style={{ marginBottom: 12 }}>
                    <span>Erreur sandbox : {sandboxError}</span>
                    <button type="button" onClick={() => setSandboxError('')}>Fermer</button>
                </div>
            )}
            <div className="aiGrid2">
                <div className="aiPanel">
                    <label className="aiLabel" htmlFor="ai-ingredients">Ingrédients bruts</label>
                    <textarea
                        id="ai-ingredients"
                        value={rawIngredients}
                        onChange={(e) => setRawIngredients(e.target.value)}
                        className="aiTextarea"
                        placeholder="Ex: eau, sucre, jus de citron, E330, arômes naturels, émulsifiant..."
                    />
                    <div className="aiHint">
                        <Pill tone="blue">Pipeline Python</Pill>
                        <span>Les tags combinent la sortie du modèle et une détection locale.</span>
                    </div>
                </div>
                <div className="aiPanel aiPanel--light">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span className="aiLabel" style={{ marginBottom: 0 }}>Prévisualisation des tags</span>
                        {tags.length ? <Pill tone="green">{tags.length} tag(s)</Pill> : <Pill tone="slate">—</Pill>}
                    </div>
                    <div className="aiPreview">
                        {isAnalyzing ? (
                            <div className="aiLoading"><span className="aiDot" />Détection en cours…</div>
                        ) : tags.length ? (
                            <div className="aiTagRow">
                                {tags.map((t, idx) => (
                                    <Pill key={`${t.label}-${idx}`} tone={t.tone}>{t.label}</Pill>
                                ))}
                            </div>
                        ) : (
                            <span>Lancez une analyse pour afficher les tags.</span>
                        )}
                    </div>
                </div>
            </div>
            {sandboxResult && (
                <div style={{ marginTop: '20px' }}>
                    <ResultatAnalyse product={sandboxResult} isIngredientSearch={true} />
                </div>
            )}
        </Section>
    );
};

// ─── FILE D'ATTENTE CONFIANCE FAIBLE ─────────────────────────────────────────

const QueueRow = ({ r, onCorrect, onValidate, onReject, busyId }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [tags, setTags] = useState(null);

    const handleAnalyze = async () => {
        if (tags) { setTags(null); return; } // Toggle off
        const text = r.ingredientsText || r.name;
        setIsAnalyzing(true);
        try {
            // ✅ Payload minimal — le backend calcule les features
            const res = await apiFetch(`${API}/analyses/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildMinimalPayload(text)),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);

            const fromModel = predictionsToTags(data.predictions);
            const fromText = detectTags(text);
            const seen = new Set();
            const uniq = [];
            for (const t of [...fromModel, ...fromText]) {
                if (seen.has(t.label)) continue;
                seen.add(t.label);
                uniq.push(t);
            }
            setTags(uniq.slice(0, 24));
        } catch (err) {
            setTags([{ label: 'Erreur analyse', tone: 'red' }, ...detectTags(text)]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="aiQueueCard">
            <div className="aiQueueCardRow">
                <div style={{ minWidth: 0 }}>
                    <div className="aiProductName">{r.name}</div>
                    <div className="aiProductMeta">
                        {r.lastSeen} · {r.productStatus === 'pending' ? 'En attente' : 'Approuvé'}
                    </div>
                </div>
                <div>
                    <Pill tone={
                        r.category === 'Élevé' ? 'red' :
                            r.category === 'Moyen' ? 'amber' :
                                r.category === 'Faible' ? 'green' : 'slate'
                    }>
                        {r.category || 'N/A'}
                    </Pill>
                </div>
                <div className="aiRowActions" >
                    <button type="button" onClick={handleAnalyze} className="aiBtn aiBtn--ghost" style={{ padding: '8px 10px', fontSize: '0.75rem', color: '#6366f1' }}>
                        <Sparkles size={14} style={{ marginRight: '4px' }} /> {tags ? "Masquer IA" : "Analyse IA"}
                    </button>
                    {r.productStatus === 'pending' && (
                        <button type="button" onClick={() => onReject(r)} disabled={busyId === r.id} className="aiBtn aiBtn--ghost" style={{ padding: '8px 10px', fontSize: '0.75rem', color: '#dc2626' }}>
                            <AlertOctagon size={14} style={{ marginRight: '4px' }} />Rejeter
                        </button>
                    )}
                    {r.productStatus !== 'pending' && (
                        <button type="button" onClick={() => onCorrect(r)} disabled={busyId === r.id} className="aiBtn aiBtn--ghost" style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                            <Pencil size={14} style={{ marginRight: '4px' }} />Corriger
                        </button>
                    )}
                    <button type="button" onClick={() => onValidate(r)} disabled={busyId === r.id} className="aiBtn aiBtn--ok" style={{ padding: '8px 10px', fontSize: '0.75rem', backgroundColor: r.productStatus === 'pending' ? '#10b981' : undefined, color: r.productStatus === 'pending' ? '#fff' : undefined }}>
                        <CheckCircle2 size={14} style={{ marginRight: '4px' }} />{r.productStatus === 'pending' ? 'Accepter' : 'Valider'}
                    </button>
                </div>
            </div>

            {(tags || isAnalyzing) && (
                <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderTop: '1px dashed #cbd5e1', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '8px', color: '#475569', fontWeight: 500 }}>
                        Ingrédients détectés : <span style={{ fontWeight: 400 }}>{r.ingredientsText || "Aucun ingrédient fourni"}</span>
                    </div>
                    {isAnalyzing ? (
                        <div className="aiLoading" style={{ color: '#6366f1' }}><span className="aiDot" />Analyse IA en cours…</div>
                    ) : tags && tags.length ? (
                        <div className="aiTagRow" style={{ marginTop: '8px' }}>
                            {tags.map((t, idx) => (
                                <Pill key={`${t.label}-${idx}`} tone={t.tone}>{t.label}</Pill>
                            ))}
                        </div>
                    ) : tags && tags.length === 0 ? (
                        <span style={{ color: '#475569' }}>Aucun résultat probant de l'IA.</span>
                    ) : null}
                </div>
            )}
        </div>
    );
};

const LowConfidenceQueue = ({ rows, onCorrect, onValidate, onReject, busyId }) => (
    <Section
        title="Centre de validation IA"
        subtitle="Liste des produits à surveiller et à valider : validation centralisée, scoring prédit et actions rapides."
        icon={AlertOctagon}
    >
        <div className="aiTableWrap" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="aiTableHead" style={{ backgroundColor: '#f1f5f9' }}>
                <div>Produit</div>
                <div>Orignie</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            <div className="aiTableBody" style={{ padding: 0 }}>
                {rows.length === 0 ? (
                    <div className="aiTableEmpty">Aucune alerte pour le moment.</div>
                ) : (
                    rows.map((r) => (
                        <QueueRow key={r.id} r={r} onCorrect={onCorrect} onValidate={onValidate} onReject={onReject} busyId={busyId} />
                    ))
                )}
            </div>
        </div>
    </Section>
);

// ─── MÉTRIQUES ───────────────────────────────────────────────────────────────

const Metrics = ({ accuracy, timings, categories }) => (
    <Section
        title="Performance Metrics"
        subtitle="Score Bio moyen de vos validations et répartition par risque (données réelles)."
        icon={Gauge}
    >
        <div className="aiMetricsGrid">
            <div className="aiMetricCard">
                <div className="aiMetricHead">
                    <div className="aiMetricTitle"><Gauge size={16} />Score Bio moyen</div>
                    <Pill tone="green">Vos validations</Pill>
                </div>
                <SemiGauge value={accuracy} label="Score Bio moyen" />
            </div>
            <div className="aiMetricCard">
                <div className="aiMetricHead">
                    <div className="aiMetricTitle"><Timer size={16} />Temps estimés (ms)</div>
                    <Pill tone="slate">estimé</Pill>
                </div>
                <div className="aiChartH">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timings} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false}
                                tick={{ fill: '#475569', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ms" name="ms" fill="#1e40af" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </Section>
);

// ─── DICTIONNAIRE DES ADDITIFS ────────────────────────────────────────────────

const AdditivesDictionary = ({ items, severityOverrides, onEditSeverity }) => {
    const [q, setQ] = useState('');

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return items;
        return items.filter((x) =>
            [x.code, x.name, x.severity].some((v) => String(v || '').toLowerCase().includes(query))
        );
    }, [items, q]);

    const toneFor = (sev) => sev === 'Élevée' ? 'red' : sev === 'Moyenne' ? 'amber' : 'green';

    return (
        <Section
            title="Additives Dictionary"
            subtitle="Ingrédients dont le nom commence par E… (base réelle). Édition locale de la dangerosité."
            icon={BookOpen}
            right={
                <div className="aiSearchRow">
                    <div className="aiSearch">
                        <Search size={18} />
                        <input value={q} onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher (E330, acide…)" aria-label="Recherche additifs" />
                    </div>
                    <Pill tone="slate">{filtered.length}</Pill>
                </div>
            }
        >
            <div className="aiTableWrap">
                <table className="aiDataTable">
                    <thead>
                        <tr>
                            <th>Code E</th>
                            <th>Nom</th>
                            <th>Dangerosité</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ color: '#64748b' }}>Aucun résultat.</td></tr>
                        ) : (
                            filtered.map((a) => {
                                const sev = severityOverrides[a.code] || a.severity;
                                return (
                                    <tr key={String(a._id || a.code)}>
                                        <td style={{ fontWeight: 800 }}>{a.code}</td>
                                        <td>{a.name}</td>
                                        <td><Pill tone={toneFor(sev)}>{sev}</Pill></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button type="button" onClick={() => onEditSeverity(a.code)}
                                                className="aiBtn aiBtn--ghost"
                                                style={{ padding: '8px 12px', fontSize: '0.75rem', display: 'inline-flex' }}>
                                                <Pencil size={14} />Éditer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="aiFootNote">
                <BadgeCheck size={16} color="#059669" />
                La dangerosité affichée est heuristique ; « Éditer » fait tourner Faible → Moyenne → Élevée (session).
            </div>
        </Section>
    );
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const AiAnalysisTab = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lowConfidenceRows, setLowConfidenceRows] = useState([]);
    const [busyId, setBusyId] = useState(null);
    const [accuracy, setAccuracy] = useState(0);
    const [timings, setTimings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [additives, setAdditives] = useState([]);
    const [severityOverrides, setSeverityOverrides] = useState({});
    const [ingredientQuery, setIngredientQuery] = useState('');
    const [llmResult, setLlmResult] = useState(null);
    const [isLlmAnalyzing, setIsLlmAnalyzing] = useState(false);
    const [llmError, setLlmError] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch(`${API}/dashboard/agent/ai-analysis`);
            const data = await res.json();
            setLowConfidenceRows(data.lowConfidence || []);
            setAccuracy(data.metrics?.accuracy ?? 0);
            setTimings(data.metrics?.timings || []);
            setCategories(data.metrics?.categories || []);
            setAdditives(data.additives || []);
        } catch (e) {
            if (e instanceof AuthExpiredError) return;
            setError(e.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Corriger : scoreBio + 15
    const onCorrect = async (row) => {
        setBusyId(row.id);
        try {
            await apiFetch(`${API}/produits/${row.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scoreBio: Math.min(100, Math.round(Number(row.scoreBio || 0) + 15)),
                }),
            });
            await loadData();
        } catch (e) {
            if (e instanceof AuthExpiredError) return;
            setError(e.message || 'Erreur');
        } finally {
            setBusyId(null);
        }
    };

    // Valider : approve si pending, sinon scoreBio ≥ 72
    const onValidate = async (row) => {
        setBusyId(row.id);
        try {
            const scoreBio = Math.max(
                0,
                Math.min(
                    100,
                    Math.round(Number(row.scoreBio ?? row.bioscore ?? row.predictions?.bioscore ?? 72))
                )
            );

            if (row.productStatus === 'pending') {
                await apiFetch(`${API}/produits/${row.id}/approve`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        validatedBy: user?.id || user?._id,
                        agentName: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Agent',
                        scoreBio,
                    }),
                });
            } else {
                await apiFetch(`${API}/produits/${row.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scoreBio: Math.max(72, scoreBio),
                    }),
                });
            }
            await loadData();
        } catch (e) {
            if (e instanceof AuthExpiredError) return;
            setError(e.message || 'Erreur');
        } finally {
            setBusyId(null);
        }
    };

    // Rejeter un produit en attente (fournisseur)
    const onReject = async (row) => {
        setBusyId(row.id);
        try {
            await apiFetch(`${API}/produits/${row.id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    validatedBy: user?.id || user?._id,
                    agentName: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Agent',
                }),
            });
            await loadData();
        } catch (e) {
            if (e instanceof AuthExpiredError) return;
            setError(e.message || 'Erreur');
        } finally {
            setBusyId(null);
        }
    };

    const onEditSeverity = (code) => {
        const next = (s) => s === 'Faible' ? 'Moyenne' : s === 'Moyenne' ? 'Élevée' : 'Faible';
        const row = additives.find((a) => a.code === code);
        const current = severityOverrides[code] || row?.severity || 'Moyenne';
        setSeverityOverrides((prev) => ({ ...prev, [code]: next(current) }));
    };

    return (
        <div className="aiAnalysisRoot">
            {error && (
                <div className="aiError">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError('')}>Fermer</button>
                </div>
            )}

            <div className="aiPageHeader">
                <div>
                    <h2 className="aiTitle">Analyse IA</h2>
                    <p className="aiSubtitle">

                    </p>
                </div>

            </div>

            <IngredientLLMAnalyzer
                ingredientQuery={ingredientQuery}
                setIngredientQuery={setIngredientQuery}
                llmResult={llmResult}
                setLlmResult={setLlmResult}
                isLlmAnalyzing={isLlmAnalyzing}
                setIsLlmAnalyzing={setIsLlmAnalyzing}
                llmError={llmError}
                setLlmError={setLlmError}
            />
            <Sandbox />
            <LowConfidenceQueue
                rows={lowConfidenceRows}
                onCorrect={onCorrect}
                onValidate={onValidate}
                onReject={onReject}
                busyId={busyId}
            />
            <Metrics accuracy={accuracy} timings={timings} categories={categories} />
            <AdditivesDictionary
                items={additives}
                severityOverrides={severityOverrides}
                onEditSeverity={onEditSeverity}
            />
        </div>
    );
};

export default AiAnalysisTab;