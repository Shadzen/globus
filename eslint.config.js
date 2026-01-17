import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['src/**/*.{ts,astro,js}', '*.config.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'no-block-comments': {
        rules: {
          'no-block-comments': {
            create(context) {
              return {
                Program() {
                  const sourceCode = context.sourceCode
                  const comments = sourceCode.getAllComments()

                  for (const comment of comments) {
                    if (comment.type === 'Block') {
                      context.report({
                        loc: comment.loc,
                        message: 'Block comments are not allowed. Use single-line comments //',
                      })
                    }
                  }
                },
              }
            },
          },
        },
      },
    },
    rules: {
      // TypeScript ESLint rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',

      // Project rules
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],

      // Custom rules from the other project
      'no-block-comments/no-block-comments': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression:matches([callee.property.name=/^(watch|watchScoped|subscribe|observe|safeExecute)$/],[callee.name=/^(watch|watchScoped|subscribe|observe|safeExecute)$/]) > :matches(ArrowFunctionExpression, FunctionExpression)',
          message: 'Use object observer: this.method(value, { onEvent: (param) => {...} }) instead of inline callback',
        },
      ],
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'scripts/**',
    ],
  },
)
