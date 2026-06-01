// content.js — 디스코드 웹에 폰트를 적용하는 스크립트
(function () {
  "use strict";

  const STYLE_ID = "dfc-font-override";
  const LINK_ATTR = "data-dfc-font";

  const DEFAULTS = window.DEFAULT_SETTINGS;

  function mountPoint() {
    return document.head || document.documentElement;
  }

  function ensureFontLink(url) {
    if (!url) return;
    if (document.querySelector(`link[${LINK_ATTR}][href="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute(LINK_ATTR, "1");
    mountPoint().appendChild(link);
  }

  function cleanupLinks(keepUrls) {
    document.querySelectorAll(`link[${LINK_ATTR}]`).forEach((el) => {
      if (!keepUrls.includes(el.getAttribute("href"))) el.remove();
    });
  }

  function buildCss(settings) {
    const bodyFont = window.resolveFont("body", settings.bodyFont);
    const codeFont = window.resolveFont("code", settings.codeFont);

    const bodyStack = bodyFont.stack
      ? `${bodyFont.stack}, "gg sans", "Noto Sans", Helvetica, Arial, sans-serif`
      : null;

    let css = "";

    if (bodyStack) {
      // 1) 디스코드 폰트 CSS 변수 덮어쓰기
      css += `
        :root, .theme-dark, .theme-light, .visual-refresh {
          --font-primary: ${bodyStack} !important;
          --font-display: ${bodyStack} !important;
          --font-headline: ${bodyStack} !important;
        }
      `;
      // 2) 변수를 안 쓰는 요소까지 강제 적용 (아이콘/svg 제외)
      css += `
        #app-mount, #app-mount *:not([class*="icon"]):not([class*="Icon"]):not(svg):not(path) {
          font-family: ${bodyStack} !important;
        }
      `;
    }

    // 코드/모노스페이스 영역
    const codeSelectors = `
      code, pre, kbd,
      [class*="code"], [class*="Code"],
      .hljs, .hljs *,
      [class*="hljs"]`;

    if (settings.applyToCode && codeFont.stack) {
      const codeStack = `${codeFont.stack}, Consolas, "Andale Mono WT", "Andale Mono", monospace`;
      css += `
        :root { --font-code: ${codeStack} !important; }
        ${codeSelectors} { font-family: ${codeStack} !important; }
      `;
    } else if (bodyStack) {
      // 본문 폰트가 코드에 침범하지 않도록 monospace 유지
      const mono = `Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", monospace`;
      css += `
        :root { --font-code: ${mono} !important; }
        ${codeSelectors} { font-family: ${mono} !important; }
      `;
    }

    return { css, bodyFont, codeFont };
  }

  function apply(settings) {
    settings = Object.assign({}, DEFAULTS, settings || {});

    if (!settings.enabled) {
      const s = document.getElementById(STYLE_ID);
      if (s) s.remove();
      cleanupLinks([]);
      return;
    }

    const { css, bodyFont, codeFont } = buildCss(settings);

    const keep = [];
    if (bodyFont && bodyFont.css) {
      ensureFontLink(bodyFont.css);
      keep.push(bodyFont.css);
    }
    if (settings.applyToCode && codeFont && codeFont.css) {
      ensureFontLink(codeFont.css);
      keep.push(codeFont.css);
    }
    cleanupLinks(keep);

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      mountPoint().appendChild(style);
    }
    style.textContent = css;
  }

  function loadAndApply() {
    chrome.storage.sync.get(DEFAULTS, (settings) => apply(settings));
  }

  loadAndApply();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAndApply, { once: true });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") loadAndApply();
  });

  // 디스코드 SPA가 head/style을 교체할 수 있어 가볍게 감시
  let lastCheck = 0;
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastCheck < 1000) return;
    lastCheck = now;
    if (!document.getElementById(STYLE_ID)) loadAndApply();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
