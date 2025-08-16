import { pz } from "../src/index";
import { localizationManager, getMessage } from "../src/localization";
import { MsgType } from "../src/common/types/msg-type";

async function demonstrateLocalization() {
  // Example 1: Basic usage with English (default)
  console.log("=== Basic Usage (English) ===");

  const usernameSchema = pz.StringRequired({
    msg: "Username",
    msgType: MsgType.FieldName,
    minLength: 3,
    maxLength: 20,
  });

  try {
    console.log("Valid:", usernameSchema.parse("alice")); // "alice"
  } catch (error) {
    console.log("Error:", error.errors[0].message);
  }

  try {
    usernameSchema.parse("ab"); // Too short
  } catch (error) {
    console.log("Error:", error.issues?.[0]?.message || error.message); // "Username is too short (minimum: 3 characters)"
  }

  try {
    usernameSchema.parse(""); // Required
  } catch (error) {
    console.log("Error:", error.issues?.[0]?.message || error.message); // "Username is required"
  }

  // Example 2: Spanish locale
  console.log("\n=== Spanish Locale ===");

  try {
    await localizationManager.loadLocale("es");

    const usernameSchemaEs = pz.StringRequired({
      msg: "Nombre de usuario",
      msgType: MsgType.FieldName,
      minLength: 3,
      maxLength: 20,
    });

    // Note: These schemas use the default English message handler
    // For Spanish messages, see the "Direct Message Access" section below
    try {
      usernameSchemaEs.parse("ab"); // Too short
    } catch (error) {
      console.log(
        "Schema Error (English messages):",
        error.issues?.[0]?.message || error.message,
      );
    }

    try {
      usernameSchemaEs.parse(""); // Required
    } catch (error) {
      console.log(
        "Schema Error (English messages):",
        error.issues?.[0]?.message || error.message,
      );
    }
  } catch (error) {
    console.log("Could not load Spanish locale:", error.message);
  }

  // Example 3: Optional string with constraints
  console.log("\n=== Optional String ===");

  const descriptionSchema = pz.StringOptional({
    msg: "Description",
    msgType: MsgType.FieldName,
    maxLength: 100,
  });

  try {
    console.log("Valid:", descriptionSchema.parse("A short description")); // "A short description"
    console.log("Valid (empty):", descriptionSchema.parse("")); // ""
    console.log("Valid (undefined):", descriptionSchema.parse(undefined)); // ""
  } catch (error) {
    console.log("Error:", error.issues?.[0]?.message || error.message);
  }

  // Example 4: Custom message type (bypasses localization)
  console.log("\n=== Custom Messages ===");

  const customSchema = pz.StringRequired({
    msg: "This field must be filled out",
    msgType: MsgType.Message,
  });

  try {
    customSchema.parse("");
  } catch (error) {
    console.log("Custom message:", error.issues?.[0]?.message || error.message); // "This field must be filled out"
  }

  // Example 5: Direct message access
  console.log("\n=== Direct Message Access ===");
  console.log("Available locales:", localizationManager.getAvailableLocales());

  // English messages
  console.log(
    'English "string.required":',
    getMessage("string.required", undefined, "en"),
  );
  console.log(
    'English "string.tooShort" with params:',
    getMessage("string.tooShort", { min: "5" }, "en"),
  );

  // Spanish messages (if loaded)
  if (localizationManager.hasLocale("es")) {
    console.log(
      'Spanish "string.required":',
      getMessage("string.required", undefined, "es"),
    );
    console.log(
      'Spanish "string.tooShort" with params:',
      getMessage("string.tooShort", { min: "5" }, "es"),
    );
  }

  // Example 6: Fallback behavior
  console.log("\n=== Fallback Behavior ===");
  console.log(
    "Non-existent key:",
    getMessage("nonexistent.key", undefined, "en"),
  ); // Returns key itself
  console.log(
    "Non-existent locale falls back to English:",
    getMessage("string.required", undefined, "fr" as any),
  );
}

// Run the demonstration
demonstrateLocalization().catch(console.error);
