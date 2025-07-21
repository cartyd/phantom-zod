import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import globals from "globals";
import sortClassMembers from "eslint-plugin-sort-class-members";

export default [
  {
    ignores: [
      "tests/**/*",
      "**/*.test.ts",
      "**/*.test.js",
      "**/*.spec.ts",
      "**/*.spec.js",
      "__tests__/**/*",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: parser, // Correct placement of parser
    },
    plugins: {
      "@typescript-eslint": ts, // Correct format for plugins
      "sort-class-members": sortClassMembers,
    },
    ...js.configs.recommended,
    rules: {
      // Prioritized Rules (Client's request)
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeParameter", // Matches type parameters (generics)
          format: ["PascalCase"], // Enforce PascalCase (e.g., TMyType)
          custom: {
            regex: "^T[A-Z]", // Add a prefix T and ensure it starts with an uppercase letter
            match: true, // Require the regex to match
          },
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "property",
          format: null, // Allow properties like office_id, app_key, etc.
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false, // Prevent prefixing interfaces with "I"
          },
        },
      ],
      eqeqeq: "error", // Enforcing strict equality checks (=== and !==)

      // Relaxed Rules
      "no-console": "off", // Allowing console statements for development purposes
      "no-unused-vars": "warn", // Warning for unused variables, but not blocking
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "error", // Ensuring no use of undefined variables
      "consistent-return": "error", // Enforcing consistent return statements

      // Optional Rules (Adjust as needed)
      "prefer-const": "error", // Enforcing usage of const where possible
      "no-var": "error", // Enforcing let/const over var
      "arrow-spacing": ["error", { before: true, after: true }], // Enforcing spaces around arrows in arrow functions

      // Class member ordering
      "sort-class-members/sort-class-members": [
        "error",
        {
          order: [
            "[static-properties]",
            "[static-methods]",
            "[properties]",
            "[conventional-private-properties]",
            "constructor",
            "[methods]",
            "[conventional-private-methods]",
          ],
          accessorPairPositioning: "getThenSet",
        },
      ],
    },
  },
];
