import React from 'react';
import { FiClock, FiX, FiTrash2, FiSearch } from 'react-icons/fi';

const HistoryModal = ({ history, onClose, onRemoveItem, onClearAll, onUseItem }) => {
    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FiClock style={{ marginRight: '10px', color: 'var(--primary)' }} /> 
                        Mon Historique
                    </h2>
                    <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
                </div>

                {history.length === 0 ? (
                    <div style={styles.empty}>
                        <FiClock size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                        <p style={styles.emptyText}>Aucune recherche pour le moment.</p>
                    </div>
                ) : (
                    <>
                        <button style={styles.clearBtn} onClick={onClearAll}>
                            <FiTrash2 size={16} /> Tout supprimer
                        </button>
                        <div style={styles.list}>
                            {history.map((item) => (
                                <div key={item.id} style={styles.item}>
                                    <div style={styles.itemInfo}>
                                        <div style={styles.queryText}>{item.query}</div>
                                        <small style={styles.dateText}>{new Date(item.date).toLocaleString('fr-FR')}</small>
                                    </div>
                                    <div style={styles.actions}>
                                        <button style={styles.useBtn} onClick={() => onUseItem(item)} title="Relancer la recherche">
                                            <FiSearch size={16} />
                                        </button>
                                        <button style={styles.deleteBtn} onClick={() => onRemoveItem(item.id)} title="Supprimer">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
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
        width: '90%', maxWidth: '500px', maxHeight: '80%', overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
    },
    header: { 
        display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '24px' 
    },
    title: { margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold' },
    closeBtn: {
        border: 'none', background: 'var(--bg-main)', width: '36px', height: '36px', 
        borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
        fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)', 
        transition: 'background 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    empty: { textAlign: 'center', padding: '3rem 1rem' },
    emptyText: { color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 },
    clearBtn: { 
        display: 'flex', alignItems: 'center', gap: '6px',
        marginBottom: '16px', padding: '8px 16px', backgroundColor: 'transparent', 
        color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', 
        cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' 
    },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    item: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '12px 16px', border: '1px solid var(--border-color)', 
        borderRadius: '12px', backgroundColor: 'var(--bg-main)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    itemInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    queryText: { color: 'var(--text-primary)', fontWeight: '500', fontSize: '1.05rem' },
    dateText: { color: 'var(--text-muted)', fontSize: '0.85rem' },
    actions: { display: 'flex', gap: '8px' },
    useBtn: { 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'var(--primary)', color: '#fff', border: 'none', 
        borderRadius: '8px', cursor: 'pointer', padding: '8px',
        transition: 'background-color 0.2s'
    },
    deleteBtn: { 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', 
        borderRadius: '8px', cursor: 'pointer', padding: '8px',
        transition: 'all 0.2s'
    }
};

export default HistoryModal;