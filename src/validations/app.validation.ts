import * as Joi from 'joi';
import { id, proper_noun } from '../types/schemas';

export const createTestSchema = {
    body: Joi.object({
        topicId: id().required().label('Topic Id'),
        title: Joi.string().max(255).required().label('Test Title'),
        description: Joi.string().allow(null, '').optional().label('Description'),
        duration_minutes: Joi.number().integer().min(1).optional().label('Duration (minutes)'),
    })
};

export const createTopicSchema = {
    body: Joi.object({
        title: Joi.string().max(255).required().label('Topic Title'),
        description: Joi.string().allow(null, '').optional().label('Description'),
        picture: Joi.binary().allow(null, '').optional().label('Picture'),
    })
};

export const updateTestSchema = {
    body: Joi.object({
        title: Joi.string().max(255).optional().label('Test Title'),
        description: Joi.string().allow(null, '').optional().label('Description'),
        duration_minutes: Joi.number().integer().min(1).optional().label('Duration (minutes)'),
    })
};

export const createOptionSchema = {
    body: Joi.object({
        text: Joi.string().max(255).required().label('Option Text'),
        isCorrect: Joi.boolean().default(false).optional().label('Is Correct'),
    })
}

export const createQuestionSchema = {
    body: Joi.object({
        text: Joi.string().max(255).required().label('Question'),
        // type: Joi.string().valid('single_choice', 'multiple_choice').required().default('single_choice').label('Type'),
        options: Joi.array().items(createOptionSchema.body).min(2).required().label('Options'),
    }),
};

export const userAnswersSchema = {
    body: Joi.object({
        questionId: id().required().label('Question Id'),
        selectedOptionIds: Joi.array().items(id()).min(0).required().label('Selected Option Ids'),
    })
}

export const submitTestSchema = {
    body: Joi.object({
        autoSubmit: Joi.boolean().optional().label('Auto Submit'),
        testSessionId: id().required().label('Test Session Id'),
        answers: Joi.array().items(userAnswersSchema.body).min(0).required().label('Answers'),
    })
}

export const setAppConfigSchema = {
    body: Joi.object({
        send_test_result_by_email: Joi.boolean().required().label('Send Test Result By Email'),
        email_domain_restriction: Joi.array().items(Joi.string()).min(0).required().label('Email Domain Restriction'),
        wrong_answers_penalty: Joi.number().integer().min(0).required().label('Wrong Answers Penalty'),
    })
}

export const updateTopicSchema = {
    body: Joi.object({
        title: Joi.string().max(255).optional().label('Topic Title'),
        description: Joi.string().allow(null, '').optional().label('Description'),
        hide: Joi.boolean().optional().label('Hide'),
    })
}

export const bulkTestQuestionnairesStoreSchema = {
    body: Joi.object({
        topicId: id().required().label('Topic Id'),
        description: Joi.string().allow(null, '').optional().label('Test Description'),
        title: Joi.string().max(255).required().label('Test Title'),
        duration_minutes: Joi.number().integer().min(1).optional().label('Duration (minutes)'),
    })
}