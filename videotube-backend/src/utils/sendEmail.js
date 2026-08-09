import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.SMTP_HOST) {
        console.warn("[sendEmail] SMTP_HOST is not configured in .env. Skipping email dispatch to:", to);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};