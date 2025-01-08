import * as Joi from 'joi';
import { email, id, password, proper_noun } from '../types/schemas';
import EnvConfig from '../config/environment.config';
import { ENVIRONMENT } from '../types/enums';

const signup = {
    body: Joi.object().keys({
        firstname: proper_noun("First Name").required(),
        lastname: proper_noun("Last Name").required(),
        email: email().required().label('Email address'),
        phone: Joi.string().optional().label('Phone number'),
        password: password(EnvConfig.env === ENVIRONMENT.development ? 'user-weak' : 'user').required().label('Password'),
        level: id().required().label('Level')
    }),
};

const login = {
    body: Joi.object().keys({
        email: email().required().label('Email address'),
        password: password(EnvConfig.env === ENVIRONMENT.development ? 'user-weak' : 'user').required().label('Password'),
        remember: Joi.boolean().optional().label('Remember me'),
    })
}

const forgotPassword = {
    body: Joi.object().keys({
        email: email().required().label('Email address'),
    }),
};

const resetPassword = {
    body: Joi.object().keys({
        new_password: password(EnvConfig.env === ENVIRONMENT.development ? 'user-weak' : 'user').required().label('Your new Password'),
    }),
};

const updatePassword = {
    body: Joi.object().keys({
        old_password: password(EnvConfig.env === ENVIRONMENT.development ? 'user-weak' : 'user').required().label('Current Password'),
        new_password: password(EnvConfig.env === ENVIRONMENT.development ? 'user-weak' : 'user').required().label('New Password'),
    }),
};

const updateUserInfo = {
    body: Joi.object().keys({
        firstname: proper_noun("First Name").required(),
        lastname: proper_noun("Last Name").required(),
        email: email().required().label('Email address'),
    }),
};

const verifyEmail = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
};

export default {
    signup,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updatePassword,
    updateUserInfo
};