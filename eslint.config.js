import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import next from "eslint-plugin-next";

export default [
  js.configs.recommended, // Standard JS rules
  ts.configs.recommended, // TypeScript-specific rules
  next.configs.recommended, // Next.js rules
  {
    files: ["**/*.ts", "**/*.tsx"], // Apply to TS/TSX files
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
    extends: ["next/core-web-vitals"],
  },
];
