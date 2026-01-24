import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: ["dist/", "node_modules/", ".astro/", ".env*", ".agent/"],
  },
  // JS recommended
  js.configs.recommended,
  // TypeScript recommended
  ...tseslint.configs.recommended,
  // Astro recommended
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Custom overrides
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      // Allow unspoken vars in astro templates if needed, but strict otherwise
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^Props$"
      }],
    },
  },
  {
    files: ["**/*.{js,ts}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  }
];
