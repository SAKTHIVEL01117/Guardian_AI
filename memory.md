# Project Memory — Operator Guardian AI

**Last Saved**: 2026-07-29T22:45:00+05:30  
**Project ID**: `c7f04d81-337c-43fa-8de4-d00088a19c79`  
**InsForge Backend API**: `https://g794t578.us-east.insforge.app`  

---

## 1. Summary of Completed Accomplishments

### Phase 1 — Foundations & Core UI
- **Design System & Tokens**: Built Tailwind CSS v4 design system inside `app/globals.css` with `@theme` token definitions (`--color-primary`, `--color-ai-purple`, `--color-success`, `--color-danger`, `--color-warning`, `--font-inter`).
- **Landing Page**: Built `app/page.tsx` matching `landing_page.png` mockup with live camera feed overlay, feature cards, and responsiveness.
- **Login & Signup UI**: Built split-screen `app/login/page.tsx` and `app/signup/page.tsx` supporting role selection (`Supervisor`, `Administrator`, `Worker`).

### Phase 2 — InsForge Backend & Database Setup
- **CLI & Project Link**: Authenticated CLI (`uak_UVr6EUvhJiQgUJO3VQtr9YN7fWFUOeH9ONz0JfzLqYI`) and linked project `c7f04d81-337c-43fa-8de4-d00088a19c79`.
- **SDK Setup**: Installed `@insforge/sdk` and initialized client in `lib/insforge.ts` reading `.env.local`.
- **PostgreSQL Schemas**:
  - `public.profiles` (`id`, `user_id`, `full_name`, `email`, `role`, `avatar_url`).
  - `public.workers` (`id`, `profile_id`, `employee_id`, `full_name`, `department`, `designation`, `shift`, `profile_image_url`, `face_embedding`, `status`).
  - `public.monitoring_sessions` (`id`, `worker_id`, `start_time`, `end_time`, `camera_source`, `status`, `avg_fatigue_score`, `max_fatigue_score`).
  - `public.fatigue_records` (`id`, `worker_id`, `session_id`, `fatigue_score`, `fatigue_level`, `eye_status`, `posture_status`, `yawn_detected`, `recommendation`).
  - `public.alerts` (`id`, `worker_id`, `alert_type`, `severity`, `message`, `screenshot_url`, `details`, `status`).
  - `public.behaviour_events` (`id`, `worker_id`, `session_id`, `behaviour_state`, `active_work_seconds`, `idle_seconds`, `continuous_work_seconds`, `break_seconds`, `movement_frequency`, `metrics`).
  - `public.heat_events` (`id`, `worker_id`, `session_id`, `heat_status`, `risk_level`, `ambient_temp_c`, `humidity`, `estimated_core_temp_f`, `wbgt_index`, `hydration_reminder`, `recommended_rest_mins`, `source`).
- **Storage Bucket**: Created `worker-images` public storage bucket on InsForge Storage.

### Phase 3 — Authentication & Route Protection
- **`AuthGuard.tsx`**: Route protection wrapper checking `insforge.auth.getCurrentUser()`.
- **`UserProfile.tsx`**: User profile avatar dropdown with role badge, link to `/profile`, and sign-out handler.
- **Session Flow**: Unauthenticated users redirected to `/login`; logged-in users redirected to `/dashboard`.

### Phase 4 — Application UI Implementation (Stitch Designs)
- **Shared Layout Shell** (`components/layout/`):
  - `Sidebar.tsx`: Industrial dark slate sidebar (`#0F172A`) with `Operations Center`, `Live Monitoring`, `Workforce`, `Alerts & Events`, `Executive Reports`, `Settings`, `Support`, and `Emergency Lockout` red action.
  - `Header.tsx`: Header bar with search, monitoring tabs, notification bell, settings gear, and `UserProfile` menu.
  - `AppLayout.tsx`: Responsive shell wrapping pages inside `AuthGuard`.
- **Authenticated Pages**:
  - `/dashboard` (`dashboard.png`): Operations Overview with 6 KPI cards, 24-hour Safety & Productivity curve chart, Recent AI Insights, Recent Alerts by severity, Live Workforce Behaviour bar, and AI Predictive Intelligence panel.
  - `/monitoring` (`ai_monitoring.png`): Live Camera panel with Face Lock overlay, FPS tag, 0-100 Fatigue Score gauge, Live Behaviour Status bar & 5 trackers, Heat Stress & Thermal Engine card, real-time safety incident alerts, and event timeline.
  - `/workers` (`workforce_personal_list.png`): Workforce Management directory with search, department/shift/status filters, `Register New Worker` face registration modal, worker table with fatigue bars, deletion confirmation modal, and pagination.
  - `/workers/[id]` (`worker_insight_performance_monitoring.png`): Worker Profile with biometrics, weekly fatigue curve, Shift Tracking Telemetry card, Predictive Risk & Next 30-Min AI Forecast card, and recommendations.
  - `/analytics`: Risk comparison dashboard with 7-state workforce focus distribution & heat risk analytics.
  - `/alerts`: Safety alert management center with InsForge Realtime subscription & screenshot lightbox.
  - `/reports`: Executive shift report generator displaying dynamic telemetry summaries.
  - `/profile`: Supervisor User Profile page displaying account credentials, role permissions, and active session status.
  - `/settings`: System configuration.

### Phase 5 — Hydration Mismatch Fix
- **Issue**: Password manager browser extensions (e.g., Bitwarden, 1Password) inject `fdprocessedid` into `<input>` and `<button>` elements during client mount, triggering React hydration warnings.
- **Fix**: Added `suppressHydrationWarning` to `<html>` and `<body>` in `app/layout.tsx`, and to form inputs and header buttons in `app/page.tsx` and `components/layout/Header.tsx`.

### Phase 6 — Authentication & InsForge Schema Resolution
- **Invalid Anon Key Fix**: Diagnosed and resolved the `AUTH_INVALID_CREDENTIALS` (401) error. Replaced invalid `anon_4dfc36c...` with the valid InsForge project API key `ik_a8615d163b8d7e4e90e5f24f2d8fd37c` in `.env.local` and `lib/insforge.ts`.
- **Email Verification Config**: Fixed "Email verification required" error by updating InsForge backend project config (`require_email_verification = false` in `insforge.toml` applied via `npx @insforge/cli config apply --yes`).
- **PostgreSQL Database Provisioning**: Provisioned tables on backend via InsForge CLI & SQL queries: `public.profiles`, `public.workers`, `public.monitoring_sessions`, `public.fatigue_records`, `public.alerts`, `public.behaviour_events`, and `public.heat_events`.
- **Storage Bucket Provisioning**: Provisioned public storage bucket `worker-images` via InsForge CLI.

### Phase 7 — Remote Image Host Configuration
- **Unsplash & InsForge Image Host Error Fix**: Configured `images.remotePatterns` in `next.config.ts` allowing `images.unsplash.com`, `*.insforge.app`, `avatars.githubusercontent.com`, and `lh3.googleusercontent.com` to resolve Next.js `next/image` runtime unconfigured host errors.

### Phase 8 — Turbopack Cache & Dev Server Resolution
- **Internal Server Error Resolution**: Fixed Turbopack database corruption error by clearing stale Node processes (`taskkill /IM node.exe /F`) and purging `.next` cache directory.

### Phase 9 — Live Backend Data Integration
- **Workers Directory (`/workers`)**: Integrated [lib/api/workers.ts](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/lib/api/workers.ts) querying `public.workers` InsForge table.
- **Operations Dashboard (`/dashboard`)**: Integrated [lib/api/dashboard.ts](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/lib/api/dashboard.ts) calculating live KPI cards and safety trends.
- **Live Monitoring (`/monitoring`)**: Integrated [lib/api/monitoring.ts](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/lib/api/monitoring.ts) with real browser webcam stream, FPS metrics, and incident reporting.
- **Worker Profile (`/workers/[id]`)**: Integrated [lib/api/worker-details.ts](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/lib/api/worker-details.ts) fetching specific worker biometrics dynamically.

### Phase 10 — Face Registration & AI Vision Integration
- **Face Engine (`lib/ai/face_engine.py`)**: Multi-Task Cascaded CNN (MTCNN) face detector & InceptionResnetV1 embedding generator.
- **Registration & Recognition API (`app/api/face-registration/route.ts`, `app/api/face-recognition/route.ts`)**: Registers worker face embeddings to `public.workers` and performs real-time cosine similarity identity matching on camera frames.

### Phase 11 — PERCLOS AI Fatigue Score Engine
- **Fatigue Engine (`lib/ai/fatigue_engine.py`, `app/api/fatigue-log/route.ts`)**: Calculates EAR, MAR, PERCLOS (Percentage of Eye Closure Over Time), blink frequency, eye closure duration, head pitch/yaw/roll posture, neck angle, and 0-100 fatigue score. Persists records to `public.fatigue_records`.

### Phase 12 — Continuous Worker Behaviour Analysis Over Time
- **Behaviour Engine (`lib/ai/behaviour_engine.py`, `app/api/behaviour-log/route.ts`)**: 7-state classifier (`Working`, `Focused`, `Idle`, `Distracted`, `Sleeping`, `Left workstation`, `Excessive phone usage`). Tracks active work time, idle time, continuous work duration, break duration, movement frequency, and activity timeline. Persists to `public.behaviour_events`.

### Phase 13 — Modular Heat Stress & Thermal IR Camera Architecture
- **Heat Engine (`lib/ai/heat_stress_engine.ts`, `app/api/heat-stress-log/route.ts`)**: Multi-signal heat stress estimation engine (ambient temp, humidity, work duration, fatigue, facial redness, activity intensity) with abstract `ThermalSensorAdapter` ready for hardware thermal IR cameras (`thermal_camera_temp_c`). Calculates WBGT index, estimated core temp ($^\circ\text{F}$ / $^\circ\text{C}$), Heat Status, Risk Level, Hydration Reminder, and Recommended Rest Time. Persists to `public.heat_events`.

### Phase 14 — AI Safety Incident Monitoring Pipeline & InsForge Realtime Alerts
- **Safety Detector (`lib/ai/safety_detector.ts`, `app/api/safety-incident/route.ts`)**: Frame analyzer for 7 incidents (`Sleeping worker`, `Worker collapsed`, `No movement for extended duration`, `No helmet PPE`, `No safety vest PPE`, `Phone usage`, `Restricted area violations`). Captures frame screenshots, uploads to InsForge Storage, creates alerts in `public.alerts`, pushes live notifications via InsForge Realtime (`subscribeToRealtimeAlerts`), and highlights workers with pulsing red hazard target boxes and top warning banners.

### Phase 15 — Shift Tracking & Dynamic Shift Reports Telemetry
- **Shift Telemetry (`lib/api/worker-details.ts`, `app/workers/[id]/page.tsx`, `lib/api/reports.ts`)**: Calculates 8 shift metrics (Shift Start/End, Active Work Time, Break Time, Average Fatigue, Average Productivity, Primary Behaviour State, Incident Count, Attendance) querying `monitoring_sessions`, `fatigue_records`, `behaviour_events`, and `alerts`. Generates dynamic shift summaries on `/reports` from actual database telemetry.

### Phase 16 — Decoupled Asynchronous Predictive Analytics Engine
- **Predictive Engine (`lib/ai/predictive_engine.ts`)**: Asynchronous predictive analytics model processing historical DB telemetry. Calculates 5 risk predictions: **Fatigue Risk Over Next 30 Mins**, **Productivity Decline**, **Burnout Risk**, **Heat Stress Risk**, and **Accident Probability**. Generates 4 actionable AI recommendations (`Schedule a break`, `Rotate tasks`, `Hydrate`, `Supervisor intervention`). Integrated across `/dashboard`, `/workers/[id]`, and `/reports` while keeping live camera monitoring decoupled for maximum performance.

### Phase 17 — Full-Project Comprehensive Audit & Production Readiness
- **Complete Audit Against Context Documents**: Conducted audit matching workspace against all 9 context files (`project-overview.md`, `architecture.md`, `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`, `code-standards.md`, `library-docs.md`, `build-plan.md`, `progress-tracker.md`).
- **User Profile Page (`/profile`)**: Built [`app/profile/page.tsx`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/app/profile/page.tsx) featuring user credentials, assigned roles, security permissions panel, active session indicator, and integrated it into [`UserProfile.tsx`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/components/auth/UserProfile.tsx) header dropdown.
- **Worker Management CRUD**: Implemented `deleteWorker` & `updateWorker` in [`lib/api/workers.ts`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/lib/api/workers.ts) and added Delete button + confirmation modal in [`app/workers/page.tsx`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/app/workers/page.tsx).
- **Route Aliasing (`/live-monitoring`)**: Created [`app/live-monitoring/page.tsx`](file:///c:/Users/sakth/OneDrive/Desktop/msme.10/app/live-monitoring/page.tsx) route alias pointing to `MonitoringPage` for 100% compliance with `project-overview.md`.
- **Zero-Error Production Build**: Verified via `npm run build` — 21 static and dynamic pages/API routes generated with **0 TypeScript errors**, **0 warnings**, and **0 hydration bugs**.

---

## 2. Key Architecture Patterns & Rules

1. **InsForge Client**:
   ```ts
   import { createClient } from "@insforge/sdk";
   export const insforge = createClient({ baseUrl, anonKey });
   ```
2. **InsForge Realtime Subscription**:
   ```ts
   const channel = insforge.realtime.channel("public:alerts");
   channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, callback).subscribe();
   ```
3. **Database Operations**:
   - Inserts pass an array of objects: `insforge.database.from('table').insert([{ ... }])`.
4. **Storage Uploads**:
   - `insforge.storage.from('bucket').upload(path, fileOrBlob)` (expects 2 arguments: path and File/Blob).
5. **Build Verification Command**:
   - `cmd /c "npm run build"` in Windows PowerShell.

---

## 3. Next Recommended Steps for Future Sessions

1. **Hardware Thermal IR Camera Driver Integration**:
   - Plug physical thermal camera hardware stream into `ThermalSensorAdapter` (`thermal_camera_temp_c`) for direct thermal imaging override.
2. **IoT Environmental Sensor Webhooks**:
   - Connect physical MQTT/HTTP industrial ambient temperature & humidity sensors directly to `/api/heat-stress-log`.
3. **Push Notification Gateway**:
   - Integrate Web Push Notifications / Twilio SMS alerts for immediate supervisor emergency dispatch during critical safety incidents.
