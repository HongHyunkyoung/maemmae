# 쓴소리 자판기 (MAEMMAE)

**"누구한테도 못 한 고민, 여기다 던져 보세요."**

쓴소리 자판기는 사용자의 고민을 듣고, AI(Gemini)가 심리 상태를 분석하여 직설적인 조언("쓴소리")과 따뜻한 격려가 담긴 구체적인 행동 지침("처방전")을 제공하는 웹 서비스입니다. 추가로 고민 해결에 도움이 되는 YouTube 영상도 함께 추천해 드립니다.

## ✨ 주요 기능

*   **심리 분석**: 사용자의 고민 텍스트를 분석하여 현재 심리 상태를 요약합니다.
*   **쓴소리 피드백**: 정신이 번쩍 들게 하는 직설적이고 현실적인 조언을 제공합니다.
*   **AI 처방전**: 당장 실행할 수 있는 구체적인 행동 지침을 따뜻하고 격려하는 어조로 제안합니다.
*   **YouTube 영상 추천**: 고민 키워드 및 카테고리에 기반한 맞춤형 영상을 추천합니다.
*   **반응형 디자인**: PC, 태블릿, 모바일 등 모든 디바이스에서 최적화된 UI를 제공합니다.
*   **미리보기 시스템**: 개발 모드에서 다양한 디바이스 환경을 시뮬레이션할 수 있는 `/preview` 페이지를 제공합니다.

## 🛠 기술 스택

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI**: Google Gemini API (gemini-2.5-flash)
*   **Data**: YouTube Data API v3

## 🚀 설치 및 실행 방법

### 1. 저장소 클론 (Clone)

```bash
git clone https://github.com/your-username/maemmae.git
cd maemmae
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 키를 입력하세요.

```env
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

> **참고**: YouTube API 키가 없어도 더미 데이터(Mock Data)를 통해 추천 영상 기능을 체험할 수 있습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인합니다.

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── api/analyze/    # AI 분석 및 YouTube 검색 API 엔드포인트
│   ├── preview/        # 반응형 미리보기 및 테스트 페이지
│   ├── globals.css     # 전역 스타일 (Tailwind)
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지 (고민 입력 및 결과 화면)
```

## 📝 라이선스

This project is licensed under the MIT License.
