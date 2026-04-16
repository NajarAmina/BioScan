
import React, { useState, useRef, useEffect } from 'react';

const Chatbot = ({ user, addToHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            from: 'bot',
            text: `Bonjour ${user?.prenom || ''} ! Je suis votre assistant BioScan. Posez-moi vos questions sur les produits alimentaires.`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const botReply = async (userMessage) => {
        setIsTyping(true);
        try {
            // On envoie un historique léger pour le contexte (les 6 derniers messages par ex.)
            const history = messages.slice(-6);
            
            const response = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history })
            });

            if (!response.ok) {
                throw new Error("Erreur de réponse de l'assistant API");
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    from: 'bot',
                    text: data.reply,
                },
            ]);
        } catch (error) {
            console.error("Erreur Chatbot:", error);
            setMessages((prev) => [
                ...prev,
                {
                    from: 'bot',
                    text: "Désolé, je rencontre des difficultés techniques pour vous répondre.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setMessages((prev) => [...prev, { from: 'user', text }]);
        // Enregistre dans l'historique de recherche si disponible
        if (typeof addToHistory === 'function') addToHistory(text);
        botReply(text);
        setInput('');
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
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ ...styles.message, alignSelf: 'flex-start', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                ···
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={styles.input}
                        />
                        <button onClick={handleSend} style={styles.sendBtn} disabled={!input.trim()}>
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
        backgroundColor: '#16a34a',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 56,
        height: 56,
        cursor: 'pointer',
        fontSize: 22,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    chatBox: {
        position: 'absolute',
        bottom: 68,
        right: 0,
        width: 320,
        maxHeight: 420,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
    },
    header: {
        backgroundColor: '#16a34a',
        color: '#fff',
        padding: '10px 14px',
        fontWeight: 600,
        fontSize: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1,
    },
    messages: {
        flex: 1,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
    },
    message: {
        padding: '8px 12px',
        borderRadius: 10,
        maxWidth: '82%',
        fontSize: 13,
        lineHeight: 1.5,
    },
    inputArea: {
        display: 'flex',
        borderTop: '1px solid #e5e7eb',
        padding: 4,
        gap: 4,
    },
    input: {
        flex: 1,
        padding: '8px 10px',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        outline: 'none',
        fontSize: 13,
    },
    sendBtn: {
        padding: '0 12px',
        border: 'none',
        backgroundColor: '#16a34a',
        color: '#fff',
        cursor: 'pointer',
        borderRadius: 8,
        fontSize: 16,
    },
};

export default Chatbot;