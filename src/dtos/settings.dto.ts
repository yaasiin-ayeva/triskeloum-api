
export class SocialMediaLinksDto {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
    linkedin: string | null;
    google_plus: string | null;
    whatsapp: string | null;
    telegram: string | null;
}

export class AppStatusDto {
    is_app_maintenance_mode: boolean;
    app_maintenance_message: string | null;
}

export class AppCurrencyDto {
    code: string | null;
    symbol: string | null;
    name: string | null;
}

export class MoblileAppLinksDto {
    play_store: string | null;
    android_package_name: string | null;
    apple_store: string | null;
    apple_id: string | null;
}

export class AppEmailConfigDto {
    driver: string | null;
    protocol: string | null;
    host: string | null;
    port: number | null;
    username: string | null;
    password: string | null;
    from: string | null;
    encryption: string | null;
}

export class AppLocationDto {
    country: string | null;
    city: string | null;
    address: string | null;
    timezone: string | null;
}

export class AppInfoDto {
    name: string | null;
    description: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    logo: string | null;
    favicon: string | null;
    url: string | null;
}

export class AppSettingDto {
    appInfo: AppInfoDto;
    appStatus: AppStatusDto;
    appLocation: AppLocationDto;
    appCurrency: AppCurrencyDto;
    appEmailConfig: AppEmailConfigDto;
    socialMediaLinks: SocialMediaLinksDto;
    mobileAppLinks: MoblileAppLinksDto;
}