require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Test SMTP Gmail ===');
console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL || '(non défini)');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? `"${process.env.SMTP_PASSWORD}" (${process.env.SMTP_PASSWORD.length} chars)` : '(non défini)');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

console.log('\nVérification de la connexion SMTP...');
transporter.verify()
    .then(() => {
        console.log('✅ Connexion SMTP réussie ! Le mot de passe d\'application est valide.');
        console.log('\nEnvoi d\'un email de test...');
        return transporter.sendMail({
            from: `"BioScan Test" <${process.env.SMTP_EMAIL}>`,
            to: process.env.SMTP_EMAIL,
            subject: 'Test SMTP BioScan',
            text: 'Si vous recevez cet email, la configuration SMTP fonctionne !'
        });
    })
    .then((info) => {
        console.log('✅ Email de test envoyé avec succès !');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Échec :', err.message);
        console.error('Code:', err.code);
        console.error('Commande:', err.command);
        console.error('\n--- Diagnostic ---');
        if (err.code === 'EAUTH' || err.message.includes('Invalid login')) {
            console.error('Le mot de passe d\'application Google est INVALIDE ou EXPIRÉ.');
            console.error('Solutions :');
            console.error('1. Allez sur https://myaccount.google.com/apppasswords');
            console.error('2. Générez un NOUVEAU mot de passe d\'application');
            console.error('3. Copiez-le dans .env SANS espaces');
        } else if (err.code === 'ESOCKET' || err.code === 'ECONNREFUSED') {
            console.error('Impossible de se connecter au serveur SMTP.');
            console.error('Vérifiez votre connexion internet.');
        }
        process.exit(1);
    });
