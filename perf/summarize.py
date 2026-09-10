import pathlib
import re
import sys

METRICS = {
    "route_catalogue": "GET /api/profiles",
    "route_profile_detail": "GET /api/profiles/:id",
    "route_video_stream": "GET /api/videos/:id/stream",
}

STAT = re.compile(r"(med|p\(95\)|p\(99\))=([0-9.]+)(ms|s|µs)")


def to_ms(value: str, unit: str) -> float:
    factor = {"µs": 0.001, "ms": 1.0, "s": 1000.0}[unit]
    return float(value) * factor


def parse(path: pathlib.Path) -> dict:
    run = {"routes": {}, "failures": None, "throughput": None, "cpu": {}}

    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        name = line.strip().split(".")[0].strip()

        if name in METRICS or name == "http_req_duration":
            stats = {key: to_ms(val, unit) for key, val, unit in STAT.findall(line)}
            if stats:
                run["routes"][name] = stats
        elif name in ("route_failures", "http_req_failed"):
            found = re.search(r"([0-9.]+)%", line)
            if found and run["failures"] is None:
                run["failures"] = float(found.group(1))
        elif name == "http_reqs":
            found = re.search(r":\s+\d+\s+([0-9.]+)/s", line)
            if found:
                run["throughput"] = float(found.group(1))
        elif line.startswith("peak_cpu_"):
            key, _, value = line.partition(": ")
            run["cpu"][key.replace("peak_cpu_", "")] = value.strip()

    return run


def fmt(value: float) -> str:
    return f"{value:.2f} ms" if value < 1000 else f"{value / 1000:.2f} s"


def main() -> None:
    run_dir = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    files = sorted(
        run_dir.glob("*.txt"),
        key=lambda p: (not p.name.startswith("browse"), int(re.sub(r"\D", "", p.stem) or 0)),
    )

    machine = run_dir / "machine.txt"
    if machine.exists():
        print("# Synthèse des tests de charge\n")
        for line in machine.read_text(encoding="utf-8").splitlines():
            print(f"- {line}")
        print()

    for path in files:
        if path.name == "machine.txt":
            continue

        run = parse(path)
        if not run["routes"]:
            continue

        per_route = {key: run["routes"][key] for key in METRICS if key in run["routes"]}
        rows = per_route or {"http_req_duration": run["routes"].get("http_req_duration", {})}
        labels = {**METRICS, "http_req_duration": "toutes requêtes confondues"}

        print(f"## {path.stem}\n")

        if run["throughput"] is not None:
            failures = "n/a" if run["failures"] is None else f"{run['failures']:.2f} %"
            print(f"Débit {run['throughput']:.0f} req/s · erreurs {failures} · "
                  f"CPU backend {run['cpu'].get('backend', 'n/a')} · "
                  f"CPU postgres {run['cpu'].get('postgres', 'n/a')}\n")

        print("| Route | Médiane | p95 | p99 |")
        print("| --- | --- | --- | --- |")
        for key, stats in rows.items():
            if stats:
                print(f"| `{labels[key]}` | {fmt(stats['med'])} | "
                      f"{fmt(stats['p(95)'])} | {fmt(stats['p(99)'])} |")
        print()


if __name__ == "__main__":
    main()
