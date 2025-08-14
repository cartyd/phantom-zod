import { createTestMessageHandler } from "../localization/types/message-handler.types";
// Top-level export for barrel usage
export const zUserOptional = (
  options: { msg?: string; msgType?: MsgType } = {},
) => {
  const { msg = "User", msgType = MsgType.FieldName } = options;
  return createUserSchemas(createTestMessageHandler()).zUserOptional(
    msg,
    msgType,
  );
};
import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createStringSchemas } from "./string-schemas";
import { createEmailSchemas } from "./email-schemas";
import { createEnumSchemas } from "./enum-schemas";

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

/**
 * Calculate password strength score (0-4).
 * @param password - The password to evaluate
 * @returns Score from 0 (very weak) to 4 (very strong)
 */
function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character type checks
  if (/[a-z]/.test(password)) score++; // lowercase
  if (/[A-Z]/.test(password)) score++; // uppercase
  if (/\d/.test(password)) score++; // numbers
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // special chars

  // Cap at 4 for maximum strength
  return Math.min(score, 4);
}

/**
 * Creates a factory function for user schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing user schema creation functions
 */
export const createUserSchemas = (messageHandler: ErrorMessageFormatter) => {
  const stringSchemas = createStringSchemas(messageHandler);
  const emailSchemas = createEmailSchemas(messageHandler);
  const enumSchemas = createEnumSchemas(messageHandler);

  /**
   * Password strength validation schema.
   * Validates password with configurable requirements.
   */
  const zPassword = (
    msg = "Password",
    msgType: MsgType = MsgType.FieldName,
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  ) =>
    stringSchemas
      .zStringRequired({ msg, msgType })
      .refine((password) => password.length >= minLength, {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordTooShort",
          msg,
          msgType,
          params: { min: minLength },
        }),
      })
      .refine((password) => !requireUppercase || /[A-Z]/.test(password), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordMissingUppercase",
          msg,
          msgType,
        }),
      })
      .refine((password) => !requireLowercase || /[a-z]/.test(password), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordMissingLowercase",
          msg,
          msgType,
        }),
      })
      .refine((password) => !requireNumbers || /\d/.test(password), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordMissingNumbers",
          msg,
          msgType,
        }),
      })
      .refine(
        (password) =>
          !requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password),
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "passwordMissingSpecialChars",
            msg,
            msgType,
          }),
        },
      );

  /**
   * Username validation schema.
   * Validates username with length and character requirements.
   */
  const zUsername = (
    msg = "Username",
    msgType: MsgType = MsgType.FieldName,
    minLength = 3,
    maxLength = 30,
  ) =>
    stringSchemas
      .zStringRequired({ msg, msgType, minLength, maxLength })
      .refine((username) => /^[a-zA-Z0-9_-]+$/.test(username), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "usernameInvalid",
          msg,
          msgType,
        }),
      })
      .refine(
        (username) => !username.startsWith("_") && !username.endsWith("_"),
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "invalidUnderscorePosition",
            msg,
            msgType,
          }),
        },
      )
      .refine(
        (username) => !username.startsWith("-") && !username.endsWith("-"),
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "invalidHyphenPosition",
            msg,
            msgType,
          }),
        },
      );

  /**
   * Display name validation schema.
   * Optional field with length validation.
   */
  const zDisplayName = (
    msg = "Display Name",
    msgType: MsgType = MsgType.FieldName,
    maxLength = 50,
  ) =>
    stringSchemas
      .zStringOptional({ msg, msgType, maxLength })
      .refine((name) => !name || name.trim().length > 0, {
        message: messageHandler.formatErrorMessage({
          group: "string",
          messageKey: "cannotBeEmpty",
          msg,
          msgType,
        }),
      });

  /**
   * Basic user registration schema.
   */
  const zUserRegistration = (
    msg = "User Registration",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .object(
        {
          username: zUsername("Username", msgType),
          email: emailSchemas.zEmailRequired({ msg: "Email", msgType }),
          password: zPassword("Password", msgType),
          confirmPassword: stringSchemas.zStringRequired({
            msg: "Confirm Password",
            msgType,
          }),
          displayName: zDisplayName("Display Name", msgType),
          firstName: stringSchemas.zStringOptional({
            msg: "First Name",
            msgType,
          }),
          lastName: stringSchemas.zStringOptional({
            msg: "Last Name",
            msgType,
          }),
          acceptTerms: z
            .boolean({
              message: messageHandler.formatErrorMessage({
                group: "user",
                messageKey: "termsNotAccepted",
                msg,
                msgType,
              }),
            })
            .refine((val) => val === true, {
              message: messageHandler.formatErrorMessage({
                group: "user",
                messageKey: "termsNotAccepted",
                msg,
                msgType,
              }),
            }),
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "required",
            msg,
            msgType,
          }),
        },
      )
      .refine((data) => data.password === data.confirmPassword, {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordsDoNotMatch",
          msg,
          msgType,
        }),
        path: ["confirmPassword"],
      });

  /**
   * User login schema.
   */
  const zUserLogin = (
    msg = "User Login",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        identifier: stringSchemas.zStringRequired({
          msg: "Username/Email",
          msgType,
        }),
        password: stringSchemas.zStringRequired({ msg: "Password", msgType }),
        rememberMe: z.boolean().optional(),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Optional user profile schema.
   */
  const zUserOptional = (msg = "User", msgType: MsgType = MsgType.FieldName) =>
    z
      .object({
        id: stringSchemas.zStringRequired({ msg: "User ID", msgType }),
        username: zUsername("Username", msgType),
        email: emailSchemas.zEmailRequired({ msg: "Email", msgType }),
        displayName: zDisplayName("Display Name", msgType),
        firstName: stringSchemas.zStringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.zStringOptional({ msg: "Last Name", msgType }),
        role: enumSchemas.zEnumRequired([...USER_ROLES], {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.zEnumRequired([...USER_STATUS], {
          msg: "Status",
          msgType,
        }),
        accountType: enumSchemas.zEnumOptional([...ACCOUNT_TYPES], {
          msg: "Account Type",
          msgType,
        }),
        avatar: stringSchemas.zStringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.zStringOptional({ msg: "Bio", msgType }),
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
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "mustBeValidUserObject",
            msg,
            msgType,
          }),
        },
      );

  /**
   * Required user profile schema.
   */
  const zUserRequired = (msg = "User", msgType: MsgType = MsgType.FieldName) =>
    z.object(
      {
        id: stringSchemas.zStringRequired({ msg: "User ID", msgType }),
        username: zUsername("Username", msgType),
        email: emailSchemas.zEmailRequired({ msg: "Email", msgType }),
        displayName: zDisplayName("Display Name", msgType),
        firstName: stringSchemas.zStringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.zStringOptional({ msg: "Last Name", msgType }),
        role: enumSchemas.zEnumRequired([...USER_ROLES], {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.zEnumRequired([...USER_STATUS], {
          msg: "Status",
          msgType,
        }),
        accountType: enumSchemas.zEnumOptional([...ACCOUNT_TYPES], {
          msg: "Account Type",
          msgType,
        }),
        avatar: stringSchemas.zStringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.zStringOptional({ msg: "Bio", msgType }),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        lastLoginAt: z.date().optional(),
        emailVerified: z.boolean().optional(),
        phoneVerified: z.boolean().optional(),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * User profile update schema (allows partial updates).
   */
  const zUserUpdate = (
    msg = "User Update",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        displayName: zDisplayName("Display Name", msgType),
        firstName: stringSchemas.zStringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.zStringOptional({ msg: "Last Name", msgType }),
        avatar: stringSchemas.zStringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.zStringOptional({ msg: "Bio", msgType }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Password change schema.
   */
  const zPasswordChange = (
    msg = "Password Change",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .object(
        {
          currentPassword: stringSchemas.zStringRequired({
            msg: "Current Password",
            msgType,
          }),
          newPassword: zPassword("New Password", msgType),
          confirmPassword: stringSchemas.zStringRequired({
            msg: "Confirm Password",
            msgType,
          }),
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "required",
            msg,
            msgType,
          }),
        },
      )
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordsDoNotMatch",
          msg,
          msgType,
        }),
        path: ["confirmPassword"],
      })
      .refine((data) => data.currentPassword !== data.newPassword, {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordMustBeDifferent",
          msg,
          msgType,
        }),
        path: ["newPassword"],
      });

  /**
   * Password reset request schema.
   */
  const zPasswordReset = (
    msg = "Password Reset",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        email: emailSchemas.zEmailRequired({ msg: "Email", msgType }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Admin user management schema.
   */
  const zAdminUserManagement = (
    msg = "Admin User Management",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        userId: stringSchemas.zStringRequired({ msg: "User ID", msgType }),
        role: enumSchemas.zEnumOptional([...USER_ROLES], {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.zEnumOptional([...USER_STATUS], {
          msg: "Status",
          msgType,
        }),
        reason: stringSchemas.zStringOptional({ msg: "Reason", msgType }),
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      },
    );

  /**
   * Enhanced password validation with weakness detection.
   * Uses the "passwordWeak" message key for comprehensive validation.
   */
  const zPasswordWithWeaknessCheck = (
    msg = "Password",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.zStringRequired({ msg, msgType }).refine(
      (password) => {
        const score = calculatePasswordStrength(password);
        return score >= 4; // Require "strong" password
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordWeak",
          msg,
          msgType,
          params: {
            score: 2, // Example score
            missingRequirements: ["uppercase", "numbers"],
            suggestions: ["Add uppercase letters", "Include numbers"],
          },
        }),
      },
    );

  /**
   * User validation with invalid message.
   * Uses the generic "invalid" message key for validation errors.
   */
  const zUserGenericValidation = (
    msg = "User",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.any().refine(
      (val) => {
        // Basic validation - must be an object with id
        return val && typeof val === "object" && "id" in val && val.id;
      },
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "invalid",
          msg,
          msgType,
          params: { reason: "User object must contain a valid ID" },
        }),
      },
    );

  /**
   * Email uniqueness validation schema.
   * Uses the "emailAlreadyExists" message key.
   */
  const zEmailUniqueness = (
    msg = "Email",
    msgType: MsgType = MsgType.FieldName,
    existingEmails: string[] = [],
  ) =>
    emailSchemas
      .zEmailRequired({ msg, msgType })
      .refine((email) => !existingEmails.includes(email.toLowerCase()), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "emailAlreadyExists",
          msg,
          msgType,
          params: { email: "example@domain.com" }, // Will be replaced with actual email
        }),
      });

  /**
   * Username uniqueness validation schema.
   * Uses the "usernameAlreadyExists" message key.
   */
  const zUsernameUniqueness = (
    msg = "Username",
    msgType: MsgType = MsgType.FieldName,
    existingUsernames: string[] = [],
  ) =>
    zUsername(msg, msgType).refine(
      (username) => !existingUsernames.includes(username.toLowerCase()),
      {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "usernameAlreadyExists",
          msg,
          msgType,
          params: { username: "example_user" }, // Will be replaced with actual username
        }),
      },
    );

  /**
   * Role validation schema with invalid role detection.
   * Uses the "invalidRole" message key.
   */
  const zRoleValidation = (
    msg = "Role",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
      .refine((role) => USER_ROLES.includes(role as any), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "invalidRole",
          msg,
          msgType,
          params: { role: "invalid_role" }, // Will be replaced with actual role
        }),
      });

  /**
   * Account type validation schema with invalid type detection.
   * Uses the "invalidAccountType" message key.
   */
  const zAccountTypeValidation = (
    msg = "Account Type",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .string({
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "required",
          msg,
          msgType,
        }),
      })
      .refine((type) => ACCOUNT_TYPES.includes(type as any), {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "invalidAccountType",
          msg,
          msgType,
          params: { type: "invalid_type" }, // Will be replaced with actual type
        }),
      });

  /**
   * Enhanced user registration with uniqueness checks.
   */
  const zUserRegistrationWithUniqueness = (
    msg = "User Registration",
    msgType: MsgType = MsgType.FieldName,
    existingEmails: string[] = [],
    existingUsernames: string[] = [],
  ) =>
    z
      .object(
        {
          username: zUsernameUniqueness("Username", msgType, existingUsernames),
          email: zEmailUniqueness("Email", msgType, existingEmails),
          password: zPasswordWithWeaknessCheck("Password", msgType),
          confirmPassword: stringSchemas.zStringRequired({
            msg: "Confirm Password",
            msgType,
          }),
          displayName: zDisplayName("Display Name", msgType),
          firstName: stringSchemas.zStringOptional({
            msg: "First Name",
            msgType,
          }),
          lastName: stringSchemas.zStringOptional({
            msg: "Last Name",
            msgType,
          }),
          accountType: zAccountTypeValidation("Account Type", msgType),
          acceptTerms: z
            .boolean({
              message: messageHandler.formatErrorMessage({
                group: "user",
                messageKey: "termsNotAccepted",
                msg,
                msgType,
              }),
            })
            .refine((val) => val === true, {
              message: messageHandler.formatErrorMessage({
                group: "user",
                messageKey: "termsNotAccepted",
                msg,
                msgType,
                params: {
                  termsVersion: "v1.0",
                  requiredSections: ["privacy", "terms_of_service"],
                },
              }),
            }),
        },
        {
          message: messageHandler.formatErrorMessage({
            group: "user",
            messageKey: "required",
            msg,
            msgType,
          }),
        },
      )
      .refine((data) => data.password === data.confirmPassword, {
        message: messageHandler.formatErrorMessage({
          group: "user",
          messageKey: "passwordsDoNotMatch",
          msg,
          msgType,
          params: {
            field1: "password",
            field2: "confirmPassword",
          },
        }),
        path: ["confirmPassword"],
      });

  return {
    zPassword,
    zUsername,
    zDisplayName,
    zUserRegistration,
    zUserLogin,
    zUserOptional,
    zUserRequired,
    zUserUpdate,
    zPasswordChange,
    zPasswordReset,
    zAdminUserManagement,
    // New schemas that use the missing message keys
    zPasswordWithWeaknessCheck,
    zUserGenericValidation,
    zEmailUniqueness,
    zUsernameUniqueness,
    zRoleValidation,
    zAccountTypeValidation,
    zUserRegistrationWithUniqueness,
    USER_ROLES,
    USER_STATUS,
    ACCOUNT_TYPES,
  };
};
