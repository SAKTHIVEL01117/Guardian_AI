# Library Docs

Project-specific usage patterns for the technologies used in **Operator Guardian AI**.

This document explains how each framework and library should be used inside this project — including implementation rules, patterns, and constraints.

Read the relevant section before implementing any feature using these technologies.

---

# Before Using Any Library

Before implementing any feature:

1. Check `AGENTS.md` at the project root for available skills and instructions.
2. Check MCP servers if available for updated documentation.
3. Read this file for project-specific usage rules.

Authority Order:

```
MCP Documentation

↓

AGENTS.md Instructions

↓

This Documentation

↓

General Knowledge
```

Never rely only on previous knowledge because libraries and APIs change frequently.

---

# Next.js 15

Operator Guardian AI uses Next.js as the main application framework.

Responsibilities:

* Application routing
* Server rendering
* API handling
* Frontend architecture
* Authentication flow

---

## App Router

Use Next.js App Router.

Structure:

```
app/

├── page.tsx

├── login/

├── dashboard/

├── workers/

├── monitoring/

├── analytics/

├── reports/

└── settings/
```

Rules:

* Use route-based organization.
* Keep pages focused.
* Avoid putting business logic directly inside pages.
* Use reusable components.

---

## Server Components

Use Server Components by default.

Suitable for:

* Data fetching
* Static content
* Dashboard initial loading

Avoid unnecessary client components.

---

## Client Components

Use `"use client"` only when required.

Suitable for:

* Camera access
* Real-time updates
* Interactive charts
* Forms
* User interactions

Examples:

```tsx
"use client";

export default function CameraMonitor(){
    return <CameraFeed />;
}
```

---

# TypeScript

TypeScript is mandatory across the project.

Rules:

* Enable strict mode.
* Avoid `any`.
* Define interfaces.
* Use proper return types.
* Share types between modules.

Example:

```typescript
interface FatigueResult {
    score:number;
    level:string;
    recommendation:string;
}
```

---

# React

React is used for UI development.

Rules:

* Build reusable components.
* Keep components small.
* Separate UI from business logic.
* Use hooks correctly.

Recommended structure:

```
Component

↓

Custom Hook

↓

Service Layer

↓

API
```

---

# React Query

Used for server state management.

Use for:

* Worker data
* Monitoring records
* Alerts
* Reports
* Analytics

Example:

```typescript
useQuery({
    queryKey:["workers"],
    queryFn:getWorkers
})
```

Rules:

* Do not duplicate API state manually.
* Use caching where possible.
* Handle loading and error states.

---

# Tailwind CSS

Used for styling.

Rules:

* Prefer utility classes.
* Maintain consistent spacing.
* Avoid unnecessary custom CSS.
* Build responsive layouts.

Example:

```tsx
<div className="
flex
items-center
rounded-lg
p-4
">
```

---

# shadcn/ui

Used for reusable UI components.

Use for:

* Buttons
* Cards
* Dialogs
* Forms
* Tables
* Alerts
* Dropdowns

Rules:

* Customize components when needed.
* Keep design consistent.
* Avoid installing duplicate UI libraries.

---

# InsForge Backend

InsForge manages:

* Authentication
* Database
* Storage
* APIs
* Backend services

---

## Authentication

Use InsForge authentication.

Features:

* Login
* Logout
* Session handling
* User roles

Rules:

* Never store passwords manually.
* Always validate sessions server-side.
* Protect private routes.

---

## Database

Database:

PostgreSQL

Managed through:

InsForge services.

Main tables:

```
users

workers

monitoring_sessions

fatigue_records

alerts

recommendations

reports
```

Rules:

* Validate data before insertion.
* Maintain relationships.
* Never duplicate records.
* Preserve historical data.

---

## Storage

Used for:

* Worker profile images
* Generated reports
* Documentation files

Rules:

* Validate uploaded files.
* Restrict access.
* Avoid storing unnecessary images.

---

# OpenCV

OpenCV handles image and video processing.

Used for:

* Frame processing
* Image manipulation
* Camera stream handling

Rules:

* Optimize processing speed.
* Avoid unnecessary frame analysis.
* Release resources properly.

Example workflow:

```
Camera Frame

↓

OpenCV Processing

↓

AI Model

↓

Result
```

---

# MediaPipe

MediaPipe is used for real-time computer vision.

---

## Face Detection

Use:

MediaPipe Face Detection

Purpose:

* Detect faces
* Generate bounding boxes
* Locate worker position

Output:

```json
{
"faceDetected":true,
"x":120,
"y":80
}
```

---

## Face Mesh

Use:

MediaPipe Face Mesh

Purpose:

Detect:

* Eye landmarks
* Mouth landmarks
* Facial orientation

Used for:

* Blink detection
* Eye closure
* Yawning

---

## Pose Detection

Use:

MediaPipe Pose

Purpose:

Detect:

* Body posture
* Shoulder position
* Head alignment

Used for fatigue analysis.

---

# InsightFace

Used for face recognition.

Responsibilities:

* Generate face embeddings.
* Compare worker identities.
* Recognize registered workers.

Workflow:

```
Worker Image

↓

InsightFace

↓

Embedding

↓

Store

↓

Camera Embedding Comparison
```

Rules:

* Store embeddings securely.
* Do not expose embeddings publicly.
* Require confidence threshold.
* Handle unknown faces safely.

---

# Hugging Face Models

Hugging Face models are used only for higher-level AI tasks.

Allowed:

* Report generation
* AI summaries
* Supervisor insights
* Natural language explanations

Not allowed:

* Real-time face detection
* Camera processing
* Fatigue calculation

Workflow:

```
AI Monitoring Data

↓

Statistics

↓

Hugging Face Model

↓

Human-readable Report
```

---

# AI Service Architecture

AI services must remain separate.

Structure:

```
ai-service/

├── face_detection

├── face_recognition

├── fatigue_detection

├── recommendation

└── reports
```

Rules:

* Communicate through APIs.
* Return JSON responses.
* Handle AI failures gracefully.
* Keep models replaceable.

---

# Charts & Analytics

Recommended:

Recharts

Used for:

* Fatigue trends
* Productivity charts
* Department comparison
* Risk analytics

Rules:

* Charts must use real backend data.
* Include loading states.
* Handle empty data.

---

# Forms

Use:

React Hook Form

For:

* Worker registration
* Login
* Settings
* Reports

Rules:

* Validate inputs.
* Display useful errors.
* Prevent invalid submissions.

---

# API Communication

All communication should follow:

```
Frontend

↓

API Layer

↓

Backend

↓

Database / AI Service
```

Never:

* Call databases directly from UI.
* Put secrets in frontend code.
* Bypass APIs.

---

# Real-Time Monitoring

Camera processing rules:

* Do not process every frame.
* Sample frames intelligently.
* Maintain smooth UI performance.
* Avoid blocking browser execution.

Recommended:

```
Camera Stream

↓

Frame Sampling

↓

AI Processing

↓

Dashboard Update
```

---

# Notifications

Store notifications through backend.

Events:

* High Fatigue
* Critical Fatigue
* Unknown Worker
* Camera Failure
* AI Warning

Each notification must contain:

* Type
* Message
* Timestamp
* Status

---

# Reports

Reports are generated from stored analytics.

Types:

* Daily Fatigue Report
* Worker Performance Report
* Shift Summary
* Safety Report

AI may enhance explanations but calculations must come from backend data.

---

# Performance

Always:

* Optimize images.
* Lazy load components.
* Cache API responses.
* Reduce unnecessary renders.
* Optimize AI processing.

Avoid:

* Large client bundles.
* Duplicate API requests.
* Memory leaks.

---

# Security

Always:

* Protect routes.
* Validate permissions.
* Secure API endpoints.
* Protect worker data.

Never:

* Expose API keys.
* Store passwords.
* Publish biometric information.

---

# Logging

Important events:

* Worker Registered
* Face Recognized
* Fatigue Detected
* Alert Generated
* Report Created

Avoid unnecessary logs.

---

# Dependencies

Approved Technologies:

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Query
* React Hook Form

## Backend

* InsForge
* PostgreSQL

## AI

* OpenCV
* MediaPipe
* InsightFace
* Hugging Face Models

Avoid adding dependencies without a clear requirement.

---

# Project Rules

Every AI agent working on Operator Guardian AI must:

* Read all context files before coding.
* Follow the defined architecture.
* Complete one feature before starting another.
* Keep AI services separate from frontend.
* Maintain clean TypeScript practices.
* Protect worker biometric information.
* Use approved libraries only.
* Write production-quality code.
* Ensure every feature is testable.
* Maintain consistency throughout development.
