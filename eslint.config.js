import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import globals from "globals";
import vueParser from "vue-eslint-parser";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],

  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        fetch: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        defineProps: "readonly",
        defineEmits: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
      },
    },

    plugins: {
      vue,
      "@typescript-eslint": tseslint.plugin,
    },

    rules: {
      "no-undef": "off",

      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",

      "no-console": "warn",

      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",

      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
];
