# UI Registry

Living document for the **Operator Guardian AI** interface system.

Update this document after every major component is created.

Before building any new component:

1. Check if a similar component already exists.
2. Reuse existing spacing, typography, layout, and interaction patterns.
3. Follow `ui-rules.md` and `ui-tokens.md`.
4. Add every completed component to this registry.

The goal is to maintain a consistent enterprise-grade Industry 5.0 monitoring platform.

# Foundation Components

## Global Styles & Design Tokens

**File**

```
app/globals.css
```

**Purpose**

Tailwind CSS v4 theme configuration incorporating all design tokens from `ui-tokens.md` (Primary, AI Purple, Safety status levels, Neutrals, Text, Shadows, and Inter font).

---

# Application Layout Components


## Main Application Layout

**File**

```
components/layout/AppLayout.tsx
```

**Purpose**

Shared layout for all authenticated pages.

**Contains**

* Sidebar Navigation
* Top Header
* User Profile
* Notification Center
* Main Content Area

---

## Sidebar Navigation

**File**

```
components/layout/Sidebar.tsx
```

**Purpose**

Primary navigation system.

**Menu Items**

```
Dashboard

Live Monitoring

Workers

Analytics

Alerts

Reports

Settings
```

Rules:

* Active route must be highlighted.
* Navigation should be role-based.
* Must support collapsed mode.

---

## Top Header

**Purpose**

Global application header.

Contains:

* Page Title
* Search
* Notifications
* User Menu
* System Status Indicator

---

# Landing Page & Authentication Components

## Landing Page Component

**File**

```
app/page.tsx
```

**Purpose**

Complete marketing and product introduction page matching `landing_page.png` design specifications. Features top navigation with search and profile actions, hero section with Industry 5.0 pill and 98.4% live safety compliance overlay, 4 precision engineering feature cards (Fatigue Detection, Real-time Alerts, Productivity Analytics, Safety Compliance), dark paradigm showcase section, and footer.

---

## Authentication Components

### SignupForm Component

**File**

```
components/auth/SignupForm.tsx
```

**Purpose**

User registration component using InsForge Auth (`signUp`) supporting Full Name, Work Email, Password, and Role Selection (`supervisor`, `admin`, `worker`), automatically inserting matching profile record into `public.profiles`.

---

### LoginForm Component

**File**

```
components/auth/LoginForm.tsx
```

**Purpose**

User login component using InsForge Auth (`signInWithPassword`), validating user session and redirecting to Supervisor Dashboard.

---

### AuthGuard Component

**File**

```
components/auth/AuthGuard.tsx
```

**Purpose**

Client route protection wrapper ensuring only authenticated operators access protected pages (`/dashboard`, `/monitoring`, `/workers`, `/analytics`, `/alerts`, `/reports`, `/settings`). Unauthenticated requests are redirected to `/login`.

---

### UserProfile Component

**File**

```
components/auth/UserProfile.tsx
```

**Purpose**

Top header profile menu displaying logged-in user name, email, and role badge, with Sign Out action clearing InsForge session (`signOut`) and redirecting to `/login`.

---

# Application Layout Components



## KPI Card

**File**

```
components/dashboard/KPICard.tsx
```

**Purpose**

Displays important system metrics.

Examples:

* Total Workers
* Active Monitoring Sessions
* Fatigue Alerts
* Average Fatigue Score
* Safety Index
* Productivity Score

Contains:

* Title
* Value
* Trend Indicator
* Icon
* Status

---

## Worker Status Card

Displays:

* Worker Name
* Department
* Current Status
* Fatigue Level
* Last Update

Statuses:

```
Normal

Moderate

High Risk

Critical
```

---

## Fatigue Score Card

Displays:

* Current Score
* Risk Level
* Score Progress
* AI Recommendation

Example:

```
Fatigue Score

78%

High Risk

Recommendation:
Take a short break
```

---

## Activity Feed

Displays recent system events.

Examples:

* Worker Registered
* Face Recognized
* Fatigue Detected
* Alert Generated
* Report Created

Newest activity appears first.

---

## AI Insight Panel

Displays:

* AI-generated observations
* Safety recommendations
* Workforce insights

---

# Live Monitoring Components

## Camera Monitor

**File**

```
components/monitoring/CameraMonitor.tsx
```

**Purpose**

Real-time worker monitoring interface.

Contains:

* Webcam Feed
* Face Bounding Box
* Worker Identification
* AI Status Overlay

---

## Face Detection Overlay

Displays:

* Face Rectangle
* Worker Name
* Recognition Confidence
* Monitoring Status

Example:

```
[Face Box]

John Smith

Confidence: 98%

Status: Normal
```

---

## Monitoring Control Panel

Actions:

* Start Monitoring
* Stop Monitoring
* Pause Analysis
* Capture Snapshot

---

## AI Analysis Panel

Displays:

* Eye Status
* Blink Rate
* Yawning Detection
* Posture Status
* Fatigue Score

---

# Worker Components

## Worker Card

**File**

```
components/workers/WorkerCard.tsx
```

Displays:

* Worker Image
* Name
* Employee ID
* Department
* Shift
* Current Risk Level

Used in:

* Worker Directory
* Dashboard
* Monitoring

---

## Worker Profile

Sections:

```
Personal Information

↓

Face Registration

↓

Monitoring History

↓

Fatigue Analytics

↓

Recommendations

↓

Reports
```

---

## Worker Registration Form

Fields:

* Employee ID
* Name
* Department
* Shift
* Designation
* Contact Information
* Worker Photo

Actions:

* Register Worker
* Upload Image
* Generate Face Embedding

---

# AI Components

## Fatigue Indicator

Displays:

* Fatigue Score
* Risk Level
* Progress Bar
* Status Badge

States:

```
Normal

Moderate

High

Critical
```

---

## AI Recommendation Card

Displays:

* Current Condition
* AI Recommendation
* Reason
* Suggested Action

Example:

```
Condition:

High Fatigue


Recommendation:

Take 15 minute rest


Reason:

High eye closure detected
```

---

## Confidence Badge

Used for AI predictions.

Displays:

* Confidence Percentage
* Prediction Quality

Example:

```
Recognition Confidence

96%
```

---

# Alert Components

## Alert Card

Displays:

* Alert Type
* Worker
* Severity
* Time
* Action

Alert Types:

```
High Fatigue

Critical Fatigue

Unknown Worker

Camera Error

AI Processing Error
```

---

## Alert Panel

Contains:

* Active Alerts
* Resolved Alerts
* Filtering
* Severity Sorting

---

## Notification Center

Displays:

* AI Alerts
* System Notifications
* Recommendations

---

# Analytics Components

## Analytics Chart

**File**

```
components/charts/AnalyticsChart.tsx
```

Supported:

* Line Chart
* Bar Chart
* Area Chart
* Pie Chart

Used for:

* Fatigue Trends
* Productivity Trends
* Department Analysis
* Shift Comparison

---

## Fatigue Trend Chart

Displays:

* Hourly fatigue
* Daily fatigue
* Weekly fatigue

---

## Workforce Risk Chart

Displays:

* Low Risk Workers
* Medium Risk Workers
* High Risk Workers

---

# Reports Components

## Report Card

Displays:

* Report Name
* Generated Date
* Report Type
* Download Button

---

## AI Report Viewer

Displays:

Sections:

```
Summary

↓

Fatigue Analysis

↓

Safety Insights

↓

Recommendations

↓

Action Items
```

---

# Form Components

## Standard Form Layout

Used for:

* Worker Registration
* Settings
* Profile Updates

Structure:

```
Header

↓

Basic Information

↓

Additional Information

↓

Actions
```

---

## Form Buttons

Primary:

* Save
* Register
* Generate
* Submit

Secondary:

* Cancel
* Reset
* Back

Danger:

* Delete
* Remove

---

# Table Components

## Data Table

Used for:

* Workers
* Alerts
* Reports
* Monitoring History

Features:

* Search
* Filtering
* Sorting
* Pagination
* Export

---

## Search Bar

Supports:

* Keyword Search
* Worker Search
* Department Filter
* Risk Filter
* Date Filter

---

## Status Badge

Consistent application states.

Worker Status:

```
Active

Inactive

Monitoring

Offline
```

Fatigue Status:

```
Normal

Moderate

High

Critical
```

---

# Modal Components

## Confirmation Modal

Used for:

* Delete Worker
* Stop Monitoring
* Generate Report

Buttons:

* Confirm
* Cancel

---

## AI Explanation Modal

Displays:

* Model Result
* Reasoning
* Data Points Used
* Recommendation

---

# Empty States

Used when no data exists.

Contains:

* Illustration/Icon
* Explanation
* Action Button

Examples:

```
No Workers Registered

No Alerts Found

No Reports Generated

No Monitoring Data
```

---

# Loading States

Used during:

* Data fetching
* AI processing
* Report generation

Displays:

* Skeleton Cards
* Skeleton Tables
* Processing Indicator

---

# Error States

Displays:

* User-friendly Error Message
* Retry Button
* Support Information

Never expose:

* API errors
* Database errors
* Stack traces

---

# Responsive Behavior

## Desktop

* Full dashboard layout
* Multi-column analytics
* Large monitoring view

---

## Tablet

* Reduced grids
* Collapsible panels
* Scrollable tables

---

## Mobile

* Single column layout
* Stacked cards
* Simplified navigation

---

# Component Naming Convention

React Components:

```
KPICard

WorkerCard

FatigueCard

CameraMonitor

AlertPanel

AnalyticsChart

ReportViewer
```

Files:

```
kpi-card.tsx

worker-card.tsx

camera-monitor.tsx

alert-panel.tsx
```

---

# Design Principles

Every component must be:

* Human-designed
* Professional
* Consistent
* Responsive
* Accessible
* Reusable
* Minimal
* Data-focused
* Easy to understand

The interface should feel like a real industrial AI monitoring platform, not a generic dashboard template.

---

# Build Status

Completed Components:
* `RegisterWorkerModal` (`components/workers/RegisterWorkerModal.tsx`) — Biometric Worker Registration modal featuring live laptop webcam preview, 5-stage pose guidance enrollment, real-time quality validation (lighting, blur, face count), InsightFace `buffalo_l` 512-dimensional embedding generation, InsForge storage photo upload, and instant workforce database sync.
* `LiveMonitoringPage` (`app/monitoring/page.tsx`) — Real-time live camera monitoring page with laptop webcam feed, InsightFace `buffalo_l` worker identification, dynamic 0–100 Fatigue Score Gauge, EAR & PERCLOS eye metrics, MAR & Yawn Counter, Head Pose (Pitch/Yaw/Roll), Neck/Shoulder posture, on-screen warning alert banners, AI break recommendations, and InsForge `monitoring_sessions` / `fatigue_records` database logging.
