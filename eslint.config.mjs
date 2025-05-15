import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // <--------------- ignoring extra files and folders
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "out/**",
      "build/**",
      "lib/generated/**", // <--- this miserable new-way folder of Prisma Client :-)
    ],
  }, // <-----------------
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
