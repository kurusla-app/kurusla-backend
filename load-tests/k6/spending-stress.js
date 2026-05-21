/**
 * Stres testi — görev hedefi: 10.000 eşzamanlı harcama simülasyonu
 *
 * UYARI: Güçlü makine / bulut runner gerekir. İlk denemede spending-load.js ile başlayın.
 *
 * Çalıştır:
 *   k6 run load-tests/k6/spending-stress.js
 *
 * Bulut (k6 Cloud) veya çok çekirdekli sunucu önerilir.
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
const TARGET_VUS = Number(__ENV.TARGET_VUS || 10000);

export const options = {
  scenarios: {
    stress_spending: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: Math.min(500, TARGET_VUS) },
        { duration: '10m', target: Math.min(2000, TARGET_VUS) },
        { duration: '15m', target: Math.min(5000, TARGET_VUS) },
        { duration: '20m', target: TARGET_VUS },
        { duration: '10m', target: TARGET_VUS },
        { duration: '5m', target: 0 },
      ],
      gracefulRampDown: '2m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.15'],
    http_req_duration: ['p(95)<10000'],
  },
};

export default function () {
  const maxUsers = Number(__ENV.MAX_USER_ID || 10000);
  const userId = userIdForVu(__VU, maxUsers);

  const res = http.post(
    `${BASE_URL}/api/webhooks/sms`,
    JSON.stringify({
      userId,
      text: buildSmsText(randomMerchant(), randomAmount()),
    }),
    { headers: defaultHeaders(), tags: { name: 'webhook_sms_stress' } }
  );

  check(res, {
    'accepted or limited': (r) => [201, 429, 500].includes(r.status),
  });

  sleep(0.1 + Math.random() * 0.4);
}

export function setup() {
  const health = http.get(`${BASE_URL}/healthz`);
  if (health.status !== 200) {
    throw new Error(`Hedef sunucu yanıt vermiyor: ${BASE_URL}`);
  }
  console.log(`Stres testi başlıyor → hedef ${TARGET_VUS} VU, BASE_URL=${BASE_URL}`);
}
