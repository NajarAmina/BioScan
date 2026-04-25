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

        // ✅ Formatage de l'historique
        // Pour les messages avec image dans l'historique, on garde uniquement le texte
        // (envoyer des images dans l'historique dépasse souvent les limites de token)
        const formattedHistory = (history || []).map(m => {
            const role = m.from === 'user' ? 'user' : 'assistant';
            return {
                role,
                content: m.text || "..."
            };
        });

        // ✅ Construction du message utilisateur courant
        const hasImage = !!image;

        // Choisir le bon modèle selon la présence d'image
        // - Avec image  → modèle vision Groq supporté
        // - Sans image  → modèle texte rapide
        const model = hasImage
            ? "meta-llama/llama-4-maverick-17b-128e-instruct"  // ✅ Vision supporté sur Groq
            : "llama3-8b-8192";                                 // ✅ Texte rapide et stable

        let userContent;

        if (hasImage) {
            // ✅ Format multimodal correct pour Groq vision
            userContent = [
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${image}`
                    }
                },
                {
                    type: "text",
                    text: message || "Analyse ce produit alimentaire. Dis-moi s'il est bio, ses ingrédients principaux, et s'il est bon pour la santé."
                }
            ];
        } else {
            // ✅ Format texte simple (pas de tableau nécessaire)
            userContent = message || "Bonjour";
        }

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
                max_tokens: 600
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Groq API Error: ${response.status}`, err);

            // ✅ Si le modèle vision échoue, retry en texte seul
            if (hasImage && response.status === 400) {
                console.warn("Vision model failed, retrying text-only...");
                const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama3-8b-8192",
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...formattedHistory,
                            {
                                role: "user",
                                content: message || "J'ai envoyé une image d'un produit alimentaire. Donne-moi des conseils généraux sur comment évaluer si un produit est bio."
                            }
                        ],
                        temperature: 0.5,
                        max_tokens: 600
                    })
                });

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    const reply = fallbackData.choices[0]?.message?.content
                        || "Désolé, je ne peux pas analyser cette image pour le moment.";
                    return res.status(200).json({ reply: reply.trim() });
                }
            }

            throw new Error(`Groq API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const botReply = data.choices[0]?.message?.content
            || "Désolé, je ne peux pas répondre pour le moment.";

        res.status(200).json({ reply: botReply.trim() });

    } catch (error) {
        console.error("Chatbot Error:", error.message);
        res.status(500).json({ error: "Erreur lors de la communication avec l'assistant." });
    }
};