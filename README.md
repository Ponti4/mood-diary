# 마음 일기

매일의 감정과 이유를 기록하는 웹서비스입니다. 비회원 기록은 현재 브라우저에 임시 저장되고, Google 로그인 사용자의 기록은 본인 Firebase 계정의 Firestore에 저장됩니다.

## 실행하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

Firebase Console에서 웹 앱을 등록한 뒤 `.env.local`에 앱 설정값을 입력하고, 터미널에 표시되는 로컬 주소를 브라우저에서 엽니다. Firebase 설정값이 없으면 비회원 모드로 계속 사용할 수 있습니다.

## 주요 기능

- 날짜별 감정과 100자 이내의 일기 기록
- 기록 수정 및 삭제
- 최근 7일·30일 기록과 감정별 필터
- JSON 백업 다운로드 및 병합 복원
- Google 로그인과 회원별 클라우드 저장
- 로그인 시 비회원 기록의 안전한 병합(계정 기록 우선)
- 모바일·데스크톱 반응형 화면

## 확인 명령

```bash
npm test
npm run build
npm run test:rules
```

규칙 테스트에는 Java와 Firebase Firestore Emulator가 필요합니다.

## Firebase 배포

`.firebaserc`의 기본 프로젝트는 `mood-diary-ponti4`이며, Hosting은 `dist`를 SPA로 배포합니다.

```bash
npm run deploy
```

비회원 기록은 `maeum-diary.guest.entries.v1` 키만 사용합니다. 이전 버전의 `maeum-diary.entries.v1` 데이터는 읽거나 변경하지 않습니다. 비회원은 브라우저 데이터를 삭제하면 기록도 함께 사라질 수 있으므로 중요한 기록은 설정 메뉴에서 백업하세요.
