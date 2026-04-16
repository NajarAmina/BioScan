import React, { useState } from 'react';
import { FiMessageSquare, FiX, FiCheck, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';

const CommentsModal = ({ product, comments, user, onClose, onAddComment, onEditComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(5);

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            color: star <= rating ? '#fbbf24' : 'var(--border-color)',
                            transition: 'color 0.2s'
                        }}
                    >
                        <FiStar fill={star <= rating ? '#fbbf24' : 'transparent'} size={18} />
                    </span>
                ))}
            </div>
        );
    };

    const productId = product?.id_produit || product?._id || product?.id;
    const productComments = comments.filter(c => {
        const cProdId = c.id_produit || c.produit;
        return String(cProdId) === String(productId);
    });

    const handleAddComment = () => {
        if (!newComment || !newComment.trim()) return;
        if (!product) return;

        onAddComment(product, newComment.trim(), newRating);
        setNewComment('');
        setNewRating(5);
    };

    const handleStartEdit = (c) => {
        setEditingComment(c.id);
        setEditText(c.texte);
        setEditRating(c.note);
    };

    const handleSaveEdit = (c) => {
        onEditComment({ ...c, texte: editText, note: editRating });
        setEditingComment(null);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FiMessageSquare style={{ marginRight: '10px', color: 'var(--primary)' }} />
                        Commentaires — <span style={{ fontWeight: 400, marginLeft: '6px' }}>{product?.nom || 'Produit'}</span>
                    </h2>
                    <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
                </div>

                {/* Formulaire ajout commentaire */}
                {user ? (
                    <div style={styles.addForm}>
                        <h4 style={styles.formTitle}>Ajouter un commentaire</h4>
                        <div style={styles.ratingRow}>
                            <span style={styles.ratingLabel}>Votre note :</span>
                            {renderStars(newRating, true, setNewRating)}
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Partagez votre expérience avec ce produit..."
                            rows={3}
                            style={styles.textarea}
                        />
                        <button
                            style={{
                                ...styles.submitBtn,
                                opacity: !newComment.trim() ? 0.6 : 1,
                                cursor: !newComment.trim() ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handleAddComment}
                        >
                            Publier
                        </button>
                    </div>
                ) : (
                    <div style={styles.authNotice}>
                        <FiMessageSquare size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                        <p style={{ margin: 0 }}>Connectez-vous pour laisser un commentaire.</p>
                    </div>
                )}

                {/* Liste des commentaires */}
                <div style={{ marginTop: '24px' }}>
                    <h4 style={styles.commentsCount}>
                        {productComments.length} commentaire{productComments.length !== 1 ? 's' : ''}
                    </h4>

                    {productComments.length === 0 ? (
                        <p style={styles.noComments}>Aucun commentaire pour le moment. Soyez le premier !</p>
                    ) : (
                        productComments.map((c) => (
                            <div key={c.id || c._id} style={styles.commentCard}>
                                <div style={styles.commentHeader}>
                                    <strong style={styles.commentAuthor}>{c.nom_utilisateur || 'Anonyme'}</strong>
                                    {renderStars(c.note)}
                                </div>

                                {editingComment === c.id ? (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={styles.ratingRow}>
                                            <span style={styles.ratingLabel}>Note :</span>
                                            {renderStars(editRating, true, setEditRating)}
                                        </div>
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={3}
                                            style={styles.textarea}
                                        />
                                        <div style={styles.actionButtons}>
                                            <button style={styles.submitBtn} onClick={() => handleSaveEdit(c)}>
                                                <FiCheck /> Enregistrer
                                            </button>
                                            <button style={styles.cancelBtn} onClick={() => setEditingComment(null)}>
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={styles.commentText}>{c.texte}</p>
                                )}

                                {user && (String(user.id) === String(c.id_utilisateur) || user.role === 'administrateur') && editingComment !== c.id && (
                                    <div style={styles.commentActions}>
                                        <button style={styles.editBtn} onClick={() => handleStartEdit(c)}>
                                            <FiEdit2 size={14} /> Modifier
                                        </button>
                                        <button style={styles.deleteBtn} onClick={() => onDeleteComment(c.id)}>
                                            <FiTrash2 size={14} /> Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        justifyContent: 'center', alignItems: 'center', zIndex: 1050
    },
    modal: {
        backgroundColor: 'var(--bg-glass, var(--bg-card))', padding: '24px', borderRadius: '20px',
        width: '90%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
    },
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px'
    },
    title: { margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold' },
    closeBtn: {
        border: 'none', background: 'var(--bg-main)', width: '36px', height: '36px', 
        borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
        fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)', 
        transition: 'background 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    addForm: {
        backgroundColor: 'var(--bg-main)', borderRadius: '12px',
        padding: '20px', marginBottom: '16px', border: '1px solid var(--border-color)'
    },
    formTitle: { marginBottom: '12px', marginTop: 0, color: 'var(--text-primary)', fontSize: '1.1rem' },
    ratingRow: { marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
    ratingLabel: { color: 'var(--text-secondary)', fontSize: '0.95rem' },
    textarea: {
        width: '100%', padding: '12px', borderRadius: '10px',
        border: '1px solid var(--border-color)', fontSize: '0.95rem',
        resize: 'vertical', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)',
        fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s'
    },
    submitBtn: {
        marginTop: '12px', padding: '10px 20px', borderRadius: '10px',
        border: 'none', backgroundColor: 'var(--primary)',
        color: '#fff', fontWeight: '600', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'background-color 0.2s',
    },
    cancelBtn: {
        marginTop: '12px', padding: '10px 20px', borderRadius: '10px',
        border: '1px solid var(--border-color)', backgroundColor: 'transparent',
        color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    authNotice: {
        backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: '12px',
        textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic',
        border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    commentsCount: { marginBottom: '16px', marginTop: 0, color: 'var(--text-primary)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
    noComments: { color: 'var(--text-muted)', fontStyle: 'italic' },
    commentCard: {
        border: '1px solid var(--border-color)', borderRadius: '12px',
        padding: '16px', marginBottom: '16px', backgroundColor: 'var(--bg-main)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    commentAuthor: { color: 'var(--text-primary)', fontSize: '1rem' },
    commentText: { margin: '10px 0', color: 'var(--text-secondary)', lineHeight: '1.5' },
    actionButtons: { display: 'flex', gap: '8px', marginTop: '10px' },
    commentActions: { display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' },
    editBtn: {
        border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px',
        cursor: 'pointer', fontSize: '0.9rem', padding: 0, color: 'var(--text-secondary)', transition: 'color 0.2s'
    },
    deleteBtn: {
        border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px',
        cursor: 'pointer', fontSize: '0.9rem', padding: 0, color: '#ef4444', transition: 'color 0.2s'
    }
};

export default CommentsModal;
