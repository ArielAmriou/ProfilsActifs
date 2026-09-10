import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8081";
const VUS = Number(__ENV.VUS || 100);
const DURATION = __ENV.DURATION || "30s";

export const options = {
  scenarios: {
    catalogue_saturation: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
      gracefulStop: "5s",
    },
  },
  summaryTrendStats: ["med", "p(95)", "p(99)", "max"],
};

export default function () {
  http.get(`${BASE_URL}/api/profiles`);
}
