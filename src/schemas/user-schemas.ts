import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createTestMessageHandler } from "../localization/types/message-handler.types";
import type { BaseSchemaOptions } from "../common/types/schema-options.types";
import { createStringSchemas } from "./string-schemas";
import { createEmailSchemas } from "./email-schemas";
import { createEnumSchemas } from "./enum-schemas";

// --- User Role Constants ---
// Note: Constants will be exported from the factory function to avoid redeclaration

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

  // Define constants as tuples for enum compatibility
  const USER_ROLES = [
    "admin",
    "moderator",
    "user",
    "guest",
    "subscriber",
    "editor",
    "author",
    "contributor",
  ] as const;

  const USER_STATUS = [
    "active",
    "inactive",
    "pending",
    "suspended",
    "banned",
    "deleted",
  ] as const;

  const ACCOUNT_TYPES = [
    "individual",
    "business",
    "organization",
    "admin",
  ] as const;

  /**
   * Password strength validation schema.
   * Validates password with configurable requirements.
   */
  const Password = (
    msg = "Password",
    msgType: MsgType = MsgType.FieldName,
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  ) =>
    stringSchemas
      .StringRequired({ msg, msgType })
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
  const Username = (
    msg = "Username",
    msgType: MsgType = MsgType.FieldName,
    minLength = 3,
    maxLength = 30,
  ) =>
    stringSchemas
      .StringRequired({ msg, msgType, minLength, maxLength })
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
  const DisplayName = (
    msg = "Display Name",
    msgType: MsgType = MsgType.FieldName,
    maxLength = 50,
  ) =>
    stringSchemas
      .StringOptional({ msg, msgType, maxLength })
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
  const UserRegistration = (
    msg = "User Registration",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .object(
        {
          username: Username("Username", msgType),
          email: emailSchemas.EmailRequired({ msg: "Email", msgType }),
          password: Password("Password", msgType),
          confirmPassword: stringSchemas.StringRequired({
            msg: "Confirm Password",
            msgType,
          }),
          displayName: DisplayName("Display Name", msgType),
          firstName: stringSchemas.StringOptional({
            msg: "First Name",
            msgType,
          }),
          lastName: stringSchemas.StringOptional({
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
  const UserLogin = (
    msg = "User Login",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        identifier: stringSchemas.StringRequired({
          msg: "Username/Email",
          msgType,
        }),
        password: stringSchemas.StringRequired({ msg: "Password", msgType }),
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
  const UserOptional = (options: BaseSchemaOptions = {}) => {
    const { msg = "User", msgType = MsgType.FieldName } = options;
    return z
      .object({
        id: stringSchemas.StringRequired({ msg: "User ID", msgType }),
        username: Username("Username", msgType),
        email: emailSchemas.EmailRequired({ msg: "Email", msgType }),
        displayName: DisplayName("Display Name", msgType),
        firstName: stringSchemas.StringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.StringOptional({ msg: "Last Name", msgType }),
        role: enumSchemas.EnumRequired(USER_ROLES, {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.EnumRequired(USER_STATUS, {
          msg: "Status",
          msgType,
        }),
        accountType: enumSchemas.EnumOptional(ACCOUNT_TYPES, {
          msg: "Account Type",
          msgType,
        }),
        avatar: stringSchemas.StringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.StringOptional({ msg: "Bio", msgType }),
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
  };

  /**
   * Required user profile schema.
   */
  const UserRequired = (msg = "User", msgType: MsgType = MsgType.FieldName) =>
    z.object(
      {
        id: stringSchemas.StringRequired({ msg: "User ID", msgType }),
        username: Username("Username", msgType),
        email: emailSchemas.EmailRequired({ msg: "Email", msgType }),
        displayName: DisplayName("Display Name", msgType),
        firstName: stringSchemas.StringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.StringOptional({ msg: "Last Name", msgType }),
        role: enumSchemas.EnumRequired(USER_ROLES, {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.EnumRequired(USER_STATUS, {
          msg: "Status",
          msgType,
        }),
        accountType: enumSchemas.EnumOptional(ACCOUNT_TYPES, {
          msg: "Account Type",
          msgType,
        }),
        avatar: stringSchemas.StringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.StringOptional({ msg: "Bio", msgType }),
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
  const UserUpdate = (
    msg = "User Update",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        displayName: DisplayName("Display Name", msgType),
        firstName: stringSchemas.StringOptional({
          msg: "First Name",
          msgType,
        }),
        lastName: stringSchemas.StringOptional({ msg: "Last Name", msgType }),
        avatar: stringSchemas.StringOptional({ msg: "Avatar", msgType }),
        bio: stringSchemas.StringOptional({ msg: "Bio", msgType }),
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
  const PasswordChange = (
    msg = "Password Change",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z
      .object(
        {
          currentPassword: stringSchemas.StringRequired({
            msg: "Current Password",
            msgType,
          }),
          newPassword: Password("New Password", msgType),
          confirmPassword: stringSchemas.StringRequired({
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
  const PasswordReset = (
    msg = "Password Reset",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        email: emailSchemas.EmailRequired({ msg: "Email", msgType }),
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
  const AdminUserManagement = (
    msg = "Admin User Management",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.object(
      {
        userId: stringSchemas.StringRequired({ msg: "User ID", msgType }),
        role: enumSchemas.EnumOptional(USER_ROLES, {
          msg: "Role",
          msgType,
        }),
        status: enumSchemas.EnumOptional(USER_STATUS, {
          msg: "Status",
          msgType,
        }),
        reason: stringSchemas.StringOptional({ msg: "Reason", msgType }),
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
  const PasswordWithWeaknessCheck = (
    msg = "Password",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.StringRequired({ msg, msgType }).refine(
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
  const UserGenericValidation = (
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
  const EmailUniqueness = (
    msg = "Email",
    msgType: MsgType = MsgType.FieldName,
    existingEmails: string[] = [],
  ) =>
    emailSchemas
      .EmailRequired({ msg, msgType })
      .refine((email) => !existingEmails.includes((email as string).toLowerCase()), {
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
  const UsernameUniqueness = (
    msg = "Username",
    msgType: MsgType = MsgType.FieldName,
    existingUsernames: string[] = [],
  ) =>
    Username(msg, msgType).refine(
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
  const RoleValidation = (msg = "Role", msgType: MsgType = MsgType.FieldName) =>
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
  const AccountTypeValidation = (
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
  const UserRegistrationWithUniqueness = (
    msg = "User Registration",
    msgType: MsgType = MsgType.FieldName,
    existingEmails: string[] = [],
    existingUsernames: string[] = [],
  ) =>
    z
      .object(
        {
          username: UsernameUniqueness("Username", msgType, existingUsernames),
          email: EmailUniqueness("Email", msgType, existingEmails),
          password: PasswordWithWeaknessCheck("Password", msgType),
          confirmPassword: stringSchemas.StringRequired({
            msg: "Confirm Password",
            msgType,
          }),
          displayName: DisplayName("Display Name", msgType),
          firstName: stringSchemas.StringOptional({
            msg: "First Name",
            msgType,
          }),
          lastName: stringSchemas.StringOptional({
            msg: "Last Name",
            msgType,
          }),
          accountType: AccountTypeValidation("Account Type", msgType),
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
    Password,
    Username,
    DisplayName,
    UserRegistration,
    UserLogin,
    UserOptional,
    UserRequired,
    UserUpdate,
    PasswordChange,
    PasswordReset,
    AdminUserManagement,
    // New schemas that use the missing message keys
    PasswordWithWeaknessCheck,
    UserGenericValidation,
    EmailUniqueness,
    UsernameUniqueness,
    RoleValidation,
    AccountTypeValidation,
    UserRegistrationWithUniqueness,
    USER_ROLES,
    USER_STATUS,
    ACCOUNT_TYPES,
  };
};

// Top-level exports using test message handler
const testMessageHandler = createTestMessageHandler();
const defaultUserSchemas = createUserSchemas(testMessageHandler);

// Helper functions with overloads to support both string and options object
function createPasswordOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.Password>;
function createPasswordOverload(
  msg?: string,
  msgType?: MsgType,
  minLength?: number,
  requireUppercase?: boolean,
  requireLowercase?: boolean,
  requireNumbers?: boolean,
  requireSpecialChars?: boolean,
): ReturnType<typeof defaultUserSchemas.Password>;
function createPasswordOverload(
  msg: string = "Password",
  msgType: MsgType = MsgType.FieldName,
  minLength: number = 8,
  requireUppercase: boolean = true,
  requireLowercase: boolean = true,
  requireNumbers: boolean = true,
  requireSpecialChars: boolean = true,
): ReturnType<typeof defaultUserSchemas.Password> {
  return defaultUserSchemas.Password(
    msg,
    msgType,
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
  );
}

function createUsernameOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.Username>;
function createUsernameOverload(
  msg?: string,
  msgType?: MsgType,
  minLength?: number,
  maxLength?: number,
): ReturnType<typeof defaultUserSchemas.Username>;
function createUsernameOverload(
  msg: string = "Username",
  msgType: MsgType = MsgType.FieldName,
  minLength: number = 3,
  maxLength: number = 30,
): ReturnType<typeof defaultUserSchemas.Username> {
  return defaultUserSchemas.Username(msg, msgType, minLength, maxLength);
}

function createDisplayNameOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.DisplayName>;
function createDisplayNameOverload(
  msg?: string,
  msgType?: MsgType,
  maxLength?: number,
): ReturnType<typeof defaultUserSchemas.DisplayName>;
function createDisplayNameOverload(
  msg: string = "Display Name",
  msgType: MsgType = MsgType.FieldName,
  maxLength: number = 50,
): ReturnType<typeof defaultUserSchemas.DisplayName> {
  return defaultUserSchemas.DisplayName(msg, msgType, maxLength);
}

function createUserRegistrationOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.UserRegistration>;
function createUserRegistrationOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.UserRegistration>;
function createUserRegistrationOverload(
  msg: string = "User Registration",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.UserRegistration> {
  return defaultUserSchemas.UserRegistration(msg, msgType);
}

function createUserLoginOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.UserLogin>;
function createUserLoginOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.UserLogin>;
function createUserLoginOverload(
  msg: string = "User Login",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.UserLogin> {
  return defaultUserSchemas.UserLogin(msg, msgType);
}

function createUserRequiredOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.UserRequired>;
function createUserRequiredOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.UserRequired>;
function createUserRequiredOverload(
  msg: string = "User",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.UserRequired> {
  return defaultUserSchemas.UserRequired(msg, msgType);
}

function createUserUpdateOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.UserUpdate>;
function createUserUpdateOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.UserUpdate>;
function createUserUpdateOverload(
  msg: string = "User Update",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.UserUpdate> {
  return defaultUserSchemas.UserUpdate(msg, msgType);
}

function createPasswordChangeOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.PasswordChange>;
function createPasswordChangeOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.PasswordChange>;
function createPasswordChangeOverload(
  msg: string = "Password Change",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.PasswordChange> {
  return defaultUserSchemas.PasswordChange(msg, msgType);
}

function createPasswordResetOverload(
  msg: string,
): ReturnType<typeof defaultUserSchemas.PasswordReset>;
function createPasswordResetOverload(
  msg?: string,
  msgType?: MsgType,
): ReturnType<typeof defaultUserSchemas.PasswordReset>;
function createPasswordResetOverload(
  msg: string = "Password Reset",
  msgType: MsgType = MsgType.FieldName,
): ReturnType<typeof defaultUserSchemas.PasswordReset> {
  return defaultUserSchemas.PasswordReset(msg, msgType);
}

// Export schemas with string parameter overloads
export const Password = createPasswordOverload;
export const Username = createUsernameOverload;
export const DisplayName = createDisplayNameOverload;
export const UserRegistration = createUserRegistrationOverload;
export const UserLogin = createUserLoginOverload;
export const UserOptional = defaultUserSchemas.UserOptional;
export const UserRequired = createUserRequiredOverload;
export const UserUpdate = createUserUpdateOverload;
export const PasswordChange = createPasswordChangeOverload;
export const PasswordReset = createPasswordResetOverload;
export const AdminUserManagement = defaultUserSchemas.AdminUserManagement;
export const PasswordWithWeaknessCheck =
  defaultUserSchemas.PasswordWithWeaknessCheck;
export const UserGenericValidation = defaultUserSchemas.UserGenericValidation;
export const EmailUniqueness = defaultUserSchemas.EmailUniqueness;
export const UsernameUniqueness = defaultUserSchemas.UsernameUniqueness;
export const RoleValidation = defaultUserSchemas.RoleValidation;
export const AccountTypeValidation = defaultUserSchemas.AccountTypeValidation;
export const UserRegistrationWithUniqueness =
  defaultUserSchemas.UserRegistrationWithUniqueness;

// Export constants
export const { USER_ROLES, USER_STATUS, ACCOUNT_TYPES } = defaultUserSchemas;
