import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiArrowLeft, FiCheck, FiEdit2, FiTrash2, FiStar, FiInfo, FiSend } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useComments from '../../hooks/useComments';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductCommentsPage = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const product = location.state?.product;

    const { comments, addComment, editComment, deleteComment } = useComments();

    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [hoveredEditStar, setHoveredEditStar] = useState(null);

    useEffect(() => {
        if (!product) navigate('/');
    }, [product, navigate]);

    if (!product) return null;

    const renderStars = (rating, interactive = false, onRate = null, hovered = null, setHovered = null) => (
        <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (interactive && hovered ? hovered : rating);
                return (
                    <span
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        onMouseEnter={() => interactive && setHovered && setHovered(star)}
                        onMouseLeave={() => interactive && setHovered && setHovered(null)}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            color: filled ? '#f59e0b' : '#d1d5db',
                            transform: interactive && filled ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.15s ease',
                            display: 'inline-block',
                        }}
                    >
                        <FiStar fill={filled ? '#f59e0b' : 'transparent'} size={interactive ? 24 : 18} />
                    </span>
                );
            })}
        </div>
    );

    const productId = product?._id || product?.id_produit || product?.id;
    const productComments = comments.filter(c => {
        const cProdId = c.id_produit || c.produit;
        return String(cProdId) === String(productId);
    });

    const averageRating = productComments.length > 0
        ? (productComments.reduce((sum, c) => sum + (c.note || 0), 0) / productComments.length).toFixed(1)
        : null;

    const handleAddComment = () => {
        if (!newComment || !newComment.trim()) return;
        addComment(product, newComment.trim(), newRating);
        setNewComment('');
        setNewRating(5);
    };

    const handleStartEdit = (c) => {
        setEditingComment(c.id);
        setEditText(c.texte);
        setEditRating(c.note);
    };

    const handleSaveEdit = (c) => {
        editComment({ ...c, texte: editText, note: editRating });
        setEditingComment(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitialColor = (name) => {
        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
        const idx = (name || 'A').charCodeAt(0) % colors.length;
        return colors[idx];
    };

    return (
        <div style={styles.pageContainer}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .comment-card { animation: fadeUp 0.35s ease forwards; }
                .submit-btn:hover:not(:disabled) { background: #059669 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.35) !important; }
                .back-btn:hover { color: #10b981 !important; }
                .edit-btn:hover { color: #3b82f6 !important; }
                .delete-btn:hover { color: #ef4444 !important; }
                textarea:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important; }
            `}</style>

            <Navbar
                user={user}
                onFavoritesClick={() => navigate('/favoris')}
                onHistoryClick={() => navigate('/historique')}
                onProfileClick={() => navigate('/profil')}
                onLogout={handleLogout}
                variant="solid"
            />

            <main style={styles.mainContent}>

                {/* ── Header ── */}
                <div style={styles.pageHeader}>
                    <button className="back-btn" style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={17} />
                        Retour au produit
                    </button>

                    <div style={styles.headerRow}>
                        <div>
                            <h1 style={styles.title}>Commentaires</h1>
                            <p style={styles.subtitle}>
                                Pour le produit : <strong style={{ color: '#0f172a' }}>{product?.nom}</strong>
                            </p>
                        </div>

                        {averageRating && (
                            <div style={styles.avgRatingBox}>
                                <span style={styles.avgRatingValue}>{averageRating}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {renderStars(Math.round(averageRating))}
                                    <span style={styles.avgRatingCount}>{productComments.length} avis</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Formulaire ── */}
                {user ? (
                    <div style={styles.addForm}>
                        <div style={styles.formTopRow}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '50%',
                                backgroundColor: getInitialColor(user.nom || user.name),
                                color: '#fff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem',
                                flexShrink: 0,
                            }}>
                                {(user.nom || user.name || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={styles.ratingRow}>
                                    <span style={styles.ratingLabel}>Votre note :</span>
                                    {renderStars(newRating, true, setNewRating, hoveredStar, setHoveredStar)}
                                </div>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Partagez votre expérience avec ce produit..."
                                    rows={3}
                                    style={styles.textarea}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                    <button
                                        className="submit-btn"
                                        style={{
                                            ...styles.submitBtn,
                                            opacity: !newComment.trim() ? 0.55 : 1,
                                            cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                    >
                                        <FiSend size={16} />
                                        Publier mon avis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.authNotice}>
                        <div style={styles.authIcon}>
                            <FiInfo size={24} color="#10b981" />
                        </div>
                        <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.1rem' }}>Connectez-vous pour commenter</h3>
                        <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.95rem' }}>
                            Vous devez être connecté pour partager votre avis.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={styles.primaryBtn} onClick={() => navigate('/login')}>Connexion</button>
                            <button style={styles.secondaryBtn} onClick={() => navigate('/register')}>Inscription</button>
                        </div>
                    </div>
                )}

                {/* ── Liste commentaires ── */}
                <div style={styles.commentsSection}>
                    <h3 style={styles.commentsTitle}>
                        <FiMessageSquare size={18} color="#10b981" />
                        Avis des utilisateurs
                        <span style={styles.countBadge}>{productComments.length}</span>
                    </h3>

                    {productComments.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>💬</div>
                            <p style={styles.emptyText}>Aucun commentaire pour le moment.</p>
                            <p style={styles.emptySubtext}>Soyez le premier à donner votre avis !</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {productComments.map((c, i) => (
                                <div
                                    key={c.id || c._id}
                                    className="comment-card"
                                    style={{ ...styles.commentCard, animationDelay: `${i * 0.06}s` }}
                                >
                                    <div style={styles.commentHeader}>
                                        <div style={styles.authorRow}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                backgroundColor: getInitialColor(c.nom_utilisateur),
                                                color: '#fff', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontWeight: '700', fontSize: '1rem',
                                                flexShrink: 0,
                                            }}>
                                                {(c.nom_utilisateur || 'A')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <strong style={styles.commentAuthor}>{c.nom_utilisateur || 'Anonyme'}</strong>
                                                {renderStars(c.note)}
                                            </div>
                                        </div>
                                    </div>

                                    {editingComment === c.id ? (
                                        <div style={{ marginTop: '16px' }}>
                                            <div style={styles.ratingRow}>
                                                <span style={styles.ratingLabel}>Note :</span>
                                                {renderStars(editRating, true, setEditRating, hoveredEditStar, setHoveredEditStar)}
                                            </div>
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                rows={3}
                                                style={styles.textarea}
                                            />
                                            <div style={styles.actionButtons}>
                                                <button style={styles.saveBtn} onClick={() => handleSaveEdit(c)}>
                                                    <FiCheck size={15} /> Mettre à jour
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
                                            <button className="edit-btn" style={styles.editBtn} onClick={() => handleStartEdit(c)}>
                                                <FiEdit2 size={14} /> Modifier
                                            </button>
                                            <button className="delete-btn" style={styles.deleteBtn} onClick={() => deleteComment(c.id)}>
                                                <FiTrash2 size={14} /> Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        backgroundColor: '#f8fafc',
    },
    mainContent: {
        flex: 1,
        paddingTop: '100px',
        paddingBottom: '60px',
        maxWidth: '780px',
        margin: '0 auto',
        width: '100%',
        paddingLeft: '20px',
        paddingRight: '20px',
    },

    // ── Header ──
    pageHeader: {
        marginBottom: '32px',
    },
    backBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', color: '#64748b',
        cursor: 'pointer', fontSize: '0.95rem', padding: '0',
        marginBottom: '20px', fontWeight: '500',
        transition: 'color 0.2s',
    },
    headerRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '16px',
    },
    title: {
        margin: '0 0 6px', fontSize: '2rem', fontWeight: '800', color: '#0f172a',
    },
    subtitle: {
        margin: 0, fontSize: '1rem', color: '#64748b', fontWeight: '400',
    },
    avgRatingBox: {
        display: 'flex', alignItems: 'center', gap: '12px',
        backgroundColor: '#fff', padding: '12px 20px', borderRadius: '14px',
        border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    avgRatingValue: {
        fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1,
    },
    avgRatingCount: {
        fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500',
    },

    // ── Formulaire ──
    addForm: {
        backgroundColor: '#fff', borderRadius: '20px',
        padding: '24px', marginBottom: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    },
    formTopRow: {
        display: 'flex', gap: '16px', alignItems: 'flex-start',
    },
    ratingRow: {
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '12px',
    },
    ratingLabel: {
        color: '#475569', fontSize: '0.9rem', fontWeight: '600',
    },
    textarea: {
        width: '100%', padding: '14px 16px', borderRadius: '12px',
        border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
        resize: 'vertical', boxSizing: 'border-box',
        backgroundColor: '#f8fafc', color: '#1e293b',
        fontFamily: 'inherit', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        lineHeight: 1.6,
    },
    submitBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '11px 22px', borderRadius: '12px',
        border: 'none', backgroundColor: '#10b981',
        color: '#fff', fontWeight: '700', fontSize: '0.95rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
    },

    // ── Auth Notice ──
    authNotice: {
        backgroundColor: '#fff', padding: '32px', borderRadius: '20px',
        textAlign: 'center', border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '32px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    },
    authIcon: {
        width: '52px', height: '52px', borderRadius: '50%',
        backgroundColor: '#f0fdf4', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
    },
    primaryBtn: {
        padding: '10px 22px', backgroundColor: '#10b981', color: '#fff',
        border: 'none', borderRadius: '10px', fontWeight: '700',
        cursor: 'pointer', fontSize: '0.95rem',
    },
    secondaryBtn: {
        padding: '10px 22px', backgroundColor: 'transparent', color: '#475569',
        border: '1.5px solid #e2e8f0', borderRadius: '10px', fontWeight: '600',
        cursor: 'pointer', fontSize: '0.95rem',
    },

    // ── Liste ──
    commentsSection: { marginTop: '8px' },
    commentsTitle: {
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '1.15rem', fontWeight: '700', color: '#1e293b',
        marginBottom: '20px',
    },
    countBadge: {
        backgroundColor: '#f1f5f9', color: '#64748b',
        padding: '2px 10px', borderRadius: '2rem',
        fontSize: '0.85rem', fontWeight: '600',
    },
    emptyState: {
        textAlign: 'center', padding: '48px 20px',
        backgroundColor: '#fff', borderRadius: '20px',
        border: '1px solid #e2e8f0',
    },
    emptyIcon: { fontSize: '2.5rem', marginBottom: '12px' },
    emptyText: { margin: '0 0 6px', fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' },
    emptySubtext: { margin: 0, fontSize: '0.9rem', color: '#94a3b8' },

    // ── Carte commentaire ──
    commentCard: {
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '20px 24px', border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        opacity: 0,
    },
    commentHeader: { marginBottom: '14px' },
    authorRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    commentAuthor: {
        display: 'block', color: '#0f172a', fontSize: '0.95rem',
        fontWeight: '700', marginBottom: '4px',
    },
    commentText: {
        margin: 0, color: '#475569', lineHeight: 1.65,
        fontSize: '0.95rem',
    },
    actionButtons: { display: 'flex', gap: '10px', marginTop: '14px' },
    saveBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '9px 18px', borderRadius: '8px', border: 'none',
        backgroundColor: '#10b981', color: '#fff', fontWeight: '600',
        cursor: 'pointer', fontSize: '0.9rem',
    },
    cancelBtn: {
        padding: '9px 18px', borderRadius: '8px',
        border: '1.5px solid #e2e8f0', backgroundColor: 'transparent',
        color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
    },
    commentActions: {
        display: 'flex', gap: '20px', marginTop: '16px',
        paddingTop: '14px', borderTop: '1px solid #f1f5f9',
    },
    editBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        border: 'none', background: 'none',
        cursor: 'pointer', fontSize: '0.875rem',
        color: '#94a3b8', fontWeight: '600', padding: 0,
        transition: 'color 0.2s',
    },
    deleteBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        border: 'none', background: 'none',
        cursor: 'pointer', fontSize: '0.875rem',
        color: '#94a3b8', fontWeight: '600', padding: 0,
        transition: 'color 0.2s',
    },
};

export default ProductCommentsPage;