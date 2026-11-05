import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  { ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**"] },
  ...compat.extends("next/core-web-vitals"),
  prettier,
  { rules: { "no-unused-vars": "off" } },
];

export default config;
