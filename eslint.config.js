import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.turbo/**',
            '**/.next/**',
            '**/coverage/**',
        ],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: { ...globals.node, ...globals.browser },
        },
        plugins: { '@typescript-eslint': tseslint.plugin },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]
