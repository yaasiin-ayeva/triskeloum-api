export interface CreateQuestionDTO {
    text: string;
    type?: 'single_choice' | 'multiple_choice';
    options: string[];
}

export interface AnswersDTO {
    questionId: number;
    selectedOptionIds: number[];
}

export interface SubmitTestDTO {
    testSessionId: number;
    autoSubmit?: boolean;
    answers: AnswersDTO[];
}

export interface SetAppConfigDTO {
    send_test_result_by_email: boolean;
    email_domain_restriction: string[];
    wrong_answers_penalty: number
}