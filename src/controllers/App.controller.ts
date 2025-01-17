import { NextFunction, Request, Response } from "express";
import { BaseController } from "./Base.controller";
import AppSettingsService from "../services/AppSettings.service";
import { createEmailSchema, updateAppCurrencySchema, updateAppEmailConfigSchema, updateAppInfoSchema, updateAppLocationSchema, updateAppStatusSchema, updateMobileAppLinksSchema, updateSocialMediaLinksSchema } from "../validations/app.validation";
import { AppCurrencyDto, AppEmailConfigDto, AppInfoDto, AppLocationDto, AppStatusDto, EmailDto, MoblileAppLinksDto, SocialMediaLinksDto } from "../dtos/settings.dto";
import EmailService from "../services/Email.service";

export default class AppController extends BaseController<AppSettingsService> {

    private readonly _emailService: EmailService;

    constructor() {
        super(new AppSettingsService(), 'app_settings');
        this._emailService = new EmailService();
    }

    public getAppSettingsHandler = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.service.getAppSettings();
            return this.apiResponse(res, 200, "App settings fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateSocialMediaLinksHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateSocialMediaLinksSchema);
            const payload = new SocialMediaLinksDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateSocialMediaLinks(payload);
            return this.apiResponse(res, 200, "Social media links updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateMobileAppLinksHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateMobileAppLinksSchema);
            const payload = new MoblileAppLinksDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateMobileAppLinks(payload);
            return this.apiResponse(res, 200, "Mobile app links updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateAppEmailConfigHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateAppEmailConfigSchema);
            const payload = new AppEmailConfigDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateAppEmailConfig(payload);
            return this.apiResponse(res, 200, "App settings updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateAppCurrencyHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateAppCurrencySchema);
            const payload = new AppCurrencyDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateAppCurrency(payload);
            return this.apiResponse(res, 200, "App settings updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateAppStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateAppStatusSchema);
            const payload = new AppStatusDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateAppStatus(payload);
            return this.apiResponse(res, 200, "App settings updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateAppLocationHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateAppLocationSchema);
            const payload = new AppLocationDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateAppLocation(payload);
            return this.apiResponse(res, 200, "App settings updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public updateAppInfoHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, updateAppInfoSchema);
            const payload = new AppInfoDto();
            Object.assign(payload, req.body);
            const data = await this.service.updateAppInfo(payload);
            return this.apiResponse(res, 200, "App settings updated successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public createEmailHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validateRequestArgs(req, createEmailSchema);
            const payload = new EmailDto();
            Object.assign(payload, req.body);
            const data = await this._emailService.createAndSendEmail(payload);
            return this.apiResponse(res, 200, "Email created successfully", data);
        } catch (e) {
            next(e);
        }
    }
}