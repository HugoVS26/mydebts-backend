import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/']),
  {
    extends: compat.extends('xo', 'prettier'),

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2022,
      sourceType: 'module',
    },

    rules: {
      'no-unused-vars': 'error',

      'new-cap': [
        'error',
        {
          capIsNewExceptions: ['Router'],
        },
      ],

      'no-implicit-coercion': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: compat.extends('xo-typescript', 'prettier'),

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['**/model/*.ts'],

    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
]);
