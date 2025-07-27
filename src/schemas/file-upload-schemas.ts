import { z } from "zod";
import { MsgType } from "../common/types/msg-type";
import { FILENAME_INVALID_CHARS_PATTERN } from "../common/regex-patterns";
import type { ErrorMessageFormatter } from "../localization/types/message-handler.types";
import { createStringSchemas } from "./string-schemas";

// --- Common MIME Types ---

/**
 * Common image MIME types.
 */
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
] as const;

/**
 * Common document MIME types.
 */
export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
] as const;

/**
 * Common video MIME types.
 */
export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/3gpp",
  "video/x-flv",
] as const;

/**
 * Common audio MIME types.
 */
export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
] as const;

/**
 * Common archive MIME types.
 */
export const ARCHIVE_MIME_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip",
  "application/x-tar",
] as const;

/**
 * All common MIME types combined.
 */
export const ALL_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...DOCUMENT_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
  ...ARCHIVE_MIME_TYPES,
] as const;

/**
 * Creates a factory function for file upload schemas with injected message handler
 * @param messageHandler - The message handler to use for error messages
 * @returns An object containing file upload schema creation functions
 */
export const createFileUploadSchemas = (messageHandler: ErrorMessageFormatter) => {
  const stringSchemas = createStringSchemas(messageHandler);

  /**
   * File size validation schema.
   * Accepts a number representing file size in bytes with maximum size limit.
   */
  const zFileSize = (
    maxSize: number,
    msg = "File Size",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.number({
      message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalid" }),
    })
    .positive({
      message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalid" }),
    })
    .max(maxSize, {
      message: messageHandler.formatErrorMessage({ 
        msg, 
        msgType, 
        group: "fileUpload",
        messageKey: "fileSizeExceeded",
        params: { maxSize: maxSize }
      }),
    });

  /**
   * MIME type validation schema.
   * Accepts a string that must be one of the allowed MIME types.
   */
  const zMimeType = (
    allowedTypes: readonly string[],
    msg = "File Type",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    z.enum(allowedTypes as [string, ...string[]], {
      message: messageHandler.formatErrorMessage({ 
        msg, 
        msgType, 
        group: "fileUpload",
        messageKey: "invalidMimeType",
        params: { mime: allowedTypes.join(", ") }
      }),
    });

  /**
   * Filename validation schema.
   * Accepts a string with filename validation rules.
   */
  const zFilename = (
    msg = "Filename",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    stringSchemas.zStringRequired({ msg, msgType })
      .refine(
        (name) => FILENAME_INVALID_CHARS_PATTERN.test(name),
        {
          message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalidFileName", params: { name: msg } }),
        },
      )
      .refine(
        (name) => !name.startsWith(".") && !name.endsWith("."),
        {
          message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalidFileName", params: { name: msg } }),
        },
      );

  /**
   * Optional file upload schema with comprehensive validation.
   */
  const zFileUploadOptional = (
    config: {
      maxSize?: number;
      allowedTypes?: readonly string[];
      requireExtension?: boolean;
    } = {},
    msg = "File",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = ALL_MIME_TYPES, requireExtension = false } = config;

    return z
      .object({
        filename: zFilename("Filename", msgType)
          .refine(
            (name) => !requireExtension || name.includes("."),
            {
              message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalidFileName", params: { name: msg } }),
            },
          ),
        mimetype: zMimeType(allowedTypes, "File Type", msgType),
        size: zFileSize(maxSize, "File Size", msgType),
        encoding: stringSchemas.zStringOptional({ msg: "Encoding", msgType }),
        originalName: stringSchemas.zStringOptional({ msg: "Original Name", msgType }),
        buffer: z.instanceof(Buffer, {
          message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "mustBeValidFile" }),
        }).optional(),
      })
      .optional()
      .refine(
        (val) => val === undefined || (typeof val === "object" && val !== null),
        {
          message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalid" }),
        },
      );
  };

  /**
   * Required file upload schema with comprehensive validation.
   */
  const zFileUploadRequired = (
    config: {
      maxSize?: number;
      allowedTypes?: readonly string[];
      requireExtension?: boolean;
    } = {},
    msg = "File",
    msgType: MsgType = MsgType.FieldName,
  ) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = ALL_MIME_TYPES, requireExtension = false } = config;

    return z.object({
      filename: zFilename("Filename", msgType)
        .refine(
          (name) => !requireExtension || name.includes("."),
          {
            message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "invalidFileName", params: { name: msg } }),
          },
        ),
      mimetype: zMimeType(allowedTypes, "File Type", msgType),
      size: zFileSize(maxSize, "File Size", msgType),
      encoding: stringSchemas.zStringOptional({ msg: "Encoding", msgType }),
      originalName: stringSchemas.zStringOptional({ msg: "Original Name", msgType }),
      buffer: z.instanceof(Buffer, {
        message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "mustBeValidFile" }),
      }).optional(),
    }, {
      message: messageHandler.formatErrorMessage({ group: "fileUpload", msg, msgType, messageKey: "fileRequired" }),
    });
  };

  /**
   * Image upload schema.
   * Required file upload with image-specific constraints.
   */
  const zImageUpload = (
    maxSize = 5 * 1024 * 1024, // 5MB
    msg = "Image",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    zFileUploadRequired(
      {
        maxSize,
        allowedTypes: IMAGE_MIME_TYPES,
        requireExtension: true,
      },
      msg,
      msgType,
    );

  /**
   * Document upload schema.
   * Required file upload with document-specific constraints.
   */
  const zDocumentUpload = (
    maxSize = 10 * 1024 * 1024, // 10MB
    msg = "Document",
    msgType: MsgType = MsgType.FieldName,
  ) =>
    zFileUploadRequired(
      {
        maxSize,
        allowedTypes: DOCUMENT_MIME_TYPES,
        requireExtension: true,
      },
      msg,
      msgType,
    );

  /**
   * Multiple file upload schema.
   * Array of required file uploads with configurable limits.
   */
  const zMultipleFileUpload = (
    config: {
      maxSize?: number;
      allowedTypes?: readonly string[];
      requireExtension?: boolean;
    } = {},
    msg = "Files",
    msgType: MsgType = MsgType.FieldName,
    maxFiles = 5,
  ) =>
    z.array(zFileUploadRequired(config, msg, msgType))
      .min(1, {
        message: messageHandler.formatErrorMessage({ group: "array", msg, msgType, messageKey: "mustHaveMinItems", params: { min: 1 } }),
      })
      .max(maxFiles, {
        message: messageHandler.formatErrorMessage({ 
          msg, 
          msgType, 
          group: "array",
          messageKey: "mustHaveMaxItems",
          params: { max: maxFiles }
        }),
      });

  return {
    zFileSize,
    zMimeType,
    zFilename,
    zFileUploadOptional,
    zFileUploadRequired,
    zImageUpload,
    zDocumentUpload,
    zMultipleFileUpload,
  };
};

// --- Utility Functions ---

/**
 * Formats bytes into human-readable format.
 * @param bytes - Number of bytes.
 * @param decimals - Number of decimal places (default: 2).
 * @returns Formatted string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Gets file extension from filename.
 * @param filename - The filename.
 * @returns The file extension or empty string if none.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.substring(lastDot + 1).toLowerCase() : "";
}

/**
 * Checks if a file extension matches the MIME type.
 * @param filename - The filename.
 * @param mimetype - The MIME type.
 * @returns True if extension matches MIME type.
 */
export function isExtensionMatchingMimeType(filename: string, mimetype: string): boolean {
  const extension = getFileExtension(filename);
  const mimeToExtension: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/gif": ["gif"],
    "image/webp": ["webp"],
    "image/svg+xml": ["svg"],
    "application/pdf": ["pdf"],
    "application/msword": ["doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
    "text/plain": ["txt"],
    "text/csv": ["csv"],
    "application/zip": ["zip"],
    "video/mp4": ["mp4"],
    "audio/mpeg": ["mp3"],
  };

  return mimeToExtension[mimetype]?.includes(extension) || false;
}
