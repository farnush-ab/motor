/* ==========================================================================
   موتوسنج | MOTOSANJ — اسکریپت اصلی سایت
   بدون هیچ کتابخانه‌ی بیرونی (jQuery و … لازم نیست) تا سایت سبک و سریع بماند.
   بخش‌ها:
   1. منوی موبایل
   2. حالت چسبیده‌ی هدر
   3. فعال‌سازی خودکار لینک صفحه‌ی جاری در منو
   4. نمایش تدریجی بخش‌ها هنگام اسکرول
   5. شمارنده‌ی اعداد آمار
   6. آکاردئون سوالات متداول
   7. فیلتر نمونه کارشناسی‌ها
   8. دکمه‌ی بازگشت به بالا
   9. درج خودکار سال جاری در فوتر
   ========================================================================== */
(function () {
  "use strict";

  var onReady = function (fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };

  onReady(function () {
    /* ---------- 1. منوی موبایل ------------------------------------------ */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      /* با کلیک روی هر لینک، منو بسته شود */
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });

      /* با کلید Escape منو بسته شود */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }

    /* ---------- 2. حالت چسبیده‌ی هدر ------------------------------------- */
    var header = document.querySelector(".site-header");
    var toTop = document.querySelector(".to-top");

    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle("is-stuck", y > 12);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- 3. لینک فعال منو ----------------------------------------- */
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__list a").forEach(function (a) {
      var target = (a.getAttribute("href") || "").split("/").pop().split("#")[0];
      if (target && target === here) a.classList.add("is-active");
    });

    /* ---------- 4. نمایش تدریجی هنگام اسکرول ----------------------------- */
    var revealItems = document.querySelectorAll(".reveal");
    if (revealItems.length) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealItems.forEach(function (el, i) {
          /* تاخیر پلکانی کوتاه برای عناصر یک ردیف */
          el.style.transitionDelay = (i % 6) * 70 + "ms";
          io.observe(el);
        });
      } else {
        revealItems.forEach(function (el) { el.classList.add("is-visible"); });
      }
    }

    /* ---------- 5. شمارنده‌ی آمار ---------------------------------------- */
    var counters = document.querySelectorAll("[data-count]");
    var reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            countObserver.unobserve(el);

            var target = parseInt(el.getAttribute("data-count"), 10) || 0;
            var duration = 1400;
            var start = null;

            var tick = function (ts) {
              if (!start) start = ts;
              var p = Math.min((ts - start) / duration, 1);
              /* منحنی نرم شدن انتهای شمارش */
              var eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(target * eased).toLocaleString("fa-IR");
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(function (el) {
        el.textContent = (parseInt(el.getAttribute("data-count"), 10) || 0).toLocaleString("fa-IR");
      });
    }

    /* ---------- 6. آکاردئون سوالات متداول -------------------------------- */
    document.querySelectorAll(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        var isOpen = item.classList.contains("is-open");

        /* بستن بقیه‌ی سوال‌ها (اگر می‌خواهید چند سوال هم‌زمان باز بماند،
           سه خط زیر را حذف کنید) */
        item.parentElement.querySelectorAll(".faq__item.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
          }
        });

        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      });
    });

    /* ---------- 7. فیلتر نمونه کارشناسی‌ها ------------------------------- */
    var filterBtns = document.querySelectorAll(".filter-btn");
    if (filterBtns.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var filter = btn.getAttribute("data-filter");

          filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");

          document.querySelectorAll("[data-category]").forEach(function (item) {
            var show = filter === "all" || item.getAttribute("data-category") === filter;
            item.style.display = show ? "" : "none";
          });
        });
      });
    }

    /* ---------- 8. بازگشت به بالا ---------------------------------------- */
    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* ---------- 9. سال جاری در فوتر -------------------------------------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Intl.DateTimeFormat("fa-IR", { year: "numeric" })
        .format(new Date())
        .replace(/[^۰-۹0-9]/g, "");
    });
  });
})();
