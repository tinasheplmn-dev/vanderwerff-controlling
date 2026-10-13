/* Kennisbank: live zoeken, markeren, A tot Z. Fail-open: zonder JavaScript staan
   alle begrippen gewoon op de pagina en klap je ze zelf open. */
(function () {
  'use strict';
  var invoer = document.querySelector('[data-kb-zoek]');
  var form = document.querySelector('[data-kb-form]');
  var begrippen = [].slice.call(document.querySelectorAll('[data-begrip]'));
  var groepen = [].slice.call(document.querySelectorAll('[data-groep]'));
  var telling = document.querySelector('[data-kb-telling]');
  var leeg = document.querySelector('[data-kb-leeg]');
  if (!invoer || !begrippen.length) return;

  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  begrippen.forEach(function (d) {
    d._zoek = norm(d.getAttribute('data-begrip'));
    d._titel = d.querySelector('.kb-titel');
    d._titelTekst = d._titel.textContent;
  });

  function zet(raw) {
    var q = norm(raw.trim());
    var n = 0;
    begrippen.forEach(function (d) {
      var hit = !q || d._zoek.indexOf(q) !== -1;
      d.hidden = !hit;
      if (hit) n++;
      /* titel markeren */
      var t = d._titelTekst, i = q ? norm(t).indexOf(q) : -1;
      if (i > -1) {
        d._titel.innerHTML = '';
        d._titel.append(t.slice(0, i));
        var m = document.createElement('mark'); m.textContent = t.slice(i, i + q.length); d._titel.append(m);
        d._titel.append(t.slice(i + q.length));
      } else d._titel.textContent = t;
      /* bij een zoekterm die alleen in de uitleg staat: openklappen */
      if (q && hit && i === -1) d.open = true;
    });
    groepen.forEach(function (g) { g.hidden = !g.querySelector('[data-begrip]:not([hidden])'); });
    document.querySelectorAll('.az a[data-letter]').forEach(function (a) {
      var g = document.getElementById('letter-' + a.dataset.letter);
      a.classList.toggle('leeg', !g || g.hidden);
    });
    telling.textContent = n === 1 ? '1 begrip' : n + ' begrippen';
    leeg.hidden = n !== 0;
  }

  invoer.addEventListener('input', function () { zet(invoer.value); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var eerste = document.querySelector('[data-begrip]:not([hidden])');
    if (eerste) { eerste.open = true; eerste.scrollIntoView({ block: 'start' }); }
  });

  /* ?q= vanaf de homepage, of #begrip uit een link */
  var q = new URLSearchParams(location.search).get('q');
  if (q) { invoer.value = q; zet(q); }
  if (location.hash) {
    var doel = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (doel && doel.tagName === 'DETAILS') { doel.open = true; setTimeout(function () { doel.scrollIntoView({ block: 'start' }); }, 60); }
  }
  window.addEventListener('hashchange', function () {
    var d = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (d && d.tagName === 'DETAILS') d.open = true;
  });
})();
