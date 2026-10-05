/* 교재 공통 스크립트: 사이드바/목차/이전·다음/프롬프트 복사 */
(function () {
  var PAGES = [
    { group: "시작하기" },
    { href: "index.html", num: "", title: "과정 소개", time: "" },
    { href: "pre-workbook.html", num: "0", title: "사전 워크북", time: "사전" },
    { group: "모듈" },
    { href: "m1-ot.html", num: "1", title: "OT & 생성형 AI 업무 활용 개요", time: "0.5H" },
    { href: "m2-chatgpt.html", num: "2", title: "ChatGPT 업무 활용", time: "1.5H" },
    { href: "m3-claude.html", num: "3", title: "Claude 업무 활용", time: "1.5H" },
    { href: "m4-gemini.html", num: "4", title: "Gemini 업무 활용", time: "1.5H" },
    { href: "m5-apply.html", num: "5", title: "내 업무 적용 & 정리", time: "1H" },
    { group: "출력" },
    { href: "print.html", num: "", title: "전체 보기 / PDF 출력", time: "" }
  ];

  function here() { return location.pathname.split("/").pop() || "index.html"; }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  function buildSidebar() {
    var side = document.getElementById("sidebar");
    if (!side) return;
    var wasOpen = side.classList.contains("open");
    side.innerHTML = "";

    var toggle = el("button", { class: "mobile-toggle", text: "목차" });
    toggle.addEventListener("click", function () { side.classList.toggle("open"); });
    side.appendChild(toggle);

    side.appendChild(el("a", { class: "brand", href: "index.html", html: "생성형 AI 업무 활용<small>ChatGPT · Claude · Gemini 실습 교재</small>" }));

    var nav = el("nav");
    PAGES.forEach(function (p) {
      if (p.group) { nav.appendChild(el("div", { class: "group", text: p.group })); return; }
      var a = el("a", { href: p.href }, [
        p.num ? el("span", { class: "num", text: p.num }) : null,
        el("span", { text: p.title }),
        p.time ? el("span", { class: "time", text: p.time }) : null
      ]);
      if (p.href === here()) a.classList.add("active");
      nav.appendChild(a);
    });
    side.appendChild(nav);

    var h2s = document.querySelectorAll("main h2[id]");
    if (h2s.length) {
      var toc = el("div", { class: "toc" });
      h2s.forEach(function (h) {
        toc.appendChild(el("a", { href: "#" + h.id, text: h.textContent.replace(/^\s*[\d.]+\s*/, "") }));
      });
      nav.appendChild(toc);
    }

    var foot = el("div", { class: "side-foot" });
    var presentBtn = el("button", { class: "present-btn", type: "button", html: "▶ 전체 모드 (발표)" });
    presentBtn.addEventListener("click", function () { if (window.SLIDES) window.SLIDES.enter(); });
    foot.appendChild(presentBtn);
    foot.appendChild(el("div", { class: "keys", html: "<kbd>Ctrl</kbd>+<kbd>←</kbd>/<kbd>→</kbd> 모듈 이동" }));
    foot.appendChild(el("div", { html: "초안 v0.1 · 2026-10<br><a href=\"print.html\">PDF로 출력하기</a>" }));
    side.appendChild(foot);
    if (wasOpen) side.classList.add("open");
  }

  function buildPager() {
    var main = document.querySelector("main");
    if (!main || document.body.classList.contains("no-pager")) return;
    var old = main.querySelector(":scope > .pager");
    if (old) old.remove();
    var list = PAGES.filter(function (p) { return p.href; });
    var i = list.findIndex(function (p) { return p.href === here(); });
    if (i < 0) return;
    var prev = list[i - 1], next = list[i + 1];
    var pager = el("div", { class: "pager" });
    if (prev) pager.appendChild(el("a", { class: "prev", href: prev.href, html: "<small>← 이전</small>" + (prev.num ? "모듈 " + prev.num + ". " : "") + prev.title }));
    else pager.appendChild(el("span"));
    if (next) pager.appendChild(el("a", { class: "next", href: next.href, html: "<small>다음 →</small>" + (next.num ? "모듈 " + next.num + ". " : "") + next.title }));
    main.appendChild(pager);
  }

  function addCopyButtons(root) {
    (root || document).querySelectorAll(".prompt").forEach(function (p) {
      if (p.querySelector(".copy")) return;
      var b = el("button", { class: "copy", type: "button", text: "복사" });
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var text = p.innerText.replace(/^복사\s*/, "").trim();
        navigator.clipboard.writeText(text).then(function () {
          b.textContent = "복사됨"; setTimeout(function () { b.textContent = "복사"; }, 1500);
        });
      });
      p.appendChild(b);
    });
  }

  function render() {
    buildSidebar();
    buildPager();
    addCopyButtons();
  }

  window.SITE = { PAGES: PAGES, addCopyButtons: addCopyButtons, render: render, here: here };

  document.addEventListener("DOMContentLoaded", render);
})();
