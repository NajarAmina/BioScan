const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['consommateur', 'agent_saisie', 'fournisseur', 'admin', 'administrateur'],
        default: 'consommateur'
    },
    nom:    { type: String, required: true },
    prenom: { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ AJOUTÉ : champ blocage
    isBlocked: { type: Boolean, default: false },

    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },

}, { timestamps: true }); // ✅ AJOUTÉ : createdAt et updatedAt automatiques

// Hasher le mot de passe avant save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Comparer les mots de passe
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
