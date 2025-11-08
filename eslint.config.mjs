import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      security,
    },
    rules: {
      // 해커톤용 완화된 보안 규칙 (Critical만 error, 나머지는 warn 또는 off)
      "security/detect-object-injection": "off", // 객체 주입 탐지 (false positive 많음)
      "security/detect-non-literal-regexp": "off", // 비리터럴 정규식 탐지
      "security/detect-unsafe-regex": "warn", // 안전하지 않은 정규식 탐지 (ReDoS) - warn으로 완화
      "security/detect-buffer-noassert": "warn", // Buffer 안전하지 않은 사용 탐지
      "security/detect-child-process": "off", // 자식 프로세스 사용 탐지
      "security/detect-disable-mustache-escape": "warn", // Mustache 이스케이프 비활성화 탐지
      "security/detect-eval-with-expression": "error", // eval 사용 탐지 - Critical!
      "security/detect-no-csrf-before-method-override": "off", // CSRF 보호 누락 탐지
      "security/detect-non-literal-fs-filename": "off", // 비리터럴 파일명 탐지
      "security/detect-non-literal-require": "off", // 비리터럴 require 탐지
      "security/detect-possible-timing-attacks": "off", // 타이밍 공격 가능성 탐지
      "security/detect-pseudoRandomBytes": "off", // 약한 난수 생성 탐지
      "security/detect-new-buffer": "warn", // 안전하지 않은 Buffer 생성자 탐지
      
      // TypeScript any 타입 허용
      "@typescript-eslint/no-explicit-any": "off",
      
      // 미사용 변수는 경고만
      "@typescript-eslint/no-unused-vars": "warn",
      
      // React hooks 규칙 완화
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
