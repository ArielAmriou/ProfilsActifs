import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8081";
const VUS = Number(__ENV.VUS || 100);
const DURATION = __ENV.DURATION || "2m";
const STREAM_CHUNK = "bytes=0-262143";

const catalogue = new Trend("route_catalogue", true);
const profileDetail = new Trend("route_profile_detail", true);
const videoStream = new Trend("route_video_stream", true);
const failures = new Rate("route_failures");

export const options = {
  scenarios: {
    recruiters_browsing: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
      gracefulStop: "10s",
    },
  },
  summaryTrendStats: ["med", "p(95)", "p(99)", "max", "avg"],
};

export function setup() {
  const response = http.get(`${BASE_URL}/api/profiles`);

  if (response.status !== 200) {
    throw new Error(`Catalogue indisponible au démarrage: ${response.status}`);
  }

  const profiles = response.json("profiles");

  return {
    ids: profiles.map((profile) => profile.id),
    streams: profiles
      .filter((profile) => profile.video && profile.video.playbackUrl)
      .map((profile) => profile.video.playbackUrl),
  };
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export default function (data) {
  const list = http.get(`${BASE_URL}/api/profiles`, { tags: { route: "catalogue" } });
  catalogue.add(list.timings.duration);
  failures.add(list.status !== 200);
  check(list, { "catalogue 200": (r) => r.status === 200 });
  sleep(1);

  const detail = http.get(`${BASE_URL}/api/profiles/${pick(data.ids)}`, {
    tags: { route: "profile_detail" },
  });
  profileDetail.add(detail.timings.duration);
  failures.add(detail.status !== 200);
  check(detail, { "fiche 200": (r) => r.status === 200 });
  sleep(1);

  const stream = http.get(pick(data.streams), {
    headers: { Range: STREAM_CHUNK },
    tags: { route: "video_stream" },
  });
  videoStream.add(stream.timings.duration);
  failures.add(stream.status !== 206);
  check(stream, { "flux 206": (r) => r.status === 206 });
  sleep(1);
}
