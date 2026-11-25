import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.TOYSHOP_BASE_URL;
if (!baseUrl) throw new Error("Set TOYSHOP_BASE_URL to an isolated staging origin.");

export const options = {
  scenarios: {
    visitors: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 100 },
        { duration: "1m", target: 250 },
        { duration: "1m", target: 500 },
        { duration: "5m", target: 500 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function loadTest() {
  const home = http.get(`${baseUrl}/`);
  check(home, { "homepage is available": (response) => response.status === 200 });
  const shop = http.get(`${baseUrl}/api/shop`);
  check(shop, { "shop details are available": (response) => response.status === 200 });
  sleep(1);
}
