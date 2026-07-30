# Code Standards

Implementation rules and engineering conventions for the entire **Operator Guardian AI** project.

Every AI coding agent working on this project must follow these standards to maintain a clean architecture, scalable codebase, reliable AI integration, and production-quality implementation.

---

# Engineering Mindset

The AI agent should behave like a senior full-stack AI product engineer experienced in:

* Next.js applications
* Enterprise SaaS platforms
* Computer Vision systems
* AI-powered applications
* Real-time monitoring systems

Principles:

* Read all project context files before implementing any feature.
* Understand the complete workflow before writing code.
* Build one feature completely before moving to another.
* Every feature must be immediately testable.
* Prefer simple, readable solutions over complex implementations.
* Avoid unnecessary dependencies.
* Keep frontend, backend, and AI responsibilities separated.
* Never duplicate business logic.
* Build reusable components.
* Prioritize maintainability and scalability.

---

# Technology Standards

## Frontend

Required:

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Query

Rules:

* Use TypeScript strictly.
* Avoid using `any`.
* Create reusable components.
* Keep components small and focused.
* Separate UI and business logic.
* Follow responsive-first design.

---

## Backend

Backend platform:

* InsForge

Responsibilities:

* Authentication
* Database operations
* API management
* File storage
* Application logic

Rules:

* Never directly access database from frontend.
* All data operations must go through backend APIs.
* Validate all incoming data.
* Keep business rules on backend.

---

## AI Service

AI processing must remain separated from the main application.

Responsibilities:

* Face detection
* Face recognition
* Fatigue analysis
* Recommendation generation

Technologies:

* Python
* OpenCV
* MediaPipe
* InsightFace

Rules:

* Never run heavy AI processing inside Next.js.
* Never block frontend rendering with AI operations.
* Communicate through APIs.
* Return structured JSON responses.

---

# TypeScript Standards

Follow:

* Strict TypeScript mode.
* Meaningful variable names.
* Strong typing.
* Small reusable functions.

Good:

```typescript
interface Worker {
    id: string;
    name: string;
    fatigueScore: number;
    status: string;
}
```

Avoid:

```typescript
const data:any = response;
```

---

# React Component Standards

Components should follow:

```text
Component
 ├── UI
 ├── Props
 ├── State
 ├── Events
 └── API Calls
```

Rules:

* One component per file.
* Use meaningful component names.
* Avoid very large components.
* Extract reusable logic into hooks.

Example:

```
components/

WorkerCard.tsx

FatigueChart.tsx

AlertPanel.tsx

CameraFeed.tsx
```

---

# Folder Structure Standards

Use:

```
src/

app/
components/
hooks/
services/
lib/
types/
utils/

ai-service/

face_detection/
face_recognition/
fatigue_detection/
recommendation/
```

Rules:

* Use lowercase folder names.
* Use meaningful filenames.
* Avoid random utility folders.
* Keep features isolated.

---

# Naming Conventions

## Components

PascalCase:

```
WorkerCard

FatigueDashboard

CameraMonitor
```

---

## Functions

camelCase:

```
calculateFatigueScore()

registerWorker()

generateReport()
```

---

## Files

Use:

```
worker-card.tsx

fatigue-service.ts

camera-utils.ts
```

---

# API Standards

All APIs must:

* Have clear names.
* Validate inputs.
* Return predictable responses.
* Handle errors properly.

Example:

```json
{
 "success": true,
 "data": {
    "workerId": "EMP102",
    "fatigueScore": 75,
    "status": "HIGH"
 }
}
```

Error response:

```json
{
 "success": false,
 "message": "Worker not found"
}
```

---

# AI Integration Standards

## Face Detection

Technology:

* MediaPipe Face Detection

Purpose:

* Locate faces.
* Generate bounding boxes.

---

## Face Recognition

Technology:

* InsightFace

Rules:

* Generate embeddings during registration.
* Store embeddings securely.
* Compare embeddings during monitoring.
* Never store raw face images unnecessarily.

---

## Fatigue Detection

Use:

* MediaPipe Face Mesh
* MediaPipe Pose
* OpenCV

Analyze:

* Eye closure
* Blink rate
* Yawning
* Head pose
* Body posture
* Working duration

---

# Fatigue Score Rules

The score calculation must be explainable.

Example:

```
Eye Closure        +25

Yawning            +20

Poor Posture       +15

Long Working Time  +20

Head Tilt          +10

----------------------

Total Score = 90
```

Never create black-box fatigue predictions without explanation.

---

# Hugging Face Usage Standards

Hugging Face models should only be used for:

* Report generation
* AI summaries
* Supervisor insights
* Natural language explanations

Do not use Hugging Face LLMs for:

* Face detection
* Real-time camera processing
* Fatigue calculation

Workflow:

```
AI Monitoring Data

↓

Statistics

↓

Hugging Face Model

↓

Generated Report
```

---

# Database Standards

Database operations must:

* Use proper schemas.
* Validate relationships.
* Avoid duplicate records.
* Maintain historical records.

Main entities:

```
User

Worker

MonitoringSession

FatigueRecord

Alert

Recommendation

Report
```

---

# Business Logic

Business rules must never exist inside:

* React components
* UI files
* Client-side scripts

Business logic belongs in:

* Backend services
* API handlers
* AI processing services

Examples:

Correct:

```typescript
if(fatigueScore > 80){
    createAlert();
}
```

Incorrect:

```tsx
<Button onClick={() => updateDatabase()}>
```

---

# Validation

Always validate:

* Worker ID uniqueness.
* Required fields.
* Image uploads.
* Face detection success.
* API requests.
* User permissions.

Never silently fail.

Return meaningful messages.

---

# Error Handling

Good:

```typescript
throw new Error(
"Worker registration failed because face was not detected."
);
```

Bad:

```typescript
throw new Error("Error");
```

Rules:

* Show user-friendly messages.
* Log technical errors separately.
* Never expose sensitive information.

---

# Real-Time Processing Standards

Camera processing must:

* Avoid processing every frame unnecessarily.
* Use optimized intervals.
* Reduce unnecessary API calls.
* Maintain smooth UI performance.

Recommended:

```
Camera FPS

↓

Frame Sampling

↓

AI Processing

↓

Dashboard Update
```

---

# State Management

Use:

* React Query for server state.
* React state for local UI state.

Avoid:

* Duplicate state.
* Global state unless required.

---

# Security Standards

Always:

* Protect authenticated routes.
* Validate permissions.
* Secure API endpoints.
* Protect worker images.
* Encrypt sensitive data.

Never:

* Store passwords directly.
* Expose embeddings publicly.
* Trust frontend validation alone.

---

# Logging Standards

Log important events:

Examples:

* Worker Registered
* Face Recognition Successful
* High Fatigue Detected
* Alert Generated
* Report Created

Avoid excessive logging.

---

# Performance Standards

Always:

* Optimize images.
* Lazy load components.
* Minimize API calls.
* Cache reusable data.
* Avoid unnecessary rendering.

AI Processing:

* Use optimized models.
* Process frames efficiently.
* Avoid memory leaks.

---

# Import Order

Follow:

```
React / Next.js

↓

Third-party Libraries

↓

Internal Components

↓

Utilities

↓

Types
```

Example:

```typescript
import React from "react";

import { useQuery } from "@tanstack/react-query";

import WorkerCard from "@/components/WorkerCard";

import { calculateScore } from "@/utils/fatigue";
```

---

# Comments

Comments should explain:

Why something exists.

Good:

```typescript
// Process every 10th frame to maintain
// real-time performance while reducing AI load.
```

Avoid:

```typescript
// Calculate score
```

---

# Dependencies

Approved technologies:

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* InsForge

AI:

* OpenCV
* MediaPipe
* InsightFace
* Hugging Face Models

Do not install unnecessary libraries without justification.

---

# Testing Standards

Every feature must be tested.

Test:

Authentication:

* Login
* Logout
* Protected routes

Workers:

* Registration
* Recognition
* Profile updates

AI:

* Face detection
* Fatigue detection
* Recommendation generation

Dashboard:

* Real-time updates
* Analytics
* Reports

---

# Invariants

These rules must never be violated:

* Worker identities must remain unique.
* Face recognition only matches registered workers.
* AI predictions must be explainable.
* Fatigue scores must contain timestamps.
* Critical fatigue must generate alerts.
* Backend must control business logic.
* Frontend must never bypass permissions.
* Sensitive worker data must remain protected.
* AI services must remain separated from UI.
* Every important action must be logged.
* The application must remain scalable and maintainable.
