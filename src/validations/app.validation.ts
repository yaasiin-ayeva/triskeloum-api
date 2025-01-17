import * as Joi from 'joi';

export const updateAppInfoSchema = {
    body: Joi.object({
        name: Joi.string().allow(null, '').optional().label('App Name'),
        description: Joi.string().allow(null, '').optional().label('Description'),
        contact_phone: Joi.string().allow(null, '').optional().label('Contact Phone'),
        contact_email: Joi.string().email().allow(null, '').optional().label('Contact Email'),
        logo: Joi.string().uri().allow(null, '').optional().label('Logo'),
        favicon: Joi.string().uri().allow(null, '').optional().label('Favicon'),
        url: Joi.string().uri().allow(null, '').optional().label('URL'),
    })
};

export const updateAppLocationSchema = {
    body: Joi.object({
        country: Joi.string().allow(null, '').optional().label('Country'),
        city: Joi.string().allow(null, '').optional().label('City'),
        address: Joi.string().allow(null, '').optional().label('Address'),
        timezone: Joi.string().allow(null, '').optional().label('Timezone'),
    })
};

export const updateAppEmailConfigSchema = {
    body: Joi.object({
        driver: Joi.string().allow(null, '').optional().label('Driver'),
        protocol: Joi.string().allow(null, '').optional().label('Protocol'),
        host: Joi.string().allow(null, '').optional().label('Host'),
        port: Joi.number().integer().allow(null).optional().label('Port'),
        username: Joi.string().allow(null, '').optional().label('Username'),
        password: Joi.string().allow(null, '').optional().label('Password'),
        from: Joi.string().email().allow(null, '').optional().label('From Email'),
        encryption: Joi.string().allow(null, '').optional().label('Encryption'),
    })
};

export const createEmailSchema = {
    body: Joi.object({
        sender: Joi.string().email().required().label('Sender Email'),
        recipient: Joi.string().email().required().label('Recipient Email'),
        subject: Joi.string().required().label('Subject'),
        html: Joi.string().required().label('HTML'),
        text: Joi.string().required().label('Text'),
    })
};


export const updateMobileAppLinksSchema = {
    body: Joi.object({
        play_store: Joi.string().uri().allow(null, '').optional().label('Play Store Link'),
        android_package_name: Joi.string().allow(null, '').optional().label('Android Package Name'),
        apple_store: Joi.string().uri().allow(null, '').optional().label('Apple Store Link'),
        apple_id: Joi.string().allow(null, '').optional().label('Apple ID'),
    })
};

export const updateAppCurrencySchema = {
    body: Joi.object({
        code: Joi.string().allow(null, '').optional().label('Currency Code'),
        symbol: Joi.string().allow(null, '').optional().label('Currency Symbol'),
        name: Joi.string().allow(null, '').optional().label('Currency Name'),
    })
};

export const updateAppStatusSchema = {
    body: Joi.object({
        is_app_maintenance_mode: Joi.boolean().required().label('App Maintenance Mode'),
        app_maintenance_message: Joi.string().allow(null, '').optional().label('App Maintenance Message'),
    })
};

export const updateSocialMediaLinksSchema = {
    body: Joi.object({
        facebook: Joi.string().uri().allow(null, '').optional().label('Facebook Link'),
        twitter: Joi.string().uri().allow(null, '').optional().label('Twitter Link'),
        instagram: Joi.string().uri().allow(null, '').optional().label('Instagram Link'),
        youtube: Joi.string().uri().allow(null, '').optional().label('YouTube Link'),
        linkedin: Joi.string().uri().allow(null, '').optional().label('LinkedIn Link'),
        google_plus: Joi.string().uri().allow(null, '').optional().label('Google Plus Link'),
        whatsapp: Joi.string().uri().allow(null, '').optional().label('WhatsApp Link'),
        telegram: Joi.string().uri().allow(null, '').optional().label('Telegram Link'),
    })
};
