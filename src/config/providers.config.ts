import EnvConfig from "./environment.config";
import { createTransport } from 'nodemailer';
import logger from "./logger.config";

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(EnvConfig.SENDGRID_API_KEY);

interface EmailMessage {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
}

const transporter = createTransport({
    service: EnvConfig.SMTP_SERVICE,
    host: EnvConfig.SMTP_HOST,
    port: EnvConfig.SMTP_PORT,
    secure: EnvConfig.SMTP_SECURE,
    auth: {
        user: EnvConfig.SMTP_USER,
        pass: EnvConfig.SMTP_PASS,
    },
});

export const sendMail = async (msg: EmailMessage, provider: 'nodemailer' | 'sendgrid' = EnvConfig.DEFAULT_EMAIL_PROVIDER) => {
    if (EnvConfig.ENABLE_EMAIL) {
        if (provider === 'sendgrid') {
            await sgMail.send(msg);
        } else {
            const info = await transporter.sendMail({
                from: msg.from,
                to: msg.to,
                subject: msg.subject,
                text: msg.text,
                html: msg.html
            });

            logger.info(`SMTP Message info: ${JSON.stringify(info)}`);
        }
    }
}

export const verifySmtpConnection = async () => {
    logger.info('SMTP connection Initialized');
    await transporter.verify()
        .then(() => logger.info('SMTP connection verified'))
        .catch((error) => logger.error(`SMTP connection verification error:\n ${error}`));
}