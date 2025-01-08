import * as Events from 'events';
import { EMAIL_EVENTS } from '../enums';
import EnvConfig from '../../config/environment.config';
import logger from '../../config/logger.config';
import { sendMail } from '../../config/providers.config';
import { IEmailMessage, IMailUserData, ITestResultsDto } from '../interfaces';

const validator = require('validator');

const emailEmitter = new Events.EventEmitter();

emailEmitter.on((EMAIL_EVENTS.user_register as string), (userData: IMailUserData) => {

    if (!EnvConfig.ENABLE_EMAIL) {
        logger.info(`Email not sent. Email is disabled!`);
        return;
    } else if (!validator.isEmail(userData.email)) {
        logger.info(`Email not sent. Email is not valid!`);
        return;
    }

    const msg: IEmailMessage = {
        to: userData.email,
        from: EnvConfig.FROM_EMAIL,
        subject: `Welcome to ${EnvConfig.APP_NAME}, ${userData.firstname}!`,
        html: `
        <p>Hi ${userData.firstname},</p>
        <p>Welcome to ${EnvConfig.APP_NAME}! We're excited to have you on board.</p>
        <p>Ready to challenge yourself? Log in and try out our Triskeloum platform:</p>
        <p><a href="${EnvConfig.URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Start Now</a></p>
        <p>If you have any questions, we're here to help. Just reply to this email.</p>
        <p>Enjoy!</p>
        <p>The ${EnvConfig.APP_NAME} Team</p>
        `
    };

    sendMail(msg).then(() => {
        logger.info(`Email sent to ${userData.email}`);
    }).catch((error) => {
        logger.error(`Email could not be sent. \nError : ${error}`, 500);
    });
});

emailEmitter.on(EMAIL_EVENTS.user_reset_passwd as string, async (userData: IMailUserData) => {

    if (!EnvConfig.ENABLE_EMAIL) {
        logger.info(`Email not sent. Email is disabled!`);
        return;
    } else if (!validator.isEmail(userData.email)) {
        logger.info(`Email not sent. Email is not valid!`);
        return;
    }

    const msg: IEmailMessage = {
        to: userData.email,
        from: EnvConfig.FROM_EMAIL,
        subject: `${EnvConfig.APP_NAME}, Your password has been reset!`,
        text: `
            Your password has been successfully reset on ${EnvConfig.APP_NAME}.
        `,
        html: `
            <p>Your password has been successfully reset on ${EnvConfig.APP_NAME}.</p>
        `
    };

    sendMail(msg).then(() => {
        logger.info(`Email sent to ${userData.email}`);
    }).catch((error) => {
        logger.error(`Email could not be sent. \nError : ${error}`, 500);
    });
});

emailEmitter.on(EMAIL_EVENTS.send_test_result as string, async (testData: ITestResultsDto) => {
    if (!EnvConfig.ENABLE_EMAIL) {
        logger.info(`Email not sent. Email is disabled!`);
        return;
    } else if (!validator.isEmail(testData.user.email)) {
        logger.info(`Email not sent. Email is not valid!`);
        return;
    }

    const msg: IEmailMessage = {
        to: testData.user.email,
        from: EnvConfig.FROM_EMAIL,
        subject: `Your test result!`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #f9f9f9; color: #333;">
            <h1 style="color: #333;">Hello ${testData.user.firstname},</h1>
            <p>Here are your results for the <strong>${testData.test.title}</strong> test:</p>
            
            <div style="
                font-size: 48px; 
                font-weight: bold; 
                color: white; 
                padding: 20px; 
                border-radius: 8px; 
                background-color: ${testData.score >= testData.totalScore / 2 ? '#4CAF50' : '#F44336'};
            ">
                ${testData.correctAnswers} / ${testData.totalScore}
            </div>
    
            <p style="font-size: 16px; margin-top: 20px;">
                Correct answers: ${testData.correctAnswers} <br>
                Incorrect answers: ${testData.incorrectAnswers} <br>
                Unanswered questions: ${testData.unansweredQuestions}
            </p>
    
            <p style="font-size: 14px; color: #777; margin-top: 20px;">
                Test submitted on: ${new Date(testData.submittedAt).toLocaleDateString()} at ${new Date(testData.submittedAt).toLocaleTimeString()} <br>
                Duration: ${testData.test.duration_minutes} minutes
            </p>
    
            <p style="margin-top: 30px;">Good luck for your future tests!</p>
        </div>
        `,
    };


    sendMail(msg).then(() => {
        logger.info(`Email sent to ${testData.user.email}`);
    }).catch((error) => {
        logger.error(`Email could not be sent. \nError : ${error}`, 500);
    });
});

emailEmitter.on(EMAIL_EVENTS.user_forgot_passwd as string, async (userData: IMailUserData, resetUrl: string) => {
    if (!EnvConfig.ENABLE_EMAIL) {
        logger.info(`Email not sent. Email is disabled!`);
        return;
    } else if (!validator.isEmail(userData.email)) {
        logger.info(`Email not sent. Email is not valid!`);
        return;
    }

    const msg: IEmailMessage = {
        to: userData.email,
        from: EnvConfig.FROM_EMAIL,
        subject: `${EnvConfig.APP_NAME}, Reset Your Password!`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f7f7f7;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border: 1px solid #dddddd;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                    }
                    .content p {
                        margin: 15px 0;
                        line-height: 1.6;
                    }
                    .button-container {
                        text-align: center;
                        margin: 20px 0;
                    }
                    .button {
                        background-color: #4CAF50;
                        color: white;
                        padding: 12px 20px;
                        text-decoration: none;
                        font-size: 16px;
                        border-radius: 5px;
                        display: inline-block;
                    }
                    .button:hover {
                        background-color: #45a049;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        font-size: 12px;
                        color: #888888;
                        background-color: #f1f1f1;
                        border-top: 1px solid #dddddd;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>${EnvConfig.APP_NAME}</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${userData.firstname},</p>
                        <p>You are receiving this email because you (or someone else) requested a password reset for your account on ${EnvConfig.APP_NAME}.</p>
                        <p>If you did not request this, you can safely ignore this email.</p>
                        <div class="button-container">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
                        <p><a href="${resetUrl}" style="color: #4CAF50; word-wrap: break-word;">${resetUrl}</a></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${EnvConfig.APP_NAME}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    sendMail(msg).then(() => {
        logger.info(`Email sent to ${userData.email}`);
    }).catch((error) => {
        logger.error(`Email could not be sent. \nError : ${error}`, 500);
    });
});


export { emailEmitter }