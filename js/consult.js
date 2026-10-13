/* Boekingsflow gratis consult, powered by Mettafel.
   Drie stappen: vorm, dag en tijd, gegevens. Bezette tijden komen van de server.
   Fail-open: lukt het niet om de server te bereiken (of staat de site op een
   statische host), dan blijft het gewone aanvraagformulier staan dat een mail opbouwt. */
(function () {
  'use strict';
  var boek = document.querySelector('[data-boek]');
  var terugval = document.querySelector('[data-terugval]');
  if (!boek) return;
  var form = boek.querySelector('[data-boek-form]');
  var zij = document.querySelector('[data-samenvatting]');
  var powered = document.querySelector('[data-powered]');
  var MAIL = 'info@vanderwerffcontrolling.nl';
  var VORM = { video: 'Online videogesprek', telefoon: 'Telefonisch' };
  var ONDERWERP = { uitbesteden: 'Boekhouding uitbesteden', aangifte: 'Aangifte inkomstenbelasting', financiering: 'Financiering', anders: 'Anders' };
  var staat = { vorm: '', datum: '', tijd: '', onderwerp: '' };
  var cfg = null;
  var stap = 1;

  /* ---------- datums, altijd als JJJJ-MM-DD rekenen (geen tijdzonegedoe) ---------- */
  var plus = function (d, n) { var x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  var dagVan = function (d) { return new Date(d + 'T12:00:00Z').getUTCDay(); };
  var mooi = function (d, opts) { return new Date(d + 'T12:00:00Z').toLocaleDateString('nl-NL', Object.assign({ timeZone: 'UTC' }, opts)); };
  var lang = function (d) { return mooi(d, { weekday: 'long', day: 'numeric', month: 'long' }); };
  var eindTijd = function (t) { var m = +t.slice(0, 2) * 60 + +t.slice(3) + cfg.duurMinuten; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  /* ---------- samenvatting ---------- */
  function zetSv(sleutel, tekst) {
    var el = document.querySelector('[data-sv="' + sleutel + '"]');
    if (!el) return;
    el.textContent = tekst || 'Nog niet gekozen';
    el.classList.toggle('leeg', !tekst);
  }
  function verversSv() {
    zetSv('vorm', VORM[staat.vorm]);
    zetSv('datum', staat.datum ? lang(staat.datum) : '');
    zetSv('tijd', staat.tijd ? staat.tijd + ' tot ' + eindTijd(staat.tijd) + ' uur' : '');
    zetSv('onderwerp', staat.onderwerp);
  }

  /* ---------- fouten bij het veld ---------- */
  function fout(naam, tekst) {
    var p = form.querySelector('[data-fout-voor="' + naam + '"]');
    if (p) p.textContent = tekst || '';
    var veld = form.querySelector('[name="' + naam + '"]');
    if (veld && veld.closest('.veld')) veld.closest('.veld').classList.toggle('fout', !!tekst);
    if (veld) { if (tekst) veld.setAttribute('aria-invalid', 'true'); else veld.removeAttribute('aria-invalid'); }
  }

  /* ---------- stappen ---------- */
  function toonStap(n) {
    stap = n;
    form.querySelectorAll('[data-stap]').forEach(function (s) { s.hidden = +s.dataset.stap !== n; });
    boek.querySelectorAll('[data-stapper]').forEach(function (li) {
      var i = +li.dataset.stapper;
      li.classList.toggle('actief', i === n);
      li.classList.toggle('klaar', i < n);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    var kop = form.querySelector('[data-stap="' + n + '"] h2');
    if (kop) kop.focus({ preventScroll: true });
    var top = boek.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * .5) boek.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function stapGoed(n) {
    if (n >= 1 && !staat.vorm) { fout('vorm', 'Kies of je een videogesprek wilt of liever belt.'); return 1; }
    if (n >= 2 && (!staat.datum || !staat.tijd)) { fout('tijd', staat.datum ? 'Kies een tijd.' : 'Kies een dag en een tijd.'); return 2; }
    return 0;
  }
  form.addEventListener('click', function (e) {
    var k = e.target.closest('[data-naar]');
    if (!k) return;
    var doel = +k.dataset.naar;
    if (doel > stap) { var mis = stapGoed(doel - 1); if (mis) { if (mis !== stap) toonStap(mis); return; } }
    toonStap(doel);
  });

  /* stap 1: vorm */
  form.querySelectorAll('input[name="vorm"]').forEach(function (r) {
    r.addEventListener('change', function () { staat.vorm = r.value; fout('vorm', ''); verversSv(); });
  });

  /* stap 2: dagen en tijden */
  var dagenEl = form.querySelector('[data-dagen]');
  var datumIn = form.querySelector('[data-datum]');
  var slotsEl = form.querySelector('[data-slots]');
  var statusEl = form.querySelector('[data-slots-status]');
  var kopEl = form.querySelector('[data-slots-kop]');

  function bouwDagen() {
    var d = cfg.vandaag, n = 0, html = '';
    for (var i = 0; n < 8 && i < cfg.dagenVooruit; i++, d = plus(cfg.vandaag, i)) {
      if (cfg.werkdagen.indexOf(dagVan(d)) === -1 || (cfg.gesloten || []).indexOf(d) !== -1) continue;
      var label = i === 0 ? 'Vandaag' : i === 1 ? 'Morgen' : mooi(d, { weekday: 'short' }).replace('.', '');
      html += '<button type="button" class="dag" data-dag="' + d + '" aria-pressed="false"><small>' + label + '</small><b>' + mooi(d, { day: 'numeric', month: 'short' }).replace('.', '') + '</b></button>';
      n++;
    }
    dagenEl.innerHTML = html;
    datumIn.min = cfg.vandaag;
    datumIn.max = plus(cfg.vandaag, cfg.dagenVooruit);
  }
  dagenEl.addEventListener('click', function (e) { var b = e.target.closest('[data-dag]'); if (b) kiesDatum(b.dataset.dag); });
  datumIn.addEventListener('change', function () { if (datumIn.value) kiesDatum(datumIn.value); });

  var verzoek = 0;
  function kiesDatum(d) {
    staat.datum = d; staat.tijd = '';
    fout('tijd', '');
    dagenEl.querySelectorAll('[data-dag]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.dag === d)); });
    if (datumIn.value !== d) datumIn.value = dagenEl.querySelector('[data-dag="' + d + '"]') ? '' : d;
    kopEl.textContent = 'Tijden op ' + lang(d);
    statusEl.textContent = 'Tijden laden...';
    slotsEl.innerHTML = '';
    verversSv();
    var mijn = ++verzoek;
    fetch('/api/consult/bezet?datum=' + encodeURIComponent(d), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (mijn !== verzoek) return;
        if (!j.open) { statusEl.textContent = j.reden || 'Op deze dag zijn er geen consulten.'; return; }
        var vrij = j.slots.filter(function (s) { return s.vrij; }).length;
        statusEl.textContent = vrij ? vrij + (vrij === 1 ? ' tijd' : ' tijden') + ' beschikbaar. Doorgestreept is al bezet.' : 'Alle tijden zijn bezet op deze dag. Kies een andere dag.';
        slotsEl.innerHTML = j.slots.map(function (s) {
          return '<button type="button" class="slot-knop" data-tijd="' + s.tijd + '" aria-pressed="false"' + (s.vrij ? '' : ' disabled aria-label="' + s.tijd + ', bezet"') + '>' + s.tijd + '</button>';
        }).join('');
      })
      .catch(function () { if (mijn === verzoek) statusEl.textContent = 'De tijden konden niet worden geladen. Probeer het opnieuw of bel Andries.'; });
  }
  slotsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tijd]');
    if (!b || b.disabled) return;
    staat.tijd = b.dataset.tijd;
    slotsEl.querySelectorAll('[data-tijd]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    fout('tijd', '');
    verversSv();
  });

  /* stap 3: gegevens en versturen */
  form.querySelectorAll('input[name="onderwerp"]').forEach(function (r) {
    r.addEventListener('change', function () { staat.onderwerp = r.value; fout('onderwerp', ''); verversSv(); });
  });
  function waarde(n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
  function controleerGegevens() {
    var f = {};
    if (!waarde('naam')) f.naam = 'Vul je naam in.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(waarde('email'))) f.email = waarde('email') ? 'Dit e-mailadres klopt nog niet helemaal.' : 'Vul je e-mailadres in, daar komt de bevestiging naartoe.';
    if (waarde('telefoon').replace(/\D/g, '').length < 10) f.telefoon = waarde('telefoon') ? 'Vul een telefoonnummer van minstens 10 cijfers in.' : 'Vul je telefoonnummer in.';
    if (!staat.onderwerp) f.onderwerp = 'Kies waar je het over wilt hebben.';
    ['naam', 'email', 'telefoon', 'onderwerp'].forEach(function (n) { fout(n, f[n]); });
    return f;
  }
  form.querySelectorAll('input[name="naam"], input[name="email"], input[name="telefoon"]').forEach(function (el) {
    el.addEventListener('blur', function () { if (el.closest('.fout')) controleerGegevens(); });
  });

  var melding = form.querySelector('[data-melding]');
  var knop = form.querySelector('[data-verstuur]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var mis = stapGoed(2);
    if (mis) { toonStap(mis); return; }
    var f = controleerGegevens();
    var eerste = Object.keys(f)[0];
    if (eerste) { var el = form.querySelector('[name="' + eerste + '"]'); if (el) el.focus(); return; }
    melding.hidden = true;
    knop.disabled = true;
    var body = {
      vorm: staat.vorm, datum: staat.datum, tijd: staat.tijd, onderwerp: staat.onderwerp,
      naam: waarde('naam'), email: waarde('email'), telefoon: waarde('telefoon'),
      bedrijf: waarde('bedrijf'), opmerking: waarde('opmerking'), website: waarde('website'),
    };
    fetch('/api/consult', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (res) {
        knop.disabled = false;
        if (res.j.ok) return klaar(body);
        if (res.status === 409) {
          toonStap(2);
          fout('tijd', res.j.fout);
          kiesDatumBehoud(staat.datum, res.j.fout);
          return;
        }
        if (res.j.velden) {
          Object.keys(res.j.velden).forEach(function (n) { fout(n, res.j.velden[n]); });
          if (res.j.velden.datum || res.j.velden.tijd) { toonStap(2); fout('tijd', res.j.velden.datum || res.j.velden.tijd); }
          return;
        }
        toonMelding(res.j.fout);
      })
      .catch(function () { knop.disabled = false; toonMelding(); });
  });
  function kiesDatumBehoud(d, tekst) { kiesDatum(d); fout('tijd', tekst); }
  function toonMelding(tekst) {
    var onderwerp = 'Aanvraag gratis consult, ' + waarde('naam');
    var mailBody = 'Hallo Andries,\n\nIk wil graag een gratis consult.\n\nVorm: ' + (VORM[staat.vorm] || '') + '\nDag: ' + (staat.datum ? lang(staat.datum) : '') + '\nTijd: ' + staat.tijd + '\nOnderwerp: ' + staat.onderwerp + '\nNaam: ' + waarde('naam') + '\nTelefoon: ' + waarde('telefoon') + '\nE-mail: ' + waarde('email') + (waarde('opmerking') ? '\nOpmerking: ' + waarde('opmerking') : '');
    melding.innerHTML = '';
    melding.append((tekst || 'Het versturen lukte niet.') + ' ');
    var a = document.createElement('a');
    a.className = 'tekstlink';
    a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(onderwerp) + '&body=' + encodeURIComponent(mailBody);
    a.textContent = 'Stuur je aanvraag per mail';
    melding.append(a);
    melding.hidden = false;
  }

  /* ---------- bevestiging en agenda-bestand ---------- */
  function klaar(b) {
    form.hidden = true;
    boek.querySelector('.stapper').hidden = true;
    var paneel = boek.querySelector('[data-klaar]');
    paneel.hidden = false;
    paneel.querySelector('[data-klaar-wat]').textContent = VORM[b.vorm] + ' op ' + lang(b.datum) + ' van ' + b.tijd + ' tot ' + eindTijd(b.tijd) + ' uur.';
    paneel.querySelector('[data-klaar-mail]').textContent = 'Andries bevestigt je afspraak per e-mail aan ' + b.email + '.';
    paneel.querySelector('[data-klaar-vorm]').textContent = b.vorm === 'video'
      ? 'In die mail staat de link voor het videogesprek. Je hoeft niets te installeren.'
      : 'Andries belt je op ' + b.telefoon + ' op het afgesproken tijdstip.';
    var ics = maakIcs(b);
    paneel.querySelector('[data-ics]').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    var kop = paneel.querySelector('h2'); kop.focus({ preventScroll: true });
    boek.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function maakIcs(b) {
    var start = b.datum.replace(/-/g, '') + 'T' + b.tijd.replace(':', '') + '00';
    var eind = b.datum.replace(/-/g, '') + 'T' + eindTijd(b.tijd).replace(':', '') + '00';
    var nu = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var beschrijving = (b.vorm === 'video' ? 'Online videogesprek. De link volgt per e-mail van Andries.' : 'Telefonisch. Andries belt je op ' + b.telefoon + '.') + ' Onderwerp: ' + b.onderwerp + '. Vragen: ' + MAIL;
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Van der Werff Controlling//Gratis consult//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Amsterdam',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT', 'UID:' + start + '-' + Math.random().toString(36).slice(2) + '@vanderwerffcontrolling.nl', 'DTSTAMP:' + nu,
      'DTSTART;TZID=Europe/Amsterdam:' + start, 'DTEND;TZID=Europe/Amsterdam:' + eind,
      'SUMMARY:Gratis consult met Andries van der Werff',
      'DESCRIPTION:' + beschrijving.replace(/[,;]/g, '\\$&'),
      'LOCATION:' + (b.vorm === 'video' ? 'Online videogesprek' : 'Telefonisch'),
      'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');
  }

  /* ---------- opstarten: werkt de server, dan de flow; anders blijft het formulier ---------- */
  fetch('/api/consult/instellingen', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (j) {
      if (!j.ok) throw new Error();
      cfg = j;
      bouwDagen();
      var o = new URLSearchParams(location.search).get('onderwerp');
      if (o && ONDERWERP[o.toLowerCase()]) {
        var r = form.querySelector('input[name="onderwerp"][value="' + ONDERWERP[o.toLowerCase()] + '"]');
        if (r) { r.checked = true; staat.onderwerp = r.value; }
      }
      boek.hidden = false;
      if (zij) zij.hidden = false;
      if (powered) powered.hidden = false;
      if (terugval) terugval.hidden = true;
      verversSv();
    })
    .catch(function () { /* fail-open: het aanvraagformulier blijft gewoon staan */ });
})();
