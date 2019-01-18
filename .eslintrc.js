module.exports = {
  env: {
    'es6': true
  },
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'vue/require-v-for-key': 'off'
  }
}
