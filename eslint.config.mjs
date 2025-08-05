import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  globalIgnores(['**/node_modules/', '**/dist/']),
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
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
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
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
