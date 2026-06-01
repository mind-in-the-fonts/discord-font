// 노션에 적용할 폰트 목록 정의 (popup.js / content.js 공유)
// stack: 실제 CSS font-family 값 / css: 폰트를 불러올 스타일시트 URL (없으면 시스템 폰트)
const NOTION_FONTS = {
  body: [
    { id: "default", name: "시스템 기본 (적용 안 함)", stack: null, css: null },
    {
      id: "pretendard",
      name: "Pretendard (한글)",
      stack: "'Pretendard'",
      css: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css",
    },
    {
      id: "noto-sans-kr",
      name: "Noto Sans KR (한글)",
      stack: "'Noto Sans KR'",
      css: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap",
    },
    {
      id: "ibm-plex-sans-kr",
      name: "IBM Plex Sans KR (한글)",
      stack: "'IBM Plex Sans KR'",
      css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap",
    },
    {
      id: "nanum-gothic",
      name: "나눔고딕 (한글)",
      stack: "'Nanum Gothic'",
      css: "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",
    },
    {
      id: "gowun-dodum",
      name: "고운돋움 (한글)",
      stack: "'Gowun Dodum'",
      css: "https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap",
    },
    {
      id: "nanum-myeongjo",
      name: "나눔명조 (한글 명조)",
      stack: "'Nanum Myeongjo'",
      css: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap",
    },
    {
      id: "gowun-batang",
      name: "고운바탕 (한글 명조)",
      stack: "'Gowun Batang'",
      css: "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap",
    },
    {
      id: "inter",
      name: "Inter (영문)",
      stack: "'Inter'",
      css: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap",
    },
    {
      id: "ibm-plex-sans",
      name: "IBM Plex Sans (영문)",
      stack: "'IBM Plex Sans'",
      css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&display=swap",
    },
    {
      id: "lora",
      name: "Lora (영문 세리프)",
      stack: "'Lora'",
      css: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&display=swap",
    },
    {
      id: "merriweather",
      name: "Merriweather (영문 세리프)",
      stack: "'Merriweather'",
      css: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
    },
  ],
  code: [
    { id: "default", name: "시스템 기본 (적용 안 함)", stack: null, css: null },
    {
      id: "d2coding",
      name: "D2Coding (한글 코딩)",
      stack: "'D2Coding'",
      css: "https://cdn.jsdelivr.net/gh/wan2land/d2coding/d2coding-ligature.css",
    },
    {
      id: "jetbrains-mono",
      name: "JetBrains Mono",
      stack: "'JetBrains Mono'",
      css: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",
    },
    {
      id: "fira-code",
      name: "Fira Code",
      stack: "'Fira Code'",
      css: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap",
    },
    {
      id: "ibm-plex-mono",
      name: "IBM Plex Mono",
      stack: "'IBM Plex Mono'",
      css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap",
    },
    {
      id: "source-code-pro",
      name: "Source Code Pro",
      stack: "'Source Code Pro'",
      css: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;700&display=swap",
    },
  ],
};

// 기본 설정값
const DEFAULT_SETTINGS = {
  enabled: true,
  bodyFont: "pretendard",
  codeFont: "default",
  applyToCode: false,
};

// 저장된 값(value)을 실제 폰트 정보로 해석
// value 형식: "default" | 웹폰트 id (예: "pretendard") | "local:폰트이름"
function resolveFont(kind, value) {
  if (!value || value === "default") return { stack: null, css: null };
  if (value.indexOf("local:") === 0) {
    const family = value.slice(6);
    return { stack: "'" + family + "'", css: null };
  }
  const list = (NOTION_FONTS[kind] || []);
  const f = list.find((x) => x.id === value);
  return f ? { stack: f.stack, css: f.css } : { stack: null, css: null };
}

// content.js는 일반 스크립트라 export가 안 되므로 전역에 노출
if (typeof window !== "undefined") {
  window.NOTION_FONTS = NOTION_FONTS;
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  window.resolveFont = resolveFont;
}
