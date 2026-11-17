(function () {
  'use strict';
  var C = window.LP_CONFIG || {};
  var REST = C.supabaseUrl + '/rest/v1/';
  var SITE = document.body.dataset.site || C.site;
  var REDIRECT = 'redirect.html';
  var AREA_KEY = 'll_area';

  // assunto escolhido em cada CTA -> rótulo gravado na coluna "servico"
  var AREAS = {
    geral: '',
    autismo: 'BPC/LOAS para autismo',
    idoso: 'BPC/LOAS para idoso',
    acidente: 'Auxílio-acidente',
    doenca: 'Auxílio-doença',
    maternidade: 'Salário-maternidade'
  };

  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // ---------- origem / UTM ----------
  var params = new URLSearchParams(location.search);
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(function (k) {
    if (params.get(k)) utm[k] = params.get(k);
  });
  if (Object.keys(utm).length) sset('ll_utm', JSON.stringify(utm));
  var stored = {};
  try { stored = JSON.parse(sget('ll_utm') || '{}'); } catch (e) {}
  function refHost() {
    try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { return ''; }
  }
  if (!sget('ll_ref')) sset('ll_ref', refHost());
  function origem() {
    if (stored.utm_source || stored.utm_medium || stored.utm_campaign) {
      return [stored.utm_source, stored.utm_medium, stored.utm_campaign].filter(Boolean).join(' / ');
    }
    if (stored.gclid) return 'google / cpc';
    if (stored.fbclid) return 'facebook / social';
    return sget('ll_ref') || 'direto';
  }

  // ---------- Supabase (REST) ----------
  function insert(table, row) {
    return fetch(REST + table, {
      method: 'POST',
      headers: {
        'apikey': C.supabaseAnonKey,
        'Authorization': 'Bearer ' + C.supabaseAnonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: true
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
  }

  // 1 visita por carregamento de página
  insert('lp_visits', { site: SITE, path: location.pathname + location.search, referrer: document.referrer || null }).catch(function () {});

  // ---------- rastreamento (GTM / Pixel / gtag, se instalados) ----------
  function track(name, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, data));
    if (typeof window.fbq === 'function' && name === 'lead_submit') window.fbq('track', 'Lead', data);
    if (typeof window.gtag === 'function') window.gtag('event', name === 'lead_submit' ? 'generate_lead' : name, data);
  }

  // ---------- assunto selecionado ----------
  var chip = document.getElementById('assunto-chip');
  var chipTxt = document.getElementById('assunto-txt');
  function showArea() {
    var a = sget(AREA_KEY) || 'geral';
    var label = AREAS[a] || '';
    if (!chip) return;
    if (label) { chipTxt.textContent = label; chip.hidden = false; } else { chip.hidden = true; }
  }
  showArea();

  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta]');
    if (!cta) return;
    var a = cta.getAttribute('data-area') || 'geral';
    sset(AREA_KEY, a);
    showArea();
    track('cta_click', { local: (cta.textContent || '').trim().slice(0, 40) || 'icone', area: a });
    var inp = document.getElementById('f-nome');
    if (inp) setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (x) {} }, 700);
  });

  // ---------- abas de benefícios ----------
  var tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var n = t.getAttribute('data-tab');
      tabs.forEach(function (o) {
        var on = o === t;
        o.classList.toggle('on', on);
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== n; });
    });
  });

  // ---------- FAQ ----------
  var faqBtns = document.querySelectorAll('[data-faq]');
  faqBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var wasOpen = b.getAttribute('aria-expanded') === 'true';
      faqBtns.forEach(function (o) {
        o.setAttribute('aria-expanded', 'false');
        document.getElementById(o.getAttribute('aria-controls')).hidden = true;
        var ic = o.querySelector('.faq-ico'); if (ic) ic.style.transform = 'rotate(0deg)';
      });
      if (!wasOpen) {
        b.setAttribute('aria-expanded', 'true');
        document.getElementById(b.getAttribute('aria-controls')).hidden = false;
        var ic = b.querySelector('.faq-ico'); if (ic) ic.style.transform = 'rotate(45deg)';
      }
    });
  });

  // ---------- formulário ----------
  var form = document.getElementById('lead-form');
  if (!form) return;
  var nome = document.getElementById('f-nome');
  var wpp = document.getElementById('f-wpp');
  var erro = document.getElementById('form-erro');
  var btn = document.getElementById('form-btn');

  wpp.addEventListener('input', function () {
    var d = wpp.value.replace(/\D/g, '').slice(0, 11);
    var f = d;
    if (d.length > 0) f = '(' + d.slice(0, 2);
    if (d.length > 2) f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) f = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    wpp.value = f;
  });

  function showError(msg, el) {
    erro.textContent = msg;
    erro.hidden = false;
    if (el) el.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    erro.hidden = true;
    var n = nome.value.trim();
    var digits = wpp.value.replace(/\D/g, '');
    if (n.length < 2) return showError('Digite seu nome para continuar.', nome);
    if (digits.length < 10 || digits.length > 11) return showError('Digite um WhatsApp válido com DDD.', wpp);

    btn.disabled = true;
    var area = sget(AREA_KEY) || 'geral';
    var row = { site: SITE, nome: n, whatsapp: digits, origem: origem() };
    if (AREAS[area]) row.servico = AREAS[area];

    track('lead_submit', { area: area });

    var done = false;
    function go() {
      if (done) return; done = true;
      var q = new URLSearchParams(location.search); // repassa UTMs/gclid
      q.set('n', n.split(' ')[0]);
      q.set('a', area);
      location.href = REDIRECT + '?' + q.toString();
    }
    // mesmo com falha de rede o visitante segue para o WhatsApp
    insert('lp_leads', row).then(go).catch(go);
    setTimeout(go, 4000);
  });
})();
