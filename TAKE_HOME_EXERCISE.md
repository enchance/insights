
# Senior Software Developer — Take-Home Exercise

## 1. Overview
You are tasked with building a small **Investment Insights** web application using **Python/Django** for the backend and **React (TypeScript)** for the frontend. This exercise assesses your ability to design, implement, and document a full-stack solution with attention to code quality, testing, and CI/CD readiness.

---

## 2. Objectives
- Demonstrate proficiency in **Django + DRF** for API development.
- Implement a responsive **React** frontend with modern state management.
- Showcase testing strategies (unit + integration) and CI/CD awareness.
- Deliver clean, maintainable, and well-documented code.

---

## 3. Requirements

### 3.1 Backend (Django + DRF)
- **Models**: `Insight` with fields: `id`, `title`, `category` (enum), `body`, `tags` (list), timestamps.
- **Auth**: Session or token-based authentication.
- **API Endpoints**:
  - `POST /api/auth/login`
  - `GET /api/insights?search=&category=&tag=`
  - `POST /api/insights`
  - `PUT /api/insights/:id`
  - `DELETE /api/insights/:id`
  - `GET /api/analytics/top-tags`
- **Validation & Security**: Input validation, error handling, and secure defaults.
- **Tests**: Unit tests for models/serializers and API integration tests.

### 3.2 Frontend (React + TypeScript)
- **Pages**:
  - Login page
  - Insight list with filters
  - Create/Edit insight form
  - Analytics page with a chart of top tags
- **State Management**: React Context.
- **UI/UX**: Loading states and error handling.
- **Tests**: Component and integration tests.

---

## 4. Deliverables
- Source code in a Git repository.
- `REPORT.md` with setup instructions and architecture overview.
- Automated tests for backend and frontend.

---

## 5. Evaluation Rubric
- **Architecture & Code Quality**: 25%
- **API Design & Backend Proficiency**: 25%
- **Frontend Execution & UX**: 20%
- **Testing Depth**: 20%
- **Documentation & Developer Experience**: 10%

---

## 6. Timebox
Estimated effort: **6–8 hours**. Submission within **5 days**.

---

## 7. Submission Instructions
- Share a **read-only Git repository URL**.
- Include setup instructions and any assumptions in the REPORT.

---

## 8. Optional Extensions
- Role-based permissions.
- Tag auto-complete.
- Advanced analytics.
- Performance optimizations.

---

## 9. Starter API Contracts
```http
# Authentication
POST /api/auth/login
{ "username": "alice", "password": "secret" }

# List insights - all query string parameters are optional
GET /api/insights?search=alpha&category=Macro&tag=Inflation&page=1&page_size=10

# Create insight
POST /api/insights
{
  "title": "Q1 Inflation Watch",
  "category": "Macro",
  "body": "CPI surprised on the upside...",
  "tags": ["Inflation","Rates","CPI"]
}

# Analytics
GET /api/analytics/top-tags
# => { "tags": [{ "name":"Inflation", "count": 7 }, ...] }
```
