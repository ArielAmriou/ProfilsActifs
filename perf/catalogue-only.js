import http from "k6/http";
const BASE_URL = __ENV.BASE_URL || "http://localhost:8081";
export const options = { scenarios: { c: { executor: "constant-vus", vus: 100, duration: "30s" } },
  summaryTrendStats: ["med", "p(95)", "p(99)", "max"] };
export default function () { http.get(`${BASE_URL}/api/profiles`); }
