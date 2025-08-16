/**
 * Example showing how to use the localization manager
 * for consistent behavior across schema validations
 */

import { localizationManager } from "../src/localization";
import { pz } from "../src/index";

// Example: Set up localization
function setupLocalization() {
  // Configure the localization manager
  localizationManager.setLocale("en");
  localizationManager.setFallbackLocale("en");

  console.log("Localization configuration set:");
  console.log("- Current Locale:", localizationManager.getLocale());
  console.log("- Fallback Locale:", localizationManager.getFallbackLocale());
  console.log(
    "- Available Locales:",
    localizationManager.getAvailableLocales(),
  );
}

// Example: Use schemas with localization
function exampleUsage() {
  setupLocalization();

  // All these schemas use the default English localization
  const nameSchema = pz.StringRequired({ msg: "Name" });
  const emailSchema = pz.EmailRequired({ msg: "Email" });
  const ipSchema = pz.IPv4Required({ msg: "IP Address" });

  console.log("\n--- Testing schemas with localization ---");

  try {
    nameSchema.parse(""); // Should trigger validation error
  } catch (error) {
    console.log(
      "Name validation error:",
      error.issues?.[0]?.message || error.message,
    );
  }

  try {
    emailSchema.parse("invalid-email"); // Should trigger validation error
  } catch (error) {
    console.log(
      "Email validation error:",
      error.issues?.[0]?.message || error.message,
    );
  }

  try {
    ipSchema.parse("999.999.999.999"); // Should trigger validation error
  } catch (error) {
    console.log(
      "IP validation error:",
      error.issues?.[0]?.message || error.message,
    );
  }

  console.log("\n--- Valid inputs ---");
  console.log("Valid name:", nameSchema.parse("John Doe"));
  console.log("Valid email:", emailSchema.parse("john@example.com"));
  console.log("Valid IP:", ipSchema.parse("192.168.1.1"));
}

// Run the example
exampleUsage();

export { setupLocalization, exampleUsage };
