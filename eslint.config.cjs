const js = require('@eslint/js')
const globals = require('globals')
const importPlugin = require('eslint-plugin-import')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettier = require('eslint-config-prettier')

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            '**/.next/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            '**/.turbo/**',
        ],
    },

    js.configs.recommended,

    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'no-undef': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    {
        files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            import: importPlugin,
        },
        rules: {
            'import/first': 'error',
            'import/no-duplicates': 'error',
            'import/newline-after-import': 'error',
        },
    },

    prettier,
]