import EnvConfig from "./environment.config";
import { createTransport } from 'nodemailer';
import logger from "./logger.config";
import Mail from "nodemailer/lib/mailer";
const { convert } = require('html-to-text');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(EnvConfig.SENDGRID_API_KEY);

const defaultTransporter = createTransport({
    service: EnvConfig.SMTP_SERVICE,
    host: EnvConfig.SMTP_HOST,
    port: EnvConfig.SMTP_PORT,
    secure: EnvConfig.SMTP_SECURE,
    auth: {
        user: EnvConfig.SMTP_USER,
        pass: EnvConfig.SMTP_PASS,
    },
});

export const sendMail = async (
    msg: Mail.Options,
    provider: 'nodemailer' | 'sendgrid' = EnvConfig.DEFAULT_EMAIL_PROVIDER,
    transporter: any = provider === 'nodemailer' ? defaultTransporter : sgMail
) => {
    if (EnvConfig.ENABLE_EMAIL) {
        if (provider === 'sendgrid') {
            await transporter.send(msg);
        } else {

            const text = convert(msg.html, { wordwrap: 130 });
            const info = await transporter.sendMail({
                from: msg.from,
                to: msg.to,
                subject: msg.subject,
                html: msg.html,
                text
            });

            logger.info(`SMTP Message info: ${JSON.stringify(info)}`);
        }
    } else {
        logger.warn(`Email not sent. Email is disabled!`);
    }
}

export const verifySmtpConnection = async () => {
    logger.info('SMTP connection Initialized');
    await defaultTransporter.verify()
        .then(() => logger.info('SMTP connection verified'))
        .catch((error) => logger.error(`SMTP connection verification error:\n ${error}`));
}