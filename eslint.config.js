import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.jsx"], // Aplica esta configuração APENAS a arquivos .jsx
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "18.3" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["**/*.js"], // Aplica esta configuração a arquivos .js (incluindo os do frontend que não são JSX)
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module", // Assumindo que seus arquivos .js do frontend também são módulos
      },
    },
    settings: { react: { version: "18.3" } }, // Mantendo settings do React para consistência
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["backend/**/*.js", "api/**/*.js"], // Aplica esta configuração a arquivos .js na pasta backend E na pasta api (AGORA .js)
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node }, // Adiciona os globals do Node.js
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module", // Define o sourceType como "module" para arquivos .js (já que estamos refatorando para ES Modules)
      },
    },
    env: {
      node: true, // Habilita o ambiente Node.js
    },
    rules: {
      ...js.configs.recommended.rules, // Você pode adicionar regras específicas para o backend/api aqui, se necessário
      "no-undef": "warn", // Mude de "error" para "warn" para permitir 'process' no ambiente Node.js
    },
  },
];
