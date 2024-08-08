"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// Middleware: permissions

const CustomError = require("../errors/customError");

module.exports = {
    isLogin: (req, res, next) => {
      if (!req.user) {
        throw new CustomError(
          "AuthenticationError: You must be logged in to access this resource.",
          403,
        );
      }
      if (!req.user?.isActive) {
        throw new CustomError(
          "Your account is not active. Please contact support.",
          403,
        );
      }
      next();
    },
    isStaffOrisAdmin: (req, res, next) => {
      if (!(req.user?.isAdmin || req.user?.isStaff)) {
        throw new CustomError(
          "AuthorizationError: You must be an Admin or Staff to access this resource.",
          403,
        );
      }
      if (!req.user?.isActive) {
        throw new CustomError(
          "Your account is not active. Please contact support.",
          403,
        );
      }
      next();
    },
    isAdmin: (req, res, next) => {
      if (!req.user?.isAdmin)
        throw new CustomError(
          "AuthorizationError: You must be an Admin to access this resource.",
          403,
        );
      if (!req.user?.isActive) {
        throw new CustomError(
          "Your account is not active. Please contact support.",
          403,
        );
      }
      next();
    },
    isActive: (req, res, next) => {
      if (!req.user?.isActive) {
        throw new CustomError(
          "Your account is not active. Please contact support.",
          403,
        );
      }
    },
  };
  