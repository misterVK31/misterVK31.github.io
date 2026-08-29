/* Mobile navigation toggle. ~1 KB, no dependencies.
   The nav is fully usable without JS on desktop; on small screens this
   script is what opens the panel, so it is loaded with `defer` in <head>. */
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  var MOBILE = "(max-width: 820px)";

  function isMobile() {
    return window.matchMedia(MOBILE).matches;
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.hidden = !open;
  }

  // Collapse by default on small screens; always visible on desktop.
  function sync() {
    if (isMobile()) {
      if (toggle.getAttribute("aria-expanded") !== "true") nav.hidden = true;
    } else {
      nav.hidden = false;
      setOpenState(false);
    }
  }

  function setOpenState(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close on Escape and return focus to the button.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMobile() && !nav.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when a link is chosen.
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a") && isMobile()) setOpen(false);
  });

  // Close when focus or a tap leaves the open panel.
  document.addEventListener("click", function (e) {
    if (!isMobile() || nav.hidden) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  window.matchMedia(MOBILE).addEventListener
    ? window.matchMedia(MOBILE).addEventListener("change", sync)
    : window.matchMedia(MOBILE).addListener(sync);

  sync();
})();
