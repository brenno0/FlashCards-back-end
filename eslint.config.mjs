import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import nodePlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';
import typescript from 'typescript-eslint';

export default [
    // Configurações base recomendadas
    js.configs.recommended,
    ...typescript.configs.recommended,
    prettierConfig,

    // Configuração global
    {
        languageOptions: {
            globals: {
                ...globals.node, // Suporte para Node.js (process, console, etc.)
                ...globals.es2022, // Suporte para ES2022
            },
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
    },

    // Configuração para arquivos JavaScript (.js)
    {
        files: ['**/*.js'],
        plugins: {
            import: importPlugin,
            n: nodePlugin,
            promise: promisePlugin,
            prettier: prettierPlugin,
        },
        rules: {
            // Integração com Prettier
            'prettier/prettier': ['error', { singleQuote: true, tabWidth: 4 }],

            // Regras gerais do ESLint (inspiradas no Airbnb)
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-unused-vars': [
                'error',
                { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
            ],
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-multi-spaces': 'error',
            curly: ['error', 'all'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'object-shorthand': ['error', 'always'],
            'prefer-arrow-callback': 'error',
            'arrow-body-style': ['error', 'as-needed'],

            // Regras de imports (inspiradas no Airbnb)
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'import/no-duplicates': 'error',
            'import/no-unresolved': 'off', // Defer to TypeScript for module resolution
            'import/extensions': 'off',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-extraneous-dependencies': [
                'error',
                { devDependencies: ['**/*.test.js', '**/*.spec.js'] },
            ],

            // Regras específicas para Node.js
            'n/no-unsupported-features/es-syntax': 'error',
            'n/no-missing-import': 'error',
            'n/prefer-global/process': ['error', 'always'],
            'n/prefer-global/console': ['error', 'always'],

            // Regras para promessas
            'promise/always-return': 'error',
            'promise/catch-or-return': 'error',
            'promise/param-names': 'error',
            'promise/no-nesting': 'warn',
        },
        settings: {
          'import/resolver': {
              typescript: {
                  project: './tsconfig.json',
              },
              node: {
                  extensions: ['.js', '.ts', '.tsx'],
              },
          },
        },
    },

    // Configuração para arquivos TypeScript (.ts, .tsx)
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescript.parser,
            parserOptions: {
                project: './tsconfig.json', // Necessário para regras baseadas em tipos
            },
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': typescript.plugin,
            import: importPlugin,
            n: nodePlugin,
            promise: promisePlugin,
            prettier: prettierPlugin,
        },
        rules: {
            // Integração com Prettier
            'prettier/prettier': ['error', { singleQuote: true, tabWidth: 2 }],

            // Regras gerais do ESLint (inspiradas no Airbnb)
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            'no-multi-spaces': 'error',
            curly: ['error', 'all'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'object-shorthand': ['error', 'always'],
            'prefer-arrow-callback': 'error',
            'arrow-body-style': ['error', 'as-needed'],

            // Regras TypeScript (substituem regras ESLint equivalentes)
            'no-unused-vars': 'off', // Desativar regra ESLint
            '@typescript-eslint/no-unused-vars': [
                'error',
                { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': [
                'warn',
                { ignoreRestArgs: true },
            ],
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // Regras de imports
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'import/no-duplicates': 'error',
            'import/no-unresolved': 'off',
            'import/extensions': 'off',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
                    optionalDependencies: false,
                    peerDependencies: false,
                    packageDir: './',
                },

            ],

            // Regras específicas para Node.js
            'n/no-unsupported-features/es-syntax': 'off', // TypeScript handles this
            'n/no-missing-import': 'off', // TypeScript handles this
            'n/prefer-global/process': ['error', 'always'],
            'n/prefer-global/console': ['error', 'always'],

            // Regras para promessas
            'promise/always-return': 'error',
            'promise/catch-or-return': 'error',
            'promise/param-names': 'error',
            'promise/no-nesting': 'warn',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                },
                node: {
                    extensions: ['.js', '.ts', '.json'],
                    moduleDirectory: ['node_modules', './'],
                },
            },
        },
    },

    // Arquivos de teste
    {
        files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    // Arquivos de configuração
    {
        files: ['*.config.{js,mjs,cjs,ts}', '.eslintrc.{js,cjs}'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },

    // Ignorar arquivos
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '*.min.js',
            '.cache/**',
        ],
    },
];
