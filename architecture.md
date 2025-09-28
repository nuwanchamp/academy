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
