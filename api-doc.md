# Rainbow Roots API Documentation

## Overview
- **Purpose**: Versioned REST API for user authentication, student management, guardian onboarding, learning content (modules/paths), and study session scheduling.
- **Style**: JSON-only, stateless, path versioned (`/api/v1`), protected by Laravel Sanctum bearer tokens.
- **Roles**: `admin`, `teacher`, `parent` with route-level authorization.
- **Key flows**: Register/login → bearer token; manage students/guardians; manage learning modules/paths; schedule sessions and enroll students (with waitlisting).

## Environments & Base URLs
- Sandbox/local: `http://localhost:8000/api/v1`
- Production: `https://<your-domain>/api/v1`
- Content type: `Content-Type: application/json`, `Accept: application/json`

## Versioning
- Path-based: `/api/v1/...`
- No header negotiation. Breaking changes must ship as `/api/v2`.

## Authentication & Authorization
- Scheme: Bearer tokens issued by Sanctum personal access tokens.
- Header: `Authorization: Bearer <token>`
- Token lifetime: No expiry by default (`config/sanctum.php:expiration = null`). Revoke via logout or deleting tokens.
- Roles:
  - `admin`: Full access.
  - `teacher`: Own students/sessions; can create/update students, sessions, enrollments.
  - `parent`: Read-only via parent portal endpoints (created by staff).
- Errors: 401 (missing/invalid token), 403 (role or ownership blocked).

### Example Auth Flow
1) `POST /api/v1/login` with credentials → receive `token`.
2) Send `Authorization: Bearer <token>` on protected calls.
3) `POST /api/v1/logout` to revoke current token.

## Error Format & Status Codes
- Validation: `422 Unprocessable Entity`
  ```json
  {
    "message": "The given data was invalid.",
    "errors": { "field": ["Error message"] }
  }
  ```
- Auth: `401 Unauthorized`; Forbidden: `403`; Not found: `404`; Bad request: `400` (mismatched resources); Success: `200/201/204`.

## Pagination, Filtering, Limits
- Pagination: Laravel paginator with `data`, `links`, `meta`. Query `per_page` (1–50, default 10).
- Filtering: Query params noted per endpoint (e.g., `search`, `status`, `subject`, `grade_band`, `visibility`, `grade`).
- Rate limiting: Default Laravel `api` throttle (commonly 60 req/min per user/IP unless overridden).

## Endpoint Reference (v1)

### User Management

**POST /api/v1/register**
- cURL
```bash
curl -X POST https://your-domain/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Teacher","email":"alex@example.com","password":"secret123","password_confirmation":"secret123"}'
```
- Request
```json
{"name":"Alex Teacher","email":"alex@example.com","password":"secret123","password_confirmation":"secret123"}
```
- Success 201
```json
{
  "user": {"id":1,"name":"Alex Teacher","email":"alex@example.com","role":"teacher","preferred_locale":"en","timezone":"UTC","is_active":true,"last_login_at":null},
  "token": "plain-text-token"
}
```
- Errors
  - 422 Validation
  ```json
  {"message":"The given data was invalid.","errors":{"email":["The email has already been taken."]}}
  ```

**POST /api/v1/login**
- cURL
```bash
curl -X POST https://your-domain/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"alex@example.com","password":"secret123"}'
```
- Request
```json
{"identifier":"alex@example.com","password":"secret123"}
```
- Success 200
```json
{
  "user": {"id":1,"name":"Alex Teacher","email":"alex@example.com","role":"teacher","preferred_locale":"en","timezone":"UTC","is_active":true,"last_login_at":"2025-03-01 14:03:22"},
  "token": "plain-text-token"
}
```
- Errors
  - 422 Invalid credentials
  ```json
  {"message":"The given data was invalid.","errors":{"identifier":["These credentials do not match our records."]}}
  ```

**POST /api/v1/logout** (auth)
- cURL
```bash
curl -X POST https://your-domain/api/v1/logout \
  -H "Authorization: Bearer <token>"
```
- Success 204: No body.
- Errors
  - 401 Missing/invalid token.

**POST /api/v1/password/forgot**
- cURL
```bash
curl -X POST https://your-domain/api/v1/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com"}'
```
- Request
```json
{"email":"alex@example.com"}
```
- Success 200
```json
{"message":"passwords.sent"}
```
- Errors
  - 422 Unknown email
  ```json
  {"message":"The given data was invalid.","errors":{"email":["We can't find a user with that email address."]}}
  ```

**POST /api/v1/password/reset**
- cURL
```bash
curl -X POST https://your-domain/api/v1/password/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"reset-token","email":"alex@example.com","password":"newpass123","password_confirmation":"newpass123"}'
```
- Request
```json
{"token":"reset-token","email":"alex@example.com","password":"newpass123","password_confirmation":"newpass123"}
```
- Success 200
```json
{"message":"passwords.reset"}
```
- Errors
  - 422 Invalid token/email
  ```json
  {"message":"The given data was invalid.","errors":{"email":["This password reset token is invalid."]}}
  ```

### Student Profiles (auth required; teacher/case-manager ownership enforced on show/update)

**GET /api/v1/students**
- cURL
```bash
curl "https://your-domain/api/v1/students?per_page=10&grade=5&search=ana" \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "data": [
    {"id":11,"name":"Ana Rivera","first_name":"Ana","last_name":"Rivera","preferred_name":null,"date_of_birth":"2012-09-10","grade":"5","status":"active"}
  ],
  "filters": {"grades":["4","5","6"]},
  "links": {...},
  "meta": {...}
}
```
- Empty list 200
```json
{"data":[],"filters":{"grades":[]},"links":{},"meta":{"total":0}}
```
- Errors
  - 401 Missing/invalid token.

**GET /api/v1/students/{id}**
- cURL
```bash
curl https://your-domain/api/v1/students/11 \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "id":11,
  "first_name":"Ana","last_name":"Rivera","preferred_name":null,
  "date_of_birth":"2012-09-10","grade":"5","status":"active",
  "diagnoses":[],"notes":null,"assessment_summary":null,
  "ieps_or_goals":[],"risk_flags":[],
  "teacher_id":3,"case_manager_id":3,"current_learning_path_id":null,
  "start_date":null,"created_at":"2025-02-01 10:00:00","updated_at":"2025-02-01 10:00:00",
  "guardians":[]
}
```
- Errors
  - 401 Unauthorized
  - 403 Forbidden (not in caseload)
  - 404 Not found (invalid id)

**POST /api/v1/students**
- cURL
```bash
curl -X POST https://your-domain/api/v1/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Rivera","date_of_birth":"2012-09-10","grade":"5","case_manager_id":3,"teacher_id":3,"guardians":[{"id":10,"relationship":"mother","is_primary":true,"access_level":"view","notifications_opt_in":true}]}'
```
- Request
```json
{
  "first_name":"Ana",
  "last_name":"Rivera",
  "date_of_birth":"2012-09-10",
  "grade":"5",
  "case_manager_id":3,
  "teacher_id":3,
  "status":"onboarding",
  "guardians":[{"id":10,"relationship":"mother","is_primary":true,"access_level":"view","notifications_opt_in":true}]
}
```
- Success 201
```json
{
  "id":11,
  "first_name":"Ana","last_name":"Rivera","preferred_name":null,
  "date_of_birth":"2012-09-10","grade":"5","status":"onboarding",
  "diagnoses":[], "notes":null, "assessment_summary":null,
  "ieps_or_goals":[], "risk_flags":[],
  "teacher_id":3, "case_manager_id":3, "current_learning_path_id":null,
  "start_date":null, "created_at":"2025-02-01 10:00:00", "updated_at":"2025-02-01 10:00:00",
  "guardians":[{"id":10,"name":"Maria Rivera","email":"maria@example.com","pivot":{"relationship":"mother","is_primary":true,"access_level":"view","notifications_opt_in":true},"profile":{"primary_phone":"555-1111","address_line1":null}}]
}
```
- Errors
  - 401 Unauthorized
  - 422 Validation (e.g., missing required fields)
  ```json
  {"message":"The given data was invalid.","errors":{"case_manager_id":["The case manager id field is required."]}}
  ```

**PATCH /api/v1/students/{id}**
- cURL
```bash
curl -X PATCH https://your-domain/api/v1/students/11 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"preferred_name":"Annie","status":"active"}'
```
- Request
```json
{"preferred_name":"Annie","status":"active"}
```
- Success 200
```json
{
  "id":11,
  "first_name":"Ana","last_name":"Rivera","preferred_name":"Annie",
  "status":"active",
  "grade":"5",
  "updated_at":"2025-03-02 12:00:00"
}
```
- Errors
  - 401 Unauthorized
  - 403 Forbidden (not in caseload)
  - 404 Not found
  - 422 Validation

### Parent Portal (auth required)

**POST /api/v1/parents**
- cURL
```bash
curl -X POST https://your-domain/api/v1/parents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Maria","last_name":"Rivera","email":"maria@example.com","primary_phone":"555-1111","students":[{"id":11,"relationship":"mother","is_primary":true,"access_level":"view"}]}'
```
- Request
```json
{
  "first_name":"Maria",
  "last_name":"Rivera",
  "email":"maria@example.com",
  "primary_phone":"555-1111",
  "students":[{"id":11,"relationship":"mother","is_primary":true,"access_level":"view"}],
  "send_portal_invite":true
}
```
- Success 201
```json
{
  "user":{"id":10,"name":"Maria Rivera","email":"maria@example.com","role":"parent"},
  "profile":{"primary_phone":"555-1111","communication_preferences":[]},
  "students":[{"id":11,"first_name":"Ana","last_name":"Rivera","pivot":{"relationship":"mother","is_primary":true,"access_level":"view","notifications_opt_in":true}}]
}
```
- Errors
  - 401 Unauthorized
  - 422 Validation
  ```json
  {"message":"The given data was invalid.","errors":{"email":["The email has already been taken."]}}
  ```

**GET /api/v1/parents**
- cURL
```bash
curl https://your-domain/api/v1/parents \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "data":[
    {
      "user":{"id":10,"name":"Maria Rivera","email":"maria@example.com","role":"parent"},
      "profile":{"primary_phone":"555-1111","communication_preferences":[]},
      "students":[{"id":11,"first_name":"Ana","last_name":"Rivera","pivot":{"relationship":"mother","is_primary":true,"access_level":"view","notifications_opt_in":true}}]
    }
  ]
}
```
- Empty 200
```json
{"data":[]}
```
- Errors
  - 401 Unauthorized

### Learning Modules (auth required)

**GET /api/v1/modules**
- cURL
```bash
curl "https://your-domain/api/v1/modules?per_page=10&subject=Math&status=published" \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "data":[{"id":21,"code":"MATH-101","title":"Fractions","status":"published","tags":["math"],"updated_at":"2025-02-01 12:00:00"}],
  "filters":{"subjects":["Math"],"grade_bands":["5-6"],"statuses":["draft","published"]},
  "links":{},
  "meta":{}
}
```
- Empty 200
```json
{"data":[],"filters":{"subjects":[],"grade_bands":[],"statuses":[]},"links":{},"meta":{"total":0}}
```
- Errors
  - 401 Unauthorized

**GET /api/v1/modules/{id}**
- cURL
```bash
curl https://your-domain/api/v1/modules/21 \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "id":21,"uuid":"...","code":"MATH-101","title":"Fractions","status":"published",
  "objectives":["Understand fractions"],"tags":["math"],
  "authors":[{"id":1,"name":"Alex Teacher","role":"author","bio":null,"contact_links":[]}],
  "lessons":[{"id":201,"sequence_order":1,"title":"Intro to Fractions","materials":[],"media_uploads":[]}]
}
```
- Errors
  - 401 Unauthorized
  - 404 Not found

**POST /api/v1/modules**
- cURL
```bash
curl -X POST https://your-domain/api/v1/modules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"MATH-201","title":"Decimals","status":"draft","tags":["math"],"lessons":[{"title":"Intro","sequence_order":1}]}'
```
- Request
```json
{
  "code":"MATH-201",
  "title":"Decimals",
  "status":"draft",
  "tags":["math"],
  "lessons":[{"title":"Intro","sequence_order":1}]
}
```
- Success 201
```json
{"id":22,"code":"MATH-201","title":"Decimals","status":"draft","tags":["math"],"lessons":[{"id":301,"title":"Intro","sequence_order":1}]}
```
- Errors
  - 401 Unauthorized
  - 422 Validation
  ```json
  {"message":"The given data was invalid.","errors":{"code":["The code has already been taken."]}}
  ```

**PATCH /api/v1/modules/{id}**
- cURL
```bash
curl -X PATCH https://your-domain/api/v1/modules/22 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"published","version_label":"v1.0"}'
```
- Request
```json
{"status":"published","version_label":"v1.0"}
```
- Success 200
```json
{"id":22,"code":"MATH-201","title":"Decimals","status":"published","version_label":"v1.0"}
```
- Errors
  - 401 Unauthorized
  - 404 Not found
  - 422 Validation

**DELETE /api/v1/modules/{id}**
- cURL
```bash
curl -X DELETE https://your-domain/api/v1/modules/22 \
  -H "Authorization: Bearer <token>"
```
- Success 204: No body.
- Errors
  - 401 Unauthorized
  - 404 Not found

### Learning Paths (auth required)

**GET /api/v1/paths**
- cURL
```bash
curl "https://your-domain/api/v1/paths?per_page=10&subject=Math&visibility=school" \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "data":[{"id":31,"code":"PATH-1","title":"Math Foundations","status":"draft","visibility":"private","modules_count":3}],
  "filters":{"subjects":["Math"],"grade_bands":["5-6"],"statuses":["draft","published"],"visibilities":["private","school","district"]},
  "links":{}, "meta":{}
}
```
- Empty 200
```json
{"data":[],"filters":{"subjects":[],"grade_bands":[],"statuses":[],"visibilities":[]},"links":{},"meta":{"total":0}}
```
- Errors
  - 401 Unauthorized

**GET /api/v1/paths/{id}**
- cURL
```bash
curl https://your-domain/api/v1/paths/31 \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
{
  "id":31,"code":"PATH-1","title":"Math Foundations","status":"draft","visibility":"private",
  "modules":[{"id":21,"code":"MATH-101","title":"Fractions","sequence_order":1}]
}
```
- Errors
  - 401 Unauthorized
  - 404 Not found

**POST /api/v1/paths**
- cURL
```bash
curl -X POST https://your-domain/api/v1/paths \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"PATH-NEW","title":"STEM Exploration","modules":[{"id":21,"sequence_order":1}],"visibility":"school"}'
```
- Request
```json
{"code":"PATH-NEW","title":"STEM Exploration","modules":[{"id":21,"sequence_order":1}],"visibility":"school"}
```
- Success 201
```json
{"id":32,"code":"PATH-NEW","title":"STEM Exploration","visibility":"school","modules":[{"id":21,"code":"MATH-101","title":"Fractions","sequence_order":1}]}
```
- Errors
  - 401 Unauthorized
  - 422 Validation
  ```json
  {"message":"The given data was invalid.","errors":{"code":["The code has already been taken."]}}
  ```

**PATCH /api/v1/paths/{id}**
- cURL
```bash
curl -X PATCH https://your-domain/api/v1/paths/32 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"published","visibility":"district"}'
```
- Request
```json
{"status":"published","visibility":"district"}
```
- Success 200
```json
{"id":32,"code":"PATH-NEW","status":"published","visibility":"district"}
```
- Errors
  - 401 Unauthorized
  - 404 Not found
  - 422 Validation

**DELETE /api/v1/paths/{id}**
- cURL
```bash
curl -X DELETE https://your-domain/api/v1/paths/32 \
  -H "Authorization: Bearer <token>"
```
- Success 204: No body.
- Errors
  - 401 Unauthorized
  - 404 Not found

### Scheduling (auth required; teacher/admin unless noted)

**GET /api/v1/study-sessions**
- cURL
```bash
curl https://your-domain/api/v1/study-sessions \
  -H "Authorization: Bearer <token>"
```
- Success 200
```json
[
  {
    "id":44,"title":"Reading Lab","starts_at":"2025-03-10 15:00:00","ends_at":"2025-03-10 16:00:00",
    "capacity":6,"status":"scheduled","enrolled_count":0,"waitlist_count":0,
    "occurrences":[{"id":91,"starts_at":"2025-03-10 15:00:00","ends_at":"2025-03-10 16:00:00","status":"scheduled"}]
  }
]
```
- Empty 200: `[]`
- Errors: 401 Unauthorized

**GET /api/v1/study-sessions/{id}**
- cURL
```bash
curl https://your-domain/api/v1/study-sessions/44 \
  -H "Authorization: Bearer <token>"
```
- Success 200: Same shape as list item with occurrences.
- Errors: 401 Unauthorized; 403 Forbidden (not owner); 404 Not found.

**POST /api/v1/study-sessions**
- cURL
```bash
curl -X POST https://your-domain/api/v1/study-sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Reading Lab","starts_at":"2025-03-10T15:00:00Z","ends_at":"2025-03-10T16:00:00Z","capacity":6,"recurrence":{"frequency":"weekly","count":2}}'
```
- Request
```json
{"title":"Reading Lab","starts_at":"2025-03-10T15:00:00Z","ends_at":"2025-03-10T16:00:00Z","capacity":6,"recurrence":{"frequency":"weekly","count":2}}
```
- Success 201
```json
{
  "id":44,"title":"Reading Lab","starts_at":"2025-03-10 15:00:00","ends_at":"2025-03-10 16:00:00",
  "capacity":6,"status":"scheduled",
  "occurrences":[{"id":91,"starts_at":"2025-03-10 15:00:00","ends_at":"2025-03-10 16:00:00","status":"scheduled"},{"id":92,"starts_at":"2025-03-17 15:00:00","ends_at":"2025-03-17 16:00:00","status":"scheduled"}]
}
```
- Errors: 401 Unauthorized; 422 Validation (overlapping time/capacity rules).

**PATCH /api/v1/study-sessions/{id}**
- cURL
```bash
curl -X PATCH https://your-domain/api/v1/study-sessions/44 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"cancelled"}'
```
- Request
```json
{"status":"cancelled"}
```
- Success 200
```json
{"id":44,"status":"cancelled","occurrences":[{"id":91,"status":"cancelled"}]}
```
- Errors: 401 Unauthorized; 403 Forbidden; 404 Not found; 422 Validation (end before start).

**PATCH /api/v1/study-sessions/{sessionId}/occurrences/{occurrenceId}**
- cURL
```bash
curl -X PATCH https://your-domain/api/v1/study-sessions/44/occurrences/91 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"starts_at":"2025-03-10T16:00:00Z","ends_at":"2025-03-10T17:00:00Z"}'
```
- Request
```json
{"starts_at":"2025-03-10T16:00:00Z","ends_at":"2025-03-10T17:00:00Z"}
```
- Success 200
```json
{"id":91,"study_session_id":44,"starts_at":"2025-03-10 16:00:00","ends_at":"2025-03-10 17:00:00","status":"scheduled"}
```
- Errors: 401 Unauthorized; 403 Forbidden; 404 Not found; 422 Validation.

**POST /api/v1/study-sessions/{sessionId}/enrollments**
- cURL
```bash
curl -X POST https://your-domain/api/v1/study-sessions/44/enrollments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":11}'
```
- Request
```json
{"student_id":11}
```
- Success 201
```json
{"id":501,"study_session_id":44,"student_id":11,"status":"enrolled","waitlist_position":null,"created_at":"2025-03-02 13:00:00"}
```
- Errors: 401 Unauthorized; 403 Forbidden (not owner or student not in caseload); 404 Not found; 422 Already enrolled or capacity reached waitlist position.

**DELETE /api/v1/study-sessions/{sessionId}/enrollments/{enrollmentId}**
- cURL
```bash
curl -X DELETE https://your-domain/api/v1/study-sessions/44/enrollments/501 \
  -H "Authorization: Bearer <token>"
```
- Success 204: No body.
- Errors: 401 Unauthorized; 403 Forbidden; 404 Not found; 400 Enrollment-session mismatch.

## Schemas (YAML-style)
```yaml
User:
  id: integer
  first_name: string|null
  last_name: string|null
  name: string
  preferred_name: string|null
  email: string
  role: string (teacher|admin|parent)
  preferred_locale: string
  timezone: string
  is_active: boolean
  last_login_at: datetime|null

StudentSummary: &StudentSummary
  id: integer
  name: string
  first_name: string
  last_name: string
  preferred_name: string|null
  date_of_birth: date|null
  grade: string|null
  status: onboarding|active|archived

Student: &Student
  <<: *StudentSummary
  diagnoses: string[]
  notes: string|null
  assessment_summary: string|null
  ieps_or_goals: string[]
  risk_flags: string[]
  teacher_id: integer|null
  case_manager_id: integer|null
  current_learning_path_id: integer|null
  start_date: date|null
  created_at: datetime|null
  updated_at: datetime|null
  guardians:
    - id: integer
      name: string
      email: string
      pivot:
        relationship: string|null
        is_primary: boolean
        access_level: view|comment
        notifications_opt_in: boolean
      profile:
        primary_phone: string|null
        address_line1: string|null

Parent:
  user: User
  profile:
    household_id: string|null
    primary_phone: string|null
    secondary_phone: string|null
    address_line1: string|null
    address_line2: string|null
    city: string|null
    state: string|null
    postal_code: string|null
    preferred_contact_times: string|null
    communication_preferences: string[]
    identity_verified_at: datetime|null
  students:
    - <<: *Student
      pivot:
        relationship: string|null
        is_primary: boolean
        access_level: view|comment
        notifications_opt_in: boolean

PathSummary: &PathSummary
  id: integer
  uuid: string
  code: string
  title: string
  summary: string|null
  subject: string|null
  grade_band: string|null
  status: draft|published|archived
  visibility: private|school|district
  pacing: string|null
  modules_count: integer|null
  updated_at: datetime|null

Path:
  <<: *PathSummary
  objectives: string[]
  success_metrics: string[]
  planned_release_date: date|null
  published_at: datetime|null
  archived_at: datetime|null
  owner: { id: integer, name: string, email: string }|null
  modules:
    - id: integer
      code: string
      title: string
      sequence_order: integer

ModuleSummary: &ModuleSummary
  id: integer
  uuid: string
  code: string
  title: string
  summary: string|null
  subject: string|null
  grade_band: string|null
  status: draft|published|archived
  version_label: string|null
  difficulty: string|null
  estimated_duration: string|null
  learning_type: string|null
  lessons_count: integer|null
  tags: string[]
  updated_at: datetime|null

Module:
  <<: *ModuleSummary
  objectives: string[]
  prerequisites: string[]
  progress_tracking: string|null
  completion_criteria: string|null
  feedback_strategy: string|null
  access_control: string|null
  published_at: datetime|null
  archived_at: datetime|null
  authors:
    - id: integer
      name: string
      role: string|null
      bio: string|null
      contact_links: [{ label: string, href: string }]
  lessons:
    - id: integer
      sequence_order: integer
      title: string
      summary: string|null
      objectives: string[]
      body: string|null
      instructions: string|null
      outcomes: string[]
      materials:
        - id: integer
          name: string
          file_type: string|null
          file_size_bytes: integer|null
          storage_path: string|null
          external_url: string|null
          meta: object
      media_uploads:
        - id: integer
          file_name: string
          storage_path: string|null
          mime_type: string|null
          file_size_bytes: integer|null
          meta: object

StudySession:
  id: integer
  teacher_id: integer
  title: string
  description: string|null
  starts_at: datetime
  ends_at: datetime
  location: string|null
  meeting_url: string|null
  capacity: integer
  timezone: string|null
  status: scheduled|cancelled
  enrolled_count: integer
  waitlist_count: integer
  occurrences: [StudySessionOccurrence]

StudySessionOccurrence:
  id: integer
  study_session_id: integer
  starts_at: datetime
  ends_at: datetime
  status: scheduled|cancelled

StudySessionEnrollment:
  id: integer
  study_session_id: integer
  student_id: integer
  status: enrolled|waitlisted
  waitlist_position: integer|null
  created_at: datetime
```

## Workflows
- **Auth**: Register/Login → store token → include `Authorization: Bearer <token>` → Logout to revoke.
- **Password Reset**: `POST /password/forgot` (email) → reset email with token → `POST /password/reset` with token/email/new password.
- **Learning Content**: Create modules → Create paths referencing module IDs (ordered) → Clients fetch paths/modules for delivery.
- **Student Management**: Auth teacher → list/create students → update (including guardian links) → use students for enrollments.
- **Scheduling**: Teacher creates session (optionally recurring) → occurrences materialized → enroll students (auto-waitlist) → update session/occurrence → cancel enrollment promotes next waitlisted.

## Examples
```http
POST /api/v1/login
Content-Type: application/json

{"identifier":"teacher@example.com","password":"secret123"}
```
```json
{
  "user": {
    "id": 12,
    "name": "Alex Teacher",
    "email": "teacher@example.com",
    "role": "teacher",
    "preferred_locale": "en",
    "timezone": "UTC",
    "is_active": true,
    "last_login_at": "2025-03-01 14:03:22"
  },
  "token": "plain-text-sanctum-token"
}
```
```http
POST /api/v1/study-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Reading Lab",
  "description": "Fluency focus",
  "starts_at": "2025-03-10T15:00:00Z",
  "ends_at": "2025-03-10T16:00:00Z",
  "location": "Room 12",
  "capacity": 6,
  "recurrence": { "frequency": "weekly", "count": 4 }
}
```
```json
{
  "data": {
    "id": 44,
    "teacher_id": 12,
    "title": "Reading Lab",
    "description": "Fluency focus",
    "starts_at": "2025-03-10 15:00:00",
    "ends_at": "2025-03-10 16:00:00",
    "location": "Room 12",
    "meeting_url": null,
    "capacity": 6,
    "timezone": "UTC",
    "status": "scheduled",
    "enrolled_count": 0,
    "waitlist_count": 0,
    "occurrences": [
      {"id":91,"study_session_id":44,"starts_at":"2025-03-10 15:00:00","ends_at":"2025-03-10 16:00:00","status":"scheduled"},
      {"id":92,"study_session_id":44,"starts_at":"2025-03-17 15:00:00","ends_at":"2025-03-17 16:00:00","status":"scheduled"}
    ]
  }
}
```

## Onboarding Notes
- Run `php artisan migrate --seed` for schema + demo data (default accounts).
- Sanctum stateful domains and token expiration are configured in `config/sanctum.php`; browser-exposed env keys must be prefixed `VITE_*`.
- Frontend should reuse the shared HTTP client to automatically send the bearer token.

## Changelog & Deprecations
- Current stable surface: `v1`. No deprecated endpoints. Introduce breaking changes via `/api/v2`.
