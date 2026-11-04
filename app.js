"use strict";
(function(){
  var API = (typeof window !== 'undefined' && window.CC) ? window.CC : require('./rates.js');
  var RATES = API.RATES, CURRENCY_NAMES = API.CURRENCY_NAMES, convert = API.convert, formatMoney = API.formatMoney;
  var DEFAULT_FROM = 'USD', DEFAULT_TO = 'RUB';

  function $(id){ return document.getElementById(id); }
  var fromEl, toEl, amtEl, resEl, resSmallEl, rateEl, statusEl, testsEl;

  function fillSelect(sel, selected){
    var codes = Object.keys(RATES).sort(function(a,b){
      var an = CURRENCY_NAMES[a] || a, bn = CURRENCY_NAMES[b] || b;
      return an.localeCompare(bn, 'ru');
    });
    var frag = document.createDocumentFragment();
    for(var i=0;i<codes.length;i++){
      var c = codes[i];
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c + ' — ' + (CURRENCY_NAMES[c] || c);
      if(c === selected) opt.selected = true;
      frag.appendChild(opt);
    }
    sel.innerHTML = '';
    sel.appendChild(frag);
  }

  function render(){
    try {
      var raw = String(amtEl.value).trim();
      if(raw === ''){
        resEl.textContent = '—'; resEl.classList.remove('err');
        resSmallEl.textContent = 'Введите сумму'; rateEl.textContent = ''; return;
      }
      var amount = Number(raw.replace(/\s/g,'').replace(',', '.'));
      if(!isFinite(amount)){
        resEl.textContent = 'Ошибка'; resEl.classList.add('err');
        resSmallEl.textContent = 'Некорректная сумма'; rateEl.textContent = ''; return;
      }
      if(amount < 0){
        resEl.textContent = 'Ошибка'; resEl.classList.add('err');
        resSmallEl.textContent = 'Сумма не может быть отрицательной'; rateEl.textContent = ''; return;
      }
      var from = fromEl.value, to = toEl.value;
      var out = convert(amount, from, to);
      resEl.textContent = formatMoney(out) + ' ' + to;
      resEl.classList.remove('err');
      resSmallEl.textContent = formatMoney(amount) + ' ' + from + ' → ' + to;
      rateEl.textContent = '1 ' + from + ' = ' + formatMoney(convert(1,from,to)) + ' ' + to;
      statusEl.textContent = '';
    } catch(e){
      resEl.textContent = 'Ошибка'; resEl.classList.add('err');
      resSmallEl.textContent = e.message; rateEl.textContent = '';
    }
  }

  function runSelfTests(){
    var lines = [], passed = 0, failed = 0;
    function t(name, fn){
      try { fn(); passed++; lines.push('✓ ' + name); }
      catch(e){ failed++; lines.push('✗ ' + name + ' — ' + e.message); }
    }
    function eq(a,b,eps){ eps = eps || 1e-9; if(Math.abs(a-b) > eps) throw new Error(a+' ≠ '+b); }
    function throws(fn){ try{ fn(); }catch(e){ return; } throw new Error('ожидалась ошибка'); }

    t('USD→EUR', function(){ eq(convert(100,'USD','EUR'), 92); });
    t('EUR→USD', function(){ eq(convert(92,'EUR','USD'), 100, 1e-9); });
    t('USD→RUB', function(){ eq(convert(1,'USD','RUB'), 92.5); });
    t('та же валюта', function(){ eq(convert(42.5,'USD','USD'), 42.5); });
    t('регистр', function(){ eq(convert(100,' usd ',' eur '), 92); });
    t('ноль', function(){ eq(convert(0,'USD','EUR'), 0); });
    t('отрицательная', function(){ throws(function(){ convert(-1,'USD','EUR'); }); });
    t('NaN', function(){ throws(function(){ convert(NaN,'USD','EUR'); }); });
    t('Infinity', function(){ throws(function(){ convert(Infinity,'USD','EUR'); }); });
    t('неизвестная', function(){ throws(function(){ convert(1,'USD','XXX'); }); });
    t('EUR→GBP', function(){ eq(convert(1,'EUR','GBP'), (1/0.92)*0.79, 1e-9); });
    t('большая сумма', function(){ eq(convert(1e12,'USD','RUB'), 1e12*92.5); });
    t('точность', function(){ eq(convert(0.3,'USD','USD'), 0.3); });
    t('запятая', function(){ eq(convert('100,5','USD','USD'), 100.5); });
    t('пусто', function(){ throws(function(){ convert('','USD','EUR'); }); });
    t('formatMoney', function(){ if(!formatMoney(1234.5)) throw new Error('пусто'); });

    testsEl.textContent = lines.join('\n') + '\n\n' + passed + ' прошло, ' + failed + ' провалено';
    testsEl.classList.add('tests-show');
    return failed === 0;
  }

  function setup(){
    fromEl = $('from'); toEl = $('to'); amtEl = $('amt');
    resEl = $('res'); resSmallEl = $('ressmall');
    rateEl = $('rate'); statusEl = $('status'); testsEl = $('tests');

    fillSelect(fromEl, DEFAULT_FROM);
    fillSelect(toEl, DEFAULT_TO);

    fromEl.addEventListener('change', render);
    toEl.addEventListener('change', render);
    amtEl.addEventListener('input', render);
    $('swap').addEventListener('click', function(){
      var t = fromEl.value; fromEl.value = toEl.value; toEl.value = t; render();
    });
    $('conv-btn').addEventListener('click', render);
    $('copy').addEventListener('click', function(){
      var txt = resEl.textContent;
      if(!txt || txt === '—' || resEl.classList.contains('err')) return;
      function ok(){ statusEl.textContent = 'Скопировано'; setTimeout(function(){ statusEl.textContent=''; }, 1200); }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(ok, function(){ statusEl.textContent='Не удалось'; });
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = txt; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta); ok();
        } catch(e){ statusEl.textContent = 'Не удалось'; }
      }
    });
    render();
  }

  if(typeof document !== 'undefined'){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){ setup(); runSelfTests(); });
    } else { setup(); runSelfTests(); }
  }
  if(typeof module !== 'undefined' && module.exports){ module.exports = { runSelfTests: runSelfTests }; }
})();