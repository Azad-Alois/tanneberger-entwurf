(() => {
  document.documentElement.classList.add('js');
  const daten = JSON.parse(document.getElementById('daten').textContent);
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const svgIcon = (id, w = 1.8) => `<svg class="icon" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><use href="#${id}"/></svg>`;
  const f = daten.firma;

  // Telefon / E-Mail aus den Daten (null = noch nicht bekannt)
  $$('[data-tel]').forEach((a) => { if (f.telefon) a.href = `tel:${f.telefon}`; });
  $$('[data-tel-text]').forEach((s) => { if (f.telefonAnzeige) s.textContent = f.telefonAnzeige; });
  $$('[data-mail]').forEach((a) => { if (f.mail) a.href = `mailto:${f.mail}`; });
  $$('[data-mail-text]').forEach((s) => { if (f.mail) s.textContent = f.mail; });
  $('[data-jahr]').textContent = new Date().getFullYear();

  // Tannenreihen im Held (zufällig, aber bei jedem Laden gleich)
  let saat = 7;
  const zufall = () => ((saat = (saat * 9301 + 49297) % 233280) / 233280);
  const reihen = [['.r1', 30, 110, 180, 360], ['.r2', 22, 160, 250, 450], ['.r3', 17, 220, 320, 545]];
  reihen.forEach(([sel, anzahl, minH, maxH, basis]) => {
    let html = '';
    for (let i = 0; i < anzahl; i++) {
      const h = minH + zufall() * (maxH - minH), b = h * 0.81;
      const x = (i / anzahl) * 1500 - 40 + zufall() * 30;
      html += `<use href="#tanne" x="${x.toFixed(0)}" y="${(basis + zufall() * 40 - h).toFixed(0)}" width="${b.toFixed(0)}" height="${h.toFixed(0)}"/>`;
    }
    $(`.wald ${sel}`).innerHTML = html;
  });

  // WhatsApp (null = keine Nummer → Knöpfe führen zum Formular)
  $$('[data-wa]').forEach((a) => { if (f.whatsapp) { a.href = `https://wa.me/${f.whatsapp}?text=${encodeURIComponent('Hallo, ich hätte gern ein Angebot für eine Entrümpelung. Fotos schicke ich mit.')}`; a.target = '_blank'; a.rel = 'noopener'; } });

  // Vorher / Nachher: Regler (Maus, Finger, Tastatur über das unsichtbare Range-Feld)
  const vn = $('[data-vn]'), vnRegler = $('[data-vn-regler]');
  const setzeVn = () => vn.style.setProperty('--pos', `${vnRegler.value}%`);
  vnRegler.addEventListener('input', setzeVn); setzeVn();

  // Laufband (doppelt für nahtlose Schleife)
  const band = daten.laufband.map((t) => `<span>${t}</span>`).join('');
  $('[data-laufband]').innerHTML = band + band;

  // Leistungen mit Reitern
  const alleLeistungen = daten.bereiche.flatMap((b) => b.leistungen);
  $$('[data-anzahl-leistungen]').forEach((el) => { el.textContent = alleLeistungen.length; });
  const reiter = $('[data-reiter]'), raster = $('[data-leistungen]');
  reiter.innerHTML = daten.bereiche.map((b, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">${b.name}</button>`).join('');
  const zeigeBereich = (i) => {
    reiter.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.i == i));
    raster.innerHTML = daten.bereiche[i].leistungen.map((l, n) => `<article class="leistung" style="animation-delay:${n * 70}ms">
      <span class="kreis">${svgIcon(l.icon)}</span><h3>${l.titel}</h3><p>${l.text}</p>
      <ul>${l.punkte.map((p) => `<li>${p}</li>`).join('')}</ul>
      <a href="#kontakt" data-anfrage="${l.titel}">Dazu anfragen ${svgIcon('i-pfeil', 2)}</a></article>`).join('');
  };
  reiter.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) zeigeBereich(+b.dataset.i); });
  zeigeBereich(0);
  $('[data-fuss-leistungen]').innerHTML = daten.bereiche.map((b, i) => `<li><a href="#leistungen" data-bereich="${i}">${b.name}</a></li>`).join('');
  document.addEventListener('click', (e) => { const a = e.target.closest('[data-bereich]'); if (a) zeigeBereich(+a.dataset.bereich); });

  // Formular: Auswahlfeld aus den Leistungen
  const feldLeistung = $('[data-feld-leistung]'), feldNachricht = $('[data-feld-nachricht]');
  feldLeistung.innerHTML = '<option value="">Bitte wählen …</option>' + alleLeistungen.map((l) => `<option>${l.titel}</option>`).join('') + '<option>Etwas anderes</option>';
  document.addEventListener('click', (e) => { const a = e.target.closest('[data-anfrage]'); if (a) feldLeistung.value = a.dataset.anfrage; });

  // Entrümpelungs-Check
  const antwort = {};
  const ergebnis = $('[data-check-ergebnis]');
  Object.entries(daten.check).forEach(([frage, optionen]) => {
    const box = $(`[data-frage="${frage}"]`);
    box.innerHTML = optionen.map((o) => `<button type="button" data-id="${o.id}" aria-pressed="false">${o.text}</button>`).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      antwort[frage] = b.dataset.id; zeigeCheck();
    });
  });
  const text = (frage) => daten.check[frage].find((o) => o.id === antwort[frage]).text;
  const zeigeCheck = () => {
    const offen = Object.keys(daten.check).filter((k) => !antwort[k]).length;
    if (offen) { ergebnis.innerHTML = `<p class="warte">Noch ${offen} ${offen === 1 ? 'Frage' : 'Fragen'} – dann sehen Sie Ihren nächsten Schritt.</p>`; return; }
    const { raum, menge, zugang } = antwort;
    const schritte = [];
    let titel;
    if (menge === 'wenig' && raum !== 'haus') {
      titel = 'Kleiner Auftrag – oft schnell erledigt.';
      schritte.push('Fotos per WhatsApp schicken – meist reicht das für ein festes Angebot.', 'Termin ausmachen, abholen, fertig.');
    } else if (raum === 'haus' || menge === 'voll') {
      titel = 'Größere Räumung – erst kurz ansehen.';
      schritte.push('Besichtigung vor Ort: Wir sehen uns alle Räume an und klären, was bleibt und was weg soll.', 'Sie bekommen ein festes Angebot und einen verbindlichen Termin.');
    } else {
      titel = 'Typische Räumung – gut planbar.';
      schritte.push('Fotos schicken oder kurzer Besichtigungstermin.', 'Festes Angebot, dann räumen wir an einem vereinbarten Tag.');
    }
    if (zugang === 'treppe') schritte.push('Treppen planen wir ein – Sie müssen nichts vortragen oder vorbereiten.');
    if (zugang === 'aufzug') schritte.push('Falls nötig: Aufzug bei der Hausverwaltung für den Tag reservieren.');
    if (zugang === 'eben') schritte.push('Gut zu wissen: Ein Parkplatz nahe am Eingang spart Zeit.');
    if (raum === 'haus' || raum === 'wohnung') schritte.push('Persönliche Unterlagen, Fotos und Wertsachen legen wir beim Räumen beiseite.');
    schritte.push('Danach: fachgerecht entsorgt und besenrein übergeben.');
    ergebnis.innerHTML = `<strong>${titel}</strong><ol>${schritte.map((s) => `<li>${s}</li>`).join('')}</ol>
      <div class="knoepfe" style="margin-top:.4rem"><a class="knopf gold" href="#kontakt" data-check-uebernehmen>In Anfrage übernehmen ${svgIcon('i-pfeil', 2)}</a>
      ${f.whatsapp ? `<a class="knopf glas" target="_blank" rel="noopener" href="https://wa.me/${f.whatsapp}?text=${encodeURIComponent(checkText() + ' Fotos schicke ich mit.')}">${svgIcon('i-wa', 2)} Fotos per WhatsApp</a>` : ''}</div>`;
  };
  const checkText = () => `Entrümpelungs-Check: ${text('raum')} · Menge: ${text('menge')} · Zugang: ${text('zugang')}.`;
  ergebnis.addEventListener('click', (e) => {
    if (!e.target.closest('[data-check-uebernehmen]')) return;
    feldLeistung.value = antwort.raum === 'raum' ? 'Keller & Dachboden' : antwort.raum === 'haus' ? 'Komplette Haushaltsauflösung' : 'Wohnung & Haus';
    feldNachricht.value = `${checkText()}\n`;
  });
  zeigeCheck();

  // Einsatzgebiet
  const orteBox = $('[data-orte]'), gebietErgebnis = $('[data-gebiet-ergebnis]');
  const orte = daten.gebiet.flatMap((g) => g.orte.map((ort) => ({ ort, stufe: g.stufe })));
  $$('[data-anzahl-orte]').forEach((el) => { el.textContent = orte.length; });
  orteBox.innerHTML = orte.map((x, i) => `<button type="button" class="${x.stufe}" data-i="${i}" aria-pressed="false">${x.ort}</button>`).join('');
  const zeigeOrt = (i) => {
    const { ort, stufe } = orte[i];
    orteBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.i == i));
    gebietErgebnis.innerHTML = stufe === 'kern'
      ? `<strong>Ja – ${ort} gehört zu unserem Einsatzgebiet.</strong><span>Kurze Anfahrt, schneller Besichtigungstermin.</span>`
      : `<strong>${ort}: gerne, nach Absprache.</strong><span>Für größere Räumungen fahren wir auch weiter – kurz anfragen.</span>`;
    $('[data-feld-ort]').value = ort;
  };
  orteBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) zeigeOrt(+b.dataset.i); });
  gebietErgebnis.innerHTML = '<span>Ort antippen …</span>';

  // Formular: Versand über anfrage.php (Server). Ohne Server (z. B. Vorschau) öffnet sich das E-Mail-Programm.
  const form = $('[data-formular]'), meldung = $('[data-formular-meldung]'), knopf = $('[data-formular-knopf]');
  $('[data-feld-zeit]').value = Date.now();
  const perMail = () => {
    const body = `Name: ${form.name.value}\nTelefon: ${form.telefon.value}\nE-Mail: ${form.email.value}\nOrt: ${form.ort.value}\nLeistung: ${form.leistung.value}\nGröße: ${form.groesse.value}\nWann: ${form.zeitraum.value}\n\n${form.nachricht.value}`;
    location.href = `mailto:${f.mail}?subject=${encodeURIComponent('Anfrage über die Webseite')}&body=${encodeURIComponent(body)}`;
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    meldung.classList.remove('fehler', 'gesendet');
    if (!form.name.value.trim() || !form.telefon.value.trim()) {
      meldung.classList.add('fehler'); meldung.textContent = 'Bitte Name und Telefon ausfüllen.'; return;
    }
    knopf.disabled = true; meldung.textContent = 'Wird gesendet …';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const typ = r.headers.get('content-type') || '';
      if (!typ.includes('json')) throw new Error('kein Server');
      const d = await r.json();
      if (!d.ok) { meldung.classList.add('fehler'); meldung.textContent = d.fehler || 'Das hat nicht geklappt. Bitte anrufen.'; return; }
      form.reset(); $('[data-feld-zeit]').value = Date.now();
      meldung.classList.add('gesendet');
      meldung.textContent = 'Danke! Ihre Anfrage ist angekommen – wir melden uns so schnell wie möglich.';
    } catch {
      meldung.textContent = 'Ihr E-Mail-Programm öffnet sich – bitte die Nachricht dort absenden.'; perMail();
    } finally { knopf.disabled = false; }
  });

  // Demo-Fenster: Reiter laufen von selbst durch (Titelkarte → Schritte → nächster Reiter), anklickbar, Pause
  const demo = $('[data-demo]');
  if (demo && daten.demo) {
    const reiterBox = $('[data-demo-reiter]'), schritteBox = $('[data-demo-schritte]'), mitte = $('[data-demo-mitte]'), rechts = $('[data-demo-rechts]');
    const TAKT = 3600, INTRO = 2600;
    let b = 0, s = -1, pause = matchMedia('(prefers-reduced-motion: reduce)').matches, imBild = false, uhr = null;
    const zeichen = (gr = 30) => `<svg viewBox="-8 -8 216 216" width="${gr}" height="${gr}" style="--ring:#D9B56A;--baum:#F1EEE5"><use href="#zeichen"/></svg>`;
    reiterBox.innerHTML = daten.demo.map((d, i) => `<button type="button" role="tab" data-i="${i}">${svgIcon(d.icon, 2)}${d.name}<i></i></button>`).join('');
    const bildschirm = (x) => {
      const kopf = `<h3>${x.titel}<small>${daten.demo[b].name}</small></h3>`;
      if (x.typ === 'chat') return kopf + `<div class="chat">${x.nachrichten.map((n, k) => `<div class="blase ${n.von}" style="--v:${k * 450}ms">${n.von === 'julius' ? '<small>Julius</small>' : ''}${n.text}${n.fotos ? `<div class="fotos">${'<span></span>'.repeat(n.fotos)}</div>` : ''}</div>`).join('')}</div>`;
      if (x.typ === 'termin') return kopf + `<div class="termin"><div class="tag"><div><b>${x.tag}</b><span>${x.zeit}</span></div></div><ul>${x.zeilen.map((z) => `<li>${z}</li>`).join('')}</ul></div>`;
      if (x.typ === 'angebot') return kopf + `<div class="angebot"><div class="kopfzeile"><span>ANGEBOT</span>${zeichen()}</div><ul>${x.posten.map((z) => `<li>${z}</li>`).join('')}</ul><div class="summe">Gesamt<span>${x.fuss}</span></div></div>`;
      if (x.typ === 'plan') return kopf + `<div class="plan">${x.zeilen.map(([a, t], k) => `<div style="--v:${k * 120}ms"><b>${a}</b><span>${t}</span></div>`).join('')}</div>`;
      if (x.typ === 'liste') return kopf + `<ul class="liste">${x.punkte.map((t, k) => `<li><i style="--v:${300 + k * 450}ms"></i>${t}</li>`).join('')}</ul>`;
      return `<div class="fertig"><div class="stempel">${x.stempel || 'ERLEDIGT ✓'}</div><h3 style="display:block">${x.titel}</h3><p>${x.text}</p></div>`;
    };
    const zeige = () => {
      const d = daten.demo[b];
      const dauer = INTRO + d.schritte.length * TAKT;
      reiterBox.querySelectorAll('button').forEach((x) => { const an = x.dataset.i == b; x.setAttribute('aria-selected', an); if (an) x.style.setProperty('--dauer', `${dauer}ms`); });
      schritteBox.innerHTML = d.schritte.map((x, k) => `<li><button type="button" data-k="${k}" class="${k < s ? 'erledigt' : ''}${k === s ? ' aktiv' : ''}"><b>${k < s ? '✓' : k + 1}</b>${x.titel}</button></li>`).join('');
      mitte.innerHTML = s < 0
        ? `<div class="demo-intro"><div><svg class="gross" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><use href="#${d.icon}"/></svg><p>${d.name}</p><h3>${d.intro}</h3><button type="button" class="knopf gold" data-demo-start>Ablauf ansehen ${svgIcon('i-pfeil', 2)}</button></div></div>`
        : bildschirm(d.schritte[s]);
      rechts.innerHTML = `<div class="wer">${zeichen(48)}<div><b>Julius</b><small>Ihr Ansprechpartner</small></div></div>
        <p class="hinweis">Kein Callcenter, keine KI – Sie sprechen direkt mit Julius.</p>
        <div class="tipp"><b>Gut zu wissen</b>${d.tipp}</div>
        <div class="unten"><a class="knopf gold" ${f.telefon ? `href="tel:${f.telefon}"` : 'href="#kontakt"'}>${svgIcon('i-tel', 2)} Anrufen</a>
        <a class="knopf hell" ${f.whatsapp ? `href="https://wa.me/${f.whatsapp}" target="_blank" rel="noopener"` : 'href="#kontakt"'}>${svgIcon('i-wa', 2)} WhatsApp</a></div>`;
      // Am Handy: aktiven Schritt/Reiter in der Querleiste sichtbar halten (ohne die Seite zu verschieben)
      const aktivS = schritteBox.querySelector('.aktiv'); schritteBox.scrollLeft = aktivS ? aktivS.parentElement.offsetLeft - 16 : 0;
      const aktivR = reiterBox.querySelector('[aria-selected=true]'); if (aktivR) reiterBox.scrollLeft = aktivR.offsetLeft - 8;
      // Fortschrittsbalken neu starten
      const balken = reiterBox.querySelector('[aria-selected=true] i'); if (balken) { balken.style.animation = 'none'; void balken.offsetWidth; balken.style.animation = ''; }
      plane();
    };
    const weiter = () => { const d = daten.demo[b]; if (s < d.schritte.length - 1) s++; else { b = (b + 1) % daten.demo.length; s = -1; } zeige(); };
    const plane = () => { clearTimeout(uhr); if (!pause && imBild) uhr = setTimeout(weiter, s < 0 ? INTRO : TAKT); };
    const setzePause = (p) => { pause = p; demo.classList.toggle('pause', p); $('[data-symbol-pause]').toggleAttribute('hidden', p); $('[data-symbol-play]').toggleAttribute('hidden', !p); plane(); };
    reiterBox.addEventListener('click', (e) => { const x = e.target.closest('button'); if (!x) return; b = +x.dataset.i; s = -1; zeige(); });
    schritteBox.addEventListener('click', (e) => { const x = e.target.closest('button'); if (!x) return; s = +x.dataset.k; setzePause(true); zeige(); });
    mitte.addEventListener('click', (e) => { if (e.target.closest('[data-demo-start]')) { s = 0; zeige(); } });
    $('[data-demo-vor]').addEventListener('click', () => { b = (b + 1) % daten.demo.length; s = -1; zeige(); });
    $('[data-demo-zurueck]').addEventListener('click', () => { b = (b - 1 + daten.demo.length) % daten.demo.length; s = -1; zeige(); });
    $('[data-demo-pause]').addEventListener('click', () => setzePause(!pause));
    setzePause(pause);
    // Läuft nur, solange das Fenster im Bild ist; wächst beim Hereinscrollen (wie bei Salesforce)
    const demoScroll = () => {
      const r = demo.getBoundingClientRect(), h = innerHeight;
      const jetzt = r.top < h * 0.85 && r.bottom > h * 0.15;
      if (jetzt !== imBild) { imBild = jetzt; plane(); }
      const anteil = Math.min(1, Math.max(0, (h - r.top) / (h * 0.7)));
      demo.style.setProperty('--demo-s', (0.92 + 0.08 * anteil).toFixed(3));
    };
    addEventListener('scroll', demoScroll, { passive: true }); addEventListener('resize', demoScroll);
    zeige(); demoScroll();
  }

  // Kopf, Menü-Markierung, Parallax, Einblenden – per Scroll-Prüfung (zuverlässig auch in Safari)
  const kopf = $('#kopf');
  const spy = [...$$('[data-spy]')].map((a) => ({ a, el: document.getElementById(a.dataset.spy) }));
  const reiheEls = [...$$('.wald .reihe')];
  const leise = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wartet = false;
  const pruefe = () => {
    wartet = false;
    const y = scrollY, h = innerHeight;
    kopf.classList.toggle('fest', y > 40);
    if (!leise && y < h * 1.2) reiheEls.forEach((r) => { r.style.transform = `translateY(${(y * r.dataset.tiefe).toFixed(1)}px)`; });
    $$('.enthuellen:not(.sichtbar)').forEach((el) => { if (el.getBoundingClientRect().top < h * 0.9) el.classList.add('sichtbar'); });
    let aktiv = null;
    spy.forEach(({ a, el }) => { if (el && el.getBoundingClientRect().top < h * 0.4) aktiv = a; });
    spy.forEach(({ a }) => a.classList.toggle('aktiv', a === aktiv));
  };
  addEventListener('scroll', () => { if (!wartet) { wartet = true; requestAnimationFrame(pruefe); } }, { passive: true });
  addEventListener('resize', pruefe);
  pruefe();
})();
