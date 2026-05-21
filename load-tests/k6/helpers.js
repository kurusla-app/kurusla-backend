/**
 * k6 yardımcıları — harcama webhook senaryosu
 */

const MERCHANTS = [
  'STARBUCKS COFFEE TR',
  'MIGROS SANAL MARKET',
  'SPOTIFY ABONELIK',
  'UBER TRIP',
  'BIM MARKET',
  'NETFLIX',
  'SHELL AKARYAKIT',
];

export function randomMerchant() {
  return MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
}

export function randomAmount() {
  const base = 10 + Math.random() * 490;
  return Math.round(base * 100) / 100;
}

/** Banka SMS formatında örnek metin */
export function buildSmsText(merchant, amount) {
  const formatted = amount.toFixed(2).replace('.', ',');
  return `Garanti BBVA: ${merchant} isyerinde ${formatted} TL harcama yapilmistir.`;
}

/** VU başına dağıtılmış userId (1 .. maxUserId) */
export function userIdForVu(vu, maxUserId = 100) {
  return ((vu - 1) % maxUserId) + 1;
}

export function defaultHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  const apiKey = __ENV.INTERNAL_SERVICE_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  return headers;
}
