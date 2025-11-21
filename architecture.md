# System Architecture: Rainbow Roots

This document outlines the proposed technical architecture for the "Rainbow Roots" platform, a system designed to help teachers manage documentation and track the progress of special needs children.

The architecture is designed with a focus on **modularity, scalability, and maintainability**, following best practices for 2025.

## 1. Core Philosophy: Modular Monolith

We will begin with a **Modular Monolith** approach using Laravel. This gives us the speed and simplicity of a single codebase and deployment, while being structured internally for high organization and separation of concerns. This structure makes it significantly easier to scale or extract parts into microservices in the future if required.

The application will be organized by **Domain Contexts** rather than by technical layers (e.g., `app/Http/Controllers`).

### Proposed Domain Contexts:

-   **/UserManagement**: Handles users, authentication, and roles (Teacher, Parent, Admin).
-   **/StudentProfiles**: Manages student data and initial assessments.
-   **/LearningPaths**: Manages the creation and definition of learning paths and their associated materials.
-   **/ProgressTracking**: Handles daily lessons, teacher notes, and evidence uploads.
-   **/Reporting**: Responsible for generating and retrieving student progress reports.
-   **/ParentPortal**: Contains the logic specific to the parent-facing experience.
-   **/Scheduling**: Owns teacher-led study sessions, enrollment/waitlist rules, reminders, and calendar feeds.

## 1.1 User Personas & Stored Attributes

Rainbow Roots supports three authenticated user personas plus the non-authenticated Student entity the system tracks. Capturing the right attributes up-front keeps policies, analytics, and integrations consistent across domains.

### System Admin (staff user)

- **Core fields**: `id`, `first_name`, `last_name`, `email`, `password_hash`, `role=admin`, `is_active`, `last_login_at`.
- **Contact/localization**: `phone`, `preferred_locale`, `timezone` — required for cross-site deployments and notifications.
- **Access scope**: `organization_id`, `super_admin` flag, optional `permissions` JSON/bitmask for feature toggles (e.g., impersonation, billing exports).
- **Lifecycle**: `invited_at`, `activated_at`, `deactivated_at`, `password_updated_at` to satisfy the backlog’s “create/edit/deactivate accounts” story and support auditing.

### Teacher (staff user)

- Inherits the shared user columns above with `role=teacher` and adds `employee_code`, `hire_date`, `grade_band_focus`, `subjects`/`specializations` (array or relation) so admins can match caseloads to expertise.
- **Caseload oversight**: `caseload_capacity`, `current_caseload` (materialized or derived), `assigned_site_id` for scheduling and reporting.
- **Profile & preferences**: `bio`, `profile_photo_url`, `communication_preferences` (email/SMS/in-app) to power roster displays and progress notifications.
- **Status tracking**: `last_sync_at` or `last_activity_at` for analytics around report freshness.

### Parent / Guardian (family user)

- Shares base user columns with `role=parent` plus `relationship_to_student` and `household_id` to model multi-child families.
- **Contact info**: `primary_phone`, `secondary_phone`, `address_line1/2`, `city`, `state`, `postal_code`, `preferred_contact_times`, reflecting the parent forms already surfaced in the UI.
- **Verification & notifications**: `identity_verified_at`, `communication_preferences`, `notification_opt_in` for compliance when sending lesson summaries or homework alerts.
- **Student links**: many-to-many pivot `guardian_student` capturing `student_id`, `user_id`, `is_primary`, `access_level` (view-only vs. can comment) so admins can meet the “link parent accounts” story.

### Student (tracked entity, no login)

- Stored within the `StudentProfiles` context with `id`, `first_name`, `last_name`, `preferred_name`, `date_of_birth`, `grade`, `status` (`Active`, `Onboarding`, `Archived`), `diagnoses` (JSON/lookup), and `notes`.
- **Ownership**: `teacher_id` (assigned educator), optional `case_manager_id`, plus the guardian pivot above to drive parent access.
- **Education context**: `assessment_summary`, `ieps_or_goals` (JSON), `current_learning_path_id`, `start_date`, `risk_flags` for analytics and scheduling.
- **Audit**: `created_by`, `updated_by`, timestamps to anchor reporting flows.

These attributes feed both the REST API contracts (e.g., `/api/v1/login` returning role + locale) and downstream modules (student filters by teacher, parent dashboards, admin rosters). Future migrations should create dedicated profile tables (`teacher_profiles`, `guardian_profiles`) keyed to `users.id` to keep the core `users` table lean while respecting the architecture boundaries above.

## 2. Backend Technology Stack

-   **Framework**: **Laravel 12** (or the latest stable version in 2025). It provides a robust, elegant, and productive development experience.
-   **API**: A versioned, stateless **RESTful API** (`/api/v1/...`). This decouples the backend from any frontend, enabling future clients like a mobile app.
-   **Authentication**: **Laravel Sanctum** for token-based API authentication. It's lightweight, secure, and ideal for SPAs.
-   **Database**: **PostgreSQL 17**. It offers superior data integrity, robustness, and powerful features for complex queries that will be valuable for the reporting module.
-   **Asynchronous Jobs**: **Laravel Queues with Redis**. For handling time-consuming tasks like report generation and sending notifications without blocking the user interface. This is crucial for a good user experience.
-   **Authorization**: **Laravel Policies & Gates** will be used extensively to ensure a teacher can only manage their assigned students and a parent can *only* view their own child's data.
-   **Real-time Communication**: **Laravel Reverb** (or Soketi) for WebSocket communication. This can be used for future features like real-time notifications for parents when a teacher adds a new note.

## 3. Frontend Technology Stack

-   **Framework**: **React 19 with TypeScript** (via Vite). A Single Page Application (SPA) provides a fast, modern, and app-like user experience. TypeScript adds strong type safety, reducing bugs and improving developer experience.
-   **Styling**: **Tailwind CSS**. A utility-first CSS framework that allows for rapid and highly customizable UI development.
-   **State Management**: **Redux Toolkit**. A predictable and powerful way to manage the application's state, especially in a system with different user roles and complex data flows.
-   **Data Fetching**: **TanStack Query (React Query)**. For declaratively fetching, caching, and updating data from the API, which simplifies data synchronization and improves perceived performance.

## 4. DevOps and Infrastructure

-   **Containerization**: **Docker** (with Docker Compose for local development). This ensures a consistent and reproducible environment for development, testing, and production.
-   **CI/CD**: **GitHub Actions**. To automate the entire pipeline:
    1.  **On Pull Request**: Run static analysis (Larastan), code style checks (Pint), and automated tests (Pest).
    2.  **On Merge to `main`**: Deploy automatically to a staging environment.
    3.  **On Tag/Release**: Deploy to the production environment.
-   **Hosting**:
    -   **Recommended**: **Laravel Forge** or **Vapor** for seamless management and deployment of the Laravel backend on servers from DigitalOcean, AWS, etc.
    -   **Alternative**: A fully containerized deployment on **AWS (ECS/Fargate)** or **DigitalOcean (App Platform)**.
-   **File Storage**: **Amazon S3** (or a compatible service like DigitalOcean Spaces). For securely storing uploaded documents, images, and learning materials.

## 5. Testing Strategy

A multi-layered testing approach is critical for ensuring the system is reliable.

-   **Backend (Pest)**:
    -   **Unit Tests**: For individual classes and functions in isolation (e.g., a specific calculation in the reporting module).
    -   **Feature/Integration Tests**: For testing application features from the perspective of a user making HTTP requests (e.g., creating a student profile).
    -   **API Tests**: To ensure the API contract is maintained.
-   **Frontend (Jest & React Testing Library)**:
    -   **Unit Tests**: For individual React components and utility functions.
    -   **Integration Tests**: For testing user flows within the frontend application.

## 6. API Schema (v1)

The API will be versioned under the `/api/v1` prefix. All responses will be in JSON format.

### 6.1 User Management

#### 6.1.1 `POST /api/v1/register`

Registers a new user.

-   **Request Body**:
    ```json
    {
      "name": "string",
      "email": "string (email)",
      "password": "string (min: 8, confirmed)",
      "password_confirmation": "string"
    }
    ```

## 7. Environment & Testing Posture

- **Local runtime**: Target PostgreSQL 16+ using the provided Docker setup (e.g., `postgres:16`) so JSON/array columns behave the same as production. Keep migrations and seeds Postgres-friendly (UUIDs, enums) and avoid vendor-specific SQL when possible.
- **Automated tests**: Pest runs against in-memory SQLite (`phpunit.xml` config) for speed. When adding Postgres-only features (JSONB operators, case-insensitive indexes), add feature tests that run against Postgres locally (`DB_CONNECTION=pgsql php artisan test`) before opening a PR.
- **Seed data**: `php artisan migrate:fresh --seed` now provisions a default `admin/admin` account plus Faker-driven teacher/parent metadata so the React app immediately has realistic data to render.
- **Queue/cache**: Use database drivers in development unless the story explicitly requires Redis; this minimizes external dependencies while we flesh out domains.
-   **Response (201 Created)**:
    ```json
    {
      "user": {
        "id": "integer",
        "name": "string",
        "email": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
      },
      "token": "string (Sanctum API token)"
    }
    ```

#### 6.1.2 `POST /api/v1/login`

Logs in a user.

-   **Request Body**:
    ```json
    {
      "email": "string (email)",
      "password": "string"
    }
    ```
-   **Response (200 OK)**:
    ```json
    {
      "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
      },
      "token": "string (Sanctum API token)"
    }
    ```

#### 6.1.3 `POST /api/v1/logout`

Logs out the authenticated user.

-   **Authentication**: Bearer Token required.
-   **Response (204 No Content)**

### Frontend Authentication Notes

- The SPA uses Sanctum API tokens for authenticated requests. After `/api/v1/login`, the frontend stores the token (and user payload) in `localStorage` as `rr_token`/`rr_user` and globally configures Axios to send `Authorization: Bearer <token>` on every request. Any new HTTP client (page/component/hook) must either reuse the Axios instance from `resources/js/bootstrap.ts` or set the header manually, otherwise protected routes behind `auth:sanctum` respond with `401 Unauthenticated`.
- CSRF protection still applies: the Axios bootstrap interceptor also forwards the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN` so state-changing requests remain compliant.

### 6.2 Student Profiles

#### 6.2.1 `GET /api/v1/students`

Retrieves a list of students for the authenticated teacher.

-   **Authentication**: Bearer Token required.
-   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "integer",
          "name": "string",
          "date_of_birth": "date"
        }
      ]
    }
    ```

#### 6.2.2 `POST /api/v1/students`

Creates a new student profile.

-   **Authentication**: Bearer Token required.
-   **Request Body**:
    ```json
    {
      "name": "string",
      "date_of_birth": "date"
    }
    ```
-   **Response (201 Created)**:
    ```json
    {
      "id": "integer",
      "name": "string",
      "date_of_birth": "date"
    }
    ```
