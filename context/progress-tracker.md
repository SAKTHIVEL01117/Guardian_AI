# Progress Tracker — Operator Guardian AI

Last updated: 2026-07-29 (Memory saved in [`memory.md`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/memory.md))

## Current Status

**Project Status:** Decoupled Predictive Analytics Engine & Multi-Page Risk Forecast Completed

The system features a decoupled, asynchronous **Predictive Analytics Engine** (`lib/ai/predictive_engine.ts`) querying historical InsForge DB telemetry (`fatigue_records`, `monitoring_sessions`, `alerts`, `behaviour_events`, `heat_events`). Generates 5 core predictions (Fatigue Risk 30m, Productivity Decline, Burnout Risk, Heat Stress Risk, Accident Probability) and 4 actionable AI recommendations (`Schedule a break`, `Rotate tasks`, `Hydrate`, `Supervisor intervention`), rendered seamlessly across `/dashboard`, `/workers/[id]`, and `/reports` while keeping live camera monitoring decoupled. Zero compilation errors across all 18 application routes.


---

# Development Roadmap

## Phase 1 — UI/UX Foundation

Build the complete frontend using **Next.js**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

### Pages

* [x] Landing Page (`/`)
* [x] Login (`/login`)
* [x] Dashboard (`/dashboard`)
* [x] Live Monitoring (`/monitoring`)
* [x] Workers (`/workers`)
* [x] Register Worker Modal (`/workers`)
* [x] Worker Profile (`/workers/[id]`)
* [x] Analytics (`/analytics`)
* [x] Alerts (`/alerts`)
* [x] Reports (`/reports`)
* [x] Settings (`/settings`)

* [ ] Profile (`/profile`)

### Components

* [ ] Responsive Sidebar
* [ ] Top Navigation
* [ ] Dashboard KPI Cards
* [ ] Analytics Charts
* [ ] Worker Information Cards
* [ ] AI Recommendation Cards
* [ ] Alert Cards
* [ ] Notification Drawer
* [ ] Worker Table
* [ ] Status Badges
* [ ] Progress Indicators
* [ ] Timeline Components
* [ ] Report Viewer
* [ ] Loading Skeletons
* [ ] Empty States

Goal:

The application should look like a premium enterprise Industry 5.0 platform rather than a student project.

---

## Phase 2 — Authentication & Navigation

Implement secure authentication and routing.

Tasks

* [x] Administrator Login
* [x] Supervisor Login
* [x] Session Management
* [x] Protected Routes
* [x] Role-Based Navigation
* [x] Logout
* [x] Route Guards (AuthGuard)
* [x] Authentication Middleware & Storage Support


Goal:

Only authenticated administrators and supervisors can access protected pages.

---

## Phase 3 — Worker Management

Implement complete worker registration.

Tasks

* [x] Register Worker
* [x] Worker Directory
* [x] Search Workers
* [x] Department Filter
* [x] Shift Filter
* [x] Registration Validation

Goal:

Maintain a complete directory of registered workers before live monitoring begins.

---

## Phase 4 — Face Registration

Implement AI-powered worker registration.

Workflow

Guided Laptop Webcam Preview & Pose Enrollment (Look straight, Turn left, Turn right, Look up, Look down)

↓

Quality Checks (Lighting, Blur, Single Face Verification)

↓

InsightFace buffalo_l 512-dimensional Biometric Embedding Generation

↓

InsForge Storage Upload & PostgreSQL workers table Insertion

↓

Registration Complete & Immediate Workforce Table Refresh

Tasks

* [x] Laptop Webcam Live Stream
* [x] Guided Pose Enrollment (5 poses)
* [x] Capture 15–20 High-Quality Images
* [x] Validate Single Face & Quality
* [x] InsightFace buffalo_l Embedding Generation
* [x] Store 512-d Embedding in Database
* [x] Upload Profile Image to InsForge Storage
* [x] Registration Confirmation & Immediate Table Refresh

Recommended Technology

* MediaPipe Face Detection
* InsightFace

Goal

Every registered worker should have one stored facial embedding for future recognition.

---

## Phase 5 — Live Face Recognition

Implement real-time worker identification.

Workflow

Live Camera

↓

Detect Face

↓

Generate Embedding

↓

Compare Stored Embeddings

↓

Recognize Worker

↓

Display Worker Information

Tasks

* [x] Camera Access
* [x] Face Detection
* [x] Face Recognition
* [x] Confidence Score
* [x] Unknown Worker Detection
* [x] Worker Information Overlay

Goal

Recognize registered workers in real time with high accuracy.

---

## Phase 6 — Fatigue Detection

Implement AI fatigue analysis.

Monitor

* [x] Eye Closure (EAR)
* [x] Blink Rate & Frequency
* [x] Yawning (MAR)
* [x] Head Pose (Pitch, Yaw, Roll)
* [x] Face Orientation
* [x] Body Posture & Neck Angle
* [x] PERCLOS Calculation

Recommended Technology

* MediaPipe Face Mesh
* MediaPipe Pose
* OpenCV

Goal

Collect all fatigue indicators continuously.

---

## Phase 7 — Fatigue Scoring Engine

Implement intelligent fatigue scoring.

Inputs

* Blink Rate
* Eye Closure & PERCLOS
* Yawning
* Head Pose
* Body Posture
* Working Duration

Outputs

* Normal (0–30)
* Moderate (31–60)
* High Risk (61–80)
* Critical (81–100)

Tasks

* [x] Score Calculation (0–100)
* [x] Threshold Configuration
* [x] Risk Classification
* [x] Continuous Updates (Every 1 second)
* [x] Database Logging (monitoring_sessions & fatigue_records)

Goal

Generate a dynamic fatigue score for every monitored worker.

---

## Phase 8 — AI Recommendation Engine

Generate recommendations based on fatigue.

Examples

* Continue Working
* Drink Water
* Stretch
* Correct Posture
* Take Short Break
* Notify Supervisor

Tasks

* [x] Recommendation Rules
* [x] Supervisor Alerts
* [x] On-Screen Warning Banners
* [x] Recommendation History / Database Logging

Goal

Provide explainable AI recommendations instead of simple alerts.

---

## Phase 9 — Live Dashboard

Display all monitoring information.

Widgets

* [ ] Live Camera
* [ ] Worker Details
* [ ] Fatigue Score
* [ ] Risk Indicator
* [ ] AI Recommendations
* [ ] Timeline
* [ ] Recent Alerts
* [ ] Current Statistics

Goal

Provide supervisors with a complete real-time monitoring center.

---

## Phase 10 — Analytics

Build advanced dashboards.

Charts

* [ ] Daily Fatigue Trend
* [ ] Weekly Trend
* [ ] Monthly Trend
* [ ] Productivity Comparison
* [ ] Department Comparison
* [ ] High-Risk Workers
* [ ] Shift Analysis
* [ ] Average Fatigue

Goal

Provide actionable workforce insights.

---

## Phase 11 — Reports

Generate AI-powered reports.

Reports

* [ ] Daily Report
* [ ] Weekly Report
* [ ] Monthly Report
* [ ] Shift Summary
* [ ] Worker Report
* [ ] Productivity Report

Include

* Fatigue Statistics
* AI Insights
* Recommendations
* Supervisor Notes

Goal

Generate professional reports suitable for supervisors and management.

---

## Phase 12 — Alerts & Notifications

Implement the notification system.

Events

* [ ] High Fatigue
* [ ] Critical Fatigue
* [ ] Unknown Worker
* [ ] Camera Offline
* [ ] Recognition Failure
* [ ] Recommendation Generated

Goal

Notify supervisors immediately whenever intervention is required.

---

## Phase 13 — AI Integration

Integrate computer vision and language models.

Computer Vision

* [ ] MediaPipe Face Detection
* [ ] InsightFace Recognition
* [ ] MediaPipe Face Mesh
* [ ] MediaPipe Pose
* [ ] OpenCV Processing

Language Model

* [ ] Hugging Face model for AI-generated reports
* [ ] Shift summaries
* [ ] Recommendation explanations
* [ ] Supervisor insights

Goal

Use Hugging Face only for intelligent summaries and reporting, while computer vision handles live fatigue detection.

---

## Phase 14 — Optimization

Improve performance and deployment readiness.

Tasks

* [ ] Real-Time Processing Optimization
* [ ] Database Optimization
* [ ] Responsive UI Improvements
* [ ] Loading Optimization
* [ ] Error Handling
* [ ] API Performance
* [ ] Security Improvements

Goal

Deliver a stable, scalable, production-ready Industry 5.0 application.

---

# Final Success Criteria

The project is considered complete when:

* Workers can be registered with facial recognition.
* Registered workers are recognized automatically from the live camera.
* AI continuously monitors fatigue indicators.
* Dynamic fatigue scores update in real time.
* Supervisors receive intelligent recommendations and alerts.
* Analytics and reports provide meaningful operational insights.
* The application maintains a premium enterprise UI/UX.
* The entire system is responsive, scalable, and suitable for demonstration as an Industry 5.0 hackathon solution.
