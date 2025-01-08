
export interface LoginDto {
    email: string,
    password: string,
    remember?: boolean
}

export interface ForgotPasswordDto {
    email: string
}

export class SignupDto {
    firstname: string
    lastname: string
    email: string
    phone: string
    password: string
    level: number
}