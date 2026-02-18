import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	// If streaming has already started, Express must close the connection natively
	if (res.headersSent) {
		return next(err);
	}

	let statusCode = 500;
	let message = "Internal Server Error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
	} else if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
		statusCode = 400;
		message = err.errors.map((e: any) => e.message).join(", ");
	} else if (err instanceof Error) {
		message = process.env.NODE_ENV === "development" ? err.message : "Something went wrong";
	}

	console.error(` ${statusCode} - ${err.message}`, err.stack);

	res.status(statusCode).json({ error: message });
};