/* Brew & Bolt — site interactions */
(function () {
  "use strict";

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-menu");
  const setNav = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- Active nav link ---------- */
  const navAnchors = [...document.querySelectorAll('.nav-links a:not(.btn)')];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObs.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => obs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Menu tabs (accessible) ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const activate = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, true); }
    });
  });

  /* ---------- Opening hours ---------- */
  // [open, close] in minutes from midnight; index 0 = Sunday
  const HOURS = [
    [8 * 60, 16 * 60],        // Sun
    [6.5 * 60, 18 * 60],      // Mon
    [6.5 * 60, 18 * 60],      // Tue
    [6.5 * 60, 18 * 60],      // Wed
    [6.5 * 60, 18 * 60],      // Thu
    [6.5 * 60, 18 * 60],      // Fri
    [7.5 * 60, 18 * 60],      // Sat
  ];
  const fmt = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    const ap = h >= 12 ? "pm" : "am";
    const h12 = ((h + 11) % 12) + 1;
    return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ap;
  };
  const status = document.getElementById("open-status");
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [o, c] = HOURS[now.getDay()];
  if (mins >= o && mins < c) {
    status.textContent = "Open now · until " + fmt(c);
    status.className = "open-status open";
  } else {
    const opensToday = mins < o;
    const nextOpen = opensToday ? o : HOURS[(now.getDay() + 1) % 7][0];
    status.textContent = "Closed · opens " + (opensToday ? "today" : "tomorrow") + " at " + fmt(nextOpen);
    status.className = "open-status closed";
  }

  /* ---------- Reservation form ---------- */
  const form = document.getElementById("reserve-form");
  const dateIn = document.getElementById("r-date");
  const timeSel = document.getElementById("r-time");
  const success = document.getElementById("reserve-success");
  const successText = document.getElementById("success-text");

  const toISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const today = new Date();
  const maxDate = new Date(); maxDate.setDate(today.getDate() + 60);
  dateIn.min = toISO(today);
  dateIn.max = toISO(maxDate);

  // Fill time slots (every 30 min, last booking 1h before close)
  const fillTimes = () => {
    const prev = timeSel.value;
    if (!dateIn.value) { timeSel.innerHTML = '<option value="">Pick a date first</option>'; return; }
    timeSel.innerHTML = '<option value="">Select a time</option>';
    const [y, mo, d] = dateIn.value.split("-").map(Number);
    const day = new Date(y, mo - 1, d);
    const [open, close] = HOURS[day.getDay()];
    const isToday = dateIn.value === toISO(new Date());
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    let start = Math.ceil(open / 30) * 30;
    for (let t = start; t <= close - 60; t += 30) {
      if (isToday && t <= nowMins + 30) continue;
      const opt = document.createElement("option");
      opt.value = fmt(t);
      opt.textContent = fmt(t);
      timeSel.appendChild(opt);
    }
    if ([...timeSel.options].some((op) => op.value === prev)) timeSel.value = prev;
    if (timeSel.options.length === 1) {
      timeSel.innerHTML = '<option value="">No slots left</option>';
    }
  };
  dateIn.addEventListener("change", fillTimes);

  const setError = (input, msg) => {
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    const err = field.querySelector(".error");
    if (err) err.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const validate = () => {
    let ok = true;
    const name = document.getElementById("r-name");
    const email = document.getElementById("r-email");
    if (!name.value.trim()) { setError(name, "Please tell us your name."); ok = false; } else setError(name, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "Please enter a valid email."); ok = false; } else setError(email, "");
    if (!dateIn.value) { setError(dateIn, "Pick a date."); ok = false; }
    else if (dateIn.value < dateIn.min || dateIn.value > dateIn.max) { setError(dateIn, "Choose a date within the next 60 days."); ok = false; }
    else setError(dateIn, "");
    if (!timeSel.value) { setError(timeSel, "Pick a time."); ok = false; } else setError(timeSel, "");
    return ok;
  };

  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => { if (el.closest(".field.invalid")) validate(); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    const data = new FormData(form);
    const [y, mo, d] = data.get("date").split("-").map(Number);
    const niceDate = new Date(y, mo - 1, d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const guests = data.get("guests");
    const firstName = String(data.get("name")).trim().split(" ")[0];

    successText.textContent =
      `Thanks, ${firstName}! We've got your request for a table for ${guests} ${guests === "1" ? "guest" : "guests"} on ${niceDate} at ${data.get("time")}. ` +
      `We'll send a confirmation to ${data.get("email")}. See you soon!`;

    // NOTE: connect to a booking service / backend here (e.g. Formspree, OpenTable, or your own API).
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.getElementById("reserve-again").addEventListener("click", () => {
    form.reset();
    fillTimes();
    success.hidden = true;
    form.hidden = false;
    document.getElementById("r-name").focus();
  });

  /* ---------- Newsletter ---------- */
  const nl = document.getElementById("newsletter");
  nl.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nl.querySelector("input");
    const msg = nl.querySelector(".nl-msg");
    if (!input.checkValidity()) { msg.textContent = "Please enter a valid email."; return; }
    msg.textContent = "You're in! Look out for the next Morning Post.";
    input.value = "";
  });

  /* ---------- Year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
