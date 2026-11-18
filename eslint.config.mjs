import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Imperative WebGL code: React Three Fiber mutates GPU uniforms, scene
    // objects and animation refs inside useFrame by design. The React
    // Compiler purity rules do not model that, so they are relaxed here only.
    files: ["src/experience/opening/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy, unwired components kept for reference (superseded by src/experience):
    "src/components/**",
  ]),
]);

export default eslintConfig;
