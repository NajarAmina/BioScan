import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiArrowLeft, FiCheck, FiEdit2, FiTrash2, FiStar, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useComments from '../../hooks/useComments';
import Navbar from './Navbar';
import Footer from './Footer';

const ProductCommentsPage = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Le produit est passé via le state (navigate('/commentaires', { state: { product: p } }))
    const product = location.state?.product;

    const {
        comments,
        addComment,
        editComment,
        deleteComment,
    } = useComments();

    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(5);

    useEffect(() => {
        if (!product) {
            navigate('/'); // Redirige vers l'accueil si aucun produit n'est fourni
        }
    }, [product, navigate]);

    if (!product) return null;

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
                        <FiStar fill={star <= rating ? '#fbbf24' : 'transparent'} size={20} />
                    </span>
                ))}
            </div>
        );
    };

    const productId = product?._id || product?.id_produit || product?.id;
    const productComments = comments.filter(c => {
        const cProdId = c.id_produit || c.produit;
        return String(cProdId) === String(productId);
    });

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

    return (
        <div style={styles.pageContainer}>
            <Navbar
                user={user}
                onFavoritesClick={() => navigate('/favoris')}
                onHistoryClick={() => navigate('/historique')}
                onProfileClick={() => navigate('/profil')}
                onLogout={handleLogout}
                variant="solid"
            />

            <main style={styles.mainContent}>
                <div style={styles.pageHeader}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} /> Retour au produit
                    </button>
                    <h1 style={styles.title}>
                        <FiMessageSquare style={{ color: 'var(--primary)', marginRight: '12px' }} />
                        Commentaires
                    </h1>
                    <p style={styles.subtitle}>Pour le produit : <strong>{product?.nom}</strong></p>
                </div>

                <div style={styles.content}>
                    {/* Formulaire ajout commentaire */}
                    {user ? (
                        <div style={styles.addForm}>
                            <h3 style={styles.formTitle}>Ajouter un commentaire</h3>
                            <div style={styles.ratingRow}>
                                <span style={styles.ratingLabel}>Votre note globale :</span>
                                {renderStars(newRating, true, setNewRating)}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Partagez votre expérience avec ce produit..."
                                rows={4}
                                style={styles.textarea}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    style={{
                                        ...styles.submitBtn,
                                        opacity: !newComment.trim() ? 0.6 : 1,
                                        cursor: !newComment.trim() ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    Publier mon avis
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.authNotice}>
                            <FiInfo size={28} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Connectez-vous</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Vous devez être connecté pour partager votre avis sur ce produit.</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button style={styles.primaryBtn} onClick={() => navigate('/login')}>Connexion</button>
                                <button style={styles.secondaryBtn} onClick={() => navigate('/register')}>Inscription</button>
                            </div>
                        </div>
                    )}

                    {/* Liste des commentaires */}
                    <div style={styles.commentsListContainer}>
                        <div style={styles.commentsHeader}>
                            <h3 style={styles.commentsCountTitle}>
                                Avis des utilisateurs ({productComments.length})
                            </h3>
                        </div>

                        {productComments.length === 0 ? (
                            <div style={styles.noCommentsNotice}>
                                <FiMessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                                <p style={styles.noCommentsText}>Aucun commentaire pour le moment. Soyez le premier à donner votre avis !</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {productComments.map((c) => (
                                    <div key={c.id || c._id} style={styles.commentCard}>
                                        <div style={styles.commentHeader}>
                                            <div style={styles.authorBadge}>
                                                <div style={styles.authorInitial}>{(c.nom_utilisateur || 'A')[0].toUpperCase()}</div>
                                                <strong style={styles.commentAuthor}>{c.nom_utilisateur || 'Anonyme'}</strong>
                                            </div>
                                            {renderStars(c.note)}
                                        </div>

                                        {editingComment === c.id ? (
                                            <div style={{ marginTop: '16px' }}>
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
                                                    <button style={styles.saveBtn} onClick={() => handleSaveEdit(c)}>
                                                        <FiCheck /> Mettre à jour
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
                                                    <FiEdit2 size={16} /> Modifier
                                                </button>
                                                <button style={styles.deleteBtn} onClick={() => deleteComment(c.id)}>
                                                    <FiTrash2 size={16} /> Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        backgroundColor: 'var(--bg-main)'
    },
    mainContent: {
        flex: 1, paddingTop: '100px', paddingBottom: '60px',
        maxWidth: '800px', margin: '0 auto', width: '100%',
        paddingLeft: '20px', paddingRight: '20px'
    },
    pageHeader: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px'
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '1rem', padding: '0',
        marginBottom: '16px', transition: 'color 0.2s'
    },
    title: { 
        margin: 0, fontSize: '2.5rem', color: 'var(--text-primary)', 
        display: 'flex', alignItems: 'center', fontWeight: 'bold' 
    },
    subtitle: {
        fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0
    },
    content: { width: '100%' },
    addForm: {
        backgroundColor: 'var(--bg-card)', borderRadius: '20px',
        padding: '30px', marginBottom: '40px', border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
    },
    formTitle: { marginBottom: '20px', marginTop: 0, color: 'var(--text-primary)', fontSize: '1.4rem' },
    ratingRow: { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
    ratingLabel: { color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' },
    textarea: {
        width: '100%', padding: '16px', borderRadius: '12px',
        border: '1px solid var(--border-color)', fontSize: '1.05rem',
        resize: 'vertical', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)',
        fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s'
    },
    submitBtn: {
        marginTop: '16px', padding: '12px 24px', borderRadius: '12px',
        border: 'none', backgroundColor: 'var(--primary)',
        color: '#fff', fontWeight: 'bold', fontSize: '1rem',
        transition: 'opacity 0.2s',
    },
    authNotice: {
        backgroundColor: 'var(--bg-card)', padding: '40px 20px', borderRadius: '20px',
        textAlign: 'center', border: '1px dashed var(--border-color)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px'
    },
    primaryBtn: {
        padding: '10px 20px', backgroundColor: 'var(--primary)', color: '#fff',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
    },
    secondaryBtn: {
        padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--text-primary)',
        border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
    },
    commentsListContainer: { marginTop: '20px' },
    commentsHeader: {
        borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px'
    },
    commentsCountTitle: { margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' },
    noCommentsNotice: { 
        textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', 
        backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' 
    },
    noCommentsText: { margin: 0, fontSize: '1.1rem' },
    commentCard: {
        border: '1px solid var(--border-color)', borderRadius: '16px',
        padding: '24px', backgroundColor: 'var(--bg-card)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    authorBadge: { display: 'flex', alignItems: 'center', gap: '12px' },
    authorInitial: { 
        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
        color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', 
        fontWeight: 'bold', fontSize: '1.2rem' 
    },
    commentAuthor: { color: 'var(--text-primary)', fontSize: '1.1rem' },
    commentText: { margin: '0', color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' },
    actionButtons: { display: 'flex', gap: '12px', marginTop: '16px' },
    saveBtn: {
        padding: '10px 20px', borderRadius: '8px', border: 'none', 
        backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px'
    },
    cancelBtn: {
        padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', 
        backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
    },
    commentActions: { display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' },
    editBtn: {
        border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px',
        cursor: 'pointer', fontSize: '0.95rem', padding: 0, color: 'var(--text-secondary)', transition: 'color 0.2s', fontWeight: '500'
    },
    deleteBtn: {
        border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px',
        cursor: 'pointer', fontSize: '0.95rem', padding: 0, color: '#ef4444', transition: 'color 0.2s', fontWeight: '500'
    }
};

export default ProductCommentsPage;
