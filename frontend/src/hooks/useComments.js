// src/hooks/useComments.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useComments = () => {
    const [comments, setComments] = useState([]);
    const { user } = useAuth(); // ✅ récupère l'utilisateur depuis le contexte Auth

    // Charger tous les commentaires au démarrage
    useEffect(() => {
        fetch('http://localhost:5000/api/commentaires')
            .then(res => res.json())
            .then(data => {
                const normalized = data.map(normalizeComment);
                setComments(normalized);
            })
            .catch((e) => console.log('Impossible de charger les commentaires', e));
    }, []);

    // Normalise un commentaire backend → format frontend
    const normalizeComment = (c) => ({
        id: c._id,
        id_produit: c.produit?._id || c.produit,
        id_utilisateur: String(c.utilisateur?._id || c.utilisateur || ''),
        nom_utilisateur: c.utilisateur
            ? `${c.utilisateur.prenom || ''} ${c.utilisateur.nom || ''}`.trim() || c.utilisateur.email
            : 'Anonyme',
        texte: c.contenu,
        note: c.note || 5,
        date: c.date
    });

    // Obtenir les commentaires d'un produit
    const getProductComments = (productId) => {
        return comments.filter(c => String(c.id_produit) === String(productId));
    };

    // Calculer la note moyenne d'un produit
    const getAverageRating = (productId) => {
        const productComments = getProductComments(productId);
        if (productComments.length === 0) return 0;
        const total = productComments.reduce((sum, c) => sum + (c.note || 0), 0);
        return Math.round((total / productComments.length) * 10) / 10;
    };

    // Ajouter un commentaire
    const addComment = async (product, texte, note) => {
        try {
            const id_produit = product?.id_produit || product?.id || product?._id;

            if (!texte || !String(texte).trim()) {
                console.error('Le texte du commentaire est vide');
                return;
            }

            if (!user) {
                console.error('Utilisateur non connecté');
                return;
            }

            // ✅ Récupéré depuis useAuth(), pas depuis localStorage manuellement
            const id_utilisateur = user.id || user._id;
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/commentaires', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    contenu: String(texte).trim(),
                    note: note || 5,
                    utilisateur: id_utilisateur,
                    produit: id_produit
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Erreur ajout commentaire:', err.message);
                return;
            }

            const saved = await response.json();

            // ✅ Enrichir avec le nom de l'utilisateur connecté directement
            const newComment = {
                ...normalizeComment(saved),
                nom_utilisateur: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email,
                id_utilisateur: String(id_utilisateur)
            };

            setComments(prev => [newComment, ...prev]);

        } catch (error) {
            console.error('Erreur réseau addComment:', error);
        }
    };

    // Modifier un commentaire
    const editComment = async (commentaire) => {
        try {
            if (!commentaire.texte || !String(commentaire.texte).trim()) return;

            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5000/api/commentaires/${commentaire.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    contenu: String(commentaire.texte).trim(),
                    note: commentaire.note || 5
                })
            });

            if (!response.ok) return;

            const updated = await response.json();
            setComments(prev =>
                prev.map(c => c.id === commentaire.id ? normalizeComment(updated) : c)
            );

        } catch (error) {
            console.error('Erreur réseau editComment:', error);
        }
    };

    // Supprimer un commentaire
    const deleteComment = async (id) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5000/api/commentaires/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });

            if (!response.ok) return;

            setComments(prev => prev.filter(c => c.id !== id));

        } catch (error) {
            console.error('Erreur réseau deleteComment:', error);
        }
    };

    return {
        comments,
        getProductComments,
        getAverageRating,
        addComment,
        editComment,
        deleteComment
    };
};

export default useComments;
