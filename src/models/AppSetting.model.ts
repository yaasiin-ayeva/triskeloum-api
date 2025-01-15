import { Column, Entity } from "typeorm";
import { AppCurrencyDto, AppEmailConfigDto, AppInfoDto, AppLocationDto, AppStatusDto, MoblileAppLinksDto, SocialMediaLinksDto } from "../dtos/settings.dto";
import BaseModel from "./Base.model";

@Entity("app_settings")
export class AppSetting extends BaseModel {

    @Column({ type: "varchar", nullable: true, unique: false })
    app_name: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_description: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_contact_phone: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_contact_email: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_logo: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_favicon: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    country: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    city: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    address: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    timezone: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_driver: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_protocol: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_host: string;

    @Column({ type: "int", nullable: true, unique: false })
    mailer_port: number;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_username: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_password: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_from: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mailer_encryption: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_play_store_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_android_package_name: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_apple_store_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_apple_id: string;

    @Column({ type: "boolean", default: false })
    is_app_maintenance_mode: boolean;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_maintenance_message: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_currency_symbol: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_currency_code: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    app_currency_name: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_facebook_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_twitter_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_instagram_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_youtube_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_linkedin_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_google_plus_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_whatsapp_url: string;

    @Column({ type: "varchar", nullable: true, unique: false })
    mobile_app_telegram_url: string;

    get getAppInfo() {
        return {
            name: this.app_name,
            description: this.app_description,
            contact_phone: this.app_contact_phone,
            contact_email: this.app_contact_email,
            url: this.app_url,
            logo: this.app_logo,
            favicon: this.app_favicon
        }
    }

    setAppInfo(info: AppInfoDto) {
        this.app_name = info.name ?? this.app_name;
        this.app_description = info.description ?? this.app_description;
        this.app_contact_phone = info.contact_phone ?? this.app_contact_phone;
        this.app_contact_email = info.contact_email ?? this.app_contact_email;
        this.app_url = info.url ?? this.app_url;
        this.app_logo = info.logo ?? this.app_logo;
        this.app_favicon = info.favicon ?? this.app_favicon;
    }

    get getAppLocation() {
        return {
            country: this.country,
            city: this.city,
            address: this.address,
            timezone: this.timezone
        }
    }

    setAppLocation(location: AppLocationDto) {
        this.country = location.country ?? this.country;
        this.city = location.city ?? this.city;
        this.address = location.address ?? this.address;
        this.timezone = location.timezone ?? this.timezone;
    }

    get getAppEmailConfig() {
        return {
            driver: this.mailer_driver,
            protocol: this.mailer_protocol,
            host: this.mailer_host,
            port: this.mailer_port,
            username: this.mailer_username,
            password: this.mailer_password,
            from: this.mailer_from,
            encryption: this.mailer_encryption
        }
    }

    setAppEmailConfig(config: AppEmailConfigDto) {
        this.mailer_driver = config.driver ?? this.mailer_driver;
        this.mailer_protocol = config.protocol ?? this.mailer_protocol;
        this.mailer_host = config.host ?? this.mailer_host;
        this.mailer_port = config.port ?? this.mailer_port;
        this.mailer_username = config.username ?? this.mailer_username;
        this.mailer_password = config.password ?? this.mailer_password;
        this.mailer_from = config.from ?? this.mailer_from;
        this.mailer_encryption = config.encryption ?? this.mailer_encryption;
    }

    get getMobileAppLinks() {
        return {
            play_store: this.mobile_app_play_store_url,
            android_package_name: this.mobile_app_android_package_name,
            apple_store: this.mobile_app_apple_store_url,
            apple_id: this.mobile_app_apple_id
        }
    }

    setMobileAppLinks(links: MoblileAppLinksDto) {
        this.mobile_app_play_store_url = links.play_store ?? this.mobile_app_play_store_url;
        this.mobile_app_android_package_name = links.android_package_name ?? this.mobile_app_android_package_name;
        this.mobile_app_apple_store_url = links.apple_store ?? this.mobile_app_apple_store_url;
        this.mobile_app_apple_id = links.apple_id ?? this.mobile_app_apple_id;
    }

    get getAppCurrency() {
        return {
            code: this.app_currency_code,
            symbol: this.app_currency_symbol,
            name: this.app_currency_name
        }
    }

    setAppCurrency(currency: AppCurrencyDto) {
        this.app_currency_code = currency.code ?? this.app_currency_code;
        this.app_currency_symbol = currency.symbol ?? this.app_currency_symbol;
        this.app_currency_name = currency.name ?? this.app_currency_name;
    }

    get getAppStatus() {
        return {
            is_app_maintenance_mode: this.is_app_maintenance_mode,
            app_maintenance_message: this.app_maintenance_message
        }
    }

    setAppStatus(status: AppStatusDto) {
        this.is_app_maintenance_mode = status.is_app_maintenance_mode ?? this.is_app_maintenance_mode;
        this.app_maintenance_message = status.app_maintenance_message ?? this.app_maintenance_message;
    }

    get getSocialMediaLinks() {
        return {
            facebook: this.mobile_app_facebook_url,
            twitter: this.mobile_app_twitter_url,
            instagram: this.mobile_app_instagram_url,
            youtube: this.mobile_app_youtube_url,
            linkedin: this.mobile_app_linkedin_url,
            google_plus: this.mobile_app_google_plus_url,
            whatsapp: this.mobile_app_whatsapp_url,
            telegram: this.mobile_app_telegram_url,
        }
    }

    setSocialMediaLinks(links: SocialMediaLinksDto) {
        this.mobile_app_facebook_url = links.facebook ?? this.mobile_app_facebook_url;
        this.mobile_app_twitter_url = links.twitter ?? this.mobile_app_twitter_url;
        this.mobile_app_instagram_url = links.instagram ?? this.mobile_app_instagram_url;
        this.mobile_app_youtube_url = links.youtube ?? this.mobile_app_youtube_url;
        this.mobile_app_linkedin_url = links.linkedin ?? this.mobile_app_linkedin_url;
        this.mobile_app_google_plus_url = links.google_plus ?? this.mobile_app_google_plus_url;
        this.mobile_app_whatsapp_url = links.whatsapp ?? this.mobile_app_whatsapp_url;
        this.mobile_app_telegram_url = links.telegram ?? this.mobile_app_telegram_url;
    };

    constructor(appSetting: Partial<AppSetting>) {
        super();
        Object.assign(this, appSetting);
    }
}