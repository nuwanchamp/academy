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

## 4. Frontend Architecture

The frontend is built with React and TypeScript, utilizing Vite for a fast development experience. It follows a component-based architecture, with a clear separation of concerns.

### 4.1 Design System

The project utilizes **shadcn/ui** components, styled with **Tailwind CSS**, to provide a consistent and intelligent theme. This approach allows for highly customizable and accessible UI components. The theming supports light, dark, and system modes, managed by a custom `ThemeProvider`.

-   **Components**: Reusable UI components are located in `resources/js/components/ui/`.
-   **Styling**: Tailwind CSS is used for all styling, with custom CSS variables defined in `resources/css/app.css` to manage the color palette and other design tokens.
-   **Theming**: The `ThemeProvider` (located in `resources/js/components/theme-provider.tsx`) handles theme switching (light, dark, system) and persists the user's preference.
-   **Utilities**: Common utility functions, such as `cn` for merging Tailwind classes, are found in `resources/js/lib/utils.ts`.

### 4.2 Project Structure

-   `resources/js/app.ts`: Main entry point for the React application.
-   `resources/js/Index.tsx`: Root React component, responsible for routing and theme provisioning.
-   `resources/js/pages/`: Contains page-level components (e.g., `Home.tsx`, `Register.tsx`).
-   `resources/js/components/`: Contains reusable components, including the `ui` library components.

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