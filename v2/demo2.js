// Demo Entwurf 2: Inhalt wie das erste Demo-Fenster (Ablauf links anklickbar, Bildschirm in der Mitte, rechts direkt Julius),
// Optik im Glasrahmen. Läuft von selbst (Mauszeiger klickt die Schritte), Klick auf einen Schritt hält an. Inhalte aus #daten.demo.
(() => {
  const wurzel = document.querySelector('[data-d2]');
  if (!wurzel) return;
  const daten = JSON.parse(document.getElementById('daten').textContent);
  const f = daten.firma;
  const leise = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ic = (id) => `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 32 32"><use href="#${id}"/></svg>`;
  const zeichen = (g) => `<svg viewBox="-8 -8 216 216" width="${g}" height="${g}" style="--ring:#D9B56A;--baum:#F1EEE5"><use href="#zeichen"/></svg>`;
  const zeichenDunkel = (g) => `<svg viewBox="-8 -8 216 216" width="${g}" height="${g}"><use href="#zeichen"/></svg>`;

  // ---------- kleine Illustrationen (statt Fotos, im Stil der Seite) ----------
  const raum = (inhalt, wand = '#E4DCCB', boden = '#C9BA9C') => `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="88" fill="${wand}"/><rect y="88" width="160" height="32" fill="${boden}"/><rect y="86" width="160" height="3" fill="#D6CCB8"/>${inhalt}</svg>`;
  const karton = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#C49A62" stroke="#8E6B3E" stroke-width="1.2"/><path d="M${x + w / 2} ${y}v${h}" stroke="#E8D6B0" stroke-width="3"/>`;
  const sack = (cx, cy, r) => `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .75}" fill="#2F3D36"/><path d="M${cx} ${cy - r * .75}l-2-5" stroke="#1E2924" stroke-width="1.5"/>`;
  const SZ = {
    voll1: raum(karton(8, 50, 34, 38) + karton(12, 22, 28, 28) + karton(44, 62, 26, 26) + sack(92, 96, 14) + `<rect x="100" y="40" width="46" height="48" fill="#6F7E72" rx="4"/><rect x="104" y="20" width="34" height="22" fill="#56645D"/>` + sack(130, 104, 11)),
    voll2: raum(`<rect x="10" y="18" width="40" height="70" fill="#8E6B3E"/><path d="M10 40h40M10 62h40" stroke="#6B4E33" stroke-width="2"/>` + karton(14, 24, 14, 14) + karton(30, 46, 16, 14) + karton(60, 58, 30, 30) + karton(64, 36, 22, 22) + sack(112, 98, 16) + `<circle cx="140" cy="100" r="9" fill="#B98A3E" opacity=".7"/>`),
    voll3: raum(`<rect x="70" y="22" width="20" height="66" rx="5" fill="#E9E2D2" stroke="#B9AE98" transform="rotate(-8 80 55)"/>` + karton(6, 56, 30, 32) + sack(46, 98, 13) + karton(100, 50, 40, 38) + karton(106, 26, 28, 24) + `<path d="M150 88V40" stroke="#4A4A40" stroke-width="2"/><path d="M142 42h16l-4-12h-8z" fill="#C9B07A"/>`),
    leer1: raum(`<path d="M60 88l20 0 30 32H40z" fill="#F3E3B8" opacity=".55"/><rect x="62" y="16" width="36" height="30" fill="#DCE9EC" stroke="#fff" stroke-width="3"/><path d="M148 30l-12 58" stroke="#152C22" stroke-width="2.5"/><path d="M131 86l10 2-2 8-11-3z" fill="#B98A3E"/>`, '#F1ECE1', '#DCCFB8'),
    leer2: raum(`<rect x="20" y="16" width="36" height="30" fill="#DCE9EC" stroke="#fff" stroke-width="3"/><path d="M22 88h30l26 32H0z" fill="#F3E3B8" opacity=".5"/><path d="M120 100l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#D9B56A"/>`, '#F1ECE1', '#DCCFB8'),
    zimmer: raum(`<rect x="12" y="52" width="70" height="26" rx="6" fill="#6F7E72"/><rect x="12" y="70" width="70" height="18" rx="4" fill="#5C6A5F"/><rect x="96" y="30" width="44" height="58" fill="#8E6B3E"/><rect x="100" y="34" width="17" height="50" fill="#A07A4A"/><rect x="119" y="34" width="17" height="50" fill="#A07A4A"/><rect x="30" y="14" width="28" height="22" fill="#C9B07A" stroke="#fff" stroke-width="2"/>`),
    heckeWild: `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#CFE0E6"/><rect y="88" width="160" height="32" fill="#7FA35A"/><path d="M0 92C8 40 20 30 30 44c6-22 22-26 30-6 8-24 26-20 32 0 8-22 28-18 30 4 10-14 26-6 28 20v38H0z" fill="#3E6B3A"/><path d="M20 50l-6-14M60 36l4-16M100 40l8-18M140 52l10-12" stroke="#3E6B3A" stroke-width="3"/></svg>`,
    heckeGerade: `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#CFE0E6"/><rect y="88" width="160" height="32" fill="#8DB565"/><path d="M0 98h160" stroke="#9CC274" stroke-width="6" stroke-dasharray="14 8"/><rect x="0" y="46" width="160" height="46" rx="6" fill="#3E6B3A"/><rect x="0" y="46" width="160" height="6" rx="3" fill="#4F7E48"/></svg>`,
    lampeAus: `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#5E625C"/><path d="M0 120l60-60h40v60z" fill="#4C504A"/><rect x="70" y="10" width="20" height="8" rx="2" fill="#777"/><circle cx="80" cy="24" r="9" fill="#8B8B84"/></svg>`,
    lampeAn: `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="#E9E1CF"/><path d="M80 24 30 120h100z" fill="#FFF3C8" opacity=".8"/><path d="M0 120l60-60h40v60z" fill="#D9CEB6"/><rect x="70" y="10" width="20" height="8" rx="2" fill="#999"/><circle cx="80" cy="24" r="9" fill="#FFE08A"/></svg>`,
  };
  const foto = (sz, text, ecke = '') => `<div class="foto">${SZ[sz]}<span>${text}</span>${ecke ? `<em>${ecke}</em>` : ''}</div>`;

  // Bilder je Geschäftsfeld (gezeichnete Illustrationen, bis echte Fotos da sind)
  const BILDER = [
    { vorher: ['voll1', 'voll2', 'voll3'], nachher: ['leer1', 'leer2', 'leer1'] },
    { vorher: ['zimmer', 'voll2', 'voll3'], nachher: ['leer2', 'leer1', 'leer2'] },
    { vorher: ['lampeAus'], nachher: ['lampeAn', 'leer2', 'heckeGerade'] },
    { vorher: ['heckeWild', 'heckeWild'], nachher: ['heckeGerade', 'heckeGerade', 'leer2'] },
  ];
  const DEMO = daten.demo || [];
  const NAMEN = ['Regal links', 'Hintere Ecke', 'Eingang'];

  // ---------- Bildschirme ----------
  const kopfzeile = (titel, unter) => `<div class="e-kopf"><h4>${titel}</h4><span>${unter}</span></div>`;
  const BS = {
    chat: (x, b) => `${kopfzeile(x.titel, 'per WhatsApp')}<div class="e-wa"><div class="wa-kopf"><i>${zeichen(26)}</i><div><b>Julius · Tanneberger</b><small>online</small></div></div><div class="wa-verlauf" data-verlauf></div></div>`,
    termin: (x) => {
      const tagNr = { MO: 16, DI: 17, MI: 18, DO: 19, FR: 20 }[x.tag] || 19;
      const tage = Array.from({ length: 35 }, (_, i) => i - 6 + 1).map((n) => `<span class="${n === tagNr ? 'an' : ''}${n < 1 || n > 30 ? ' leer' : ''}">${n >= 1 && n <= 30 ? n : ''}</span>`).join('');
      return `${kopfzeile(x.titel, 'kostenlos · unverbindlich')}<div class="e-termin"><div class="box e-kal"><div class="box-kopf">November 2026</div><div class="e-wt">${'MDMDFSS'.split('').map((t) => `<b>${t}</b>`).join('')}</div><div class="e-tage">${tage}</div></div>
        <div class="box e-tdetail"><div class="e-uhr"><small>${{ MO: 'Montag', DI: 'Dienstag', MI: 'Mittwoch', DO: 'Donnerstag', FR: 'Freitag' }[x.tag] || ''}, ${tagNr}.11.</small><b>${x.zeit} Uhr</b></div>
        <ul>${x.zeilen.map((z, i) => `<li style="--v:${300 + i * 250}ms"><i>✓</i>${z}</li>`).join('')}</ul><span class="etikett gruen e-best" data-bestaetigt>Termin bestätigt</span></div></div>`;
    },
    angebot: (x, b) => `${kopfzeile(x.titel, 'Angebot')}<div class="box angebot2 e-ang"><div class="box-kopf" style="padding:0 0 10px;border:0"><span style="display:flex;align-items:center;gap:8px">${zeichenDunkel(26)} Angebot · ${DEMO[b].name}</span><span class="etikett gold" data-ang-status>Neu</span></div>
      ${x.posten.map((p, i) => `<div class="a-zeile" style="--v:${i * 180}ms"><i>0${i + 1}</i><span>${p}</span><em>inklusive</em></div>`).join('')}
      <div class="a-summe"><b>${x.fuss}</b><button type="button" class="knopf2 gold" data-annehmen>Angebot annehmen</button></div><div class="stempel2" data-stempel>ANGE-<br>NOMMEN<br>✓</div></div>`,
    liste: (x) => `${kopfzeile(x.titel, 'heute')}<div class="box"><ul class="check2" data-check>${x.punkte.map((p, i) => `<li><i></i><span>${p}</span><time>${String(8 + Math.floor((10 + i * 35) / 60)).padStart(2, '0')}:${String((10 + i * 35) % 60).padStart(2, '0')}</time></li>`).join('')}</ul></div>`,
    plan: (x) => `${kopfzeile(x.titel, 'fest vereinbart')}<div class="box e-plan">${x.zeilen.map(([a, t], i) => `<div style="--v:${i * 160}ms"><b>${a}</b><span>${t}</span></div>`).join('')}</div>`,
    fertig: (x, b) => `${kopfzeile(x.titel, 'abgeschlossen')}<div class="e-fertig"><div class="e-fotos">${BILDER[b].nachher.slice(0, 3).map((s, i) => `<div class="foto neu" style="animation-delay:${i * 150}ms">${SZ[s]}<em>Nachher</em></div>`).join('')}</div>
      <div class="e-abschluss"><div class="stempel2 an e-st">${(x.stempel || 'ERLEDIGT ✓').replace('BESEN-<br>REIN', 'BESEN-<br>REIN')}</div><p>${x.text}</p></div></div>`,
  };

  // ---------- Grundgerüst ----------
  wurzel.innerHTML = `<div class="d2-leiste"><div class="d2-reiter" role="tablist" aria-label="Geschäftsfelder">${DEMO.map((s, i) => `<button type="button" role="tab" data-i="${i}"><span class="rk">${ic(s.icon)}</span>${s.name}<span class="lauf"></span></button>`).join('')}</div>
    <div class="d2-steuer"><button type="button" class="d2-rund" data-zur aria-label="Zurück"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9l-7 7 7 7"/></svg></button>
    <button type="button" class="d2-rund" data-vor aria-label="Weiter"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 9l7 7-7 7"/></svg></button>
    <button type="button" class="d2-rund" data-pause aria-label="Anhalten"><svg viewBox="0 0 32 32" fill="currentColor" data-sp><rect x="10" y="9" width="4" height="14" rx="1"/><rect x="18" y="9" width="4" height="14" rx="1"/></svg><svg viewBox="0 0 32 32" fill="currentColor" data-sy style="display:none"><path d="M11 8l13 8-13 8z"/></svg></button>
    <a class="d2-cta" href="#kontakt">Angebot anfragen</a></div></div>
    <div class="d2-buehne" data-buehne><div class="d2-skala" data-skala></div></div>`;
  const buehne = wurzel.querySelector('[data-buehne]'), skala = wurzel.querySelector('[data-skala]');
  const reiterKn = [...wurzel.querySelectorAll('.d2-reiter button')];

  // Skalierung: breit 1140×660; Handy 440 breit, Höhe so, dass das Fenster zwischen Kopf- und Fußleiste passt
  let B = 1140, H = 660, faktor = 1, schmal = false;
  const passe = () => {
    const w = buehne.clientWidth; schmal = w < 700;
    B = schmal ? 440 : 1140; faktor = w / B;
    if (schmal) {
      const kopfH = (document.getElementById('kopf')?.getBoundingClientRect().bottom || 70) + 12;
      const leiste = document.querySelector('.leiste'); const fussH = leiste ? innerHeight - leiste.getBoundingClientRect().top + 12 : 90;
      const rahmenRest = wurzel.offsetHeight - buehne.offsetHeight;
      const verfuegbar = innerHeight - kopfH - fussH - rahmenRest;
      H = Math.max(520, Math.min(820, verfuegbar / faktor));
    } else H = 660;
    skala.classList.toggle('schmal', schmal);
    skala.style.width = `${B}px`; skala.style.height = `${H}px`;
    skala.style.transform = `scale(${faktor})`; buehne.style.height = `${H * faktor}px`;
  };

  const appHTML = (b) => {
    const d = DEMO[b];
    return `<div class="e-app">
      <div class="e-oben"><div class="app-logo">${zeichenDunkel(28)}TANNEBERGER</div><div class="e-wo"><small>Ihr Auftrag</small><b>${d.name}</b></div>
        <div class="e-schritt"><span data-schrittzahl>Schritt 1 von ${d.schritte.length}</span><s><i data-schrittbalken></i></s></div></div>
      <div class="e-koerper">
        <aside class="e-ablauf"><p>Ablauf</p><ol data-schritte>${d.schritte.map((x, k) => `<li><button type="button" data-k="${k}"><b>${k + 1}</b><span>${x.titel}</span></button></li>`).join('')}</ol></aside>
        <main class="e-mitte" data-mitte><div class="e-leer">${ic(d.icon)}<b>So läuft Ihr Auftrag</b><span>Schritt links antippen – oder einfach zuschauen.</span></div></main>
        <aside class="e-julius"><div class="wer">${zeichen(48)}<div><b>Julius</b><small>Ihr Ansprechpartner</small></div></div>
          <p class="hinweis">Kein Callcenter, keine KI – Sie sprechen direkt mit Julius.</p>
          <div class="tipp"><b>Gut zu wissen</b>${d.tipp}</div>
          <div class="unten"><a class="knopf2 gold e-gross" ${f.telefon ? `href="tel:${f.telefon}"` : 'href="#kontakt"'}>${ic('i-tel')} Anrufen</a>
          <a class="knopf2 e-gross e-hell" ${f.whatsapp ? `href="https://wa.me/${f.whatsapp}" target="_blank" rel="noopener"` : 'href="#kontakt"'}>${ic('i-wa')} WhatsApp</a></div></aside>
      </div></div>
      <div class="d2-intro" data-intro><div><div class="marke2"><i>${ic(d.icon)}</i>${d.name}</div><h3>${d.intro}</h3><button type="button" data-start>Ablauf ansehen</button></div></div>
      <svg class="zeiger" data-zeiger viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.4-7.6L21 11z" fill="#fff" stroke="#152C22" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  };

  // ---------- Ablauf-Steuerung ----------
  let nr = 0, k = -1, lauf = 0, pause = leise;
  const sichtbar = () => { const r = wurzel.getBoundingClientRect(), h = innerHeight; return r.top < h * .85 && r.bottom > h * .15; };
  const ABBRUCH = Symbol('abbruch');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => skala.querySelector(s), $$ = (s) => [...skala.querySelectorAll(s)];

  const warteMit = (meinLauf, frei) => async (ms) => {
    let rest = ms;
    while (rest > 0) {
      if (meinLauf !== lauf) throw ABBRUCH;
      if (!frei && (pause || !sichtbar())) { await sleep(200); continue; }
      await sleep(Math.min(100, rest)); rest -= 100;
    }
    if (meinLauf !== lauf) throw ABBRUCH;
  };
  const zeigerZu = async (el, warte) => {
    const z = $('[data-zeiger]'); if (!z || !el) return;
    const r = el.getBoundingClientRect(), s = skala.getBoundingClientRect();
    z.style.transform = `translate(${(r.left - s.left + r.width * .5) / faktor}px,${(r.top - s.top + r.height * .55) / faktor}px)`;
    await warte(900); z.classList.remove('klick'); void z.offsetWidth; z.classList.add('klick'); await warte(250);
  };

  // Schritt anzeigen + seine kleine Animation abspielen
  const spieleSchritt = async (warte, b, i) => {
    const d = DEMO[b], x = d.schritte[i];
    $$('[data-schritte] button').forEach((btn, j) => { btn.classList.toggle('aktiv', j === i); btn.classList.toggle('ok', j < i); btn.querySelector('b').textContent = j < i ? '✓' : j + 1; });
    $('[data-schrittzahl]').textContent = `Schritt ${i + 1} von ${d.schritte.length}`;
    $('[data-schrittbalken]').style.width = `${((i + 1) / d.schritte.length) * 100}%`;
    reiterKn[b]?.style.setProperty('--lauf', ((i + 1) / d.schritte.length).toFixed(2));
    const mitte = $('[data-mitte]');
    mitte.innerHTML = `<div class="e-bild">${BS[x.typ](x, b)}</div>`;
    if (x.typ === 'chat') {
      const v = $('[data-verlauf]');
      for (const n of x.nachrichten) {
        if (n.von === 'julius') { v.insertAdjacentHTML('beforeend', '<div class="tippt"><i></i><i></i><i></i></div>'); await warte(900); v.querySelector('.tippt')?.remove(); }
        const fotos = n.fotos ? `<div class="fotos2">${Array.from({ length: Math.min(4, n.fotos + (n.fotos % 2)) }, (_, j) => `<div>${SZ[BILDER[b].vorher[j % BILDER[b].vorher.length]]}</div>`).join('')}</div>` : '';
        v.insertAdjacentHTML('beforeend', `<div class="bl ${n.von === 'julius' ? 'j' : 'k'}">${fotos}${n.text}<small class="${n.von === 'julius' ? '' : 'blau'}">${['08:12', '08:15', '08:16'][x.nachrichten.indexOf(n)] || '08:20'}</small></div>`);
        await warte(1200);
      }
      await warte(800);
    } else if (x.typ === 'angebot') {
      await warte(1300);
      const kn = $('[data-annehmen]'); await zeigerZu(kn, warte);
      kn.textContent = 'Angenommen ✓'; kn.className = 'knopf2 ok2';
      const st = $('[data-ang-status]'); st.className = 'etikett gruen'; st.textContent = 'Angenommen'; $('[data-stempel]').classList.add('an');
      await warte(1800);
    } else if (x.typ === 'liste') {
      for (const li of $$('[data-check] li')) { await warte(520); li.classList.add('ok'); }
      await warte(1000);
    } else if (x.typ === 'termin') {
      await warte(1500); $('[data-bestaetigt]')?.classList.add('an'); await warte(1700);
    } else await warte(3400);
  };

  const starte = async (b, ab = -1, ohneIntro = false) => {
    nr = (b + DEMO.length) % DEMO.length; const meinLauf = ++lauf; const warte = warteMit(meinLauf, false);
    reiterKn.forEach((kn, j) => { kn.setAttribute('aria-selected', j === nr); kn.style.setProperty('--lauf', 0); });
    const aktiv = reiterKn[nr]; aktiv.parentElement.scrollLeft = aktiv.offsetLeft - 10;
    skala.innerHTML = appHTML(nr);
    const z = $('[data-zeiger]'); z.style.transition = 'none'; z.style.transform = `translate(${B * .5}px,${H * .85}px)`; void z.offsetWidth; z.style.transition = '';
    try {
      if (ab >= 0) { $('[data-intro]').classList.add('weg'); await spieleSchritt(warteMit(meinLauf, true), nr, ab); return; }
      if (!ohneIntro) await warte(2400);
      $('[data-intro]').classList.add('weg'); await warte(400);
      for (let i = 0; i < DEMO[nr].schritte.length; i++) {
        const btn = $$('[data-schritte] button')[i];
        if (schmal) btn.parentElement.parentElement.scrollLeft = btn.parentElement.offsetLeft - 12;
        await zeigerZu(btn, warte);
        await spieleSchritt(warte, nr, i);
      }
      await warte(1200);
      starte(nr + 1);
    } catch (e) { if (e !== ABBRUCH) throw e; }
  };

  // Bedienung
  wurzel.querySelector('.d2-reiter').addEventListener('click', (e) => { const kn = e.target.closest('button'); if (kn) starte(+kn.dataset.i); });
  wurzel.querySelector('[data-vor]').addEventListener('click', () => starte(nr + 1));
  wurzel.querySelector('[data-zur]').addEventListener('click', () => starte(nr - 1));
  skala.addEventListener('click', (e) => {
    if (e.target.closest('[data-start]')) { starte(nr, -1, true); return; }
    const btn = e.target.closest('[data-schritte] button');
    if (btn) { setzePause(true); starte(nr, +btn.dataset.k); }
  });
  const setzePause = (p) => {
    pause = p; wurzel.querySelector('[data-sp]').style.display = p ? 'none' : ''; wurzel.querySelector('[data-sy]').style.display = p ? '' : 'none';
    wurzel.querySelector('[data-pause]').setAttribute('aria-label', p ? 'Abspielen' : 'Anhalten');
  };
  wurzel.querySelector('[data-pause]').addEventListener('click', () => {
    const war = pause; setzePause(!pause);
    if (war) { const aktivK = $$('[data-schritte] button').findIndex((x) => x.classList.contains('aktiv')); if (aktivK >= 0) starte(nr, -1, true); }
  });

  // Rahmen wächst und hebt sich beim Hereinscrollen
  const scroll = () => {
    const r = wurzel.getBoundingClientRect(), h = innerHeight;
    const t = Math.min(1, Math.max(0, (h - r.top) / (h * .75)));
    wurzel.style.setProperty('--d2-s', (0.9 + 0.1 * t).toFixed(3));
    wurzel.style.setProperty('--d2-y', ((1 - t) * 60).toFixed(1));
  };
  addEventListener('scroll', scroll, { passive: true });
  let altB = 0; addEventListener('resize', () => { const w = buehne.clientWidth; if (Math.abs(w - altB) > 2) { altB = w; passe(); } scroll(); });
  passe(); altB = buehne.clientWidth; setzePause(pause); scroll(); starte(0);
})();
