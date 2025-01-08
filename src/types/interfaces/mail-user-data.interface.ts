export interface IMailUserData {
    email: string;
    firstname: string;
    lastname: string;
}

export interface ITestResultsDto {
    user: IMailUserData;
    score: number;
    totalScore: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    submittedAt: Date;
    test: {
        title: string;
        description: string;
        duration_minutes: number;
    };
}