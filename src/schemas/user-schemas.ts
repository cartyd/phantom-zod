import { z } from "zod";

import { MsgType } from "./msg-type";
import { zStringRequired, zStringOptional } from "./string-schemas";
import { zEmailRequired, zEmailOptional } from "./email-schemas";
import { zEnumRequired, zEnumOptional } from "./enum-schemas";
import { getErrorMessage } from "../utils/error-utils";

// --- User Schema Types ---

/**
 * Type for an optional user.
 */
export type UserOptional = z.infer<ReturnType<typeof zUserOptional>>;

/**
 * Type for a required user.
 */
export type UserRequired = z.infer<ReturnType<typeof zUserRequired>>;

// --- User Role Constants ---

/**
 * Common user roles.
 */
export const USER_ROLES = [
  "admin",
  "moderator",
  "user",
  "guest",
  "subscriber",
  "editor",
  "author",
  "contributor",
] as const;

/**
 * User account status options.
 */
export const USER_STATUS = [
  "active",
  "inactive",
  "pending",
  "suspended",
  "banned",
  "deleted",
] as const;

/**
 * User account types.
 */
export const ACCOUNT_TYPES = [
  "individual",
  "business",
  "organization",
  "admin",
] as const;

// --- Password Validation ---

/**
 * Password strength validation schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minLength - Minimum password length (default: 8).
 * @param requireUppercase - Require uppercase letters (default: true).
 * @param requireLowercase - Require lowercase letters (default: true).
 * @param requireNumbers - Require numbers (default: true).
 * @param requireSpecialChars - Require special characters (default: true).
 * @returns Zod schema for password validation.
 */
export const zPassword = (
  fieldName = "Password",
  msgType: MsgType = MsgType.FieldName,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  requireSpecialChars = true,
) =>
  zStringRequired(fieldName, msgType)
    .refine(
      (password) => password.length >= minLength,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be at least ${minLength} characters long`,
      },
    )
    .refine(
      (password) => !requireUppercase || /[A-Z]/.test(password),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must contain at least one uppercase letter`,
      },
    )
    .refine(
      (password) => !requireLowercase || /[a-z]/.test(password),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must contain at least one lowercase letter`,
      },
    )
    .refine(
      (password) => !requireNumbers || /\d/.test(password),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must contain at least one number`,
      },
    )
    .refine(
      (password) => !requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must contain at least one special character`,
      },
    );

/**
 * Username validation schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param minLength - Minimum username length (default: 3).
 * @param maxLength - Maximum username length (default: 30).
 * @returns Zod schema for username validation.
 */
export const zUsername = (
  fieldName = "Username",
  msgType: MsgType = MsgType.FieldName,
  minLength = 3,
  maxLength = 30,
) =>
  zStringRequired(fieldName, msgType)
    .refine(
      (username) => username.length >= minLength,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be at least ${minLength} characters long`,
      },
    )
    .refine(
      (username) => username.length <= maxLength,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be at most ${maxLength} characters long`,
      },
    )
    .refine(
      (username) => /^[a-zA-Z0-9_-]+$/.test(username),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} can only contain letters, numbers, underscores, and hyphens`,
      },
    )
    .refine(
      (username) => !username.startsWith("_") && !username.endsWith("_"),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} cannot start or end with underscore`,
      },
    )
    .refine(
      (username) => !username.startsWith("-") && !username.endsWith("-"),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} cannot start or end with hyphen`,
      },
    );

/**
 * Display name validation schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @param maxLength - Maximum display name length (default: 50).
 * @returns Zod schema for display name validation.
 */
export const zDisplayName = (
  fieldName = "Display Name",
  msgType: MsgType = MsgType.FieldName,
  maxLength = 50,
) =>
  zStringOptional(fieldName, msgType)
    .refine(
      (name) => !name || name.length <= maxLength,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be at most ${maxLength} characters long`,
      },
    )
    .refine(
      (name) => !name || name.trim().length > 0,
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} cannot be empty if provided`,
      },
    );

// --- User Schemas ---

/**
 * Basic user registration schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for user registration.
 * 
 * @example
 * const registrationSchema = zUserRegistration("User Registration");
 * const result = registrationSchema.parse({
 *   username: "johndoe",
 *   email: "john@example.com",
 *   password: "SecurePass123!",
 *   confirmPassword: "SecurePass123!"
 * });
 */
export const zUserRegistration = (
  fieldName = "User Registration",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    username: zUsername(
      msgType === MsgType.Message ? "Username is required" : "Username",
      msgType,
    ),
    email: zEmailRequired(
      msgType === MsgType.Message ? "Email is required" : "Email",
      msgType,
    ),
    password: zPassword(
      msgType === MsgType.Message ? "Password is required" : "Password",
      msgType,
    ),
    confirmPassword: zStringRequired(
      msgType === MsgType.Message ? "Password confirmation is required" : "Confirm Password",
      msgType,
    ),
    displayName: zDisplayName(
      msgType === MsgType.Message ? "Display name is optional" : "Display Name",
      msgType,
    ),
    firstName: zStringOptional(
      msgType === MsgType.Message ? "First name is optional" : "First Name",
      msgType,
    ),
    lastName: zStringOptional(
      msgType === MsgType.Message ? "Last name is optional" : "Last Name",
      msgType,
    ),
    acceptTerms: z.boolean({
      message:
        msgType === MsgType.Message
          ? "You must accept the terms and conditions"
          : "Terms acceptance is required",
    }).refine(val => val === true, {
      message:
        msgType === MsgType.Message
          ? "You must accept the terms and conditions"
          : "Terms and conditions must be accepted",
    }),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message:
        msgType === MsgType.Message
          ? "Passwords do not match"
          : "Password and confirmation password must match",
      path: ["confirmPassword"],
    },
  );

/**
 * User login schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for user login.
 * 
 * @example
 * const loginSchema = zUserLogin("Login");
 * const result = loginSchema.parse({
 *   identifier: "johndoe",
 *   password: "SecurePass123!"
 * });
 */
export const zUserLogin = (
  fieldName = "User Login",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    identifier: zStringRequired(
      msgType === MsgType.Message ? "Username or email is required" : "Username/Email",
      msgType,
    ),
    password: zStringRequired(
      msgType === MsgType.Message ? "Password is required" : "Password",
      msgType,
    ),
    rememberMe: z.boolean().optional(),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * Optional user profile schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional user profile.
 * 
 * @example
 * const userSchema = zUserOptional("User Profile");
 * const result = userSchema.parse({
 *   id: "123",
 *   username: "johndoe",
 *   email: "john@example.com",
 *   role: "user",
 *   status: "active"
 * });
 */
export const zUserOptional = (
  fieldName = "User",
  msgType: MsgType = MsgType.FieldName,
) =>
  z
    .object({
      id: zStringRequired(
        msgType === MsgType.Message ? "User ID is required" : "User ID",
        msgType,
      ),
      username: zUsername(
        msgType === MsgType.Message ? "Username is required" : "Username",
        msgType,
      ),
      email: zEmailRequired(
        msgType === MsgType.Message ? "Email is required" : "Email",
        msgType,
      ),
      displayName: zDisplayName(
        msgType === MsgType.Message ? "Display name is optional" : "Display Name",
        msgType,
      ),
      firstName: zStringOptional(
        msgType === MsgType.Message ? "First name is optional" : "First Name",
        msgType,
      ),
      lastName: zStringOptional(
        msgType === MsgType.Message ? "Last name is optional" : "Last Name",
        msgType,
      ),
      role: zEnumRequired(
        [...USER_ROLES],
        msgType === MsgType.Message ? "Role is required" : "Role",
        msgType,
      ),
      status: zEnumRequired(
        [...USER_STATUS],
        msgType === MsgType.Message ? "Status is required" : "Status",
        msgType,
      ),
      accountType: zEnumOptional(
        [...ACCOUNT_TYPES],
        msgType === MsgType.Message ? "Account type is optional" : "Account Type",
        msgType,
      ),
      avatar: zStringOptional(
        msgType === MsgType.Message ? "Avatar URL is optional" : "Avatar",
        msgType,
      ),
      bio: zStringOptional(
        msgType === MsgType.Message ? "Bio is optional" : "Bio",
        msgType,
      ),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional(),
      lastLoginAt: z.date().optional(),
      emailVerified: z.boolean().optional(),
      phoneVerified: z.boolean().optional(),
    })
    .optional()
    .refine(
      (val) => val === undefined || (typeof val === "object" && val !== null),
      {
        message:
          msgType === MsgType.Message
            ? String(fieldName)
            : `${fieldName} must be a valid user object`,
      },
    );

/**
 * Required user profile schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required user profile.
 * 
 * @example
 * const userSchema = zUserRequired("User Profile");
 * const result = userSchema.parse({
 *   id: "123",
 *   username: "johndoe",
 *   email: "john@example.com",
 *   role: "user",
 *   status: "active"
 * });
 */
export const zUserRequired = (
  fieldName = "User",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    id: zStringRequired(
      msgType === MsgType.Message ? "User ID is required" : "User ID",
      msgType,
    ),
    username: zUsername(
      msgType === MsgType.Message ? "Username is required" : "Username",
      msgType,
    ),
    email: zEmailRequired(
      msgType === MsgType.Message ? "Email is required" : "Email",
      msgType,
    ),
    displayName: zDisplayName(
      msgType === MsgType.Message ? "Display name is optional" : "Display Name",
      msgType,
    ),
    firstName: zStringOptional(
      msgType === MsgType.Message ? "First name is optional" : "First Name",
      msgType,
    ),
    lastName: zStringOptional(
      msgType === MsgType.Message ? "Last name is optional" : "Last Name",
      msgType,
    ),
    role: zEnumRequired(
      [...USER_ROLES],
      msgType === MsgType.Message ? "Role is required" : "Role",
      msgType,
    ),
    status: zEnumRequired(
      [...USER_STATUS],
      msgType === MsgType.Message ? "Status is required" : "Status",
      msgType,
    ),
    accountType: zEnumOptional(
      [...ACCOUNT_TYPES],
      msgType === MsgType.Message ? "Account type is optional" : "Account Type",
      msgType,
    ),
    avatar: zStringOptional(
      msgType === MsgType.Message ? "Avatar URL is optional" : "Avatar",
      msgType,
    ),
    bio: zStringOptional(
      msgType === MsgType.Message ? "Bio is optional" : "Bio",
      msgType,
    ),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    lastLoginAt: z.date().optional(),
    emailVerified: z.boolean().optional(),
    phoneVerified: z.boolean().optional(),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * User profile update schema (allows partial updates).
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for user profile updates.
 * 
 * @example
 * const updateSchema = zUserUpdate("Profile Update");
 * const result = updateSchema.parse({
 *   displayName: "John Doe",
 *   bio: "Software developer"
 * });
 */
export const zUserUpdate = (
  fieldName = "User Update",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    displayName: zDisplayName(
      msgType === MsgType.Message ? "Display name is optional" : "Display Name",
      msgType,
    ),
    firstName: zStringOptional(
      msgType === MsgType.Message ? "First name is optional" : "First Name",
      msgType,
    ),
    lastName: zStringOptional(
      msgType === MsgType.Message ? "Last name is optional" : "Last Name",
      msgType,
    ),
    avatar: zStringOptional(
      msgType === MsgType.Message ? "Avatar URL is optional" : "Avatar",
      msgType,
    ),
    bio: zStringOptional(
      msgType === MsgType.Message ? "Bio is optional" : "Bio",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} must be a valid update object`,
  });

/**
 * Password change schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for password changes.
 * 
 * @example
 * const passwordChangeSchema = zPasswordChange("Password Change");
 * const result = passwordChangeSchema.parse({
 *   currentPassword: "OldPass123!",
 *   newPassword: "NewPass123!",
 *   confirmPassword: "NewPass123!"
 * });
 */
export const zPasswordChange = (
  fieldName = "Password Change",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    currentPassword: zStringRequired(
      msgType === MsgType.Message ? "Current password is required" : "Current Password",
      msgType,
    ),
    newPassword: zPassword(
      msgType === MsgType.Message ? "New password is required" : "New Password",
      msgType,
    ),
    confirmPassword: zStringRequired(
      msgType === MsgType.Message ? "Password confirmation is required" : "Confirm Password",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message:
        msgType === MsgType.Message
          ? "New passwords do not match"
          : "New password and confirmation must match",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message:
        msgType === MsgType.Message
          ? "New password must be different from current password"
          : "New password must be different from current password",
      path: ["newPassword"],
    },
  );

/**
 * Password reset request schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for password reset requests.
 */
export const zPasswordReset = (
  fieldName = "Password Reset",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    email: zEmailRequired(
      msgType === MsgType.Message ? "Email is required" : "Email",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });

/**
 * Admin user management schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for admin user management.
 */
export const zAdminUserManagement = (
  fieldName = "Admin User Management",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.object({
    userId: zStringRequired(
      msgType === MsgType.Message ? "User ID is required" : "User ID",
      msgType,
    ),
    role: zEnumOptional(
      [...USER_ROLES],
      msgType === MsgType.Message ? "Role is optional" : "Role",
      msgType,
    ),
    status: zEnumOptional(
      [...USER_STATUS],
      msgType === MsgType.Message ? "Status is optional" : "Status",
      msgType,
    ),
    reason: zStringOptional(
      msgType === MsgType.Message ? "Reason is optional" : "Reason",
      msgType,
    ),
  }, {
    message:
      msgType === MsgType.Message
        ? String(fieldName)
        : `${fieldName} is required`,
  });
