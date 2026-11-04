"use strict";
const RATES = Object.freeze({
  USD:1, EUR:0.92, GBP:0.79, JPY:151.5, CNY:7.24, CAD:1.36,
  AUD:1.52, CHF:0.88, RUB:92.5, INR:83.2, KRW:1350, BRL:5.42,
  MXN:17.1, PLN:4.02, SEK:10.85, TRY:32.1, UAH:36.5, ZAR:18.6,
  ILS:3.72, HKD:7.8, SGD:1.34, NZD:1.65, NOK:10.9, DKK:6.88,
  CZK:23.2, HUF:360, RON:4.58, BGN:1.8, GEL:2.7, TWD:32.3,
  PHP:56.2, THB:36.1, IDR:16200, VND:25800, ARS:920, CLP:950,
  COP:4200, PEN:3.8, EGP:48.5, MAD:10.1, TND:3.1, DZD:135,
  LYD:4.8, IQD:1310, AFN:71.5, ALL:93.2, AMD:385, AOA:850,
  AZN:1.7, BAM:1.8, BBD:2, BDT:110, BOB:6.9, BYN:3.28,
  CDF:2800, XOF:605, XAF:605, GHS:15.2, GMD:67.5, GNF:8600,
  GTQ:7.85, GYD:209, HNL:24.7, HRK:6.9, HTG:132.5, ISK:138,
  JMD:158, KES:129, KGS:89.5, KHR:4100, KMF:450, KPW:900,
  LAK:21500, LBP:89000, LKR:300, LSL:17.7, MGA:4500, MKD:56.5,
  MMK:2100, MNT:3450, MOP:8.0, MRU:39.5, MUR:45.5, MVR:15.4,
  MWK:1750, MYR:4.72, MZN:63.5, NAD:18.6, NGN:1500, NIO:36.5,
  NPR:133.5, OMR:0.38, PAB:1, PGK:3.8, PKR:278, PYG:7300,
  QAR:3.64, RSD:108, RWF:1300, SAR:3.75, SBD:8.5, SCR:13.5,
  SDG:600, SLL:22000, SOS:570, SRD:35, SSP:1300, STN:22.5,
  SVC:8.75, SYP:13000, SZL:17.7, TJS:10.9, TMT:3.5, TOP:2.35,
  TTD:6.8, TZS:2600, UGX:4000, UYU:39, UZS:12600, VES:36.5,
  VUV:120, WST:2.75, YER:250, ZMW:25.5
});

const CURRENCY_NAMES = Object.freeze({
  USD:'Доллар США', EUR:'Евро', GBP:'Фунт стерлингов', JPY:'Японская йена',
  CNY:'Китайский юань', CAD:'Канадский доллар', AUD:'Австралийский доллар',
  CHF:'Швейцарский франк', RUB:'Российский рубль', INR:'Индийская рупия',
  KRW:'Южнокорейская вона', BRL:'Бразильский реал', MXN:'Мексиканское песо',
  PLN:'Польский злотый', SEK:'Шведская крона', TRY:'Турецкая лира',
  UAH:'Украинская гривна', ZAR:'Южноафриканский рэнд'
});

function normalizeCode(code){
  if(typeof code !== 'string') throw new TypeError('Код валюты должен быть строкой');
  var c = code.trim().toUpperCase();
  if(!c) throw new Error('Пустой код валюты');
  if(!Object.prototype.hasOwnProperty.call(RATES, c)) throw new Error('Неизвестная валюта: ' + c);
  return c;
}

function convert(amount, from, to){
  if(typeof amount === 'string'){
    amount = amount.trim().replace(/\s/g,'').replace(',', '.');
    if(amount === '') throw new Error('Введите сумму');
    amount = Number(amount);
  }
  if(typeof amount !== 'number' || !isFinite(amount)) throw new Error('Некорректная сумма');
  if(amount < 0) throw new Error('Сумма не может быть отрицательной');
  var f = normalizeCode(from), t = normalizeCode(to);
  if(f === t) return amount;
  var result = (amount / RATES[f]) * RATES[t];
  if(!isFinite(result)) throw new Error('Результат вне диапазона');
  return result;
}

function formatMoney(value){
  if(typeof value !== 'number' || !isFinite(value)) return '—';
  var abs = Math.abs(value), d = 2;
  if(abs === 0) d = 2;
  else if(abs >= 1e9) d = 0;
  else if(abs >= 1e6) d = 1;
  try{ return value.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d}); }
  catch(e){ return value.toFixed(d); }
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = { RATES, CURRENCY_NAMES, normalizeCode, convert, formatMoney };
}
if(typeof window !== 'undefined'){
  window.CC = { RATES, CURRENCY_NAMES, normalizeCode, convert, formatMoney };
}