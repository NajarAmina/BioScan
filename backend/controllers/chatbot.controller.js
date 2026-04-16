exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "API Key non configurée" });
        }

        const prompt = `Tu es BioScan AI, un assistant virtuel amical et expert en nutrition.
Ton rôle est d'aider les consommateurs à comprendre les informations nutritionnelles, les additifs, et les impacts des aliments sur la santé.
Sois concis, clair, et chaleureux. Parle en français.

Historique récent de la conversation :
${(history || []).map(m => (m.from === 'user' ? 'Utilisateur: ' : 'BioScan: ') + m.text).join('\n')}

Utilisateur: ${message}
BioScan:`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: prompt }],
                temperature: 0.5,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API Error: ${response.status} ${err}`);
        }

        const data = await response.json();
        const botReply = data.choices[0]?.message?.content || "Désolé, je ne peux pas répondre pour le moment.";

        res.status(200).json({ reply: botReply.trim() });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "Erreur lors de la communication avec l'assistant." });
    }
};
