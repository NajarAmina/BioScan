const Anthropic = require('@anthropic-ai/sdk');

// Initialiser le client Anthropic dès qu'il y a une clé API
const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

const isConfigured = () => {
  if (!client) {
    console.warn('⚠️  ANTHROPIC_API_KEY not configured. LLM features disabled.');
    return false;
  }
  return true;
};

module.exports = {
  client,
  isConfigured,
};
