/* 전체 모드(발표) + 모듈 간 이동
 * - Ctrl+←/→ : 이전/다음 모듈(PPT)로. 일반 보기·모아보기·전체 모드 모두에서 동작
 * - 전체 모드 : h2 단위 슬라이드. ←/→/Space/PgUp/PgDn 슬라이드, Home/End 모듈 처음/끝, Esc 종료
 * - 모듈 페이지 간 이동은 fetch로 <main>만 교체(SPA)하므로 전체화면이 풀리지 않음
 */
(function () {
  var PRINT = /print\.html$/.test(location.pathname) || !!document.getElementById("content");
  var present = false;
  var cur = 0;
  var loading = false;
  var currentFile = file(location.pathname.split("/").pop() || "index.html");
  var bar;

  function file(href) { return (href || "").split("#")[0]; }
  function hashOf(href) { return (href || "").split("#")[1] || ""; }
  function modules() { return (window.SITE ? SITE.PAGES : []).filter(function (p) { return p.href && p.href !== "print.html"; }); }

  /* ---------- 슬라이드 분할 ---------- */
  function wrap(root) {
    if (!root || root.querySelector(":scope > .slide")) return;
    var kids = Array.prototype.slice.call(root.children).filter(function (c) { return !c.classList.contains("pager"); });
    var slide = null;
    kids.forEach(function (c) {
      if (c.tagName === "H2" || !slide) {
        slide = document.createElement("div");
        slide.className = "slide";
        root.insertBefore(slide, c);
      }
      slide.appendChild(c);
    });
  }

  function decks() {
    if (PRINT) return Array.prototype.slice.call(document.querySelectorAll("section.print-module")).filter(function (s) { return s.style.display !== "none"; });
    var m = document.querySelector("main");
    return m ? [m] : [];
  }
  function deckSlides(d) { return Array.prototype.slice.call(d.querySelectorAll(":scope > .slide")); }
  function slides() { var out = []; decks().forEach(function (d) { out = out.concat(deckSlides(d)); }); return out; }
  function deckOf(slide) { return slide.closest("section.print-module") || document.querySelector("main"); }

  function refresh() {
    if (PRINT) decks().forEach(wrap); else wrap(document.querySelector("main"));
    if (present) show(Math.min(cur, slides().length - 1));
  }

  /* ---------- 슬라이드 표시 ---------- */
  function show(i) {
    var s = slides();
    if (!s.length) return;
    i = Math.max(0, Math.min(s.length - 1, i));
    document.querySelectorAll(".slide.active").forEach(function (x) { x.classList.remove("active"); });
    s[i].classList.add("active");
    cur = i;
    var main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
    updateBar();
  }
  function next() {
    var s = slides();
    if (cur + 1 < s.length) { show(cur + 1); return; }
    goDeck(1, false);
  }
  function prev() {
    if (cur > 0) { show(cur - 1); return; }
    goDeck(-1, true);
  }
  function deckHomeEnd(end) {
    var s = slides(); var d = deckOf(s[cur]); var ds = deckSlides(d);
    show(s.indexOf(end ? ds[ds.length - 1] : ds[0]));
  }

  /* ---------- 모듈(PPT) 간 이동 ---------- */
  function nearestDeckByScroll(ds) {
    var y = window.scrollY + 90, best = null;
    ds.forEach(function (d) { if (d.offsetTop <= y) best = d; });
    return best;
  }
  function goDeck(delta, toLast) {
    if (PRINT) {
      var ds = decks(); if (!ds.length) return;
      var s = slides();
      var curDeck = present ? deckOf(s[cur]) : nearestDeckByScroll(ds);
      var i = ds.indexOf(curDeck) + delta;
      if (i < 0 || i >= ds.length) { flash(delta > 0 ? "마지막 모듈입니다" : "첫 모듈입니다"); return; }
      if (present) { var ss = deckSlides(ds[i]); show(s.indexOf(toLast ? ss[ss.length - 1] : ss[0])); }
      else ds[i].scrollIntoView({ behavior: "smooth" });
      return;
    }
    var list = modules();
    var idx = list.findIndex(function (p) { return p.href === currentFile; }) + delta;
    if (idx < 0 || idx >= list.length) { flash(delta > 0 ? "마지막 모듈입니다" : "첫 모듈입니다"); return; }
    loadPage(list[idx].href, { slide: toLast ? "last" : 0 });
  }

  /* ---------- SPA 페이지 교체 (전체화면 유지) ---------- */
  function loadPage(href, opts, push) {
    opts = opts || {}; if (push === undefined) push = true;
    var f = file(href), h = hashOf(href);
    if (loading) return;
    if (f === currentFile) { // 같은 페이지: 해시 이동만
      if (push) history.pushState({ href: href }, "", href);
      jumpToHash(h);
      return;
    }
    loading = true;
    fetch(f).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var newMain = doc.querySelector("main");
      var old = document.querySelector("main");
      if (!newMain || !old) throw new Error("no main");
      old.parentNode.replaceChild(newMain, old);
      document.title = doc.title;
      currentFile = f;
      if (push) history.pushState({ href: href }, "", href);
      if (window.SITE) SITE.render();
      wrap(newMain);
      if (present) {
        var s = slides(), idx = 0;
        if (opts.slide === "last") idx = s.length - 1;
        else if (h) { var t = document.getElementById(h); var sl = t && t.closest(".slide"); if (sl) idx = s.indexOf(sl); }
        show(idx);
      } else {
        jumpToHash(h);
      }
    }).catch(function () { location.href = href; }).finally(function () { loading = false; });
  }
  function jumpToHash(h) {
    if (!h) { window.scrollTo(0, 0); return; }
    var t = document.getElementById(h);
    if (!t) return;
    if (present) { var sl = t.closest(".slide"); if (sl) show(slides().indexOf(sl)); }
    else t.scrollIntoView();
  }

  /* ---------- 전체 모드 진입/종료 ---------- */
  function enter() {
    if (present) return;
    var s = slides(); if (!s.length) refresh(), s = slides();
    var y = window.scrollY + 120, idx = 0;
    s.forEach(function (sl, k) { if (sl.offsetTop <= y) idx = k; });
    present = true;
    document.body.classList.add("present");
    try { sessionStorage.setItem("present", "1"); } catch (e) {}
    requestFs();
    show(idx);
  }
  function exit() {
    if (!present) return;
    present = false;
    document.body.classList.remove("present");
    try { sessionStorage.removeItem("present"); } catch (e) {}
    var s = slides(), el = s[cur];
    document.querySelectorAll(".slide.active").forEach(function (x) { x.classList.remove("active"); });
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    if (el) el.scrollIntoView();
  }
  function requestFs() {
    var el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(function () {});
  }
  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else requestFs();
  }
  document.addEventListener("fullscreenchange", function () {
    if (bar) bar.querySelector(".pb-fs").textContent = document.fullscreenElement ? "창 모드" : "전체화면";
  });

  /* ---------- 하단 바 ---------- */
  function buildBar() {
    bar = document.createElement("div");
    bar.className = "present-bar";
    bar.innerHTML =
      '<button class="pb-deck-prev" title="이전 모듈 (Ctrl+←)">‹‹ 이전 모듈</button>' +
      '<button class="pb-prev" title="이전 슬라이드 (←)">‹</button>' +
      '<span class="pb-title"></span><span class="pb-count"></span>' +
      '<button class="pb-next" title="다음 슬라이드 (→)">›</button>' +
      '<button class="pb-deck-next" title="다음 모듈 (Ctrl+→)">다음 모듈 ››</button>' +
      '<span class="pb-hint">←/→ 슬라이드 · Ctrl+←/→ 모듈 · Esc 종료</span>' +
      '<button class="pb-fs">전체화면</button>' +
      '<button class="pb-exit">종료</button>';
    document.body.appendChild(bar);
    bar.querySelector(".pb-deck-prev").addEventListener("click", function () { goDeck(-1, false); });
    bar.querySelector(".pb-deck-next").addEventListener("click", function () { goDeck(1, false); });
    bar.querySelector(".pb-prev").addEventListener("click", prev);
    bar.querySelector(".pb-next").addEventListener("click", next);
    bar.querySelector(".pb-fs").addEventListener("click", toggleFs);
    bar.querySelector(".pb-exit").addEventListener("click", exit);
  }
  function updateBar() {
    if (!bar) return;
    var s = slides(), el = s[cur]; if (!el) return;
    var d = deckOf(el), ds = deckSlides(d);
    var h1 = d.querySelector("h1"), label = d.querySelector(".module-label");
    var lab = label ? label.textContent.split("·")[0].trim() : "";
    bar.querySelector(".pb-title").textContent = (lab ? lab + " · " : "") + (h1 ? h1.textContent.replace(/\s+/g, " ") : "");
    bar.querySelector(".pb-count").textContent = (ds.indexOf(el) + 1) + " / " + ds.length;
  }
  var flashT;
  function flash(msg) {
    var f = document.getElementById("slide-flash");
    if (!f) { f = document.createElement("div"); f.id = "slide-flash"; document.body.appendChild(f); }
    f.textContent = msg; f.classList.add("on");
    clearTimeout(flashT); flashT = setTimeout(function () { f.classList.remove("on"); }, 1200);
  }

  /* ---------- 키보드 ---------- */
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      if (e.key === "ArrowRight") { e.preventDefault(); goDeck(1, false); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); goDeck(-1, false); return; }
      return;
    }
    if (!present) return;
    switch (e.key) {
      case "ArrowRight": case " ": case "PageDown": case "Enter": e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp": case "Backspace": e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); deckHomeEnd(false); break;
      case "End": e.preventDefault(); deckHomeEnd(true); break;
      case "Escape": exit(); break;
    }
  });

  /* ---------- 링크 가로채기 / 뒤로가기 ---------- */
  document.addEventListener("click", function (e) {
    if (PRINT) return;
    var a = e.target.closest("a[href]"); if (!a) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!/^[a-z0-9-]+\.html(#.*)?$/.test(href)) return;
    if (file(href) === "print.html") return;
    e.preventDefault();
    loadPage(href);
  });
  window.addEventListener("popstate", function () {
    if (PRINT) return;
    loadPage((location.pathname.split("/").pop() || "index.html") + location.hash, {}, false);
  });

  /* ---------- 초기화 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildBar();
    if (!PRINT) wrap(document.querySelector("main"));
    var restore = false;
    try { restore = sessionStorage.getItem("present") === "1"; } catch (e) {}
    if (restore && !PRINT) { present = true; document.body.classList.add("present"); var h = location.hash.slice(1); show(0); if (h) jumpToHash(h); }
  });

  window.SLIDES = { enter: enter, exit: exit, refresh: refresh, next: next, prev: prev, goDeck: goDeck, isPresent: function () { return present; } };
})();
