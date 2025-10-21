import { ApiResponse, ApiError } from "../interfaces";

export class ResponseHelper {
  static success<T>(data: T): ApiResponse<T> {
    return {
      status: true,
      data,
    };
  }

  static error(message: string, code?: string, details?: any): ApiError {
    return {
      status: false,
      error: {
        message,
        code,
        details,
      },
    };
  }
}
