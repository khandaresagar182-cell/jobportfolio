(function () {
  document.documentElement.classList.add("js");
  const D = window.PORTFOLIO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Profile
  $("#profile-text").textContent = D.profile;
  $("#facts").innerHTML = D.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");

  // Experience
  $("#exp-list").innerHTML = D.experience.map((x) => `
    <li><time>${esc(x.period)}</time><h3>${esc(x.role)}</h3><p class="role-org">${esc(x.org)}</p><p>${esc(x.note)}</p></li>`).join("");

  // Subjects
  $("#subject-rows").innerHTML = D.subjects.map((s) => {
    const failed = s.students - s.passed, pct = s.students ? (s.passed / s.students * 100).toFixed(1) : "0.0";
    return `<tr><td>${esc(s.name)}</td><td>${esc(s.term)}</td><td class="num">${s.students}</td><td class="num">${s.passed}</td><td class="num">${failed}</td><td class="num">${pct}%</td><td><span class="grade">${esc(s.grade)}</span></td></tr>`;
  }).join("");

  // FDP
  $("#fdp-list").innerHTML = D.fdp.map((g) => `
    <div class="year-row">
      <h3>${esc(g.year)}</h3>
      <div class="year-items">${g.items.map((i) => `
        <article class="item"><h4>${esc(i.title)}</h4><p>${esc(i.org)} &middot; ${esc(i.dur)}</p></article>`).join("")}
      </div>
    </div>`).join("");

  // Certs
  $("#cert-grid").innerHTML = D.certs.map((c) => `
    <article class="cert"><span class="tag">${esc(c.by)}</span><h3>${esc(c.title)}</h3><p>${esc(c.note)}</p></article>`).join("");

  // Lectures
  $("#lecture-list").innerHTML = D.lectures.map((l) => `
    <li><time>${esc(l.date)}</time><h3>${esc(l.title)}</h3><p>${esc(l.venue)}</p></li>`).join("");

  // Publications with tabs
  const pubList = $("#pub-list");
  function showPubs(type) {
    const rows = D.publications.filter((p) => p.type === type);
    pubList.innerHTML = rows.length
      ? rows.map((p) => `<li class="in"><div><h3>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</h3><p>${esc(p.venue)}</p></div><span class="yr">${esc(p.year)}</span></li>`).join("")
      : `<li class="empty in">No entries yet.</li>`;
    pubList.setAttribute("aria-labelledby", "tab-" + type);
  }
  document.querySelectorAll(".tabs [role=tab]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".tabs [role=tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
      showPubs(b.dataset.tab);
    })
  );
  showPubs("journal");

  // Patents
  $("#patent-grid").innerHTML = D.patents.map((p) => `
    <article class="patent"><span class="status">${esc(p.status)}</span><h3>${esc(p.title)}</h3><p>${esc(p.id)}</p></article>`).join("");

  // Recognition
  $("#recog-grid").innerHTML = D.recognition.map((r) => `
    <article class="recog${r.feature ? " feature" : ""}"><span class="yr">${esc(r.year)}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.by)}</p></div></article>`).join("");

  // Contact
  const c = D.contact;
  $("#contact-info").innerHTML = `
    <div><dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd></div>
    <div><dt>Phone</dt><dd><a href="tel:${esc(c.phone.replace(/\s/g, ""))}">${esc(c.phone)}</a></dd></div>
    <div><dt>Address</dt><dd>${esc(c.address)}</dd></div>`;

  // Form: validate, then open mail client
  const form = $("#contact-form");
  const fields = [["name", "Please enter your name."], ["email", "Enter a valid email, for example you@example.com."], ["msg", "Please write a short message."]];
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    fields.forEach(([id, msg]) => {
      const el = $("#" + id), err = $("#err-" + id);
      const bad = !el.value.trim() || (id === "email" && !el.validity.valid && el.value.trim() !== "") || (id === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
      el.setAttribute("aria-invalid", bad);
      err.textContent = bad ? msg : "";
      if (bad && !first) first = el;
    });
    if (first) return first.focus();
    const body = `${$("#msg").value}\n\nFrom: ${$("#name").value} <${$("#email").value}>`;
    location.href = `mailto:${c.email}?subject=${encodeURIComponent("Portfolio enquiry from " + $("#name").value)}&body=${encodeURIComponent(body)}`;
    $("#form-ok").textContent = "Opening your email app…";
  });

  $("#yr").textContent = new Date().getFullYear();

  // Mobile menu
  const btn = $(".menu-btn"), side = $("#sidebar");
  const setMenu = (open) => { side.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
  btn.addEventListener("click", () => setMenu(!side.classList.contains("open")));
  side.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Scroll reveal (communicates sequence as sections enter)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal, .sec h2, .item, .cert, .patent, .recog, .timeline li, .pubs li:not(.in)").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 60 + "ms";
    io.observe(el);
  });

  // Active nav link
  const links = [...document.querySelectorAll(".sidebar nav a")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const so = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      const id = e.target.id === "profile" ? "home" : e.target.id;
      links.forEach((a) => a.classList.toggle("active", a === map.get(id)));
    }
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => so.observe(s));
})();
