import React, { useState, useRef, useEffect } from 'react';

const Chatbot = ({ user, addToHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            from: 'bot',
            text: `Bonjour ${user?.prenom || ''} ! Je suis votre assistant BioScan. Posez-moi vos questions sur les produits alimentaires ou envoyez une photo d'un produit.`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageBase64(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const botReply = async (userMessage, b64Image = null) => {
        setIsTyping(true);
        try {
            // ✅ Historique avec support des images base64
            const history = messages.slice(-6).map(m => ({
                from: m.from,
                text: m.text,
                imageBase64: m.imageBase64 || null,
            }));

            const body = { message: userMessage, history };
            if (b64Image) body.image = b64Image;

            const response = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Erreur de réponse de l'assistant API");

            const data = await response.json();
            setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
        } catch (error) {
            console.error('Erreur Chatbot:', error);
            setMessages((prev) => [
                ...prev,
                { from: 'bot', text: "Désolé, je rencontre des difficultés techniques pour vous répondre." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text && !imageBase64) return;

        // ✅ Stocker imageBase64 dans le message pour l'historique
        setMessages((prev) => [
            ...prev,
            {
                from: 'user',
                text: text || '📷 Image envoyée',
                image: imagePreview || null,
                imageBase64: imageBase64 || null,
            },
        ]);

        if (typeof addToHistory === 'function' && text) addToHistory(text);
        botReply(text || 'Analyse ce produit alimentaire.', imageBase64);
        setInput('');
        removeImage();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={styles.chatContainer}>
            <button style={styles.toggleBtn} onClick={() => setIsOpen((o) => !o)} title="Assistant BioScan">
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div style={styles.chatBox}>
                    <div style={styles.header}>
                        <span>🌿 Assistant BioScan</span>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    <div style={styles.messages}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.message,
                                    alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.from === 'user' ? '#16a34a' : '#f3f4f6',
                                    color: msg.from === 'user' ? '#fff' : '#1f2937',
                                }}
                            >
                                {msg.image && (
                                    <img src={msg.image} alt="produit" style={styles.msgImage} />
                                )}
                                {msg.text && <span>{msg.text}</span>}
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{
                                ...styles.message,
                                alignSelf: 'flex-start',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280'
                            }}>
                                <span style={styles.typingDots}>···</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {imagePreview && (
                        <div style={styles.previewContainer}>
                            <img src={imagePreview} alt="aperçu" style={styles.previewImage} />
                            <button onClick={removeImage} style={styles.removeBtn}>✕</button>
                        </div>
                    )}

                    <div style={styles.inputArea}>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            style={styles.imageBtn}
                            title="Envoyer une image"
                        >
                            +
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={styles.input}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                ...styles.sendBtn,
                                opacity: (!input.trim() && !imageBase64) ? 0.5 : 1,
                                cursor: (!input.trim() && !imageBase64) ? 'not-allowed' : 'pointer',
                            }}
                            disabled={!input.trim() && !imageBase64}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    chatContainer: { position: 'fixed', bottom: 24, right: 24, zIndex: 1000 },
    toggleBtn: {
        backgroundColor: '#16a34a', color: '#fff', border: 'none',
        borderRadius: '50%', width: 56, height: 56, cursor: 'pointer',
        fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    chatBox: {
        position: 'absolute', bottom: 68, right: 0, width: 360, maxHeight: 560,
        backgroundColor: '#fff', borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '1px solid #e5e7eb',
    },
    header: {
        backgroundColor: '#16a34a', color: '#fff', padding: '10px 14px',
        fontWeight: 600, fontSize: 14, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
    },
    closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 },
    messages: {
        flex: 1, padding: 12, display: 'flex', flexDirection: 'column',
        gap: 8, overflowY: 'auto',
    },
    message: {
        padding: '8px 12px', borderRadius: 10, maxWidth: '82%',
        fontSize: 13, lineHeight: 1.5, display: 'flex',
        flexDirection: 'column', gap: 4,
    },
    msgImage: {
        display: 'block', maxWidth: '100%', borderRadius: 8,
        marginBottom: 4, maxHeight: 150, objectFit: 'cover',
    },
    typingDots: { letterSpacing: 2, fontSize: 18 },
    previewContainer: {
        position: 'relative', padding: '6px 12px',
        borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
        display: 'flex', alignItems: 'center', gap: 8,
    },
    previewImage: {
        height: 60, borderRadius: 6,
        border: '1px solid #d1d5db', objectFit: 'cover',
    },
    removeBtn: {
        background: '#ef4444', color: '#fff', border: 'none',
        borderRadius: '50%', width: 20, height: 20, fontSize: 10,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
    },
    inputArea: {
        display: 'flex', borderTop: '1px solid #e5e7eb',
        padding: 6, gap: 4, alignItems: 'center',
    },
    imageBtn: {
        background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
        padding: '0 8px', fontSize: 16, cursor: 'pointer',
        height: 36, flexShrink: 0,
    },
    input: {
        flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb',
        borderRadius: 8, outline: 'none', fontSize: 13,
    },
    sendBtn: {
        padding: '0 12px', border: 'none', backgroundColor: '#16a34a',
        color: '#fff', borderRadius: 8, fontSize: 16, height: 36, flexShrink: 0,
    },
};

export default Chatbot;