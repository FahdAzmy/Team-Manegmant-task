export class ApiError extends Error {
  public statusCode: number;
  public errors: any[];
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors: any[] = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors: any[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string, errors: any[] = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message: string, errors: any[] = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message: string, errors: any[] = []) {
    return new ApiError(404, message, errors);
  }

  static internal(message: string, errors: any[] = []) {
    return new ApiError(500, message, errors);
  }
}
