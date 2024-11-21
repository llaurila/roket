// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        rules: {
            'no-console': 'error',
            'max-len': ['error', { code: 100 }],
            'no-magic-numbers': ["error", { "ignore": [-1, -.5, 0, .5, 1, 2, 100, 1000] }]
        }
    }
);
