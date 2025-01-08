export interface IEmailMessage {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html: string;
}