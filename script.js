/* =========================================================
   Sophy Oseko — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  // JS is running: enable reveal animations
  document.documentElement.classList.remove("no-js");

  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("main section[id]");

  /* ---------- Header background on scroll ---------- */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  }

  navToggle.addEventListener("click", function () {
    const opening = !navMenu.classList.contains("open");
    setMenu(opening);
    // Move keyboard focus into the menu when it opens
    if (opening) {
      const firstLink = navMenu.querySelector("a");
      if (firstLink) setTimeout(function () { firstLink.focus(); }, 50);
    }
  });

  // Close menu when a link is chosen
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Close when clicking outside the menu
  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      setMenu(false);
    }
  });

  // Reset menu state when resizing to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) setMenu(false);
  });

  /* ---------- Active nav link on scroll ---------- */
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            const isActive = link.getAttribute("href") === "#" + id;
            link.classList.toggle("active", isActive);
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      // Trigger when a section crosses the upper-middle of the viewport
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });

    /* ---------- Reveal on scroll ---------- */
    const revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("visible");
          obs.unobserve(el);
          // After the reveal finishes, drop the helper classes so each
          // component's own hover transitions apply without delay.
          const delay = parseInt(el.style.transitionDelay, 10) || 0;
          setTimeout(function () {
            el.classList.remove("reveal", "visible");
            el.style.transitionDelay = "";
          }, delay + 900);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Stagger siblings slightly for a smoother cascade
    document.querySelectorAll(".reveal").forEach(function (el) {
      const siblings = Array.prototype.filter.call(
        el.parentElement.children,
        function (c) { return c.classList.contains("reveal"); }
      );
      const index = siblings.indexOf(el);
      el.style.transitionDelay = Math.min(index * 90, 450) + "ms";
      revealObserver.observe(el);
    });
  } else {
    // Older browsers: show everything
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Toast helper ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4500);
  }

  /* ---------- CV download ----------
     The link points to assets/Sophy_Oseko_CV.pdf and downloads normally.
     On a hosted site (http/https), we first check the file exists so
     visitors see a friendly message instead of a 404 page if it is missing.
     Opened directly from disk (file://), the browser handles the link as-is. */
  const cvLink = document.querySelector("[data-cv-link]");
  if (cvLink && /^https?:$/.test(window.location.protocol) && "fetch" in window) {
    cvLink.addEventListener("click", function (e) {
      if (cvLink.dataset.verified === "true") return; // already checked: let it download
      e.preventDefault();
      fetch(cvLink.href, { method: "HEAD", cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("CV not found");
          cvLink.dataset.verified = "true";
          cvLink.click();
        })
        .catch(function () {
          showToast("My CV will be available to download soon. In the meantime, please reach out by email.");
        });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
