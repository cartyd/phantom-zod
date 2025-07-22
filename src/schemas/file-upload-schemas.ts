import { z } from "zod";

import { MsgType } from "./msg-type";
import { zStringRequired, zStringOptional } from "./string-schemas";
import { formatErrorMessage } from "../common/message-handler";
import { FILENAME_INVALID_CHARS_PATTERN } from "../common/regex-patterns";

// --- File Upload Schema Types ---
export type FileUploadOptional = z.infer<ReturnType<typeof zFileUploadOptional>>;
export type FileUploadRequired = z.infer<ReturnType<typeof zFileUploadRequired>>;

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

// --- File Upload Schemas ---

/**
 * File size validation schema.
 * @param maxSize - Maximum file size in bytes.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for file size validation.
 */
/**
 * Creates a Zod schema for validating file sizes.
 *
 * The schema ensures that the value is a number, is positive, and does not exceed the specified maximum size.
 * Custom error messages can be provided for each validation step.
 *
 * @param maxSize - The maximum allowed file size in bytes.
 * @param fieldName - The name of the field being validated (used in error messages). Defaults to "File Size".
 * @param msgType - The type of message formatting to use for errors. Defaults to `MsgType.FieldName`.
 * @returns A Zod number schema with validation for file size.
 *
 * @example
 * // Allow files up to 2MB
 * const fileSizeSchema = zFileSize(2 * 1024 * 1024, "Upload Size");
 * fileSizeSchema.parse(1024 * 1024); // Passes
 * fileSizeSchema.parse(3 * 1024 * 1024); // Throws ZodError
 */
export const zFileSize = (
  maxSize: number,
  fieldName = "File Size",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.number({
    message: formatErrorMessage(
      fieldName,
      msgType,
      "must be a number"
    ),
  })
  .positive({
    message: formatErrorMessage(
      fieldName,
      msgType,
      "must be greater than 0"
    ),
  })
  .max(maxSize, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      `must be less than ${formatBytes(maxSize)}`
    ),
  });


/**
 * MIME type validation schema.
 * @param allowedTypes - Array of allowed MIME types.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for MIME type validation.
 *
 * @example
 * // Allow only JPEG and PNG images
 * const mimeSchema = zMimeType(["image/jpeg", "image/png"]);
 * mimeSchema.parse("image/jpeg"); // Passes
 * mimeSchema.parse("image/gif"); // Throws ZodError
 *
 * @example
 * // Custom error message
 * const mimeSchema = zMimeType(["application/pdf"], "Document Type", MsgType.Message);
 * mimeSchema.parse("application/pdf"); // Passes
 * mimeSchema.parse("image/png"); // Throws ZodError with custom message
 */
export const zMimeType = (
  allowedTypes: readonly string[],
  fieldName = "File Type",
  msgType: MsgType = MsgType.FieldName,
) =>
  z.enum(allowedTypes as [string, ...string[]], {
    message: formatErrorMessage(
      fieldName,
      msgType,
      `must be one of: ${allowedTypes.join(", ")}`
    ),
  });


/**
 * Filename validation schema.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for filename validation.
 *
 * @example
 * // Basic usage
 * const filenameSchema = zFilename();
 * filenameSchema.parse("myfile.txt"); // Passes
 * filenameSchema.parse(".hiddenfile"); // Throws ZodError
 * filenameSchema.parse("file?.txt"); // Throws ZodError (invalid character)
 */
export const zFilename = (
  fieldName = "Filename",
  msgType: MsgType = MsgType.FieldName,
) =>
  zStringRequired(fieldName, msgType)
    .refine(
      (name) => FILENAME_INVALID_CHARS_PATTERN.test(name),
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "contains invalid characters"
        ),
      },
    )
    .refine(
      (name) => !name.startsWith(".") && !name.endsWith("."),
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "cannot start or end with a dot"
        ),
      },
    );

/**
 * Optional file upload schema with comprehensive validation.
 * @param config - Configuration object for file validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional file upload.
 * 
 * @example
 * const fileSchema = zFileUploadOptional({ 
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: IMAGE_MIME_TYPES 
 * }, "Profile Picture");
 */
export const zFileUploadOptional = (
  config: {
    maxSize?: number;
    allowedTypes?: readonly string[];
    requireExtension?: boolean;
  } = {},
  fieldName = "File",
  msgType: MsgType = MsgType.FieldName,
) => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ALL_MIME_TYPES, requireExtension = false } = config;

  return z
    .object({
      filename: zFilename(
        msgType === MsgType.Message ? "Filename is required" : "Filename",
        msgType,
      ).refine(
        (name) => !requireExtension || name.includes("."),
        {
          message: formatErrorMessage(
            fieldName,
            msgType,
            "must have a file extension"
          ),
        },
      ),
      mimetype: zMimeType(
        allowedTypes,
        msgType === MsgType.Message ? "Invalid file type" : "File Type",
        msgType,
      ),
      size: zFileSize(
        maxSize,
        msgType === MsgType.Message ? "File too large" : "File Size",
        msgType,
      ),
      encoding: zStringOptional(
        msgType === MsgType.Message ? "Encoding is optional" : "Encoding",
        msgType,
      ),
      originalName: zStringOptional(
        msgType === MsgType.Message ? "Original name is optional" : "Original Name",
        msgType,
      ),
      buffer: z.instanceof(Buffer, {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "buffer must be a Buffer instance"
        ),
      }).optional(),
    })
    .optional()
    .refine(
      (val) => val === undefined || (typeof val === "object" && val !== null),
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "must be a valid file object"
        ),
      },
    );
};

/**
 * Required file upload schema with comprehensive validation.
 * @param config - Configuration object for file validation.
 * @param fieldName - The field name for error messages.
 * @param msgType - Determines if 'fieldName' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required file upload.
 * 
 * @example
 * const fileSchema = zFileUploadRequired({ 
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: IMAGE_MIME_TYPES 
 * }, "Profile Picture");
 */
export const zFileUploadRequired = (
  config: {
    maxSize?: number;
    allowedTypes?: readonly string[];
    requireExtension?: boolean;
  } = {},
  fieldName = "File",
  msgType: MsgType = MsgType.FieldName,
) => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ALL_MIME_TYPES, requireExtension = false } = config;

  return z.object({
    filename: zFilename(
      msgType === MsgType.Message ? "Filename is required" : "Filename",
      msgType,
    ).refine(
      (name) => !requireExtension || name.includes("."),
      {
        message: formatErrorMessage(
          fieldName,
          msgType,
          "must have a file extension"
        ),
      },
    ),
    mimetype: zMimeType(
      allowedTypes,
      msgType === MsgType.Message ? "Invalid file type" : "File Type",
      msgType,
    ),
    size: zFileSize(
      maxSize,
      msgType === MsgType.Message ? "File too large" : "File Size",
      msgType,
    ),
    encoding: zStringOptional(
      msgType === MsgType.Message ? "Encoding is optional" : "Encoding",
      msgType,
    ),
    originalName: zStringOptional(
      msgType === MsgType.Message ? "Original name is optional" : "Original Name",
      msgType,
    ),
    buffer: z.instanceof(Buffer, {
      message: formatErrorMessage(
        fieldName,
        msgType,
        "buffer must be a Buffer instance"
      ),
    }).optional(),
  }, {
    message: formatErrorMessage(
      fieldName,
      msgType,
      "is required"
    ),
  });
};


/**
 * Creates a Zod schema for validating image file uploads.
 *
 * @param maxSize - The maximum allowed file size in bytes. Defaults to 5MB.
 * @param fieldName - The name of the field being validated. Defaults to "Image".
 * @param msgType - The type of message to use for validation errors. Defaults to `MsgType.FieldName`.
 * @returns A Zod schema that validates required image uploads with specified constraints.
 *
 * @example
 * // Allow image uploads up to 5MB
 * const imageSchema = zImageUpload();
 * imageSchema.parse({
 *   filename: "photo.jpg",
 *   mimetype: "image/jpeg",
 *   size: 1024 * 1024,
 *   encoding: "7bit",
 *   originalName: "photo.jpg",
 *   buffer: Buffer.from([]),
 * });
 */
export const zImageUpload = (
  maxSize = 5 * 1024 * 1024, // 5MB
  fieldName = "Image",
  msgType: MsgType = MsgType.FieldName,
) =>
  zFileUploadRequired(
    {
      maxSize,
      allowedTypes: IMAGE_MIME_TYPES,
      requireExtension: true,
    },
    fieldName,
    msgType,
  );


/**
 * Creates a Zod schema for validating a required document upload.
 *
 * @param maxSize - The maximum allowed file size in bytes. Defaults to 10MB.
 * @param fieldName - The name of the field to use in validation messages. Defaults to "Document".
 * @param msgType - The type of message to use for validation errors. Defaults to `MsgType.FieldName`.
 * @returns A Zod schema for validating a required document upload with specified constraints.
 *
 * @example
 * // Allow document uploads up to 10MB
 * const documentSchema = zDocumentUpload();
 * documentSchema.parse({
 *   filename: "report.pdf",
 *   mimetype: "application/pdf",
 *   size: 1024 * 1024,
 *   encoding: "7bit",
 *   originalName: "report.pdf",
 *   buffer: Buffer.from([]),
 * });
 */
export const zDocumentUpload = (
  maxSize = 10 * 1024 * 1024, // 10MB
  fieldName = "Document",
  msgType: MsgType = MsgType.FieldName,
) =>
  zFileUploadRequired(
    {
      maxSize,
      allowedTypes: DOCUMENT_MIME_TYPES,
      requireExtension: true,
    },
    fieldName,
    msgType,
  );


/**
 * Creates a Zod schema for validating an array of file uploads.
 *
 * @param config - Optional configuration for file validation, including:
 *   - `maxSize`: Maximum allowed file size in bytes.
 *   - `allowedTypes`: Array of allowed MIME types.
 *   - `requireExtension`: Whether a file extension is required.
 * @param fieldName - The name of the field being validated (default: "Files").
 * @param msgType - The type of message formatting to use for error messages.
 * @param maxFiles - The maximum number of files allowed in the array (default: 5).
 * @returns A Zod array schema that:
 *   - Requires at least one file.
 *   - Limits the number of files to `maxFiles`.
 *   - Applies the file validation schema to each file in the array.
 *
 * @example
 * // Allow up to 3 image files, each max 2MB
 * const multiImageSchema = zMultipleFileUpload(
 *   { maxSize: 2 * 1024 * 1024, allowedTypes: IMAGE_MIME_TYPES, requireExtension: true },
 *   "Images",
 *   MsgType.FieldName,
 *   3
 * );
 * multiImageSchema.parse([
 *   {
 *     filename: "photo1.jpg",
 *     mimetype: "image/jpeg",
 *     size: 1024 * 1024,
 *     encoding: "7bit",
 *     originalName: "photo1.jpg",
 *     buffer: Buffer.from([]),
 *   },
 *   {
 *     filename: "photo2.png",
 *     mimetype: "image/png",
 *     size: 512 * 1024,
 *     encoding: "7bit",
 *     originalName: "photo2.png",
 *     buffer: Buffer.from([]),
 *   }
 * ]);
 */
export const zMultipleFileUpload = (
  config: {
    maxSize?: number;
    allowedTypes?: readonly string[];
    requireExtension?: boolean;
  } = {},
  fieldName = "Files",
  msgType: MsgType = MsgType.FieldName,
  maxFiles = 5,
) =>
  z.array(zFileUploadRequired(config, fieldName, msgType))
    .min(1, {
      message: formatErrorMessage(
        fieldName,
        msgType,
        "must contain at least one file"
      ),
    })
    .max(maxFiles, {
      message: formatErrorMessage(
        fieldName,
        msgType,
        `must contain at most ${maxFiles} files`
      ),
    });

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
