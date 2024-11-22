// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
        rules: {
            'no-console': 'error',
            'max-len': ['error', { code: 100 }],
            'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
            'no-magic-numbers': ["error", { "ignore": [-1, -.5, 0, .5, 1, 2, 100, 1000] }],
            'complexity': ['error', 3],
            'quotes': ['error', 'double'],
            
            // TypeScript
            '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/no-empty-interface': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-for-in-array': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/class-literal-property-style': 'error',
            '@typescript-eslint/consistent-indexed-object-style': 'error',
            '@typescript-eslint/consistent-type-assertions': 'error',
            '@typescript-eslint/consistent-type-definitions': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',

        }
    }
);
