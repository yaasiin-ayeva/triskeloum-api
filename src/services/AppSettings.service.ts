import { AppCurrencyDto, AppEmailConfigDto, AppInfoDto, AppLocationDto, AppSettingDto, AppStatusDto, MoblileAppLinksDto, SocialMediaLinksDto } from "../dtos/settings.dto";
import { AppSetting } from "../models/AppSetting.model";
import BaseService from "./Base.service";

export default class AppSettingsService extends BaseService<AppSetting> {

    static instance: AppSettingsService;

    constructor() {
        if (AppSettingsService.instance) {
            return AppSettingsService.instance;
        }
        super(AppSetting);
        AppSettingsService.instance = this;
    }

    async getDefault(): Promise<AppSetting> {
        let settings = await this.repo.findOne({ where: {} });
        if (!settings) {
            settings = new AppSetting({});
            await this.repo.save(settings);
        }
        return settings;
    }

    async updateSocialMediaLinks(socialMediaLinks: SocialMediaLinksDto) {
        const settings = await this.getDefault();
        settings.setSocialMediaLinks(socialMediaLinks);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateMobileAppLinks(mobileAppLinks: MoblileAppLinksDto) {
        const settings = await this.getDefault();
        settings.setMobileAppLinks(mobileAppLinks);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateAppEmailConfig(emailConfig: AppEmailConfigDto) {
        const settings = await this.getDefault();
        settings.setAppEmailConfig(emailConfig);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateAppCurrency(currency: AppCurrencyDto) {
        const settings = await this.getDefault();
        settings.setAppCurrency(currency);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateAppStatus(status: AppStatusDto) {
        const settings = await this.getDefault();
        settings.setAppStatus(status);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateAppLocation(location: AppLocationDto) {
        const settings = await this.getDefault();
        settings.setAppLocation(location);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async updateAppInfo(appInfo: AppInfoDto) {
        const settings = await this.getDefault();
        settings.setAppInfo(appInfo);
        await this.repo.save(settings);
        return this.getAppSettings();
    }

    async getAppSettings(): Promise<AppSettingDto> {
        const appSettings = await this.getDefault();
        return {
            appInfo: appSettings.getAppInfo,
            appStatus: appSettings.getAppStatus,
            appLocation: appSettings.getAppLocation,
            appCurrency: appSettings.getAppCurrency,
            appEmailConfig: appSettings.getAppEmailConfig,
            socialMediaLinks: appSettings.getSocialMediaLinks,
            mobileAppLinks: appSettings.getMobileAppLinks
        }
    }

    static async getSettings(): Promise<any> {
        const settings = new AppSettingsService();
        return await settings.getAppSettings();
    }
}