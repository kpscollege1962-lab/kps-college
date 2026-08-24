class ApiResponse {
  static success(message = 'Success', data = null) {
    return { success: true, message, data };
  }

  static error(message = 'Internal Server Error', data = null) {
    return { success: false, message, data };
  }
}

module.exports = ApiResponse;
