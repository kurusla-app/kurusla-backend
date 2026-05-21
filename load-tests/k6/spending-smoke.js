/**
 * Duman testi — ~10 sanal kullanıcı, kısa süre
 * Çalıştır: k6 run load-tests/k6/spending-smoke.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  buildSmsText,
  defaultHeaders,
  randomAmount,
  randomMerchant,
  userIdForVu,
} from './helpers.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const merchant = randomMerchant();
  const amount = randomAmount();
  // Duman testinde varsayılan userId=1 (register ile oluşturduğun kullanıcı)
  const userId = Number(__ENV.USER_ID || __ENV.MAX_USER_ID || 1);

  const res = http.post(
    `${BASE_URL}/api/webhooks/sms`,
    JSON.stringify({
      userId,
      text: buildSmsText(merchant, amount),
    }),
    { headers: defaultHeaders(), tags: { name: 'webhook_sms' } }
  );

  check(res, {
    'status 201': (r) => r.status === 201,
    'not parse error': (r) => r.status !== 422,
  });

  sleep(0.5 + Math.random());
}

export function setup() {
  const health = http.get(`${BASE_URL}/healthz`);
  if (health.status !== 200) {
    throw new Error(`Sunucu ayakta değil: ${BASE_URL}/healthz → ${health.status}`);
  }
  return { ok: true };
}
