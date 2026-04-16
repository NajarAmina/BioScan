/** Map frontend role labels to MongoDB enum values */
const toBackendRole = (role) => {
    if (!role) return 'consommateur';
    const r = String(role).toLowerCase();
    if (r === 'administrateur') return 'admin';
    if (r === 'agent') return 'agent_saisie';
    return r;
};

/** Map DB role to what the React app expects */
const toFrontendRole = (role) => {
    if (!role) return 'consommateur';
    const r = String(role).toLowerCase();
    if (r === 'admin') return 'administrateur';
    if (r === 'agent_saisie') return 'agent';
    return r;
};

module.exports = { toBackendRole, toFrontendRole };
