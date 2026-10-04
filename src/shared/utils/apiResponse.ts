import { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export class ApiResponse {
  static success<T>(
    res: Response,
    {
      statusCode = 200,
      message = "Success",
      data,
    }: {
      statusCode?: number;
      message?: string;
      data?: T;
    },
  ) {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      data,
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    {
      statusCode = 500,
      message = "Internal Server Error",
      errors,
    }: {
      statusCode?: number;
      message?: string;
      errors?: unknown;
    },
  ) {
    const response: ErrorResponse = {
      success: false,
      message,
      errors,
    };

    return res.status(statusCode).json(response);
  }
}
