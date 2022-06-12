module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true
  },
  extends: ['standard'],
  ignorePatterns: ['test/*', 'examples/*', 'benchmarks/*'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {}
}
