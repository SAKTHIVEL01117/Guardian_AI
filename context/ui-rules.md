# UI Rules

Concise rules for building the **Operator Guardian AI** interface.

Follow these guidelines to maintain a professional, human-centered AI monitoring platform that is consistent across all screens.

---

# Design Philosophy

Operator Guardian AI is an **Industry 5.0 human-centric safety and productivity platform**.

The interface should feel:

* Professional
* Trustworthy
* Intelligent
* Minimal
* Data-focused
* Safety-oriented
* Easy to understand
* Responsive
* Accessible

The system should prioritize:

* Worker safety
* Human well-being
* Clear AI explanations
* Quick decision-making

Avoid:

* Gaming-style interfaces
* Excessive animations
* Overly complex dashboards
* Decorative elements without purpose

---

# Visual Identity

The design should represent:

* Industrial technology
* AI intelligence
* Workplace safety
* Human-machine collaboration

The interface should look suitable for:

* Manufacturing plants
* MSMEs
* Industrial control rooms
* Safety monitoring centers

Avoid making it look like:

* Social media apps
* Gaming dashboards
* Cryptocurrency platforms

---

# Layout

Application layout:

```
Sidebar

↓

Header

↓

Main Content
```

Rules:

* Full-width responsive layout.
* Maximum content width: 1440px.
* Page padding: 24px.
* Section spacing: 24px.
* Card spacing: 16px.
* Maintain consistent alignment.

---

# Navigation

Main Navigation:

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

* Keep navigation simple.
* Highlight active page clearly.
* Support collapsed sidebar.
* Use meaningful icons.
* Avoid deep navigation trees.

---

# Cards

All information blocks should use consistent cards.

Properties:

```
Background:
White / Dark neutral surface

Border Radius:
Medium

Padding:
20-24px

Shadow:
Subtle

Spacing:
Consistent
```

Cards are used for:

* Worker information
* AI predictions
* Analytics
* Alerts
* Reports

Avoid:

* Excessive colored cards.
* Too many visual containers.
* Large decorative cards.

Use colors only for:

* Risk levels
* Alerts
* Status indicators
* Charts

---

# Color System

Colors should communicate meaning.

## Normal Status

Represents:

* Safe
* Healthy
* Normal operation

---

## Warning Status

Represents:

* Moderate fatigue
* Attention required

---

## Critical Status

Represents:

* High fatigue
* Immediate action required

---

Rules:

* Never use color alone to communicate information.
* Always include text labels.
* Maintain accessibility contrast.

---

# Typography

Hierarchy:

## Page Title

Properties:

* Large
* Bold
* Clear

Example:

```
Live Worker Monitoring
```

---

## Section Title

Properties:

* Medium
* Semi-bold

Example:

```
Fatigue Analysis
```

---

## Body Text

Properties:

* Regular
* Easy to read

---

## Data Numbers

Examples:

```
87%

12 Workers

5 Alerts
```

Properties:

* Large
* Bold
* High visibility

---

## Secondary Information

Examples:

* Last updated time
* Confidence score
* Metadata

Properties:

* Smaller
* Muted

---

# Buttons

## Primary Actions

Examples:

* Register Worker
* Start Monitoring
* Generate Report
* Submit Analysis

Rules:

* One main action per screen.
* Clear labels.
* Consistent placement.

---

## Secondary Actions

Examples:

* Cancel
* Back
* Reset
* View Details

---

## Danger Actions

Examples:

* Remove Worker
* Stop Monitoring
* Delete Data

---

# Forms

Used for:

* Worker registration
* Login
* Settings
* Profile updates

Standard Layout:

```
Basic Information

↓

Worker Details

↓

Image Upload

↓

AI Configuration

↓

Actions
```

Rules:

* Keep forms simple.
* Required fields first.
* Show validation clearly.
* Provide helpful error messages.
* Avoid unnecessary fields.

---

# Camera Monitoring UI

The monitoring screen is the core feature.

Layout:

```
Camera Feed

↓

Face Detection Overlay

↓

AI Analysis Panel

↓

Recommendation Panel
```

The interface should display:

* Worker face box
* Worker name
* Recognition confidence
* Fatigue score
* Current condition
* Recommendation

Avoid:

* Blocking the camera view.
* Overlapping information.
* Excessive data.

---

# AI Result Display

Every AI prediction must explain:

## Result

Example:

```
Fatigue Level:
High
```

## Confidence

Example:

```
Confidence:
94%
```

## Reason

Example:

```
Detected:
Reduced blinking rate
+
Long working duration
```

## Action

Example:

```
Recommendation:
Take a short break
```

AI should never appear as a black box.

---

# Status Badges

Use consistent statuses.

## Worker Status

```
Active

Offline

Monitoring

Unknown
```

---

## Fatigue Status

```
Normal

Moderate

High

Critical
```

---

## Alert Status

```
New

Acknowledged

Resolved
```

Every status should have:

* Label
* Icon
* Color indicator

---

# Dashboard

Dashboard should display:

## Top KPIs

* Active Workers
* Workers Being Monitored
* Fatigue Alerts
* Average Fatigue Score
* Safety Index
* Productivity Score

---

## Additional Sections

* Live Worker Status
* Recent Alerts
* Fatigue Trends
* AI Recommendations
* Shift Analytics

---

# Charts

Supported:

* Line Chart
* Bar Chart
* Area Chart
* Pie Chart

Used for:

* Fatigue trends
* Worker comparison
* Shift analysis
* Safety metrics

Rules:

* Keep charts simple.
* Use meaningful labels.
* Avoid unnecessary animations.
* Always provide context.

---

# Search and Filters

Worker lists should support:

* Name Search
* Employee ID Search
* Department Filter
* Risk Level Filter
* Date Filter
* Shift Filter

Filters should remain accessible without clutter.

---

# Dialogs

Use dialogs for:

* Delete worker
* Stop monitoring
* Generate reports
* Confirm actions

Structure:

```
Title

↓

Explanation

↓

Confirm Action

↓

Cancel
```

Avoid unnecessary confirmation steps.

---

# Notifications

Notification types:

## Success

Examples:

* Worker registered successfully.
* Report generated.

---

## Warning

Examples:

* Fatigue increasing.
* Long working duration detected.

---

## Critical

Examples:

* Immediate rest required.
* Safety risk detected.

---

Rules:

* Keep messages short.
* Explain what happened.
* Provide next action.

Never display technical errors.

---

# Empty States

Every page requires an empty state.

Examples:

```
No Workers Registered

No Active Monitoring Sessions

No Alerts Found

No Reports Available
```

Include:

* Simple illustration/icon
* Explanation
* Action button

---

# Loading States

During processing:

Show:

* Skeleton cards
* Skeleton tables
* AI processing indicator
* Camera initialization status

Never display blank screens.

---

# Error States

Display:

* Friendly message
* Retry option
* Suggested action

Never display:

* Stack traces
* API errors
* Database messages

---

# Responsive Design

## Desktop

Support:

* Multi-column dashboards
* Large camera monitoring
* Side-by-side analytics

---

## Tablet

Support:

* Reduced grids
* Collapsible panels
* Scrollable tables

---

## Mobile

Support:

* Single-column layout
* Stacked cards
* Simplified monitoring view

---

# Icons

Use icons for:

* Workers
* Camera
* AI
* Alerts
* Reports
* Analytics
* Settings

Rules:

* Icons should communicate meaning.
* Avoid decorative icons.
* Maintain consistent icon style.

---

# Accessibility

Always:

* Use readable text.
* Maintain contrast.
* Support keyboard navigation.
* Provide labels.
* Avoid color-only indicators.
* Support screen readers where possible.

---

# AI Transparency Rules

Every AI feature must show:

* What was detected.
* Why it was detected.
* Confidence level.
* Recommended action.

Never show only:

```
AI says:
High Risk
```

Without explanation.

---

# Performance Rules

Always:

* Optimize camera processing.
* Avoid unnecessary renders.
* Lazy load heavy components.
* Compress images.
* Cache backend requests.

Avoid:

* Blocking UI during AI processing.
* Running heavy models unnecessarily.
* Processing every video frame.

---

# Consistency Rules

Every new component should:

* Match existing spacing.
* Match typography.
* Match button styles.
* Match status indicators.
* Follow existing layouts.
* Be reusable.

Never create a new pattern when an existing component can solve the problem.

---

# Do Nots

Do not:

* Use excessive gradients.
* Use neon colors.
* Create gaming-style dashboards.
* Overload screens with data.
* Hide AI reasoning.
* Use inconsistent layouts.
* Expose technical errors.
* Create unnecessary components.
* Ignore accessibility.

---

# Final Principle

Every screen should help supervisors and workers answer:

1. What is happening?
2. Who needs attention?
3. Why is it happening?
4. What action should be taken?

The interface must support humans, not replace them.
