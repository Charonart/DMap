/**
 * Application Constants & Configuration
 * Lưu các thiết lập chung cho hệ thống (phân trang, upload, giới hạn tìm kiếm)
 */

module.exports = {
  // Authentication & Security
  auth: {
    accessTokenCookieMaxAge: 60 * 60 * 1000, // 1 hour (ms)
    refreshTokenCookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (ms)
  },

  // Pagination Limits
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    adminDefaultLimit: 50,
    adminMaxLimit: 200,
  },

  // Search & Map Settings
  search: {
    maxFuzzyResults: 5,
    maxNearbyResults: 500, // Số lượng tối đa POI trả về cho map bounds
    defaultReviewLimit: 20,
  },

  // File Upload Limits
  uploads: {
    maxPhotoSize: 5 * 1024 * 1024, // 5MB
    maxDocumentSize: 10 * 1024 * 1024, // 10MB
  }
};
