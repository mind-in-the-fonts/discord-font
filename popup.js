// popup.js — 팝업 UI 동작 및 설정 저장
(function () {
  "use strict";

  const FONTS = window.NOTION_FONTS;
  const DEFAULTS = window.DEFAULT_SETTINGS;

  const el = {
    enabled: document.getElementById("enabled"),
    bodyFont: document.getElementById("bodyFont"),
    codeFont: document.getElementById("codeFont"),
    applyToCode: document.getElementById("applyToCode"),
    main: document.getElementById("main"),
    previewBody: document.getElementById("previewBody"),
    previewCode: document.getElementById("previewCode"),
    statusDot: document.getElementById("statusDot"),
    statusText: document.getElementById("statusText"),
  };

  // 드롭다운 구성: 기본 → 웹 폰트 그룹 → 내 컴퓨터 폰트 그룹
  function populate(select, kind, localFonts) {
    select.innerHTML = "";

    const def = document.createElement("option");
    def.value = "default";
    def.textContent = "시스템 기본 (적용 안 함)";
    select.appendChild(def);

    const web = document.createElement("optgroup");
    web.label = "웹 폰트 (자동 다운로드)";
    FONTS[kind].forEach((f) => {
      if (f.id === "default") return;
      const o = document.createElement("option");
      o.value = f.id;
      o.textContent = f.name;
      web.appendChild(o);
    });
    select.appendChild(web);

    if (localFonts && localFonts.length) {
      const loc = document.createElement("optgroup");
      loc.label = "내 컴퓨터 폰트 (" + localFonts.length + "개)";
      localFonts.forEach((name) => {
        const o = document.createElement("option");
        o.value = "local:" + name;
        o.textContent = name;
        loc.appendChild(o);
      });
      select.appendChild(loc);
    }
  }

  // 미리보기용 폰트 CSS를 팝업 문서에 로드 (웹폰트만, 중복 방지)
  const loaded = new Set();
  function loadPreviewFont(url) {
    if (!url || loaded.has(url)) return;
    loaded.add(url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }

  function updatePreview() {
    const body = window.resolveFont("body", el.bodyFont.value);
    const code = window.resolveFont("code", el.codeFont.value);

    loadPreviewFont(body.css);
    el.previewBody.style.fontFamily = body.stack
      ? body.stack + ", -apple-system, sans-serif"
      : "-apple-system, BlinkMacSystemFont, sans-serif";

    if (el.applyToCode.checked && code.stack) {
      loadPreviewFont(code.css);
      el.previewCode.style.fontFamily = code.stack + ", monospace";
    } else {
      el.previewCode.style.fontFamily =
        '"SFMono-Regular", Consolas, Menlo, monospace';
    }
  }

  function updateEnabledUI() {
    const on = el.enabled.checked;
    el.main.classList.toggle("disabled", !on);
    el.statusDot.classList.toggle("off", !on);
    el.statusText.textContent = on
      ? "Discord 탭에 자동으로 적용됩니다"
      : "꺼짐 — Discord 기본 폰트 사용";
  }

  function save() {
    chrome.storage.sync.set({
      enabled: el.enabled.checked,
      bodyFont: el.bodyFont.value,
      codeFont: el.codeFont.value,
      applyToCode: el.applyToCode.checked,
    });
  }

  function onChange() {
    updatePreview();
    updateEnabledUI();
    save();
  }

  // 저장된 설정으로 UI 초기화 (드롭다운 채운 뒤 호출)
  function restoreSettings() {
    chrome.storage.sync.get(DEFAULTS, (s) => {
      el.enabled.checked = !!s.enabled;
      el.bodyFont.value = s.bodyFont;
      if (!el.bodyFont.value) el.bodyFont.value = "default";
      el.codeFont.value = s.codeFont;
      if (!el.codeFont.value) el.codeFont.value = "default";
      el.applyToCode.checked = !!s.applyToCode;
      updatePreview();
      updateEnabledUI();

      [el.enabled, el.bodyFont, el.codeFont, el.applyToCode].forEach((node) =>
        node.addEventListener("change", onChange)
      );
    });
  }

  // 시스템(Mac) 폰트 목록 가져오기 → 드롭다운 채우기
  function init() {
    const useFontList =
      chrome.fontSettings && chrome.fontSettings.getFontList;

    if (useFontList) {
      chrome.fontSettings.getFontList((fonts) => {
        const names = Array.from(
          new Set(
            (fonts || [])
              .map((f) => (f.displayName || f.fontId || "").trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b, "ko"));

        populate(el.bodyFont, "body", names);
        populate(el.codeFont, "code", names);
        restoreSettings();
      });
    } else {
      populate(el.bodyFont, "body", null);
      populate(el.codeFont, "code", null);
      restoreSettings();
    }
  }

  init();
})();
