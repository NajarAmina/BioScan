const fs = require('fs');
const path = require('path');
const Produit = require('../models/produit.model');
const Ingredient = require('../models/ingredient.model');
const Notification = require('../models/notification.model');
const { emitNotification } = require('../socket');

// ─── Helper : Sauvegarder l'image base64 ─────────────────────────────────────
const saveBase64Image = (base64String) => {
    // Vérifier si c'est du base64
    if (!base64String || !base64String.includes('base64,')) {
        return base64String; // Retourne tel quel si ce n'est pas du base64
    }

    // Extraire le type et les données
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        console.error('Format base64 invalide');
        return null;
    }

    const mimeType = matches[1];
    const data = matches[2];

    // Déterminer l'extension
    let extension = '.jpg';
    if (mimeType.includes('png')) extension = '.png';
    if (mimeType.includes('gif')) extension = '.gif';
    if (mimeType.includes('webp')) extension = '.webp';
    if (mimeType.includes('jpeg')) extension = '.jpg';

    // Chemin absolu basé sur le répertoire du projet
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Dossier uploads créé:', uploadDir);
    }

    // Générer un nom unique
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    try {
        // Sauvegarder le fichier
        fs.writeFileSync(filePath, data, 'base64');
        console.log('💾 Image sauvegardée:', filePath);
        // Retourner le chemin relatif
        return `/uploads/${fileName}`;
    } catch (err) {
        console.error('Erreur sauvegarde image:', err);
        return null;
    }
};

// ─── Helper : Traiter l'image avant sauvegarde ────────────────────────────────
const processImage = (produitData) => {
    if (produitData.image && produitData.image.includes('base64,')) {
        const imagePath = saveBase64Image(produitData.image);
        if (imagePath) {
            produitData.image = imagePath;
        }
    }
    return produitData;
};

// ─── Helper : crée la notif en DB ET l'envoie en temps réel ──────────────────
const sendNotification = async ({ recipientId, message, productName, agentName }) => {
    try {
        if (!recipientId) return;

        const notif = await Notification.create({
            recipientId,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false
        });

        emitNotification(String(recipientId), {
            _id: notif._id,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false,
            createdAt: notif.createdAt,
        });

    } catch (err) {
        console.error('Erreur création notification:', err.message);
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeCodeBarre = (payload) => {
    const code = String(payload?.code_barre || payload?.codeBarres || '').trim();
    return code;
};

const normalizeIngredientNames = (names) => {
    if (!names) return [];
    if (Array.isArray(names)) {
        return names.map((x) => String(x || '').trim()).filter(Boolean);
    }
    return String(names).split(',').map((x) => x.trim()).filter(Boolean);
};

const resolveIngredientIds = async (ingredientNames) => {
    const names = normalizeIngredientNames(ingredientNames);
    if (names.length === 0) return [];
    const docs = [];
    for (const nom of names) {
        let ing = await Ingredient.findOne({ nom });
        if (!ing) ing = await Ingredient.create({ nom });
        docs.push(ing);
    }
    return docs.map((d) => d._id);
};

const normalizeLocalisation = (body) => {
    const loc = body.localisation || {};
    return {
        adresse: String(loc.adresse || '').trim(),
        lat: loc.lat !== undefined && loc.lat !== '' ? Number(loc.lat) : null,
        lng: loc.lng !== undefined && loc.lng !== '' ? Number(loc.lng) : null
    };
};

const PYTHON_BIN = process.env.PYTHON_BIN || 'python';

const runPythonPredictor = (payload) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'predictor.py');
        const pythonProcess = spawn(PYTHON_BIN, [scriptPath]);

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0 && !stdout) {
                return reject(new Error(`Erreur du script Python : ${stderr.trim()}`));
            }
            try {
                const jsonStart = stdout.indexOf('{');
                const clean = jsonStart !== -1 ? stdout.slice(jsonStart) : stdout;
                const result = JSON.parse(clean.trim());

                if (result.error) {
                    return reject(new Error(result.error));
                }

                if (!result.success || !result.predictions) {
                    return reject(new Error('Réponse invalide du script Python')); 
                }

                resolve(result);
            } catch (err) {
                reject(new Error(`Impossible de parser la sortie Python : ${err.message}`));
            }
        });

        pythonProcess.on('error', (err) => {
            reject(err);
        });

        pythonProcess.stdin.write(JSON.stringify(payload));
        pythonProcess.stdin.end();
    });
};

const buildPredictorPayloadFromProduct = (produit) => {
    const ingredients = Array.isArray(produit.ingredients) ? produit.ingredients : [];
    const ingredientNames = ingredients.map((ing) => {
        return String(ing?.nom || ing?.name || '').trim().toLowerCase();
    }).filter(Boolean);

    const nbIngredients = ingredientNames.length;
    const eNumbers = ingredientNames.filter((nom) => nom.match(/(E\d{3}|conservateur|émulsifiant)/i)).length;
    const containsPreservatives = ingredientNames.some((nom) => nom.includes('conserv')) ? 1 : 0;
    const containsArtificialColors = ingredientNames.some((nom) => nom.includes('coloran') || nom.includes('colorant')) ? 1 : 0;
    const containsFlavouring = ingredientNames.some((nom) => nom.includes('arôm') || nom.includes('arome') || nom.includes('arôme')) ? 1 : 0;

    const estimatedNova = produit.nova_group || produit.nova || (nbIngredients > 5 || eNumbers > 0 ? 4 : nbIngredients > 2 ? 3 : 1);
    const estimatedNutri = produit.nutriscore || produit.nutri_score || produit.nutriscore_num || (nbIngredients * 3 + eNumbers * 5);

    return {
        nb_ingredients: nbIngredients,
        ingredients_text: produit.description || produit.nom || produit.name || '',
        contains_preservatives: containsPreservatives,
        contains_artificial_colors: containsArtificialColors,
        contains_flavouring: containsFlavouring,
        nova_group: estimatedNova,
        nutriscore_num: estimatedNutri,
        nb_e_numbers: produit.nb_e_numbers || eNumbers,
        ingredients_length: nbIngredients,
    };
};

// ─── Ajouter produit (par agent directement) ─────────────────────────────────
exports.createProduit = async (req, res) => {
    try {
        // Traiter l'image si elle est en base64
        const processedData = processImage(req.body);

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const produit = new Produit({
            ...processedData,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            ingredients: ingredientIds,
            localisation: normalizeLocalisation(processedData)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy', 'nom prenom email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Erreur createProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Fournisseur: soumettre un produit en attente ────────────────────────────
exports.createPendingProduit = async (req, res) => {
    try {
        // Traiter l'image si elle est en base64
        const processedData = processImage(req.body);

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const produit = new Produit({
            nom: processedData.nom,
            description: processedData.description,
            marque: processedData.marque,
            image: processedData.image,
            code_barre: codeBarre || undefined,
            codeBarres: codeBarre || undefined,
            origine: processedData.origine,
            ingredients: ingredientIds,
            pointsDeVente: Array.isArray(processedData.pointsDeVente) ? processedData.pointsDeVente : [],
            createdBy: processedData.createdBy,
            status: 'pending',
            localisation: normalizeLocalisation(processedData)
        });

        const savedProduit = await produit.save();
        const populated = await Produit.findById(savedProduit._id)
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy', 'nom prenom email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Erreur createPendingProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer tous les produits ─────────────────────────────────────────────
exports.getAllProduits = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.createdBy) filter.createdBy = req.query.createdBy;

        const produits = await Produit.find(filter)
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .populate({ path: 'createdBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .populate({ path: 'validatedBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .lean()
            .maxTimeMS(8000);

        res.status(200).json(produits);
    } catch (error) {
        console.error('getAllProduits error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer produits en attente ───────────────────────────────────────────
exports.getPendingProduits = async (req, res) => {
    try {
        const produits = await Produit.find({ status: 'pending' })
            .populate({ path: 'ingredients', select: 'nom description estBio', options: { maxTimeMS: 8000 } })
            .populate({ path: 'pointsDeVente', select: 'nom adresse', options: { maxTimeMS: 8000 } })
            .populate({ path: 'createdBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .populate({ path: 'validatedBy', select: 'nom prenom email', options: { maxTimeMS: 8000 } })
            .lean()
            .maxTimeMS(8000)
            .sort({ createdAt: -1 });

        res.status(200).json(produits);
    } catch (error) {
        console.error('getPendingProduits error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── Récupérer produit par ID ─────────────────────────────────────────────────
exports.getProduitById = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
        res.status(200).json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Modifier produit ─────────────────────────────────────────────────────────
exports.updateProduit = async (req, res) => {
    try {
        // Traiter la nouvelle image si elle est en base64
        const processedData = processImage(req.body);

        // Si une nouvelle image a été uploadée, récupérer l'ancienne pour la supprimer
        const existingProduit = await Produit.findById(req.params.id);
        if (existingProduit && existingProduit.image &&
            processedData.image &&
            existingProduit.image !== processedData.image &&
            existingProduit.image.startsWith('/uploads/')) {

            // Supprimer l'ancienne image du disque
            const oldImagePath = path.join(process.cwd(), existingProduit.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log('🗑️ Ancienne image supprimée:', oldImagePath);
            }
        }

        const ingredientIds = await resolveIngredientIds(processedData.ingredients);
        const codeBarre = normalizeCodeBarre(processedData);

        const updatePayload = {
            ...processedData,
            ...(codeBarre ? { code_barre: codeBarre, codeBarres: codeBarre } : {}),
            ...(ingredientIds.length ? { ingredients: ingredientIds } : {}),
            ...(processedData.localisation ? { localisation: normalizeLocalisation(processedData) } : {})
        };

        const produit = await Produit.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        const populated = await Produit.findById(produit._id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

        const createdById = populated.createdBy?._id || populated.createdBy;
        const agentId = req.body.modifiedBy || req.body.validatedBy;
        if (createdById && String(createdById) !== String(agentId)) {
            await sendNotification({
                recipientId: createdById,
                productName: populated.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `✏️ Votre produit "${populated.nom}" a été modifié par l'agent.`
            });
        }

        res.status(200).json(populated);
    } catch (error) {
        console.error('Erreur updateProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Approuver un produit ─────────────────────────────────────────────────────
exports.approveProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        produit.status = 'approved';
        produit.validatedBy = req.body.validatedBy || null;
        produit.validatedAt = new Date();
        await produit.save();

        const populated = await Produit.findById(produit._id)
            .populate('ingredients', 'nom description estBio')
            .populate('pointsDeVente', 'nom adresse')
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

        const createdById = populated.createdBy?._id || populated.createdBy;
        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: populated.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `✅ Votre produit "${populated.nom}" a été accepté et publié.`
            });
        }

        res.status(200).json(populated);
    } catch (error) {
        console.error('Erreur approveProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Rejeter un produit ───────────────────────────────────────────────────────
exports.rejectProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        produit.status = 'rejected';
        produit.validatedBy = req.body.validatedBy || null;
        produit.validatedAt = new Date();
        await produit.save();

        const createdById = produit.createdBy?._id || produit.createdBy;
        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: produit.nom,
                agentName: req.body.agentName || 'Un agent',
                message: `❌ Votre produit "${produit.nom}" a été refusé par l'agent.`
            });
        }

        res.status(200).json({ message: 'Produit rejeté', produit });
    } catch (error) {
        console.error('Erreur rejectProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Supprimer produit ────────────────────────────────────────────────────────
exports.deleteProduit = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });

        // Supprimer l'image associée si elle existe
        if (produit.image && produit.image.startsWith('/uploads/')) {
            const imagePath = path.join(process.cwd(), produit.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('🗑️ Image supprimée:', imagePath);
            }
        }

        const createdById = produit.createdBy?._id || produit.createdBy;
        const nomProduit = produit.nom;

        await Produit.findByIdAndDelete(req.params.id);

        if (createdById) {
            await sendNotification({
                recipientId: createdById,
                productName: nomProduit,
                agentName: req.body.agentName || 'Un agent',
                message: `🗑️ Votre produit "${nomProduit}" a été supprimé par l'agent.`
            });
        }

        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error('Erreur deleteProduit:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Recherche NLP Intelligente ───────────────────────────────────────────────
const { spawn } = require('child_process');

exports.scanProduitByBarcode = async (req, res) => {
    try {
        const code = normalizeCodeBarre(req.body) || String(req.body.code || req.query.code || req.query.code_barre || req.query.codeBarres || '').trim();
        if (!code) {
            return res.status(400).json({ message: 'Code-barres requis.' });
        }

        // ✅ Cherche dans les deux champs code_barre ET codeBarres
        const produit = await Produit.findOne({
            $or: [
                { code_barre: code },
                { codeBarres: code }
            ]
        })
            .populate('ingredients')
            .populate('pointsDeVente')
            .populate('createdBy', 'nom prenom email')
            .populate('validatedBy', 'nom prenom email');

        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé pour ce code-barres.' });
        }

        // ✅ Analyse Python optionnelle — si elle échoue, on retourne quand même le produit
        try {
            const payload = buildPredictorPayloadFromProduct(produit);
            const result = await runPythonPredictor(payload);
            const predictions = result.predictions || {};

            produit.ai_predictions = predictions;
            produit.nova_group = Number(predictions.nova_group || payload.nova_group || produit.nova_group || produit.nova || 1);
            if (predictions.bioscore !== undefined) produit.scoreBio = predictions.bioscore;
            if (predictions.cardio_risk !== undefined) produit.cardio_risk = predictions.cardio_risk;
            if (predictions.diabetes_risk !== undefined) produit.diabetes_risk = predictions.diabetes_risk;
            if (predictions.cardio_risk_proba !== undefined) produit.cardio_risk_proba = predictions.cardio_risk_proba;
            if (predictions.diabetes_risk_proba !== undefined) produit.diabetes_risk_proba = predictions.diabetes_risk_proba;
            await produit.save();

            const updatedProduit = await Produit.findById(produit._id)
                .populate('ingredients')
                .populate('pointsDeVente')
                .populate('createdBy', 'nom prenom email')
                .populate('validatedBy', 'nom prenom email');

            return res.status(200).json(updatedProduit);

        } catch (pythonError) {
            // ✅ Python a échoué mais le produit existe → on le retourne quand même sans analyse IA
            console.warn('⚠️ Analyse Python échouée (produit retourné sans prédictions):', pythonError.message);
            return res.status(200).json(produit);
        }

    } catch (error) {
        console.error('Erreur scanProduitByBarcode:', error);
        res.status(500).json({ message: error.message || 'Erreur serveur lors du scan du produit.' });
    }
};

exports.searchProduitsNLP = async (req, res) => {
    try {
        const query = req.query.q || '';
        
        // 1. Récupérer tous les produits (de préférence approuvés)
        const produits = await Produit.find({ status: 'approved' })
            .populate('ingredients', 'nom description estBio')
            .lean();
            
        if (!query.trim()) {
            return res.status(200).json(produits); // Si pas de requête, on renvoie tout
        }

        // 2. Préparer le payload pour Python
        const payload = JSON.stringify({ query, products: produits });

        // 3. Exécuter le script Python
        const scriptPath = path.join(process.cwd(), 'modelsIA', 'search_nlp.py');
        const pythonProcess = spawn('python', [scriptPath]);
        
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error("Python NLP Script Error:", errorOutput);
                // Fallback de sécurité : recherche basique
                const lowerQ = query.toLowerCase();
                const fallbackResults = produits.filter(p => 
                    p.nom?.toLowerCase().includes(lowerQ) || 
                    p.description?.toLowerCase().includes(lowerQ)
                );
                return res.status(200).json(fallbackResults);
            }
            try {
                const result = JSON.parse(output);
                if (result.success) {
                    res.status(200).json(result.results);
                } else {
                    console.error("Script NLP erreur interne:", result.error);
                    res.status(500).json({ error: result.error });
                }
            } catch (err) {
                console.error("Erreur de parsing de la sortie Python:", err, output);
                res.status(500).json({ error: "Erreur serveur NLP" });
            }
        });
        
        pythonProcess.stdin.write(payload);
        pythonProcess.stdin.end();

    } catch (error) {
        console.error('Erreur searchProduitsNLP:', error);
        res.status(500).json({ message: error.message });
    }
};