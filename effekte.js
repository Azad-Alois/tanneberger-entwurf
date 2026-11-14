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
  $('[data-anzahl-leistungen]').textContent = alleLeistungen.length;
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
  $('[data-anzahl-orte]').textContent = orte.length;
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
    const body = `Name: ${form.name.value}\nTelefon: ${form.telefon.value}\nE-Mail: ${form.email.value}\nOrt: ${form.ort.value}\nLeistung: ${form.leistung.value}\n\n${form.nachricht.value}`;
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
