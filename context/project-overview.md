# Project Overview

## About the Project

**Operator Guardian AI** is a full-stack **AI-Powered Fatigue-Aware Production Assistance System** built for MSMEs and smart manufacturing environments. The platform continuously monitors factory operators using computer vision and artificial intelligence to detect fatigue, recognize registered workers, analyze productivity trends, and assist supervisors in preventing accidents and reducing operational risks.

The system combines **real-time face recognition**, **fatigue analysis**, **AI-powered recommendations**, **supervisor alerts**, **analytics dashboards**, and **historical reporting** into a centralized Industry 5.0 platform that prioritizes worker well-being while maintaining production efficiency.

Unlike traditional monitoring systems, Operator Guardian AI focuses on **human-centric manufacturing**, where AI assists workers instead of replacing them.

---

# The Problem It Solves

Many manufacturing industries, especially MSMEs, rely on manual supervision to monitor worker fatigue and safety. Continuous repetitive work, poor posture, eye strain, and exhaustion often lead to:

* Workplace accidents
* Reduced productivity
* Increased manufacturing defects
* Lower inspection quality
* Delayed supervisor response
* Worker burnout

Most small industries cannot afford expensive thermal cameras, IoT sensors, or industrial monitoring systems.

Operator Guardian AI solves this problem by using **standard webcams** and **AI-powered computer vision** to continuously monitor workers, calculate fatigue levels, provide intelligent recommendations, notify supervisors when intervention is required, and maintain historical analytics for better workforce management.

The prototype uses a laptop webcam to demonstrate the solution, while the architecture is designed to support CCTV cameras, IP cameras, and wearable devices in future deployments.

---

# Project Vision

Develop an affordable Industry 5.0 platform that helps factories:

* Improve worker safety
* Detect fatigue before accidents occur
* Reduce production errors
* Increase productivity
* Provide AI-assisted decision making
* Improve employee well-being
* Enable affordable deployment for MSMEs

---

# Pages

```
/                          → Landing Page
/login                     → Authentication
/dashboard                 → Supervisor Dashboard
/live-monitoring           → Live Camera Monitoring
/workers                   → Worker Directory
/workers/register          → Register Worker
/workers/[id]              → Worker Profile
/analytics                 → AI Analytics
/alerts                    → Alert Center
/reports                   → Shift & AI Reports
/settings                  → System Settings
/profile                   → User Profile
```

---

# Navigation

Top navigation with role-based access.

```
Dashboard
Live Monitoring
Workers
Register Worker
Analytics
Alerts
Reports
Settings
Profile
```

Responsive enterprise dashboard optimized for desktop monitoring.

---

# Core User Flow

## Landing Page

* Professional Industry 5.0 landing page
* Product overview
* AI technology showcase
* Features
* Login button
* Logged-in users redirected to Dashboard

---

## Authentication

* Administrator Login
* Supervisor Login
* Email & Password
* Forgot Password
* Secure Session Validation

Workers do not log into the platform.

---

## Dashboard

Displays operational KPIs.

Cards include:

* Total Registered Workers
* Workers Currently Active
* Normal Operators
* Moderate Fatigue
* High Fatigue
* Critical Alerts
* Average Fatigue Score
* Overall Productivity Index

Dashboard Sections:

* Live Worker Status
* AI Recommendations
* Recent Alerts
* Today's Summary
* Fatigue Trend
* Productivity Analytics
* Department Performance

---

## Worker Registration

Supervisors register workers before monitoring.

Information includes:

* Employee ID
* Full Name
* Department
* Designation
* Shift
* Contact Number
* Emergency Contact
* Profile Photo

Registration Workflow:

```
Upload Photo
        ↓
AI Detects Face
        ↓
Crop Face Automatically
        ↓
Generate Face Embedding
        ↓
Store Face Embedding
        ↓
Worker Successfully Registered
```

Only one facial embedding is stored for each worker.

---

## Live Monitoring

This is the primary feature.

The webcam continuously analyzes workers.

Workflow:

```
Live Camera
      ↓
Face Detection
      ↓
Face Recognition
      ↓
Retrieve Worker Details
      ↓
Analyze Fatigue
      ↓
Generate Fatigue Score
      ↓
Generate AI Recommendation
      ↓
Notify Supervisor
      ↓
Store Analysis
```

Displayed Information:

* Live Camera Feed
* Face Bounding Box
* Worker Name
* Employee ID
* Department
* Shift
* Recognition Confidence
* Current Status
* Fatigue Score
* Risk Level
* AI Recommendation

---

## Fatigue Detection

The AI continuously evaluates multiple indicators.

Detected Features:

* Eye Closure
* Blink Rate
* Yawning
* Head Pose
* Face Orientation
* Body Posture
* Continuous Working Duration

The system combines all indicators into a dynamic fatigue score.

Fatigue Levels:

```
0–30    Normal

31–60   Moderate

61–80   High

81–100  Critical
```

This score updates continuously during monitoring.

---

## AI Recommendation Engine

Based on fatigue level, the AI provides recommendations.

Examples:

* Continue Working
* Drink Water
* Stretch
* Correct Posture
* Take Short Break
* Notify Supervisor
* Avoid Precision Tasks
* Rotate Workstation

Recommendations appear in real time on both worker and supervisor dashboards.

---

## Alert Center

Automatic alerts are generated when:

* Worker not recognized
* High fatigue detected
* Critical fatigue detected
* Continuous work exceeds threshold
* Face not detected
* Camera disconnected

Alerts include timestamps and recommended actions.

---

## Worker Profiles

Each registered worker has a dedicated profile.

Displays:

* Personal Information
* Department
* Shift
* Registration Photo
* Current Status
* Historical Fatigue Scores
* Attendance Summary
* AI Recommendations
* Previous Alerts
* Productivity Trends

---

## Analytics

Managers can monitor:

* Daily Fatigue Trends
* Weekly Fatigue Trends
* Department Comparison
* Shift Comparison
* Productivity vs Fatigue
* High-Risk Operators
* AI Recommendation Statistics
* Average Fatigue Score

Interactive charts are available throughout the dashboard.

---

## Reports

Generate AI-powered reports.

Available Reports:

* Daily Report
* Weekly Report
* Monthly Report
* Shift Summary
* Worker Performance Report
* Fatigue History Report

Reports include:

* Fatigue Statistics
* Productivity Trends
* AI Recommendations
* Supervisor Notes

Reports are exportable.

---

# AI Architecture

The platform uses multiple AI models working together.

## Face Detection

Detects faces from the webcam.

Recommended Technology:

* MediaPipe Face Detection

---

## Face Recognition

Matches detected faces with registered workers.

Recommended Technology:

* InsightFace (Face Embedding & Recognition)

Face embeddings generated during registration are stored securely and compared in real time during monitoring.

---

## Facial Landmark Detection

Extracts detailed facial landmarks.

Recommended Technology:

* MediaPipe Face Mesh

Used for:

* Eye landmarks
* Mouth landmarks
* Head orientation

---

## Blink Detection

Calculated using Eye Aspect Ratio (EAR).

Purpose:

* Detect prolonged eye closure
* Calculate blink frequency

---

## Yawning Detection

Calculated using Mouth Aspect Ratio (MAR).

Purpose:

* Detect repeated yawning
* Measure fatigue progression

---

## Pose Detection

Recommended Technology:

* MediaPipe Pose

Analyzes:

* Neck angle
* Shoulder alignment
* Body posture

---

## Fatigue Scoring Engine

The fatigue score is generated by combining:

* Eye Closure
* Blink Frequency
* Yawning
* Head Pose
* Body Posture
* Continuous Working Duration

The score updates continuously throughout the operator's shift.

---

## AI Report Generation

Use a Hugging Face instruction model to generate:

* Shift summaries
* Supervisor insights
* Worker recommendations
* Fatigue explanations

The LLM is used only for report generation and recommendations, not for computer vision.

---

# Data Architecture

## User Data

Stores:

* Administrators
* Supervisors
* User Roles

---

## Worker Data

Stores:

* Employee Details
* Face Embedding
* Registration Image
* Department
* Shift
* Status

---

## Monitoring Data

Stores:

* Fatigue Scores
* Blink Statistics
* Yawning Events
* Posture Events
* Head Pose
* AI Recommendations
* Monitoring History

---

## Reports

Stores:

* Shift Reports
* Daily Reports
* Analytics
* Productivity Trends

---

## Alerts

Stores:

* Notifications
* Critical Events
* Activity Logs

---

# Features In Scope

* Landing Page
* Authentication
* Role-Based Access
* Worker Registration
* Face Recognition
* Live Monitoring
* Fatigue Detection
* AI Fatigue Score
* Recommendation Engine
* Supervisor Dashboard
* Worker Directory
* Worker Profiles
* Analytics
* Reports
* Alerts
* Activity Logs
* Responsive Enterprise Interface

---

# Features Out of Scope

* Thermal Camera Integration
* Wearable Device Integration
* IoT Sensor Integration
* ERP Integration
* Payroll
* Attendance System
* CCTV Multi-Camera Support
* Mobile Application
* Multi-Factory Support

These features are reserved for future versions.

---

# User Roles

## Administrator

* Manage Supervisors
* Manage Departments
* Configure AI Settings
* View Organization Analytics
* Manage Registered Workers

---

## Supervisor

* Register Workers
* Monitor Live Camera
* View Analytics
* Receive Alerts
* Generate Reports
* View Worker Profiles

Workers are monitored and therefore do not require system accounts.

---

# Target Users

Designed primarily for:

* MSME Manufacturing Industries
* Assembly Lines
* Production Facilities
* Quality Inspection Teams
* Warehouse Operations
* Electronics Manufacturing
* Automotive Component Manufacturing
* Industrial Training Centers

---

# Success Criteria

* Supervisors authenticate successfully.
* Workers are registered using facial recognition.
* Registered workers are recognized automatically from the live camera.
* AI continuously calculates fatigue scores.
* Recommendations are generated in real time.
* Supervisors receive alerts before fatigue becomes critical.
* Analytics provide meaningful workforce insights.
* Reports summarize fatigue trends and productivity.
* The platform remains responsive, scalable, and suitable for Industry 5.0 environments.
