const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendResetPasswordEmail = async (toEmail, resetUrl) => {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        const error = new Error('SMTP non configuré');
        error.code = 'SMTP_NON_CONFIGURE';
        throw error;
    }

    const mailOptions = {
        from: `"BioScan" <${process.env.SMTP_EMAIL}>`,
        to: toEmail,
        subject: '🔐 Réinitialisation de votre mot de passe BioScan',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">BioScan</h2>
                <h3>Réinitialisation de votre mot de passe</h3>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                <a href="${resetUrl}" style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #16a34a;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 16px 0;
                ">Réinitialiser mon mot de passe</a>
                <p style="color: #6b7280; font-size: 0.875rem;">
                    Ce lien expire dans <strong>1 heure</strong>.<br/>
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
                <p style="color: #9ca3af; font-size: 0.75rem;">BioScan — Analysez vos produits en un scan</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        if (err.code === 'EAUTH' || err.responseCode === 535) {
            err.code = 'SMTP_NON_CONFIGURE';
        }
        throw err;
    }
};

module.exports = { sendResetPasswordEmail };