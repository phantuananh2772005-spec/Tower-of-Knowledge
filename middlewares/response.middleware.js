/**
 * Response Middleware
 * Enforces unified API response envelope:
 * Success: { success: true, data: ..., timestamp: ... }
 * Error:   { success: false, error: { code: ..., message: ... }, timestamp: ... }
 */

function responseFormatter(req, res, next) {
  res.apiSuccess = function (data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  };

  res.apiError = function (message, code = 'BAD_REQUEST', statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message: typeof message === 'string' ? message : (message.message || 'Lỗi hệ thống')
      },
      timestamp: new Date().toISOString()
    });
  };

  next();
}

module.exports = {
  responseFormatter
};
