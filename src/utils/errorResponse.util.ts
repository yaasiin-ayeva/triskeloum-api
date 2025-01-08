import EnvConfig from "../config/environment.config";
import { ENVIRONMENT } from "../types/enums";

export default class ErrorResponse extends Error {

  statusCode: number;
  payload?: any;

  constructor(message: string, statusCode: number, payload?: any) {
    super(message);
    this.statusCode = statusCode;

    if (payload) {
      this.payload = payload;
    }

    if (EnvConfig.env === ENVIRONMENT.test) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}