/**
 * Yük testi — kademeli artan eşzamanlı kullanıcı (hedef ~1000 VU)
 * Çalıştır: k6 run load-tests/k6/spending-load.js
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
  scenarios: {
    spending_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 500 },
        { duration: '5m', target: 1000 },
        { duration: '3m', target: 0 },
      ],
      gracefulRampDown: '1m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.08'],
    http_req_duration: ['p(95)<4000', 'p(99)<8000'],
  },
};

export default function () {
  const maxUsers = Number(__ENV.MAX_USER_ID || 500);
  const userId = userIdForVu(__VU, maxUsers);
  const merchant = randomMerchant();
  const amount = randomAmount();

  const res = http.post(
    `${BASE_URL}/api/webhooks/sms`,
    JSON.stringify({
      userId,
      text: buildSmsText(merchant, amount),
    }),
    { headers: defaultHeaders(), tags: { name: 'webhook_sms' } }
  );

  check(res, {
    'created or rate limited': (r) => r.status === 201 || r.status === 429,
  });

  sleep(0.2 + Math.random() * 0.8);
}

export function setup() {
  const health = http.get(`${BASE_URL}/healthz`);
  if (health.status !== 200) {
    throw new Error(`Sunucu hazır değil: ${BASE_URL}`);
  }
}
