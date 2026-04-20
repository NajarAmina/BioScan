exports.chat = async (req, res) => {
    try {
        const { message, history, image } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "API Key non configurée" });
        }

        const systemPrompt = `Tu es BioScan AI, un assistant virtuel amical et expert en nutrition.
Ton rôle est d'aider les consommateurs à comprendre les informations nutritionnelles, les additifs, et les impacts des aliments sur la santé.
Si une image de produit t'est envoyée, analyse ses ingrédients, valeurs nutritionnelles et additifs visibles.
Sois concis, clair, et chaleureux. Parle toujours en français.`;

        // ✅ Formatage correct de l'historique avec support des images
        const formattedHistory = (history || []).map(m => {
            const role = m.from === 'user' ? 'user' : 'assistant';

            // Si le message de l'historique contient une image base64
            if (m.imageBase64) {
                return {
                    role,
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${m.imageBase64}`
                            }
                        },
                        {
                            type: "text",
                            text: m.text && m.text !== '📷 Image envoyée'
                                ? m.text
                                : "Analyse ce produit alimentaire."
                        }
                    ]
                };
            }

            // Message texte classique
            return {
                role,
                content: m.text || "..."
            };
        });

        // ✅ Construction du message utilisateur courant
        const userContent = [];

        if (image) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${image}`
                }
            });
        }

        userContent.push({
            type: "text",
            text: message || "Analyse ce produit alimentaire."
        });

        // ✅ Toujours utiliser le modèle vision (il gère aussi le texte seul)
        const model = "meta-llama/llama-4-scout-17b-16e-instruct";

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...formattedHistory,
                    { role: "user", content: userContent }
                ],
                temperature: 0.5,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API Error: ${response.status} ${err}`);
        }

        const data = await response.json();
        const botReply = data.choices[0]?.message?.content
            || "Désolé, je ne peux pas répondre pour le moment.";

        res.status(200).json({ reply: botReply.trim() });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "Erreur lors de la communication avec l'assistant." });
    }
};