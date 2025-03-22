import { createTransport } from 'nodemailer';
import { Email } from "../models/Email.model";
import BaseService from "./Base.service";
import AppSettingsService from './AppSettings.service';
import { In } from 'typeorm';
const { convert } = require('html-to-text');

export default class EmailService extends BaseService<Email> {

    private static instance: EmailService;
    private readonly appSettingsService: AppSettingsService;

    constructor() {
        if (EmailService.instance) {
            return EmailService.instance;
        }
        super(Email);
        this.appSettingsService = AppSettingsService.instance;
        EmailService.instance = this;
    }

    public async sendEmail(emailId: number): Promise<Email | null> {
        let email = await this.repo.findOne({ where: { id: emailId } });
        if (!email) {
            throw new Error("Email not found");
        }

        const appSettings = await this.appSettingsService.getAppSettings();
        const emailConfig = appSettings.appEmailConfig;

        const transporter = createTransport({
            service: "gmail",
            host: emailConfig.host,
            port: emailConfig.port,
            secure: true,
            auth: {
                user: emailConfig.username,
                pass: emailConfig.password,
            },
        });

        const info = await transporter.sendMail({
            from: emailConfig.from,
            to: email.recipient,
            subject: email.subject,
            cc: email.sender,
            html: email.html,
            text: email.text
        });

        if (
            info && info.response &&
            info.response.includes("OK") &&
            info.accepted && info.accepted.length > 0 &&
            info.accepted[0] === email.recipient
        ) {
            email.isSent = true;
            email = await this.repo.save(email);
        }

        return email;
    }

    public async sendEmails(emailIds: number[]): Promise<Email[]> {
        const emails = await this.repo.findBy({ id: In(emailIds) });
        return Promise.all(emails.map(async (email) => {
            return this.sendEmail(email.id);
        }));
    }

    public async createAndSendEmail(emailData: Partial<Email>): Promise<Email> {
        emailData.text = convert(emailData.html, { wordwrap: 130 });
        const email = await this.create(emailData);
        return this.sendEmail(email.id);
    }
}