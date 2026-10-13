/* main.js, deel 1: de motion- en interactielaag (assets/motion.js uit de skill).
   Aanpassingen voor deze site: tellers kunnen vanaf data-van tellen,
   het mobiele menu heeft een eigen sluitknop. Deel 2 (site-eigen) staat onderaan.

   Wat erin zit (alles vanilla, alles fail-open, alles uit bij reduced motion):
   - de vier vangnetten voor reveals uit reveal.js, met een slimmer vierde
   - stagger voor kinderen ([data-stagger], zet --i per kind)
   - scroll-voortgang: --scroll op <html>, --sectie-p per [data-sectie-p]
   - muis-parallax ([data-parallax] met [data-laag]-kinderen), alleen pointer: fine
   - 3D-kantel op hover ([data-kantel]), alleen pointer: fine
   - zwevende lagen ([data-zweef]) met een eigen fase per element
   - hero-opening ([data-hero]) en crossfade ([data-hero-dia])
   - header-schaduw en header die zich terugtrekt, mobiel menu, tellers,
     mobiele actiebalk, accordeon (ongewijzigd uit reveal.js)

   Uitgangspunt: zichtbaarheid hangt nooit van één mechanisme af.
   Gaat JavaScript stuk, dan staat er gewoon een complete, leesbare site. */
(function () {
  'use strict';

  var html = document.documentElement;
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muis = window.matchMedia('(pointer: fine)').matches;

  /* ?foto=1 zet alles statisch neer, handig voor screenshots.
     De js-klasse is de schakelaar: zonder JavaScript blijft alles zichtbaar,
     want de verbergregels in CSS staan achter html.js:not(.klaar). */
  var foto = /[?&]foto=1/.test(location.search);
  if (!foto) html.classList.add('js');

  /* Geeft het script op (fout, of iets dat in beeld hoort te zijn blijft
     verborgen), dan zet .klaar alles zichtbaar. Liever een gemiste animatie
     dan een onzichtbare kop. */
  function geefOp() { html.classList.add('klaar'); }
  window.addEventListener('error', geefOp);
  window.addEventListener('beforeprint', geefOp);

  /* rAF-throttle: één uitvoering per frame, hoe vaak het event ook vuurt */
  function perFrame(fn) {
    var bezig = false;
    return function () {
      if (bezig) return;
      bezig = true;
      requestAnimationFrame(function () { bezig = false; fn(); });
    };
  }

  /* ---------- Header ---------- */
  var balk = document.querySelector('[data-balk]');
  var vorigeY = 0;
  function balkStand() {
    if (!balk) return;
    var y = window.scrollY;
    balk.classList.toggle('zweeft', y > 10);
    /* trekt zich terug bij scrollen omlaag voorbij 700 px, komt terug bij omhoog */
    if (balk.hasAttribute('data-balk-verstopt')) {
      var menuOpen = document.body.classList.contains('menu-open');
      balk.classList.toggle('verstopt', y > 700 && y > vorigeY && !menuOpen);
    }
    vorigeY = y;
  }
  window.addEventListener('scroll', perFrame(balkStand), { passive: true });
  balkStand();

  /* ---------- Mobiel menu ---------- */
  var knop = document.querySelector('[data-menuknop]');
  var menu = document.querySelector('[data-menu]');
  if (knop && menu) {
    var sluit = function () {
      knop.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    };
    knop.addEventListener('click', function () {
      var open = knop.getAttribute('aria-expanded') === 'true';
      if (open) { sluit(); return; }
      knop.setAttribute('aria-expanded', 'true');
      menu.classList.add('open');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    });
    menu.querySelectorAll('a, [data-menusluit]').forEach(function (a) {
      a.addEventListener('click', sluit);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sluit();
    });
  }

  /* ---------- Tellers ----------
     De eindwaarde staat in de HTML. De animatie telt er alleen naartoe,
     dus draait de animatie niet, dan staat het juiste getal er gewoon. */
  function tel(el) {
    if (el.dataset.geteld) return;
    el.dataset.geteld = '1';
    var doelTekst = el.dataset.tel;
    var doel = parseFloat(doelTekst.replace(',', '.'));
    if (isNaN(doel)) return;
    var komma = doelTekst.indexOf(',') !== -1;
    if (kalm) { el.textContent = doelTekst; return; }
    var start = null;
    var duur = 1600;
    var van = parseFloat(el.dataset.van || '0');
    function stapje(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / duur, 1);
      var z = 1 - Math.pow(1 - p, 3);
      var n = van + (doel - van) * z;
      el.textContent = komma ? n.toFixed(1).replace('.', ',') : Math.round(n);
      if (p < 1) requestAnimationFrame(stapje);
      else el.textContent = doelTekst;
    }
    requestAnimationFrame(stapje);
  }

  /* ---------- Stagger: --i per kind ----------
     De CSS vertraagt elk kind met --i keer --stap. Hier alleen nummeren. */
  document.querySelectorAll('[data-stagger]').forEach(function (ouder) {
    [].slice.call(ouder.children).forEach(function (kind, i) {
      kind.style.setProperty('--i', i);
    });
  });
  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    hero.querySelectorAll('[data-hero-item]').forEach(function (item, i) {
      if (!item.style.getPropertyValue('--i')) item.style.setProperty('--i', i);
    });
  });

  /* ---------- Reveals, fail-open ----------
     Vier vangnetten:
     1. controle direct bij laden (alles binnen beeld verschijnt meteen)
     2. controle bij scroll, resize, load en pageshow
     3. IntersectionObserver waar beschikbaar
     4. een waakhond: elke 800 ms een rect-controle (vangt gemiste
        scroll-events), en na 1,2 s de toets of iets dat in beeld hoort te
        zijn nog verborgen is. Zo ja, dan geeft het script op en toont
        .klaar alles.

     Verschil met reveal.js: dat toonde na 1,2 s hoe dan ook ALLES, ook
     onder de vouw, waardoor daar niets meer bewoog bij het scrollen. */
  var wachtend = [].slice.call(document.querySelectorAll('[data-rev]'));

  /* Na de reveal (600 ms plus maximaal 560 ms stagger) zet .af de
     reveal-transitie uit, zodat .lift en [data-kantel] hun eigen korte
     transitie terugkrijgen. */
  function rondAf(el) {
    setTimeout(function () { el.classList.add('af'); }, 1300);
  }

  function onthul(el) {
    el.classList.add('in');
    rondAf(el);
    [].slice.call(el.querySelectorAll('[data-tel]')).forEach(tel);
    if (el.hasAttribute('data-tel')) tel(el);
  }

  function inBeeld(el, grens) {
    var r = el.getBoundingClientRect();
    return r.top < grens && r.bottom > -40;
  }

  function controleer() {
    if (!wachtend.length) return;
    var grens = window.innerHeight * 0.92;
    wachtend = wachtend.filter(function (el) {
      if (inBeeld(el, grens)) { onthul(el); return false; }
      return true;
    });
  }

  /* Bij verminder-beweging draaien de reveals gewoon mee: de CSS maakt er
     dan zachte fades zonder verplaatsing van (de fade-variant). Alleen
     ?foto=1 zet alles direct neer. */
  if (foto) {
    wachtend.forEach(onthul);
    wachtend = [];
    geefOp();
  } else {
    var vraagControle = perFrame(controleer);
    window.addEventListener('scroll', vraagControle, { passive: true });
    window.addEventListener('resize', vraagControle, { passive: true });
    window.addEventListener('load', vraagControle);
    window.addEventListener('pageshow', vraagControle);

    if ('IntersectionObserver' in window) {
      var kijker = new IntersectionObserver(function (items) {
        items.forEach(function (it) {
          if (!it.isIntersecting) return;
          var i = wachtend.indexOf(it.target);
          if (i !== -1) wachtend.splice(i, 1);
          onthul(it.target);
          kijker.unobserve(it.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
      wachtend.forEach(function (el) { kijker.observe(el); });
    }

    controleer();

    /* Vangnet 4a: waakhond */
    var waakhond = setInterval(function () {
      controleer();
      if (!wachtend.length) clearInterval(waakhond);
    }, 800);

    /* Vangnet 4b: na 1,2 s mag niets dat in beeld staat nog verborgen zijn.
       Is dat toch zo, dan is er iets mis en tonen we alles. */
    setTimeout(function () {
      var vast = [].slice.call(document.querySelectorAll('[data-rev]:not(.in)'))
        .some(function (el) { return inBeeld(el, window.innerHeight); });
      if (vast) {
        document.querySelectorAll('[data-rev]:not(.in)').forEach(onthul);
        wachtend = [];
        geefOp();
      }
    }, 1200);
  }

  /* ---------- Hero-opening ----------
     .in binnen twee frames, en hoe dan ook na 400 ms. */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('in'); });
    });
    setTimeout(function () { hero.classList.add('in'); }, 400);
    rondAf(hero);

    /* crossfade van meerdere hero-beelden: het eerste staat al .aan in de HTML */
    var dias = hero.querySelectorAll('[data-hero-dia]');
    if (dias.length > 1 && !kalm) {
      var huidig = 0;
      dias[0].classList.add('aan');
      setInterval(function () {
        dias[huidig].classList.remove('aan');
        huidig = (huidig + 1) % dias.length;
        dias[huidig].classList.add('aan');
      }, 5000);
    }
  }

  /* ---------- Scroll-voortgang: --scroll en --sectie-p ----------
     --scroll (0 tot 1) op <html>: voor de voortgangsbalk.
     --sectie-p (0 tot 1) per [data-sectie-p]: 0 als de bovenkant net
     onderin beeld komt, 1 als de onderkant net bovenaan verdwijnt.
     Formule uit Bazen: (vh - top) / (vh + hoogte). */
  var secties = [].slice.call(document.querySelectorAll('[data-sectie-p]'));
  var balkje = document.querySelector('.scroll-balk');
  if (!kalm && (secties.length || balkje)) {
    var voortgang = function () {
      var vh = window.innerHeight;
      if (balkje) {
        var max = html.scrollHeight - html.clientHeight;
        html.style.setProperty('--scroll', max > 0 ? (html.scrollTop / max).toFixed(4) : 0);
      }
      secties.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;   /* ver buiten beeld: overslaan */
        var p = (vh - r.top) / (vh + r.height);
        p = Math.max(0, Math.min(1, p));
        el.style.setProperty('--sectie-p', p.toFixed(4));
      });
    };
    var vraagVoortgang = perFrame(voortgang);
    window.addEventListener('scroll', vraagVoortgang, { passive: true });
    window.addEventListener('resize', vraagVoortgang, { passive: true });
    window.addEventListener('load', vraagVoortgang);
    voortgang();
  }

  /* ---------- Tijdlijn: rechte lijn die zich bij scroll vult ----------
     --tl-p (0 tot 1) volgt een leeslijn op 62% van het scherm. Een stap
     krijgt .bereikt zodra de lijn zijn knoop passeert. Fail-open: zonder
     script of bij minder beweging staat de lijn vol en is elke knoop actief. */
  var tijdlijnen = [].slice.call(document.querySelectorAll('[data-tijdlijn]'));
  if (!kalm && tijdlijnen.length) {
    var smal = window.matchMedia('(max-width: 860px)');
    var tlStand = function () {
      var vh = window.innerHeight;
      tijdlijnen.forEach(function (tl) {
        var baan = tl.querySelector('.tl-baan');
        if (!baan) return;
        var b = baan.getBoundingClientRect();
        var verticaal = smal.matches;
        var p;
        if (verticaal) p = (vh * 0.62 - b.top) / Math.max(1, b.height);
        else p = (vh * 0.86 - b.top) / (vh * 0.4);
        p = Math.max(0, Math.min(1, p));
        tl.style.setProperty('--tl-p', p.toFixed(4));
        tl.querySelectorAll('.tl-stap').forEach(function (stap) {
          var k = stap.querySelector('.tl-knoop').getBoundingClientRect();
          var plek = verticaal ? (k.top + k.height / 2 - b.top) / Math.max(1, b.height)
                               : (k.left + k.width / 2 - b.left) / Math.max(1, b.width);
          stap.classList.toggle('bereikt', p >= Math.max(0, plek) - 0.001 && p > 0);
        });
      });
    };
    tijdlijnen.forEach(function (tl) { tl.classList.add('tl-js'); });
    var vraagTl = perFrame(tlStand);
    window.addEventListener('scroll', vraagTl, { passive: true });
    window.addEventListener('resize', vraagTl, { passive: true });
    window.addEventListener('load', vraagTl);
    tlStand();
  }

  /* ---------- Muis-parallax (alleen met muis) ----------
     Zet --mx en --my (van -1 tot 1) op de container. De CSS vermenigvuldigt
     per laag met --laag. De waarde loopt met een lerp van 0,08 achter de
     muis aan (Bazen) en de loop stopt zichzelf als hij stilstaat. */
  if (muis && !kalm) {
    document.querySelectorAll('[data-parallax]').forEach(function (zone) {
      var dx = 0, dy = 0, x = 0, y = 0, raf = null;
      var loop = function () {
        x += (dx - x) * 0.08;
        y += (dy - y) * 0.08;
        zone.style.setProperty('--mx', x.toFixed(3));
        zone.style.setProperty('--my', y.toFixed(3));
        if (Math.abs(dx - x) > 0.002 || Math.abs(dy - y) > 0.002) raf = requestAnimationFrame(loop);
        else raf = null;
      };
      var tik = function () { if (!raf) raf = requestAnimationFrame(loop); };
      zone.addEventListener('pointermove', function (e) {
        var r = zone.getBoundingClientRect();
        dx = ((e.clientX - r.left) / r.width) * 2 - 1;
        dy = ((e.clientY - r.top) / r.height) * 2 - 1;
        tik();
      });
      zone.addEventListener('pointerleave', function () { dx = 0; dy = 0; tik(); });
    });
  }

  /* ---------- 3D-kantel op hover (alleen met muis) ----------
     Maximaal --kantel-max graden (standaard 6). Tijdens het volgen staat
     .kantelt aan (korte transition), bij verlaten valt hij zacht terug. */
  if (muis && !kalm) {
    document.querySelectorAll('[data-kantel]').forEach(function (el) {
      var max = parseFloat(el.dataset.kantel) || 6;
      var raf = null, ex = 0, ey = 0;
      var zet = function () {
        raf = null;
        var r = el.getBoundingClientRect();
        var px = (ex - r.left) / r.width;      /* 0 tot 1 */
        var py = (ey - r.top) / r.height;
        el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      };
      el.addEventListener('pointerenter', function () { el.classList.add('kantelt'); });
      el.addEventListener('pointermove', function (e) {
        ex = e.clientX; ey = e.clientY;
        if (!raf) raf = requestAnimationFrame(zet);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('kantelt');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Zwevende lagen ----------
     Elk [data-zweef] krijgt .zweef plus een eigen fase en duur, zodat
     meerdere zwevers nooit in de maat bewegen. Deterministisch op index,
     dus bij elke lading hetzelfde. */
  if (!kalm) {
    document.querySelectorAll('[data-zweef]').forEach(function (el, i) {
      var afstand = parseFloat(el.dataset.zweef);
      if (!isNaN(afstand)) el.style.setProperty('--zweef-afstand', (-Math.abs(afstand)) + 'px');
      el.style.setProperty('--zweef-fase', (-(i * 1.3) % 6).toFixed(2) + 's');
      el.style.setProperty('--zweef-duur', (5.5 + (i % 3) * 0.8).toFixed(1) + 's');
      el.classList.add('zweef');
    });
  }

  /* ---------- Vaste actiebalk op mobiel ----------
     Verschijnt zodra de hero uit beeld is, verdwijnt bij de footer. */
  var actiebalk = document.querySelector('[data-mobielcta]');
  if (actiebalk && hero) {
    var toon = function () {
      var voorbij = hero.getBoundingClientRect().bottom < 0;
      var footer = document.querySelector('footer');
      var bijFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
      actiebalk.classList.toggle('zichtbaar', voorbij && !bijFooter);
    };
    window.addEventListener('scroll', perFrame(toon), { passive: true });
    window.addEventListener('resize', perFrame(toon), { passive: true });
    toon();
  }

  /* ---------- Accordeon (veelgestelde vragen) ---------- */
  document.querySelectorAll('[data-vouw]').forEach(function (kop) {
    kop.addEventListener('click', function () {
      var open = kop.getAttribute('aria-expanded') === 'true';
      kop.setAttribute('aria-expanded', String(!open));
      var paneel = document.getElementById(kop.getAttribute('aria-controls'));
      if (paneel) paneel.hidden = open;
    });
  });
})();

/* ==========================================================================
   main.js, deel 2: site-eigen
   - het dashboard in de hero (bedragen tellen, staven groeien, btw-deadline)
   - grafieklijnen die zich tekenen
   - carrousels met knoppen
   - formulieren die een nette e-mail opbouwen (mailto)
   - jaartal in de footer
   Alles fail-open: zonder JavaScript staat de eindstand er gewoon.
   ========================================================================== */
(function () {
  'use strict';
  var kalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var MAANDEN_LANG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  var euro = function (n) { return '€ ' + Math.round(n).toLocaleString('nl-NL'); };

  /* jaartal */
  document.querySelectorAll('[data-jaar]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- btw-deadline: eerstvolgende kwartaalaangifte ---------- */
  function volgendeBtw(nu) {
    var vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    var j = vandaag.getFullYear();
    var lijst = [
      { d: new Date(j - 1, 9, 31), k: '3e kwartaal ' + (j - 1) },
      { d: new Date(j, 0, 31), k: '4e kwartaal ' + (j - 1) },
      { d: new Date(j, 3, 30), k: '1e kwartaal ' + j },
      { d: new Date(j, 6, 31), k: '2e kwartaal ' + j },
      { d: new Date(j, 9, 31), k: '3e kwartaal ' + j },
      { d: new Date(j + 1, 0, 31), k: '4e kwartaal ' + j }
    ];
    for (var i = 1; i < lijst.length; i++) {
      if (lijst[i].d >= vandaag) {
        var dagen = Math.round((lijst[i].d - vandaag) / 864e5);
        var totaal = Math.round((lijst[i].d - lijst[i - 1].d) / 864e5);
        return { datum: lijst[i].d, kwartaal: lijst[i].k, dagen: dagen, voortgang: 1 - dagen / totaal };
      }
    }
    return null;
  }
  var btw = volgendeBtw(new Date());
  if (btw) {
    var d = btw.datum;
    var tekstDatum = d.getDate() + ' ' + MAANDEN_LANG[d.getMonth()] + ' ' + d.getFullYear();
    var kort = btw.kwartaal.replace(/ \d{4}$/, '');
    var rest = (btw.dagen === 0 ? 'Vandaag' : btw.dagen === 1 ? 'Nog 1 dag' : 'Nog ' + btw.dagen + ' dagen') + ', ' + kort;
    document.querySelectorAll('[data-btw-datum]').forEach(function (el) { el.textContent = tekstDatum; });
    document.querySelectorAll('[data-btw-rest]').forEach(function (el) { el.textContent = rest; });
    document.querySelectorAll('[data-btw-balk]').forEach(function (el) { el.style.setProperty('--p', Math.max(6, Math.round(btw.voortgang * 100)) + '%'); });
    document.querySelectorAll('[data-btw-zin]').forEach(function (el) { el.textContent = tekstDatum; });
  }

  /* ---------- het dashboard ---------- */
  var dash = document.querySelector('[data-dash]');
  if (dash) {
    /* maandlabels: de laatste zes maanden tot en met nu */
    var nu = new Date();
    var labels = dash.querySelectorAll('[data-maanden] text');
    labels.forEach(function (t, i) {
      var m = (nu.getMonth() - (labels.length - 1 - i) + 12) % 12;
      t.textContent = MAANDEN[m];
    });
    var trend = dash.querySelector('.trend');
    if (trend && trend.getTotalLength) dash.style.setProperty('--len', Math.ceil(trend.getTotalLength()));

    var bedragen = [].slice.call(dash.querySelectorAll('[data-bedrag]'));
    var bouw = function () {
      dash.classList.add('gebouwd');
      if (kalm) return;
      var start = null, duur = 1500;
      var doelen = bedragen.map(function (el) { return parseFloat(el.dataset.bedrag); });
      bedragen.forEach(function (el) { el.textContent = euro(0); });
      var stap = function (t) {
        if (!start) start = t;
        var p = Math.min((t - start) / duur, 1);
        var z = 1 - Math.pow(1 - p, 3);
        bedragen.forEach(function (el, i) { el.textContent = euro(doelen[i] * z); });
        if (p < 1) requestAnimationFrame(stap);
        else bedragen.forEach(function (el, i) { el.textContent = euro(doelen[i]); });
      };
      requestAnimationFrame(stap);
    };
    setTimeout(bouw, kalm ? 0 : 450);
  }

  /* ---------- carrousels met knoppen (alleen zichtbaar op mobiel) ---------- */
  document.querySelectorAll('[data-carrousel]').forEach(function (rij) {
    var naam = rij.getAttribute('data-carrousel');
    var knoppen = document.querySelector('[data-carrousel-knoppen="' + naam + '"]');
    var teller = document.querySelector('[data-teller="' + naam + '"]');
    var kaarten = [].slice.call(rij.children);
    if (!kaarten.length) return;
    var stapBreedte = function () { return kaarten[0].getBoundingClientRect().width + 16; };
    var stand = function () {
      var max = rij.scrollWidth - rij.clientWidth - 4;
      if (knoppen) {
        knoppen.querySelector('[data-vorige]').disabled = rij.scrollLeft <= 4;
        knoppen.querySelector('[data-volgende]').disabled = rij.scrollLeft >= max;
      }
      if (teller) {
        var i = Math.min(kaarten.length, Math.round(rij.scrollLeft / stapBreedte()) + 1);
        teller.textContent = i + ' van ' + kaarten.length;
      }
    };
    if (knoppen) {
      knoppen.querySelector('[data-vorige]').addEventListener('click', function () { rij.scrollBy({ left: -stapBreedte(), behavior: kalm ? 'auto' : 'smooth' }); });
      knoppen.querySelector('[data-volgende]').addEventListener('click', function () { rij.scrollBy({ left: stapBreedte(), behavior: kalm ? 'auto' : 'smooth' }); });
    }
    rij.addEventListener('scroll', function () { requestAnimationFrame(stand); }, { passive: true });
    window.addEventListener('resize', stand, { passive: true });
    stand();
  });

  /* ---------- lange lijsten op mobiel dichtklappen (open staat in de HTML) ---------- */
  if (window.matchMedia('(max-width: 640px)').matches) {
    document.querySelectorAll('[data-mobiel-dicht] details[open]').forEach(function (d, i) { if (i > 0) d.open = false; });
  }

  /* ---------- formulieren: nette e-mail opbouwen ---------- */
  var MAIL = 'info@vanderwerffcontrolling.nl';
  var params = new URLSearchParams(location.search);

  function labelVan(el) {
    if (el.dataset.label) return el.dataset.label;
    var fs = el.closest('fieldset');
    if (el.type === 'radio' && fs) return fs.querySelector('legend').textContent.trim();
    var l = el.id && document.querySelector('label[for="' + el.id + '"]');
    return l ? l.textContent.replace(/\s*\(optioneel\)/, '').trim() : el.name;
  }
  function zetFout(veld, tekst) {
    var houder = veld.closest('.veld, fieldset');
    if (!houder) return;
    houder.classList.toggle('fout', !!tekst);
    var f = houder.querySelector('.veldfout');
    if (f) f.textContent = tekst || '';
    var invoer = houder.querySelectorAll('input, select, textarea');
    invoer.forEach(function (i) { if (tekst) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
  }
  function controleer(el) {
    if (el.type === 'radio') {
      var groep = el.form.querySelectorAll('input[name="' + el.name + '"]');
      var gekozen = [].some.call(groep, function (r) { return r.checked; });
      return el.required && !gekozen ? (el.closest('fieldset').dataset.fout || 'Maak een keuze.') : '';
    }
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.dataset.fout || 'Vink dit aan om verder te gaan.') : '';
    var w = (el.value || '').trim();
    if (el.required && !w) return el.dataset.fout || 'Dit veld is nodig.';
    if (w && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(w)) return 'Dit e-mailadres klopt nog niet helemaal.';
    if (w && el.type === 'tel' && w.replace(/\D/g, '').length < 10) return 'Vul een telefoonnummer van minstens 10 cijfers in.';
    return '';
  }

  document.querySelectorAll('form[data-mailto]').forEach(function (form) {
    /* voorselectie via de URL, bijvoorbeeld ?onderwerp=Zoom-sessie */
    var o = params.get('onderwerp');
    if (o) {
      var sel = form.querySelector('[name="onderwerp"]');
      if (sel && sel.tagName === 'SELECT') {
        [].forEach.call(sel.options, function (opt) { if (opt.value.toLowerCase() === o.toLowerCase()) sel.value = opt.value; });
      }
    }
    form.setAttribute('novalidate', '');
    form.addEventListener('change', function (e) { if (e.target.closest('.fout')) zetFout(e.target, controleer(e.target)); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var velden = [].slice.call(form.querySelectorAll('input, select, textarea')).filter(function (el) { return el.name && el.type !== 'submit'; });
      var eerste = null, gezien = {};
      velden.forEach(function (el) {
        if (el.type === 'radio') { if (gezien[el.name]) return; gezien[el.name] = 1; }
        var f = controleer(el);
        zetFout(el, f);
        if (f && !eerste) eerste = el;
      });
      if (eerste) { eerste.focus(); return; }
      var regels = [], klaar = {};
      velden.forEach(function (el) {
        if (el.type === 'checkbox' && el.dataset.label === undefined) return;
        if (el.type === 'radio') { if (klaar[el.name] || !el.checked) return; klaar[el.name] = 1; }
        var w = el.type === 'checkbox' ? (el.checked ? 'ja' : 'nee') : el.value.trim();
        if (!w) return;
        regels.push(labelVan(el) + ': ' + w);
      });
      var naamVeld = form.querySelector('[name="naam"], [name="voornaam"]');
      var onderwerp = (form.dataset.onderwerp || 'Bericht via de website') + (naamVeld && naamVeld.value ? ', ' + naamVeld.value.trim() : '');
      var tekst = (form.dataset.aanhef || 'Hallo Andries,') + '\n\n' + regels.join('\n') + '\n\nVerstuurd via vanderwerffcontrolling.nl';
      var url = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(onderwerp) + '&body=' + encodeURIComponent(tekst);
      window.location.href = url;
      var bevestiging = document.getElementById(form.dataset.bevestiging);
      if (bevestiging) {
        form.hidden = true;
        bevestiging.hidden = false;
        var link = bevestiging.querySelector('[data-mailto-link]');
        if (link) link.href = url;
        var kop = bevestiging.querySelector('h2, h3');
        if (kop) { kop.setAttribute('tabindex', '-1'); kop.focus(); }
      }
    });
  });
  document.querySelectorAll('[data-opnieuw]').forEach(function (b) {
    b.addEventListener('click', function () {
      var bev = b.closest('[data-na]');
      var form = document.querySelector('form[data-bevestiging="' + bev.id + '"]');
      bev.hidden = true; if (form) { form.hidden = false; }
    });
  });

  /* ---------- live prijs bij de aangifte ---------- */
  var prijsForm = document.querySelector('[data-prijsform]');
  if (prijsForm) {
    var zet = function () {
      var partner = prijsForm.querySelector('input[name="partner"]:checked');
      var excl = 180 + (partner && partner.value === 'ja' ? 20 : 0);
      var fmt = function (n) { return '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
      document.querySelectorAll('[data-prijs-excl]').forEach(function (el) { el.textContent = fmt(excl); });
      document.querySelectorAll('[data-prijs-incl]').forEach(function (el) { el.textContent = fmt(Math.round(excl * 121) / 100); });
    };
    prijsForm.addEventListener('change', zet);
    zet();
  }
})();
