const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model'); // Vérifiez que le chemin correspond bien à votre architecture
require('dotenv').config();

const createAdmin = async () => {
  try {
    // 1. Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plateformeIA_PFE');
    console.log('🔗 Connecté à MongoDB');

    // 2. Définir les identifiants de l'administrateur
    const adminEmail = 'chamakhahlem93@gmail.com';
    const adminPassword = 'admin123';

    // 3. Vérifier s'il n'existe pas déjà
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Un compte administrateur utilise déjà cet email.');
      process.exit();
    }

    // 4. Hacher le mot de passe (sécurité)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 5. Créer l'utilisateur
    const admin = new User({
      nom: 'Super',
      prenom: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'administrateur'
    });

    await admin.save();
    console.log('✅ Compte Administrateur unique créé avec succès en base de données !');
    console.log(`📧 Email : ${adminEmail}`);
    console.log(`🔑 Mot de passe : ${adminPassword}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

createAdmin();
