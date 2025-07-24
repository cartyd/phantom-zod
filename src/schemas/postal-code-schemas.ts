import { z } from "zod";
import { MsgType } from "./msg-type";
import { formatErrorMessage } from "../common/message-handler";
import { US_ZIP_CODE_PATTERN } from "../common/regex-patterns";


// --- Postal Code Schemas ---

/**
 * Optional US postal code (ZIP code) schema.
 * Accepts a string matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789), or undefined.
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for an optional US ZIP code.
 */
export const zPostalCodeOptional = (
  msg = "Postal Code",
  msgType: MsgType = MsgType.FieldName,
  
) =>
  z
    .string()
    .regex(US_ZIP_CODE_PATTERN, {
      message: formatErrorMessage({ msg, msgType, messageKey: "postalCode.mustBeValidZipCode"}),
    })
    .refine((val) => {
      // Reject reserved/invalid codes
      if (val === "00000" || val.startsWith("00000-")) return false;
      if (val === "99999" || val.startsWith("99999-")) return false;
      
      // Reject codes that end with incomplete extension
      if (val.endsWith('-')) return false;
      
      // Reject codes with spaces (like international codes)
      if (val.includes(' ')) return false;
      
      // Reject specific known non-US postal codes that happen to match US format
      const knownNonUsCodes = ['75001', '10117']; // France, Germany
      if (knownNonUsCodes.includes(val.split('-')[0])) {
        return false;
      }
      
      return true;
    }, {
      message: formatErrorMessage({ msg, msgType, messageKey: "postalCode.mustBeValidZipCode"}),
    })
    .optional();

/**
 * Required US postal code (ZIP code) schema.
 * Accepts a non-empty string matching 5 digits or 5+4 digits (e.g., 12345 or 12345-6789).
 * @param msg - The field name or custom message for error output.
 * @param msgType - Determines if 'msg' is a field name or a custom message. Defaults to MsgType.FieldName.
 * @returns Zod schema for a required US ZIP code.
 */
export const zPostalCodeRequired = (
  msg = "Postal Code",
  msgType: MsgType = MsgType.FieldName,
  
) =>
  z
    .string()
    .nonempty({
      message: formatErrorMessage({ msg, msgType, messageKey: "postalCode.required"}),
    })
    .regex(US_ZIP_CODE_PATTERN, {
      message: formatErrorMessage({ msg, msgType, messageKey: "postalCode.mustBeValidZipCode"}),
    })
    .refine((val) => {
      // Reject reserved/invalid codes
      if (val === "00000" || val.startsWith("00000-")) return false;
      if (val === "99999" || val.startsWith("99999-")) return false;
      
      // Reject codes that end with incomplete extension
      if (val.endsWith('-')) return false;
      
      // Reject codes with spaces (like international codes)
      if (val.includes(' ')) return false;
      
      // Reject specific known non-US postal codes that happen to match US format
      const knownNonUsCodes = ['75001', '10117']; // France, Germany
      if (knownNonUsCodes.includes(val.split('-')[0])) {
        return false;
      }
      
      return true;
    }, {
      message: formatErrorMessage({ msg, msgType, messageKey: "postalCode.mustBeValidZipCode"}),
    });
