
const BUNDLE_FOR_PROD = process.env.BUNDLE === 'production' || process.env.BUNDLE === 'prod'

const custom_rules = {
  'no-console': BUNDLE_FOR_PROD ? 'error' : 'warn',
  'no-debugger': BUNDLE_FOR_PROD ? 'error' : 'warn',
  camelcase: 'off',
  'prefer-promise-reject-errors': 'off',
  'no-throw-literal': 'off',
  'no-mixed-operators': 'off',
  'comma-dangle': ['warn', {
    arrays: 'only-multiline',
    objects: 'only-multiline',
    imports: 'only-multiline',
    exports: 'only-multiline',
    functions: 'ignore',
  }],
  'no-trailing-spaces': [
    'error', {
      skipBlankLines: true,
    },
  ],
  'no-unused-vars': [
    'warn',
    {
      args: 'after-used',
      argsIgnorePattern: '^_\\w+'
    }
  ],

  // TODO: drop out following rules:
  'no-var': ['off'],
  'multiline-ternary': ['off'],
}

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'standard',
  ],
  // parser: '@babel/eslint-parser',
  rules: custom_rules,
  overrides: [
    {
      files: ['{,**/}*.spec.js'],
      env: { jest: true },
    },
  ],
}
