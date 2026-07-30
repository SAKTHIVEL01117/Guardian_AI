# Architecture

## Stack

| Layer             | Technology               | Purpose                                                       |
| ----------------- | ------------------------ | ------------------------------------------------------------- |
| Framework         | Next.js 15               | Full-stack web application framework                          |
| Language          | TypeScript               | Frontend application development                              |
| Styling           | Tailwind CSS + shadcn/ui | Premium enterprise UI components                              |
| Backend Platform  | InsForge                 | Backend services, APIs, authentication, and application logic |
| Database          | PostgreSQL               | Persistent data storage                                       |
| Authentication    | InsForge Authentication  | User login and session management                             |
| Storage           | InsForge Storage         | Worker images and generated reports                           |
| Frontend State    | React Query              | Server state management                                       |
| Charts            | Recharts                 | Analytics visualization                                       |
| Computer Vision   | OpenCV                   | Image and video processing                                    |
| Face Detection    | MediaPipe Face Detection | Real-time face detection                                      |
| Face Recognition  | InsightFace              | Worker identification using facial embeddings                 |
| Facial Analysis   | MediaPipe Face Mesh      | Eye, mouth, and facial landmark detection                     |
| Pose Analysis     | MediaPipe Pose           | Body posture analysis                                         |
| AI Reporting      | Hugging Face Models      | AI-generated reports and recommendations                      |
| API Communication | REST APIs                | Frontend and AI service communication                         |

---

# System Architecture

```
                    Next.js Application
                           |
                           |
                    InsForge Backend
                           |
          ┌────────────────┼────────────────┐
          |                |                |
          ▼                ▼                ▼
    PostgreSQL        Storage          Authentication
          |
          |
          ▼
    Worker Data
    Monitoring Data
    Alerts
    Reports


                           |
                           ▼

                  AI Processing Service

          ┌──────────────┼──────────────┐
          ▼              ▼              ▼

   Face Recognition  Fatigue AI   Recommendation AI

   InsightFace       MediaPipe    Hugging Face
   OpenCV            OpenCV       LLM Models
```

---

# Module Structure

```
operator-guardian-ai/

├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── live-monitoring/
│   │   ├── workers/
│   │   ├── analytics/
│   │   ├── alerts/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── camera/
│   │   ├── workers/
│   │   ├── charts/
│   │   └── ui/
│   │
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── backend/
│   ├── authentication/
│   ├── workers/
│   ├── monitoring/
│   ├── alerts/
│   ├── reports/
│   └── analytics/
│
├── ai-service/
│   ├── face_detection/
│   │   └── detector.py
│   │
│   ├── face_recognition/
│   │   └── recognition.py
│   │
│   ├── fatigue_detection/
│   │   ├── eye_analysis.py
│   │   ├── yawn_detection.py
│   │   ├── posture_analysis.py
│   │   └── fatigue_score.py
│   │
│   ├── recommendation/
│   │   └── recommendation_engine.py
│   │
│   └── report_generation/
│       └── ai_reports.py
│
└── README.md
```

---

# System Boundaries

| Module        | Responsibility                                                     |
| ------------- | ------------------------------------------------------------------ |
| `frontend/`   | User interface, dashboard, camera display, analytics visualization |
| `backend/`    | Application logic, APIs, database operations                       |
| `ai-service/` | Computer vision processing and AI analysis                         |
| `workers/`    | Worker registration and profile management                         |
| `monitoring/` | Real-time fatigue monitoring records                               |
| `alerts/`     | Supervisor notifications and warnings                              |
| `reports/`    | AI-generated reports and summaries                                 |

---

# Data Flow

## Worker Registration

```
Supervisor
      ↓
Upload Worker Photo
      ↓
Face Detection
      ↓
Face Cropping
      ↓
Generate Face Embedding
      ↓
Store Worker Data
      ↓
Worker Registered
```

AI Technologies:

* MediaPipe Face Detection
* InsightFace

---

# Live Worker Recognition

```
Laptop Camera
      ↓
Capture Video Frame
      ↓
Detect Face
      ↓
Generate Face Embedding
      ↓
Compare With Database
      ↓
Identify Worker
      ↓
Display Worker Information
```

Displayed Data:

* Name
* Employee ID
* Department
* Shift
* Recognition Confidence

---

# Fatigue Detection Workflow

```
Camera Frame
      ↓
Face Landmark Extraction
      ↓
Eye Analysis
      ↓
Mouth Analysis
      ↓
Head Pose Detection
      ↓
Body Posture Analysis
      ↓
Working Duration Analysis
      ↓
Fatigue Score Calculation
      ↓
AI Recommendation
```

---

# AI Model Architecture

## Face Detection

Technology:

MediaPipe Face Detection

Purpose:

* Detect worker face
* Locate face position
* Create bounding box

---

## Face Recognition

Technology:

InsightFace

Purpose:

* Generate facial embeddings
* Identify registered workers
* Match camera input with stored workers

---

## Facial Landmark Analysis

Technology:

MediaPipe Face Mesh

Purpose:

Extract:

* Eye landmarks
* Mouth landmarks
* Facial orientation

Used for:

* Blink detection
* Eye closure detection
* Yawning detection

---

## Pose Analysis

Technology:

MediaPipe Pose

Purpose:

Detect:

* Sitting posture
* Leaning posture
* Body alignment

---

## Fatigue Scoring Engine

Inputs:

```
Eye Closure
Blink Frequency
Yawning
Head Pose
Body Posture
Continuous Working Time
```

Output:

```
Fatigue Score

0-30     Normal

31-60    Moderate

61-80    High Risk

81-100   Critical
```

---

## AI Recommendation Engine

Responsibilities:

Convert fatigue analysis into actionable suggestions.

Examples:

```
Fatigue Score: 85%

Recommendation:

- Take immediate break
- Avoid precision tasks
- Notify supervisor
- Rotate workstation
```

---

## Hugging Face AI Usage

Hugging Face models are used only for:

* Shift report generation
* AI explanations
* Supervisor summaries
* Workforce insights

They are NOT used for real-time face detection or fatigue calculation.

Workflow:

```
Monitoring Data
        ↓
Fatigue Statistics
        ↓
Hugging Face LLM
        ↓
AI Generated Report
```

---

# Database Models

## User

Stores:

* User ID
* Name
* Email
* Password Hash
* Role
* Permissions

---

## Worker

Stores:

* Employee ID
* Name
* Department
* Shift
* Profile Image
* Face Embedding
* Registration Date
* Status

---

## Monitoring Session

Stores:

* Worker
* Start Time
* End Time
* Camera Source
* Average Fatigue Score
* Maximum Fatigue Score

---

## Fatigue Record

Stores:

* Worker
* Timestamp
* Eye Closure Score
* Blink Rate
* Yawning Detection
* Posture Score
* Fatigue Score
* Risk Level

---

## Alert

Stores:

* Worker
* Alert Type
* Severity
* Message
* Timestamp
* Status

---

## Recommendation

Stores:

* Worker
* Fatigue Level
* AI Recommendation
* Action Taken
* Timestamp

---

## Reports

Stores:

* Report Type
* Worker
* Shift
* AI Summary
* Generated Date

---

# User Roles

## Administrator

Permissions:

* Manage supervisors
* Manage workers
* Configure system settings
* View organization analytics
* Manage AI configuration

---

## Supervisor

Permissions:

* Register workers
* Monitor live camera
* View fatigue status
* Receive alerts
* Generate reports
* View analytics

---

# Scheduled Jobs

Automatic Processes:

* Daily fatigue report generation
* Weekly workforce analytics
* Alert cleanup
* Database maintenance
* AI model health checks

---

# Business Rules

* Every worker must have a registered face image before monitoring.
* Every worker must have a unique Employee ID.
* Face embeddings must be unique.
* Unknown faces must not be assigned to workers automatically.
* Fatigue scores must update continuously during monitoring.
* Critical fatigue levels must generate alerts.
* Every recommendation must be stored in history.
* All monitoring events must maintain timestamps.
* Reports must be generated from stored analytics data.

---

# Security

* Authentication through InsForge Authentication.
* Role-Based Access Control.
* Secure worker image storage.
* Protected AI service endpoints.
* API authentication.
* Encrypted sensitive information.
* Supervisor access limited according to permissions.

---

# Reporting

Available Reports:

* Daily Shift Report
* Worker Fatigue Report
* Department Risk Report
* Productivity Analysis
* AI Recommendation Summary
* Safety Performance Report

Reports include:

* Fatigue trends
* Risk levels
* AI insights
* Recommended actions

---

# Invariants

The application must always satisfy:

* Every worker has a unique identity.
* Face recognition only matches registered workers.
* Fatigue scores always include timestamp information.
* Critical fatigue events always create alerts.
* Worker monitoring history cannot be deleted accidentally.
* AI recommendations are explainable.
* Supervisor permissions are always enforced.
* Dashboard analytics always reflect current database information.
* AI processing must not expose private worker information.
