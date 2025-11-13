# Repository Guidelines

## Project Structure & Module Organization
Laravel 12 backend logic sits in `app/`, with HTTP routes in `routes/web.php`, service providers under `bootstrap/`, and configuration in `config/`. Database migrations, factories, and seeders share the `database/` tree. The React + TypeScript client boots from `resources/js/Index.tsx`; place shared widgets in `resources/js/components`, routed screens in `resources/js/pages`, and utilities in `resources/js/lib`. Blade shims stay in `resources/views`, Vite output lands in `public/build`, and `architecture.md` summarizes agreed module boundaries—check it before moving files.

## Build, Test, and Development Commands
- `composer install && npm install` – bootstrap PHP and Node dependencies.
- `php artisan migrate --seed` – apply schema updates and load demo data.
- `composer run dev` – run the Laravel server, queue listener, log stream, and `npm run dev` via `concurrently`.
- `npm run build` – emit optimized assets for deployment.
- `php artisan test` (or `composer test`) – clear config cache and execute the Pest suite.
- `npm run test:js` – execute Jest in jsdom for React units and integration tests.

## Coding Style & Naming Conventions
Use PSR-12, 4-space indentation, typed properties, and move orchestration into `app/Actions` or `app/Services`. Format PHP with `./vendor/bin/pint` before committing. React code also uses 4-space indent, TypeScript `strict` mode, and the `@/*` alias; components/pages are PascalCase, hooks/utilities camelCase, and Tailwind directives live in `resources/css/app.css`.

## Testing Guidelines
Keep Laravel HTTP flows in `tests/Feature` and pure logic in `tests/Unit`, naming files `SomethingTest.php` so Pest auto-discovers them; seed fixtures via factories. React specs live in `__tests__` folders (e.g., `resources/js/pages/__tests__/Register.test.tsx`) and should cover rendering and user intent with Testing Library helpers. Every new feature must add or update a Pest or Jest test, and regressions require a failing test first.

## Commit & Pull Request Guidelines
Prefer Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) as in the current history, keep subjects under ~70 characters, and use the body for motivation or rollout notes. PRs must link backlog issues, summarize backend vs. frontend changes, call out migrations or workers to run, and add screenshots for UI tweaks. Update `architecture.md` or other living docs whenever a boundary or contract changes.

## Environment & Security Notes
Create `.env` from `.env.example`, run `php artisan key:generate`, and keep secrets in the environment—only surface browser values via `VITE_*`. Mention in PRs if a story needs workers (`php artisan queue:listen`) or new config, and scrub demo credentials in `database/seeders` before sharing external builds.
