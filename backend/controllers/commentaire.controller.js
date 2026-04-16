const Commentaire = require('../models/commentaire.model');

// Ajouter commentaire
exports.createCommentaire = async (req, res) => {
    try {
        const { contenu, note, utilisateur, produit } = req.body;

        if (!contenu || !contenu.trim()) {
            return res.status(400).json({ message: "Le contenu est requis." });
        }

        const commentaire = new Commentaire({
            contenu: contenu.trim(),
            note: note || 5,
            utilisateur,
            produit
        });

        const saved = await commentaire.save();

        // Retourner le commentaire avec les infos utilisateur peuplées
        const populated = await Commentaire.findById(saved._id)
            .populate('utilisateur', 'nom prenom email')
            .populate('produit', 'nom');

        res.status(201).json(populated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tous les commentaires (avec filtre optionnel par produit)
exports.getAllCommentaires = async (req, res) => {
    try {
        const filter = {};
        if (req.query.produit) filter.produit = req.query.produit;

        const commentaires = await Commentaire.find(filter)
            .populate('utilisateur', 'nom prenom email')
            .populate('produit', 'nom')
            .sort({ date: -1 });

        res.json(commentaires);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Commentaire par id
exports.getCommentaireById = async (req, res) => {
    try {
        const commentaire = await Commentaire.findById(req.params.id)
            .populate('utilisateur', 'nom prenom email')
            .populate('produit', 'nom');

        if (!commentaire) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
        }

        res.json(commentaire);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Modifier commentaire
exports.updateCommentaire = async (req, res) => {
    try {
        const { contenu, note } = req.body;

        if (!contenu || !contenu.trim()) {
            return res.status(400).json({ message: "Le contenu est requis." });
        }

        const updated = await Commentaire.findByIdAndUpdate(
            req.params.id,
            { contenu: contenu.trim(), note: note || 5 },
            { new: true }
        )
            .populate('utilisateur', 'nom prenom email')
            .populate('produit', 'nom');

        if (!updated) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
        }

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer commentaire
exports.deleteCommentaire = async (req, res) => {
    try {
        const deleted = await Commentaire.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Commentaire non trouvé" });
        }

        res.json({ message: "Commentaire supprimé" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
