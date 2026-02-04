module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "espree",
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: false }
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended"
  ],
  rules: {
    // 根据团队偏好调整规则
    "no-unused-vars": "warn",
    "no-console": "off"
  }
};
