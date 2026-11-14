// Demo Entwurf 2: Programm-Oberfläche, die sich selbst bedient (Mauszeiger, Klicks, WhatsApp-Verlauf).
// Je Geschäftsfeld ein Ablauf (Szene). Inhalte sind Beispiele; Firmendaten (Telefon, WhatsApp) kommen aus #daten.
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

  // ---------- Szenen ----------
  const pfadStandard = ['Anfrage', 'Besichtigung', 'Angebot', 'Durchführung', 'Übergabe'];
  const SZENEN = [
    { name: 'Entrümpelung', icon: 'i-karton', intro: 'Keller voll?<br>Morgen wieder Platz.',
      info: 'Fotos per WhatsApp, kostenlose Besichtigung, Festpreis-Angebot – dann wird geräumt, fachgerecht entsorgt und besenrein übergeben.',
      nav: 'Aufträge', titel: 'Kellerräumung', unter: 'Auftrag 2026-114', pfad: pfadStandard,
      kunde: { kurz: 'FB', name: 'Familie Becker', ort: 'Freiburg-Herdern', felder: [['Objekt', 'Keller, ca. 15 m²'], ['Zugang', '1 Treppe, kein Aufzug'], ['Besichtigung', 'Do, 10:00 Uhr'], ['Kontakt', 'WhatsApp']] },
      messer: [['Volumen', 'ca. 8 m³', 70], ['Getrennt entsorgt', '100 %', 100]],
      reiter: ['Fotos', 'Angebot', 'Durchführung'],
      ansichten: [
        `<div class="box"><div class="box-kopf">Fotos vom Kunden <small data-fotozahl>3 Fotos · per WhatsApp</small></div><div class="fotoraster" data-fotos>${foto('voll1', 'Regal links', 'VORHER')}${foto('voll2', 'Hintere Ecke', 'VORHER')}${foto('voll3', 'Eingang', 'VORHER')}</div></div>`,
        `<div class="box angebot2"><div class="box-kopf" style="padding:0 0 10px;border:0"><span style="display:flex;align-items:center;gap:8px">${zeichenDunkel(26)} Angebot · Kellerräumung</span><span class="etikett gold" data-ang-status>Entwurf</span></div>
          <div class="a-zeile"><i>01</i><span>Räumung Kellerraum, ca. 15 m²</span><em>inklusive</em></div>
          <div class="a-zeile"><i>02</i><span>Möbel und Regale zerlegen, heraustragen</span><em>inklusive</em></div>
          <div class="a-zeile"><i>03</i><span>Abtransport, getrennte fachgerechte Entsorgung</span><em>inklusive</em></div>
          <div class="a-zeile"><i>04</i><span>Besenreine Übergabe</span><em>inklusive</em></div>
          <div class="a-summe"><b>Festpreis – keine Nachforderungen</b><button class="knopf2 gold" data-annehmen>Angebot annehmen</button></div>
          <div class="stempel2" data-stempel>ANGE-<br>NOMMEN<br>✓</div></div>`,
        `<div class="box"><div class="box-kopf">Räumung · Donnerstag <small>Team Julius</small></div><ul class="check2" data-check>
          ${[['Regale und Möbel zerlegt', '08:10'], ['Kartons und Säcke heraus', '09:05'], ['Getrennt: Holz, Metall, Elektro, Rest', '10:20'], ['Abtransport zur Entsorgung', '11:15'], ['Boden gefegt – besenrein', '11:40']].map(([t, z]) => `<li><i></i><span>${t}</span><time>${z}</time></li>`).join('')}</ul></div>`,
      ],
      ablauf: async (a) => {
        await a.nachricht('k', 'Hallo, unser Keller ist ca. 15 m² und ziemlich voll. Was würde das kosten?', '08:12', ['voll1', 'voll2', 'voll3', 'voll1']);
        await a.tippt(1200);
        await a.nachricht('j', 'Danke für die Fotos! Ich schaue es mir gern an – passt Donnerstag 10 Uhr?', '08:15');
        await a.schreibe('Passt, bis Donnerstag!'); await a.pfad(1);
        await a.reiter(1); await a.warte(900); await a.pfad(2);
        await a.klick('[data-annehmen]', (el) => { el.textContent = 'Angenommen ✓'; el.className = 'knopf2 ok2'; a.$('[data-ang-status]').className = 'etikett gruen'; a.$('[data-ang-status]').textContent = 'Angenommen'; a.$('[data-stempel]').classList.add('an'); });
        await a.warte(1200); await a.pfad(3); await a.reiter(2);
        await a.abhaken('[data-check] li');
        await a.pfad(5); await a.reiter(0);
        await a.ersetzeFotos(['leer1', 'leer2', 'leer1'], ['Regal links', 'Hintere Ecke', 'Eingang'], 'NACHHER');
        await a.nachricht('j', 'Fertig – Keller ist leer und besenrein. Fotos anbei.', '11:42', ['leer1', 'leer2']);
        await a.warte(2200);
      } },
    { name: 'Haushaltsauflösung', icon: 'i-haus', intro: 'Ein ganzer Haushalt.<br>Ein Ansprechpartner.',
      info: 'Raum für Raum geräumt. Persönliche Unterlagen, Fotos und Wertsachen legen wir beiseite und übergeben sie Ihnen.',
      nav: 'Aufträge', titel: 'Haushaltsauflösung 3 Zimmer', unter: 'Auftrag 2026-121', pfad: pfadStandard,
      kunde: { kurz: 'SK', name: 'Sabine K.', ort: 'Emmendingen', felder: [['Objekt', '3-Zimmer-Wohnung, 2. OG'], ['Zugang', 'Treppe, kein Aufzug'], ['Übergabe', 'an den Vermieter'], ['Schlüssel', 'bei Julius']] },
      messer: [['Fortschritt', '6 von 6 Räumen', 100], ['Beiseitegelegt', '4 Dinge', 100]],
      reiter: ['Räume', 'Beiseitegelegt'],
      ansichten: [
        `<div class="raeume">${['Wohnzimmer', 'Küche', 'Schlafzimmer', 'Bad', 'Flur', 'Keller'].map((r) => `<div class="box raum"><div class="fring" data-ring>0%</div><div><b>${r}</b><small data-rs>wartet</small></div></div>`).join('')}</div>
         <div class="box" style="margin-top:10px"><div class="box-kopf">Ansicht vor der Auflösung <small>Besichtigung Mo</small></div><div class="fotoraster">${foto('zimmer', 'Wohnzimmer')}${foto('voll2', 'Keller')}${foto('voll3', 'Flur')}</div></div>`,
        `<div class="box"><div class="box-kopf">Für Sie beiseitegelegt <small>wird bei Übergabe ausgehändigt</small></div><ul class="beiseite" data-beiseite style="list-style:none;margin:0;padding:0"></ul></div>`,
      ],
      ablauf: async (a) => {
        await a.nachricht('k', 'Wir müssen die Wohnung meiner Mutter auflösen. 3 Zimmer, 2. Stock ohne Aufzug.', '17:02');
        await a.tippt(1200);
        await a.nachricht('j', 'Das tut mir leid. Ich nehme Ihnen das gern ab. Montag 16:30 Besichtigung?', '17:06');
        await a.schreibe('Ja, danke. Bitte Fotos und Unterlagen aufheben.'); await a.pfad(1); await a.warte(500); await a.pfad(3);
        const ringe = a.$$('[data-ring]'), status = a.$$('[data-rs]');
        for (let i = 0; i < ringe.length; i++) {
          await a.zeige(ringe[i]); ringe[i].style.setProperty('--p', 100); status[i].textContent = 'geräumt ✓';
          let n = 0; const t = setInterval(() => { n = Math.min(100, n + 10); ringe[i].textContent = `${n}%`; if (n >= 100) clearInterval(t); }, 70);
          await a.warte(450);
        }
        await a.reiter(1);
        const liste = a.$('[data-beiseite]');
        for (const [e, t, z] of [['📷', 'Fotoalben (3)', 'Schlafzimmer'], ['📁', 'Ordner mit Dokumenten', 'Wohnzimmer'], ['💍', 'Schmuckkästchen', 'Schlafzimmer'], ['✉️', 'Briefe und Postkarten', 'Flur']]) {
          liste.insertAdjacentHTML('beforeend', `<li class="neu"><i>${e}</i><span style="flex:1"><b style="font-weight:600">${t}</b><br><small style="color:#8A928C">gefunden: ${z}</small></span><span class="etikett gold">beiseitegelegt</span></li>`);
          await a.warte(550);
        }
        await a.pfad(5);
        await a.nachricht('j', 'Wohnung ist leer und besenrein. Die Fotoalben und Unterlagen bringe ich Ihnen vorbei.', '15:20');
        await a.warte(2200);
      } },
    { name: 'Hausmeisterservice', icon: 'i-werkzeug', intro: 'Ihr Haus<br>in festen Händen.',
      info: 'Fester Turnus, Kontrollgänge, Mülltonnen, kleine Handgriffe und Winterdienst – Meldungen kommen sofort per WhatsApp.',
      nav: 'Objekte', titel: 'Wohnanlage Lindenweg 12', unter: '8 Parteien · Hausmeisterservice', pfad: ['Vertrag', 'Wochenplan', 'Kontrollgang', 'Meldung', 'Erledigt'],
      kunde: { kurz: 'HV', name: 'Hausverwaltung', ort: 'Denzlingen', felder: [['Objekt', 'MFH, 8 Parteien'], ['Turnus', 'wöchentlich'], ['Winterdienst', 'ab 6:30 Uhr'], ['Meldungen', 'per WhatsApp']] },
      messer: [['Kontrollgänge November', '4 von 4', 100], ['Offene Meldungen', '0', 100]],
      reiter: ['Wochenplan', 'Meldungen'],
      ansichten: [
        `<div class="box"><div class="box-kopf">Woche 47 <small>17.–21. November</small></div><div class="woche" data-woche>
          <div class="kt"></div>${['Mo', 'Di', 'Mi', 'Do', 'Fr'].map((d) => `<div class="kt">${d}</div>`).join('')}
          ${['07:00', '10:00', '15:00'].map((z) => `<div class="zt">${z}</div>${'<div></div>'.repeat(5)}`).join('')}</div></div>`,
        `<div class="box"><div class="box-kopf">Meldungen <small>Lindenweg 12</small></div>
          <div class="meldung" data-meldung><div class="mini" data-mini>${SZ.lampeAus}</div><div><b>Licht Treppenhaus 2. OG defekt</b><small>gemeldet von Mieterin, 2. OG · heute 07:48</small></div><span class="etikett rot" data-mstatus>Offen</span></div>
          <div class="meldung"><div class="mini">${SZ.leer2}</div><div><b>Kellertür schließt nicht richtig</b><small>Kontrollgang · Mi</small></div><span class="etikett gruen">Erledigt</span></div>
          <div class="meldung"><div class="mini">${SZ.heckeGerade}</div><div><b>Laub am Eingang</b><small>Kontrollgang · Fr</small></div><span class="etikett gruen">Erledigt</span></div></div>`,
      ],
      ablauf: async (a) => {
        await a.pfad(1);
        const zellen = a.$$('[data-woche]>div:not(.kt):not(.zt)');
        for (const [i, typ, t] of [[0, 'a', 'Mülltonnen raus'], [6, 'b', 'Kontrollgang'], [1, 'a', 'Mülltonnen rein'], [12, 'c', 'Treppenhaus prüfen'], [4, 'b', 'Außenanlage'], [14, 'c', 'Winterdienst-Check']]) {
          zellen[i].insertAdjacentHTML('beforeend', `<span class="ev ${typ}">${t}</span>`); await a.warte(380);
        }
        await a.pfad(2);
        await a.nachricht('k', 'Hallo Julius, im 2. OG ist das Licht im Treppenhaus aus.', '07:49');
        await a.reiter(1); await a.pfad(3);
        await a.tippt(1000);
        await a.nachricht('j', 'Danke für die Info – ich bin um 10 Uhr sowieso im Haus und kümmere mich drum.', '07:52');
        await a.warte(800);
        await a.klick('[data-meldung]', () => { a.$('[data-mini]').innerHTML = SZ.lampeAn; const s = a.$('[data-mstatus]'); s.className = 'etikett gruen'; s.textContent = 'Erledigt'; });
        await a.pfad(5);
        await a.nachricht('j', 'Leuchtmittel im 2. OG gewechselt, Licht geht wieder ✓', '10:14', ['lampeAn']);
        await a.warte(2200);
      } },
    { name: 'Garten & Grünflächen', icon: 'i-laub', intro: 'Gepflegt.<br>Das ganze Jahr.',
      info: 'Rasen, Hecken, Beete, Laub und Winterdienst – nach einem festen Pflegeplan. Grünschnitt nehmen wir gleich mit.',
      nav: 'Objekte', titel: 'Grundstückspflege', unter: 'Pflegevertrag 2027', pfad: ['Anfrage', 'Besichtigung', 'Pflegeplan', 'Pflege', 'Laufend'],
      kunde: { kurz: 'MW', name: 'Familie Wagner', ort: 'Gundelfingen', felder: [['Rasen', 'ca. 200 m²'], ['Hecke', 'ca. 25 m'], ['Turnus', 'alle 2 Wochen'], ['Grünschnitt', 'wird mitgenommen']] },
      messer: [['Pflegetermine 2027', '18 geplant', 72], ['Grünschnitt entsorgt', 'inklusive', 100]],
      reiter: ['Jahresplan', 'Vorher / Nachher'],
      ansichten: [
        `<div class="kpis"><div class="box kpi"><small>Rasenfläche</small><b>200</b><em>m²</em></div><div class="box kpi"><small>Hecke</small><b>25</b><em>m</em></div><div class="box kpi"><small>Nächster Termin</small><b>Di</b><em>08:00 Uhr</em></div></div>
         <div class="box" style="margin-top:10px"><div class="box-kopf">Pflegeplan 2027 <small>Beispiel</small></div><div class="jahr" style="padding:4px 14px 10px">
          <div class="m"></div>${'JFMAMJJASOND'.split('').map((m) => `<div class="m">${m}</div>`).join('')}
          ${[['Rasen mähen', [[3, 10, '#2F5A44', 'alle 2 Wochen']]], ['Heckenschnitt', [[5, 6, '#4F7E48', 'Juni'], [8, 9, '#4F7E48', 'Sept']]], ['Beete & Unkraut', [[2, 9, '#B98A3E', 'monatlich']]], ['Laub', [[9, 11, '#8A6420', 'Herbst']]], ['Winterdienst', [[0, 2, '#5B7DA3', 'bei Schnee'], [11, 12, '#5B7DA3', '']]]]
            .map(([n, bs]) => `<div class="n">${n}</div><div class="spur">${bs.map(([von, bis, farbe, t]) => `<div class="balken" style="left:${von / 12 * 100}%;width:${(bis - von) / 12 * 100}%;background:${farbe}">${t}</div>`).join('')}</div>`).join('')}
         </div></div>`,
        `<div class="box"><div class="box-kopf">Heckenschnitt Juni <small>Fotos per WhatsApp</small></div><div class="fotoraster" style="grid-template-columns:1fr 1fr">${foto('heckeWild', 'Vorher', 'VORHER')}${foto('heckeGerade', 'Nachher', 'NACHHER')}</div></div>`,
      ],
      ablauf: async (a) => {
        await a.nachricht('k', 'Hallo, wir suchen jemanden für Rasen und Hecke – regelmäßig. Geht das?', '18:30', ['heckeWild']);
        await a.tippt(1000);
        await a.nachricht('j', 'Klar! Ich mache Ihnen einen Pflegeplan fürs ganze Jahr – Grünschnitt nehme ich gleich mit.', '18:34');
        await a.pfad(1); await a.warte(400); await a.pfad(2);
        for (const b of a.$$('.balken')) { b.classList.add('an'); await a.warte(260); }
        await a.zeige(a.$$('.balken')[2]); await a.warte(900);
        await a.pfad(3); await a.reiter(1); await a.warte(900);
        await a.nachricht('j', 'Hecke ist geschnitten, Grünschnitt ist weg. Nächster Termin Dienstag.', '16:05', ['heckeGerade']);
        await a.pfad(5); await a.warte(2200);
      } },
  ];

  // ---------- Grundgerüst ----------
  wurzel.innerHTML = `<div class="d2-leiste"><div class="d2-reiter" role="tablist" aria-label="Geschäftsfelder">${SZENEN.map((s, i) => `<button type="button" role="tab" data-i="${i}"><span class="rk">${ic(s.icon)}</span>${s.name}<span class="lauf"></span></button>`).join('')}</div>
    <div class="d2-steuer"><button type="button" class="d2-rund" data-zur aria-label="Zurück"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9l-7 7 7 7"/></svg></button>
    <button type="button" class="d2-rund" data-vor aria-label="Weiter"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 9l7 7-7 7"/></svg></button>
    <button type="button" class="d2-rund" data-pause aria-label="Anhalten"><svg viewBox="0 0 32 32" fill="currentColor" data-sp><rect x="10" y="9" width="4" height="14" rx="1"/><rect x="18" y="9" width="4" height="14" rx="1"/></svg><svg viewBox="0 0 32 32" fill="currentColor" data-sy style="display:none"><path d="M11 8l13 8-13 8z"/></svg></button>
    <a class="d2-cta" href="#kontakt">Angebot anfragen</a></div></div>
    <div class="d2-buehne" data-buehne><div class="d2-skala" data-skala></div>
      <button type="button" class="d2-details" data-details>Details</button><div class="d2-info" data-info></div></div>`;
  const buehne = wurzel.querySelector('[data-buehne]'), skala = wurzel.querySelector('[data-skala]');
  const reiterKn = [...wurzel.querySelectorAll('.d2-reiter button')];

  // Skalierung: Designgröße 1140×680 (breit) bzw. 600×860 (Handy, einspaltig)
  let B = 1140, H = 680, faktor = 1;
  const passe = () => {
    const w = buehne.clientWidth;
    const schmal = w < 700;
    B = schmal ? 440 : 1140; H = schmal ? 780 : 680;
    skala.classList.toggle('schmal', schmal);
    skala.style.width = `${B}px`; skala.style.height = `${H}px`;
    faktor = w / B; skala.style.transform = `scale(${faktor})`; buehne.style.height = `${H * faktor}px`;
  };

  const appHTML = (s) => `<div class="app">
    <div class="app-kopf"><div class="app-logo">${zeichenDunkel(28)}TANNEBERGER</div>
      <div class="app-suche"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="14" cy="14" r="8"/><path d="M20 20l7 7"/></svg>Auftrag, Kunde oder Adresse suchen …</div>
      <div class="app-icons"><span class="glocke">${ic('i-mail')}<b>1</b></span>${ic('i-tel')}<span class="app-avatar">J</span></div></div>
    <div class="app-nav">${['Übersicht', 'Aufträge', 'Objekte', 'Termine', 'Nachrichten'].map((n) => `<span class="${n === s.nav ? 'an' : ''}">${n}</span>`).join('')}</div>
    <div class="app-pfad"><div class="titel"><small>${s.unter}</small><b>${s.titel}</b></div><div class="pfad">${s.pfad.map((p) => `<i>${p}</i>`).join('')}</div></div>
    <div class="app-body">
      <aside class="karte"><div class="kk-kopf"><i>${s.kunde.kurz}</i><div><b>${s.kunde.name}</b><small>${s.kunde.ort}</small></div></div>
        <dl>${s.kunde.felder.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
        <div class="messer">${s.messer.map(([a, b, w]) => `<div><span>${a}</span><b>${b}</b><s data-w="${w}"></s></div>`).join('')}</div></aside>
      <main class="flaeche"><div class="reiter2">${s.reiter.map((r, i) => `<span class="${i ? '' : 'an'}">${r}</span>`).join('')}</div>
        <div class="ansicht">${s.ansichten.map((v, i) => `<div class="${i ? '' : 'an'}">${v}</div>`).join('')}</div></main>
      <aside class="wa"><div class="wa-kopf"><i>${zeichen(26)}</i><div><b>Julius · Tanneberger</b><small>online</small></div></div>
        <div class="wa-verlauf" data-verlauf></div><div class="wa-eingabe"><span data-eingabe></span><b><svg viewBox="0 0 32 32" fill="currentColor"><path d="M5 27l23-11L5 5l3 9 12 2-12 2z"/></svg></b></div></aside>
    </div></div>
    <div class="d2-intro" data-intro><div><div class="marke2"><i>${ic(s.icon)}</i>${s.name}</div><h3>${s.intro}</h3><button type="button" data-start>Ablauf ansehen</button></div></div>
    <svg class="zeiger" data-zeiger viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.4-7.6L21 11z" fill="#fff" stroke="#152C22" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

  // ---------- Ablauf-Steuerung ----------
  let nr = 0, lauf = 0, pause = leise;
  // Sichtbarkeit direkt prüfen (Scroll-Ereignisse kommen in Safari nicht immer zuverlässig)
  const sichtbar = () => { const r = wurzel.getBoundingClientRect(), h = innerHeight; return r.top < h * .8 && r.bottom > h * .2; };
  const ABBRUCH = Symbol('abbruch');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const werkzeug = (meinLauf) => {
    const $ = (s) => skala.querySelector(s), $$ = (s) => [...skala.querySelectorAll(s)];
    const pruef = () => { if (meinLauf !== lauf) throw ABBRUCH; };
    const warte = async (ms) => {
      let rest = ms;
      while (rest > 0) { pruef(); if (pause || !sichtbar()) { await sleep(200); continue; } await sleep(Math.min(100, rest)); rest -= 100; }
      pruef();
    };
    const zeiger = () => $('[data-zeiger]');
    const zeige = async (el) => {
      if (typeof el === 'string') el = $(el);
      const r = el.getBoundingClientRect(), s = skala.getBoundingClientRect();
      const x = (r.left - s.left + r.width * .6) / faktor, y = (r.top - s.top + r.height * .55) / faktor;
      zeiger().style.transform = `translate(${x}px,${y}px)`; await warte(950);
    };
    const klick = async (sel, tat) => {
      const el = typeof sel === 'string' ? $(sel) : sel;
      await zeige(el); const z = zeiger(); z.classList.remove('klick'); void z.offsetWidth; z.classList.add('klick');
      el.classList.add('gedrueckt'); await warte(180); el.classList.remove('gedrueckt'); if (tat) tat(el); await warte(350);
    };
    const verlauf = () => $('[data-verlauf]');
    const nachricht = async (von, text, uhr, fotos) => {
      const t = verlauf().querySelector('.tippt'); if (t) t.remove();
      verlauf().insertAdjacentHTML('beforeend', `<div class="bl ${von}">${fotos ? `<div class="fotos2">${fotos.map((x) => `<div>${SZ[x]}</div>`).join('')}</div>` : ''}${text}<small class="${von === 'k' ? 'blau' : ''}">${uhr}</small></div>`);
      const v = verlauf(); while (v.children.length > 5) v.firstElementChild.remove();
      await warte(1100);
    };
    const tippt = async (ms) => { verlauf().insertAdjacentHTML('beforeend', '<div class="tippt"><i></i><i></i><i></i></div>'); await warte(ms); };
    const schreibe = async (text) => {
      const e = $('[data-eingabe]'); await zeige(e);
      for (const ch of text) { e.textContent += ch; await warte(35); }
      await warte(250); e.textContent = ''; await nachricht('k', text, 'jetzt');
    };
    const pfad = async (n) => { $$('.pfad i').forEach((p, i) => { p.className = i < n ? 'ok' : i === n ? 'jetzt' : ''; }); fortschritt(); await warte(300); };
    const reiter = async (n) => {
      const r = $$('.reiter2 span')[n]; await klick(r);
      $$('.reiter2 span').forEach((x, i) => x.classList.toggle('an', i === n));
      $$('.ansicht>div').forEach((x, i) => x.classList.toggle('an', i === n)); await warte(500);
    };
    const abhaken = async (sel) => { for (const li of $$(sel)) { await zeige(li.querySelector('i')); li.classList.add('ok'); await warte(150); } await warte(400); };
    const ersetzeFotos = async (szenen, texte, ecke) => {
      const box = $('[data-fotos]');
      box.innerHTML = szenen.map((s, i) => foto(s, texte[i], ecke)).join('');
      box.querySelectorAll('.foto').forEach((x, i) => { x.classList.add('neu'); x.style.animationDelay = `${i * 150}ms`; });
      $('[data-fotozahl]').textContent = '3 Fotos · nach der Räumung'; await warte(1400);
    };
    return { $, $$, warte, zeige, klick, nachricht, tippt, schreibe, pfad, reiter, abhaken, ersetzeFotos };
  };

  const fortschritt = () => {
    const ok = skala.querySelectorAll('.pfad i.ok').length, ges = skala.querySelectorAll('.pfad i').length || 1;
    const k = reiterKn[nr]; if (k) k.style.setProperty('--lauf', (ok / (ges - 1 || 1)).toFixed(2));
    k && (k.querySelector('.lauf').style.transition = 'transform .6s');
  };

  const starte = async (i, mitIntro = true) => {
    nr = (i + SZENEN.length) % SZENEN.length; const meinLauf = ++lauf;
    const s = SZENEN[nr];
    reiterKn.forEach((k, j) => { k.setAttribute('aria-selected', j === nr); k.style.setProperty('--lauf', 0); });
    const aktiv = reiterKn[nr]; aktiv.parentElement.scrollLeft = aktiv.offsetLeft - 10;
    skala.innerHTML = appHTML(s);
    wurzel.querySelector('[data-info]').innerHTML = `<b>${s.name}</b>${s.info}`;
    const zg = skala.querySelector('[data-zeiger]'); zg.style.transition = 'none'; zg.style.transform = `translate(${B * .55}px,${H * .8}px)`; void zg.offsetWidth; zg.style.transition = '';
    skala.querySelectorAll('.messer s').forEach((x) => x.style.setProperty('--w', '0%'));
    const a = werkzeug(meinLauf);
    try {
      if (mitIntro) await a.warte(2400);
      skala.querySelector('[data-intro]').classList.add('weg');
      skala.querySelectorAll('.messer s').forEach((x) => x.style.setProperty('--w', `${x.dataset.w}%`));
      await a.warte(500);
      await s.ablauf(a);
      starte(nr + 1);
    } catch (e) { if (e !== ABBRUCH) throw e; }
  };

  // Bedienung
  wurzel.querySelector('.d2-reiter').addEventListener('click', (e) => { const k = e.target.closest('button'); if (k) starte(+k.dataset.i); });
  wurzel.querySelector('[data-vor]').addEventListener('click', () => starte(nr + 1));
  wurzel.querySelector('[data-zur]').addEventListener('click', () => starte(nr - 1));
  skala.addEventListener('click', (e) => { if (e.target.closest('[data-start]')) starte(nr, false); });
  const setzePause = (p) => {
    pause = p; wurzel.querySelector('[data-sp]').style.display = p ? 'none' : ''; wurzel.querySelector('[data-sy]').style.display = p ? '' : 'none';
    wurzel.querySelector('[data-pause]').setAttribute('aria-label', p ? 'Abspielen' : 'Anhalten');
  };
  wurzel.querySelector('[data-pause]').addEventListener('click', () => setzePause(!pause));
  wurzel.querySelector('[data-details]').addEventListener('click', () => wurzel.querySelector('[data-info]').classList.toggle('an'));

  // Läuft nur sichtbar; Rahmen wächst und hebt sich beim Hereinscrollen
  const scroll = () => {
    const r = wurzel.getBoundingClientRect(), h = innerHeight;
    const t = Math.min(1, Math.max(0, (h - r.top) / (h * .75)));
    wurzel.style.setProperty('--d2-s', (0.9 + 0.1 * t).toFixed(3));
    wurzel.style.setProperty('--d2-y', ((1 - t) * 60).toFixed(1));
  };
  addEventListener('scroll', scroll, { passive: true });
  addEventListener('resize', () => { passe(); scroll(); });
  passe(); setzePause(pause); scroll(); starte(0);
})();
