# UI Tokens

Design tokens for **Operator Guardian AI**.

These tokens define the complete visual language of the application.

All components must use these tokens.

Never hardcode:

* Colors
* Spacing
* Typography
* Shadows
* Border radius

directly inside components.

---

# Design Philosophy

Operator Guardian AI is an **AI-powered industrial safety and workforce intelligence platform**.

The UI should communicate:

* Trust
* Safety
* Intelligence
* Human-centric technology
* Real-time awareness

Design characteristics:

* Professional
* Clean
* Modern
* Minimal
* Data-focused
* Accessible
* Enterprise-grade

Avoid:

* Gaming aesthetics
* Excessive animations
* Neon colors
* Decorative visuals without purpose

---

# Color Palette

## Primary Brand

Used for:

* Main actions
* Navigation
* AI features
* Active states

```
Primary: #2563EB

Primary Hover: #1D4ED8

Primary Light: #DBEAFE

Primary Foreground: #FFFFFF
```

---

# AI Intelligence Color

Used for:

* AI analysis
* Predictions
* Recommendations
* Smart insights

```
AI Purple: #7C3AED

AI Light: #EDE9FE

AI Foreground: #5B21B6
```

---

# Safety Colors

## Normal / Safe

Represents:

* Healthy worker state
* Normal operation
* Low risk

```
Success: #16A34A

Success Light: #DCFCE7

Success Foreground: #166534
```

---

## Warning

Represents:

* Increasing fatigue
* Attention required
* Moderate risk

```
Warning: #F59E0B

Warning Light: #FEF3C7

Warning Foreground: #92400E
```

---

## Critical

Represents:

* High fatigue
* Immediate action required
* Safety risk

```
Danger: #DC2626

Danger Light: #FEE2E2

Danger Foreground: #991B1B
```

---

## Information

Represents:

* System information
* Monitoring status
* General notifications

```
Info: #0EA5E9

Info Light: #E0F2FE

Info Foreground: #075985
```

---

# Neutral Colors

## Background

```
Page Background: #F8FAFC

Card Background: #FFFFFF

Secondary Surface: #F1F5F9
```

---

## Dark Industrial Theme Support

Optional dark surfaces:

```
Dark Background: #0F172A

Dark Card: #1E293B

Dark Surface: #334155
```

---

## Borders

```
Border: #E2E8F0

Border Light: #F1F5F9
```

---

# Text Colors

```
Primary Text: #0F172A

Secondary Text: #475569

Muted Text: #94A3B8

Disabled Text: #CBD5E1
```

---

# Typography

## Font

Primary font:

```
Inter
```

Use throughout the application.

---

# Typography Scale

## Page Title

```
32px

Weight:
700 Bold
```

Used for:

* Dashboard titles
* Monitoring pages
* Report pages

---

## Section Title

```
24px

Weight:
600 Semi Bold
```

---

## Card Title

```
18px

Weight:
600 Semi Bold
```

---

## Body Text

```
14px

Weight:
400 Regular
```

---

## Caption

```
12px

Weight:
400 Regular
```

Used for:

* Timestamps
* Confidence values
* Metadata

---

## KPI Numbers

```
36px

Weight:
700 Bold
```

Examples:

```
87%

12 Workers

5 Alerts
```

---

# Border Radius

```
Small:
4px

Medium:
8px

Large:
12px

Extra Large:
16px

Full:
9999px
```

Usage:

* Buttons → Medium
* Cards → Large
* Status badges → Full
* Modals → Extra Large

---

# Shadows

## Card Shadow

```
0 2px 8px rgba(0,0,0,0.08)
```

---

## Hover Shadow

```
0 6px 18px rgba(0,0,0,0.12)
```

---

## Modal Shadow

```
0 20px 40px rgba(0,0,0,0.15)
```

---

# Spacing System

Use only predefined spacing values.

```
4px

8px

12px

16px

20px

24px

32px

40px

48px

64px
```

---

# Layout Tokens

```
Maximum Content Width:

1440px


Page Padding:

24px


Section Gap:

24px


Card Gap:

16px
```

---

# Buttons

## Primary Button

```
Background:
Primary

Text:
White

Radius:
Medium

Padding:
12px 20px
```

Used for:

* Register Worker
* Start Monitoring
* Generate Report

---

## Secondary Button

```
Background:
White

Border:
Default Border

Text:
Primary Text
```

Used for:

* Cancel
* Back
* View Details

---

## Danger Button

```
Background:
Danger

Text:
White
```

Used for:

* Delete
* Stop Monitoring
* Remove Worker

```

---

# Cards

All cards follow:

```

Background:
White

Radius:
Large

Border:
Default Border

Padding:
24px

Shadow:
Card Shadow

```

---

# Form Tokens

## Input

```

Background:
White

Border:
#E2E8F0

Radius:
Medium

Padding:
12px

Text:
Primary Text

```

---

## Input Focus

```

Border:
Primary

Outline:
Primary Light

```

---

# Tables

Used for:

- Workers
- Alerts
- Reports
- Monitoring History

---

## Table Header

```

Background:
Secondary Surface

Text:
Secondary Text

Weight:
600

```

---

## Table Row

```

Background:
White

Border Bottom:
Default Border

```

---

## Hover

```

Background:
#F8FAFC

```

---

# Status Tokens

## Worker Status

| Status | Color |
|---|---|
| Active | Success |
| Monitoring | Primary |
| Offline | Muted |
| Unknown | Warning |

---

## Fatigue Status

| Status | Color |
|---|---|
| Normal | Success |
| Moderate | Warning |
| High | Danger |
| Critical | Danger |

---

## Alert Status

| Status | Color |
|---|---|
| New | Danger |
| Acknowledged | Warning |
| Resolved | Success |

---

## AI Confidence

| Confidence | Color |
|---|---|
| High | Success |
| Medium | Warning |
| Low | Danger |

---

# Camera Monitoring Tokens

## Face Detection Box

```

Border:
Primary

Radius:
Medium

Label:
Primary Background

```

Displays:

- Worker Name
- Confidence
- Status

---

## AI Overlay

```

Background:
rgba(15,23,42,0.8)

Text:
White

Radius:
Medium

```

Used for:

- Live camera information
- AI analysis

---

# Dashboard Components

## KPI Card

Structure:

```

Icon

↓

Label

↓

Large Number

↓

Trend / Status

```

Style:

```

White Card

Large Radius

24px Padding

```

---

## AI Insight Card

Structure:

```

AI Icon

↓

Insight Title

↓

Explanation

↓

Recommendation

```

---

## Alert Card

Structure:

```

Severity Indicator

↓

Worker Information

↓

Reason

↓

Recommended Action

```

---

# Charts

Supported:

- Line Chart
- Bar Chart
- Area Chart
- Pie Chart

Rules:

- Use consistent colors.
- Avoid unnecessary animation.
- Always show labels.
- Maintain readability.

Chart Colors:

```

Primary Blue

AI Purple

Success Green

Warning Orange

Danger Red

```

---

# Notifications

## Success

```

Green

```

Examples:

- Worker registered
- Report completed

---

## Warning

```

Orange

```

Examples:

- Fatigue increasing
- Attention required

---

## Error

```

Red

```

Examples:

- Critical fatigue
- System failure

---

## Information

```

Blue

```

Examples:

- Monitoring started
- Report available

---

# Empty State

Structure:

```

Icon

↓

Title

↓

Description

↓

Primary Action

```

Examples:

```

No Workers Registered

No Monitoring Data

No Alerts Found

```

---

# Loading State

Use:

- Skeleton cards
- Skeleton tables
- Camera loading indicator
- AI processing indicator

Never display empty screens.

---

# Responsive Breakpoints

```

Desktop:

≥1200px

Tablet:

768px - 1199px

Mobile:

<768px

```

---

# Component Tokens

## Worker Card

```

White Card

Worker Image

Name

Department

Fatigue Status

Current Score

```

---

## Fatigue Card

```

Score

Risk Level

Progress Indicator

Recommendation

```

---

## Monitoring Card

```

Camera Feed

Face Overlay

AI Status

Recommendation Panel

```

---

## Report Card

```

Report Name

Generated Date

Summary

Download Button

```

---

# Accessibility

Always maintain:

- High contrast
- Keyboard navigation
- Visible focus states
- Readable font sizes
- Clear labels
- Text + color indicators

Never depend only on color.

---

# Design Invariants

These rules must never change:

- Never hardcode colors.
- Always use token values.
- Use Inter font.
- Maintain spacing consistency.
- Same status always uses the same color.
- Avoid gradients.
- Avoid unnecessary animations.
- Keep AI explanations visible.
- Keep dashboard layouts consistent.
- Buttons, forms, tables, and cards must follow the same visual system.
- New colors require updating this file first.

---

# Final Principle

The Operator Guardian AI interface should feel like a **professional industrial AI command center** where supervisors can quickly understand:

1. What is happening?
2. Who needs attention?
3. Why is there a risk?
4. What action should be taken?

The design must support humans working alongside AI.
```
