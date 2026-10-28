/* Prevent aggressive browser scroll restoration jerk on refresh */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* ---- Horizontal text (about page ma .Horizontal hoy tyare j chale) ---- */
(function () {
  if (!window.gsap || !window.ScrollTrigger) { console.warn("GSAP / ScrollTrigger load nathi thayu – ../js/ path check karo."); return; }
  var plugins = [window.ScrollTrigger];
  if (window.SplitText) plugins.push(window.SplitText);
  gsap.registerPlugin.apply(gsap, plugins);

  var wrapper = document.querySelector(".Horizontal");
  var text = document.querySelector(".Horizontal__text");
  if (!wrapper || !text || !window.SplitText) return;

  var split = SplitText.create(text, { type: "chars, words" });
  var scrollTween = gsap.to(text, { xPercent: -100, ease: "none",
    scrollTrigger: { trigger: wrapper, pin: true, end: "+=5000", scrub: true } });
  split.chars.forEach(function (char) {
    gsap.from(char, { yPercent: function () { return gsap.utils.random(-200, 200); }, rotation: function () { return gsap.utils.random(-20, 20); },
      ease: "back.out(1.2)",
      scrollTrigger: { trigger: char, containerAnimation: scrollTween, start: "left 100%", end: "left 30%", scrub: 1 } });
  });
})();

/* =====================================================
   SECTIONS.JS – Trust · Events · Contact
   Requires global: gsap + ScrollTrigger
   ===================================================== */
(function () {
  if (!window.gsap || !window.ScrollTrigger) { console.warn("GSAP / ScrollTrigger load nathi thayu – path check karo."); return; }
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });

  var mm = gsap.matchMedia();
  var canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- helpers ---------- */
  function splitWords(el) {
    var words = (el.textContent || "").trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.innerHTML = words.map(function (w) {
      return '<span class="ev-word" aria-hidden="true"><span class="ev-word-inner">' + w + "</span></span>";
    }).join(" ");
    return el.querySelectorAll(".ev-word-inner");
  }

  function parseNum(v) {
    var m = String(v).match(/^([^\d]*)([\d.]+)(.*)$/);
    if (!m) return null;
    return { pre: m[1], num: parseFloat(m[2]), dec: (m[2].split(".")[1] || "").length, post: m[3] };
  }

  function pointerFx(card, tilt) {
    if (!canHover) return;
    var setX = gsap.quickSetter(card, "--mx", "px");
    var setY = gsap.quickSetter(card, "--my", "px");
    var rx = tilt ? gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" }) : null;
    var ry = tilt ? gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" }) : null;
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      setX(x); setY(y);
      if (tilt) { ry((x / r.width - 0.5) * 8); rx((0.5 - y / r.height) * 8); }
    });
    if (tilt) card.addEventListener("pointerleave", function () { rx(0); ry(0); });
  }

  /* =====================================================
     1) TRUST
     ===================================================== */
  var trust = document.querySelector("[data-trust]");
  if (trust) {
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var header = trust.querySelector("[data-tr-header]");
      if (header) {
        gsap.from(header.children, {
          autoAlpha: 0,
          y: 28,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          immediateRender: false,
          scrollTrigger: { trigger: header, start: "top 85%", once: true }
        });
      }

      // stats: rise, count up, light sweep
      var stats = gsap.utils.toArray("[data-tr-stat]", trust);
      if (stats.length) {
        var tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-tr-stats]", start: "top 82%", once: true }
        });
        tl.from(stats, {
          autoAlpha: 0,
          y: 40,
          scale: 0.96,
          duration: 0.8,
          ease: "power3.out",
          stagger: { each: 0.09, from: "start" },
          immediateRender: false
        });
        stats.forEach(function (card, i) {
          var numEl = card.querySelector("[data-tr-count]");
          var p = numEl ? parseNum(numEl.dataset.trCount || "") : null;
          if (numEl && p) {
            var o = { v: 0 };
            tl.to(o, {
              v: p.num,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: function () { numEl.textContent = p.pre + o.v.toFixed(p.dec) + p.post; },
              onComplete: function () { numEl.textContent = p.pre + p.num.toFixed(p.dec) + p.post; }
            }, 0.15 + i * 0.09);
          }
          tl.fromTo(card, { "--sweep": "-120%", "--sweep-o": 1 }, { "--sweep": "120%", duration: 1.1, ease: "power2.inOut" }, 0.5 + i * 0.09)
            .to(card, { "--sweep-o": 0, duration: 0.01 }, ">");
        });
      }

      // badges: stamp in + icon outline draws itself
      var badges = gsap.utils.toArray("[data-tr-badge]", trust);
      if (badges.length) {
        var tlb = gsap.timeline({
          scrollTrigger: { trigger: "[data-tr-badges]", start: "top 88%", once: true }
        });
        tlb.from(badges, {
          autoAlpha: 0,
          x: -24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          immediateRender: false
        });
        badges.forEach(function (b, i) {
          b.querySelectorAll("svg path").forEach(function (path) {
            var len = path.getTotalLength ? path.getTotalLength() : 80;
            tlb.fromTo(path,
              { strokeDasharray: len, strokeDashoffset: len },
              { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" },
              0.2 + i * 0.08
            );
          });
        });
      }

      // reviews: score count + star pop
      var story = trust.querySelector("[data-tr-story]");
      var reviews = gsap.utils.toArray("[data-tr-review]", trust);
      if (reviews.length) {
        var tlr = gsap.timeline({ scrollTrigger: { trigger: "[data-tr-reviews]", start: "top 92%", once: true } });
        if (story) tlr.from(story, { autoAlpha: 0, y: 14, duration: 0.6, ease: "power2.out", immediateRender: false });
        tlr.from(reviews, { autoAlpha: 0, y: 22, duration: 0.6, ease: "power3.out", stagger: 0.1, immediateRender: false }, story ? "-=0.2" : 0);
        reviews.forEach(function (r, i) {
          var sc = r.querySelector("[data-tr-rating]");
          var star = r.querySelector("[data-tr-star]");
          if (sc) {
            var target = parseFloat(sc.dataset.trRating || "0"), o = { v: 0 };
            tlr.to(o, { v: target, duration: 1.2, ease: "power2.out", onUpdate: function () { sc.textContent = o.v.toFixed(1); } }, 0.3 + i * 0.1);
          }
          if (star) tlr.from(star, { scale: 0, rotate: -90, duration: 0.7, ease: "back.out(3)" }, 0.5 + i * 0.1);
        });
      }
    });
  }

  /* =====================================================
     2) EVENTS
     ===================================================== */
  var events = document.querySelector("[data-events]");
  if (events) {
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var head = events.querySelector("[data-ev-split]");
      var fades = events.querySelectorAll("[data-ev-fade]");
      if (head) {
        var inner = splitWords(head);
        gsap.timeline({ scrollTrigger: { trigger: head, start: "top 85%", once: true } })
          .from(fades[0], { autoAlpha: 0, y: 12, duration: 0.5, ease: "power2.out", immediateRender: false })
          .from(inner, { yPercent: 110, rotate: 4, duration: 0.9, ease: "expo.out", stagger: 0.07, immediateRender: false }, "-=0.25")
          .from(fades[1], { autoAlpha: 0, y: 16, duration: 0.7, ease: "power2.out", immediateRender: false }, "-=0.5");
      }

      events.querySelectorAll("[data-ev-card]").forEach(function (card) {
        var img = card.querySelector("[data-ev-img]");
        var lines = card.querySelectorAll("[data-ev-line]");
        
        var cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          }
        });

        cardTl.fromTo(card,
          { clipPath: "inset(100% 0% 0% 0% round 8px)" },
          { clipPath: "inset(0% 0% 0% 0% round 8px)", duration: 1.1, ease: "expo.inOut", immediateRender: false }
        )
        .fromTo(img,
          { scale: 1.25 },
          { scale: 1, duration: 1.4, ease: "expo.out", immediateRender: false },
          0
        )
        .from(lines, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          immediateRender: false
        }, 0.55);

        if (img) {
          gsap.fromTo(img,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.6 } }
          );
        }
        pointerFx(card, false);
      });
    });
  }

  /* =====================================================
     3) CONTACT / DIRECT LINES
     ===================================================== */
  var contact = document.querySelector("[data-contact]");
  if (contact) {
    /* --- live availability: Mon–Fri 9:00–18:00 in IST or US Eastern --- */
    var status = contact.querySelector("[data-ct-status]");
    var statusText = contact.querySelector("[data-ct-status-text]");
    function isOpen(tz) {
      try {
        var parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date());
        var wd = parts.find(function (p) { return p.type === "weekday"; }).value;
        var hr = parseInt(parts.find(function (p) { return p.type === "hour"; }).value, 10) % 24;
        return ["Sat", "Sun"].indexOf(wd) === -1 && hr >= 9 && hr < 18;
      } catch (e) { return false; }
    }
    if (status && statusText) {
      var india = isOpen("Asia/Kolkata"), us = isOpen("America/New_York");
      if (india || us) {
        status.classList.add("is-online");
        statusText.textContent = india && us ? "Teams online now · India & US" : india ? "Team online now · India" : "Team online now · United States";
      } else {
        statusText.textContent = "Offline right now · we reply next business day";
      }
    }

    /* --- copy to clipboard --- */
    contact.querySelectorAll("[data-ct-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var done = function () {
          btn.classList.add("is-copied"); btn.textContent = "Copied ✓";
          setTimeout(function () { btn.classList.remove("is-copied"); btn.textContent = "Copy"; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(btn.dataset.ctCopy).then(done);
        else done();
      });
    });

    /* --- pointer glow + 3D tilt (desktop) --- */
    contact.querySelectorAll("[data-ct-card]").forEach(function (c) { pointerFx(c, true); });

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      // floating background orbs
      contact.querySelectorAll("[data-ct-orb]").forEach(function (orb, i) {
        gsap.to(orb, { x: i ? -50 : 60, y: i ? -40 : 50, duration: 7 + i * 2, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to(orb, { yPercent: i ? -25 : 25, ease: "none", scrollTrigger: { trigger: contact, start: "top bottom", end: "bottom top", scrub: 1 } });
      });

      // header
      var head = contact.querySelector("[data-ct-split]");
      var fades = contact.querySelectorAll("[data-ct-fade]");
      if (head) {
        var words = splitWords(head);
        gsap.timeline({ scrollTrigger: { trigger: head, start: "top 85%", once: true } })
          .from(fades[0], { autoAlpha: 0, y: 12, duration: 0.5, ease: "power2.out", immediateRender: false })
          .from(words, { yPercent: 110, rotate: 4, duration: 0.9, ease: "expo.out", stagger: 0.06, immediateRender: false }, "-=0.25")
          .from(fades[1], { autoAlpha: 0, y: 16, duration: 0.7, ease: "power2.out", immediateRender: false }, "-=0.55")
          .from(fades[2], { autoAlpha: 0, scale: 0.8, y: 10, duration: 0.7, ease: "back.out(2)", immediateRender: false }, "-=0.4");
      }

      // cards: rise + unfold, icon draws, mail text scrambles in
      var cards = gsap.utils.toArray("[data-ct-card]", contact);
      var chars = "abcdefghijklmnopqrstuvwxyz@._";
      var tl = gsap.timeline({ scrollTrigger: { trigger: "[data-ct-grid]", start: "top 85%", once: true } });
      tl.from(cards, {
        autoAlpha: 0,
        y: 70,
        rotationX: -18,
        transformOrigin: "50% 100%",
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        immediateRender: false
      });
      cards.forEach(function (card, i) {
        var lines = card.querySelectorAll("[data-ct-line]");
        tl.from(lines, { autoAlpha: 0, y: 16, duration: 0.6, ease: "power3.out", stagger: 0.08, immediateRender: false }, 0.3 + i * 0.12);

        card.querySelectorAll("[data-ct-icon] path, [data-ct-icon] circle").forEach(function (shape) {
          var len = shape.getTotalLength ? shape.getTotalLength() : 60;
          gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(shape, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.25 + i * 0.12);
        });

        var t = card.querySelector("[data-ct-mail-text]");
        if (t) {
          var final = t.textContent, o = { p: 0 };
          tl.to(o, { p: 1, duration: 1, ease: "none", onUpdate: function () {
            var n = Math.floor(o.p * final.length), s = final.slice(0, n);
            for (var k = n; k < final.length; k++) s += chars[Math.floor(Math.random() * chars.length)];
            t.textContent = s;
          }, onComplete: function () { t.textContent = final; } }, 0.5 + i * 0.12);
        }
      });
    });
  }

  // Refresh ScrollTrigger smoothly once all fonts and images are ready
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }
})();
