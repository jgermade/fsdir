
const IS_PROD = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    es6: true,
  },
  extends: [
    'standard',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': IS_PROD ? 'error' : 'warn',
    'no-debugger': IS_PROD ? 'error' : 'warn',
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
  },
}
