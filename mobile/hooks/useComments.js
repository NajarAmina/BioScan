// mobile/hooks/useComments.js
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const useComments = () => {
  const [comments, setComments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/commentaires')
      .then((res) => setComments(res.data.map(normalizeComment)))
      .catch(() => {});
  }, []);

  const normalizeComment = (c) => ({
    id: c._id,
    id_produit: c.produit?._id || c.produit,
    id_utilisateur: String(c.utilisateur?._id || c.utilisateur || ''),
    nom_utilisateur: c.utilisateur
      ? `${c.utilisateur.prenom || ''} ${c.utilisateur.nom || ''}`.trim() || c.utilisateur.email
      : 'Anonyme',
    texte: c.contenu,
    note: c.note || 5,
    date: c.date,
  });

  const getProductComments = (productId) =>
    comments.filter((c) => String(c.id_produit) === String(productId));

  const getAverageRating = (productId) => {
    const pc = getProductComments(productId);
    if (!pc.length) return 0;
    const total = pc.reduce((s, c) => s + (c.note || 0), 0);
    return Math.round((total / pc.length) * 10) / 10;
  };

  const addComment = async (product, texte, note) => {
    if (!texte?.trim() || !user) return;
    const id_produit = product?.id_produit || product?.id || product?._id;
    const id_utilisateur = user.id || user._id;
    try {
      const res = await api.post('/commentaires', {
        contenu: texte.trim(),
        note: note || 5,
        utilisateur: id_utilisateur,
        produit: id_produit,
      });
      const newComment = {
        ...normalizeComment(res.data),
        nom_utilisateur: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email,
        id_utilisateur: String(id_utilisateur),
      };
      setComments((prev) => [newComment, ...prev]);
    } catch (e) {
      console.error('addComment error:', e);
    }
  };

  const editComment = async (commentaire) => {
    if (!commentaire.texte?.trim()) return;
    try {
      const res = await api.put(`/commentaires/${commentaire.id}`, {
        contenu: commentaire.texte.trim(),
        note: commentaire.note || 5,
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentaire.id ? normalizeComment(res.data) : c))
      );
    } catch {}
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/commentaires/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  return { comments, getProductComments, getAverageRating, addComment, editComment, deleteComment };
};

export default useComments;
