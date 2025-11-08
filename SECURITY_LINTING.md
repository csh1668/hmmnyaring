# 보안 정적 분석 (ESLint + Security Plugin)

## 개요

이 프로젝트는 ESLint와 eslint-plugin-security를 사용하여 코드의 보안 취약점을 자동으로 탐지합니다.

## 탐지하는 보안 취약점

### 🚨 Critical (Error)
- **eval 사용** - `eval()` 함수는 임의 코드 실행이 가능하여 매우 위험
- **안전하지 않은 정규식** - ReDoS(정규식 서비스 거부) 공격 가능성
- **Buffer 안전하지 않은 사용** - 메모리 누수 및 보안 문제
- **new Buffer() 사용** - 구식이며 안전하지 않은 Buffer 생성자

### ⚠️ Warning
- **객체 주입** - 동적 프로퍼티 접근 시 프로토타입 오염 가능성
- **비리터럴 정규식** - 사용자 입력으로 정규식 생성 시 ReDoS 위험
- **자식 프로세스 사용** - 명령 주입 공격 가능성
- **비리터럴 파일명** - 경로 조작(Path Traversal) 공격 가능성
- **타이밍 공격** - 문자열 비교 시 타이밍 공격으로 비밀번호 유출 가능
- **약한 난수** - `Math.random()` 등은 암호학적으로 안전하지 않음

## 사용 방법

### 로컬 개발

```bash
# 보안 검사 실행
pnpm run lint:security

# 자동 수정 가능한 문제 수정
pnpm run lint:fix

# 일반 lint 실행
pnpm run lint
```

### Git Hooks

#### Pre-commit (커밋 전)
- 변경된 파일에 대해 자동으로 ESLint 실행
- 보안 문제 발견 시 커밋 차단
- `lint-staged`를 통해 효율적으로 실행

#### Pre-push (푸시 전)
- 전체 코드베이스에 대해 보안 검사 실행
- 경고(warning)도 허용하지 않음 (`--max-warnings=0`)
- 문제 발견 시 push 차단

**우회 방법 (비상시에만 사용)**:
```bash
# pre-push hook 우회 (권장하지 않음)
git push --no-verify
```

### CI/CD (GitHub Actions)

`.github/workflows/security-check.yml` 워크플로우가 자동으로 실행됩니다:

- **트리거**: main, develop 브랜치로의 push 또는 PR
- **동작**: 전체 코드베이스 보안 검사
- **실패 시**: PR 병합 차단, 아티팩트로 로그 업로드

## ESLint 설정

### 보안 규칙 목록

```javascript
// eslint.config.mjs
{
  rules: {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-require": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "warn",
    "security/detect-new-buffer": "error",
  }
}
```

## 일반적인 보안 문제 해결

### 1. eval 사용 금지

❌ **나쁨**:
```typescript
const result = eval(userInput); // 절대 사용 금지!
```

✅ **좋음**:
```typescript
// 대안: JSON 파싱
const result = JSON.parse(userInput);

// 대안: Function constructor 대신 명시적 로직
const allowedOperations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};
```

### 2. innerHTML 대신 안전한 방법 사용

❌ **나쁨**:
```typescript
element.innerHTML = userInput; // XSS 위험!
```

✅ **좋음**:
```typescript
// React에서는 JSX 사용 (자동 이스케이프)
<div>{userInput}</div>

// 또는 textContent 사용
element.textContent = userInput;

// HTML이 필요한 경우 DOMPurify 사용
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 3. 안전한 정규식 사용

❌ **나쁨**:
```typescript
// ReDoS 공격 가능
const regex = new RegExp(`(a+)+b`, 'g');
const regex2 = new RegExp(userInput); // 사용자 입력으로 정규식 생성
```

✅ **좋음**:
```typescript
// 리터럴 정규식 사용
const regex = /^[a-zA-Z0-9]+$/;

// Zod를 사용한 검증
import { z } from 'zod';
const schema = z.string().regex(/^[a-zA-Z0-9]+$/);
```

### 4. 암호학적으로 안전한 난수 사용

❌ **나쁨**:
```typescript
const token = Math.random().toString(36); // 예측 가능!
```

✅ **좋음**:
```typescript
import { randomBytes } from 'crypto';
const token = randomBytes(32).toString('hex');
```

### 5. 타이밍 공격 방지

❌ **나쁨**:
```typescript
if (userToken === secretToken) { // 타이밍 공격 가능
  // ...
}
```

✅ **좋음**:
```typescript
import { timingSafeEqual } from 'crypto';

const userBuf = Buffer.from(userToken);
const secretBuf = Buffer.from(secretToken);
if (timingSafeEqual(userBuf, secretBuf)) {
  // ...
}
```

### 6. 객체 주입 방지

❌ **나쁨**:
```typescript
const value = obj[userInput]; // 프로토타입 오염 가능
```

✅ **좋음**:
```typescript
// hasOwnProperty 체크
if (Object.prototype.hasOwnProperty.call(obj, userInput)) {
  const value = obj[userInput];
}

// 또는 Map 사용
const map = new Map();
const value = map.get(userInput);
```

## 설정 파일

### 주요 파일 구조
```
.
├── .github/
│   └── workflows/
│       └── security-check.yml    # GitHub Actions 워크플로우
├── .husky/
│   ├── pre-commit                # 커밋 전 hook
│   └── pre-push                  # 푸시 전 hook
├── .lintstagedrc.js             # lint-staged 설정
├── eslint.config.mjs            # ESLint 설정 (보안 플러그인 포함)
└── package.json                 # 스크립트 정의
```

## 트러블슈팅

### Q: Warning만 있는데 push가 차단되나요?
A: 네, `--max-warnings=0` 옵션으로 인해 warning도 허용하지 않습니다. 모든 경고를 수정해야 합니다.

### Q: 특정 파일/라인을 제외하고 싶어요
A: ESLint 주석을 사용하세요:
```typescript
// eslint-disable-next-line security/detect-object-injection
const value = obj[key];

// 또는 파일 전체
/* eslint-disable security/detect-object-injection */
```

**주의**: 보안 규칙을 비활성화할 때는 반드시 이유를 주석으로 남기고, 코드 리뷰를 받으세요.

### Q: CI가 실패했는데 로컬에서는 통과해요
A: 
1. `pnpm install`로 의존성을 최신으로 업데이트
2. `.next` 폴더 삭제 후 재빌드
3. Git 캐시 문제일 수 있으니 `git clean -fdx` 후 재시도

## 추가 보안 도구

이 설정과 함께 사용하면 좋은 도구들:

1. **Dependabot** - 의존성 보안 업데이트
2. **Snyk** - 의존성 취약점 스캔
3. **SonarQube** - 종합 코드 품질 분석
4. **npm audit** - npm 패키지 취약점 검사

```bash
# npm 패키지 취약점 검사
pnpm audit

# 자동 수정
pnpm audit fix
```

## 참고 자료

- [eslint-plugin-security GitHub](https://github.com/eslint-community/eslint-plugin-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js 보안 가이드](https://nextjs.org/docs/app/building-your-application/configuring/security)

