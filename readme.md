# ProfilsActifs

ProfilsActifs is a job-matching platform built for the "Ministere du Job et Bonheur" digital strategy brief (reference JEB/DNI/2026-003), part of the Epitech third-year pool project (PGE3, module G-SVR-500).

Instead of a traditional resume, job seekers present themselves through a short video profile and can complete a professional aptitude certification questionnaire to earn a badge displayed on their profile. Recruiters browse, filter, and interact with candidate profiles from a dedicated space, while administrators moderate content and manage the certification questionnaire.

## Functional scope

**Job seeker space**
- Create a professional profile (identity, skills, target sector, location)
- Publish a presentation video
- Complete the certification questionnaire to obtain a badge
- Track interactions received (views, recruiter contacts)

**Recruiter space**
- Browse the catalog of job seeker profiles
- Filter by skills, sector, location, and certification status
- Interact with profiles (contact, favorites)
- Track contacted candidates from a dashboard

**Administration space**
- Moderate profiles and video content
- Manage the certification questionnaire (questions, weighting)
- View a global dashboard (active profiles, certification rate, interactions)

## Tech stack

| Layer          | Technology                                                        |
| -------------- | ------------------------------------------------------------------ |
| Frontend       | Next.js 16, React 19, Tailwind CSS 4                               |
| Backend        | Fastify 5, Zod, Swagger/OpenAPI, better-auth                       |
| Database / ORM | PostgreSQL 17, Prisma 7                                            |
| Runtime        | Bun                                                                 |
| Infrastructure | Docker, Docker Compose                                             |
| CI             | GitHub Actions (build check on `main`/`dev`, release artifact)     |

## Project structure

```
.
├── backend/               Fastify API + Prisma schema and migrations
│   ├── src/module/        One folder per domain: auth, profiles, video,
│   │                      notifications, favorite, admin, user, certification
│   ├── scripts/           Maintenance scripts (video migration, video seeding)
│   └── tests/             bun test suites
├── frontend/              Next.js application (App Router)
├── docs/                  Functional briefs and technical documentation
├── perf/                  Load testing scenario, raw results and report
├── seed.sh                Demo dataset generator
├── docker-compose.yml     Orchestration for the database, API, and web app
└── .github/workflows/     CI pipelines
```

## Documentation

| Document | Contents |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Overall design, request flow, structuring decisions |
| [docs/api.md](docs/api.md) | Reference for every HTTP endpoint |
| [docs/database.md](docs/database.md) | Data model, relations, migrations |
| [docs/frontend.md](docs/frontend.md) | Pages, components, state and API clients |
| [docs/developpement.md](docs/developpement.md) | Setup, environment variables, scripts, known pitfalls |
| [perf/RAPPORT.md](perf/RAPPORT.md) | Load test report (100 virtual users) |

Interactive API documentation is served by the running backend at
[http://localhost:8081/docs](http://localhost:8081/docs).

## Getting started

### Prerequisites

- Docker and Docker Compose
- Bun (for local development outside of Docker)

### Environment variables

Copy the example environment files before the first run:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Adjust the values as needed (database credentials, `BETTER_AUTH_SECRET`, `FRONTEND_URL`, etc.).

### Run with Docker

```bash
# Build backend and frontend images
docker compose build

# Start the database, API, and web app
docker compose up
```

The frontend is served on [http://localhost:3000](http://localhost:3000) and the backend API on [http://localhost:8081](http://localhost:8081). Interactive API documentation (Swagger UI) is available at `http://localhost:8081/docs`.

### Run locally without Docker

Each service can also be run independently with Bun; see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for details.

### Demo dataset

```bash
./seed.sh                            # 500 profiles, 40 recruiters, favorites
cd backend && bun run seed:videos    # attaches videos through the video provider
```

See [docs/developpement.md](docs/developpement.md) for the prerequisites of both scripts.

## Continuous integration

On every push to `main` or `dev`, GitHub Actions builds the backend and frontend Docker images and publishes a release artifact containing the deployable project (source, `docker-compose.yml`, and environment file templates).

## Team

Developed by an Epitech PGE3 team as part of the 2026 third-year pool.
