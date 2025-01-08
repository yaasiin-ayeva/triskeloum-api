import { NextFunction, Response } from "express";
import ErrorResponse from "../utils/errorResponse.util";
import { ROLE } from "../types/enums";

export default function restrictTo(allowedRoles: ROLE[]) {
    return (req: any, _res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return next(new ErrorResponse("User role not found", 401));
        }

        if (allowedRoles.length > 0) {
            if (allowedRoles.includes(userRole)) {
                return next();
            } else {
                return next(new ErrorResponse("Unauthorized access", 403));
            }
        } else {
            return next();
        }
    };
}
