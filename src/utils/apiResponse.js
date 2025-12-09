/**
 * Standardized API Response Helper
 * Đảm bảo tất cả responses có format giống nhau
 */

export class ApiResponse {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created (201)
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * No Content (204) - Không trả về body
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not Found (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Conflict (409) - Ví dụ: User đã check-in rồi
   */
  static conflict(res, message = 'Resource conflict', errors = null) {
    return this.error(res, message, 409, errors);
  }

  /**
   * Internal Server Error (500)
   */
  static serverError(res, message = 'Internal Server Error') {
    return this.error(res, message, 500);
  }

  /**
   * Service Unavailable (503) - AI service down chẳng hạn
   */
  static serviceUnavailable(res, message = 'Service temporarily unavailable') {
    return this.error(res, message, 503);
  }
}
