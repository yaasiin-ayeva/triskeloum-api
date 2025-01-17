// import { createTransport } from 'nodemailer';
// import { Email } from "../models/Email.model";
// import BaseService from "./Base.service";
// import AppSettingsService from './AppSettings.service';

// export default class EmailService extends BaseService<Email> {

//     private static instance: EmailService;
//     private readonly appSettingsService: AppSettingsService;

//     constructor() {
//         if (EmailService.instance) {
//             return EmailService.instance;
//         }
//         super(Email);
//         this.appSettingsService = AppSettingsService.instance;
//         EmailService.instance = this;
//     }

//     public async sendEmail(emailId: number): Promise<Email | null> {
//         const email = await this.repo.findOne({ where: { id: emailId } });
//         if (!email) {
//             throw new Error("Email not found");
//         }

//         const appSettings = await this.appSettingsService.getAppSettings();
//         const emailConfig = appSettings.getAppEmailConfig();

//         const transporter = createTransport({
//             service: "gmail",
//             auth: {
//                 user: AppSettingsService,
//                 pass: process.env.GMAIL_PASS,
//             },


//             service: EnvConfig.SMTP_SERVICE,
//             host: EnvConfig.SMTP_HOST,
//             port: EnvConfig.SMTP_PORT,
//             secure: EnvConfig.SMTP_SECURE,
//             auth: {
//                 user: EnvConfig.SMTP_USER,
//                 pass: EnvConfig.SMTP_PASS,
//             },
//         });
//     }
// }