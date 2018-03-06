module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint:recommended'],
  plugins: ['prettier', 'jest'],
  env: {
    node: true,
    es6: true,
    'jest/globals': true
  },
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
  }
};
