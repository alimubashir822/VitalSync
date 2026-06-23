# VitalSync AI - Chronic Care Intelligence Platform

VitalSync AI is an AI-powered Remote Patient Monitoring (RPM) chronic care intelligence platform designed to connect patients, wearable devices, clinical care teams, doctors, and administrators. It is built using Next.js 16 (App Router), TypeScript, Tailwind CSS, and Prisma ORM.

---

## 🌟 Core System Portals

The platform supports four specialized role-based portals:

1. **Patient Dashboard (`/patient/dashboard`)**
   - Telemetry key indicators (BP, Glucose, HR latest records).
   - Interactive, responsive **SVG-based Vitals Trend Charts** (line interpolation with grid lines, dots, gradients, and hover filters).
   - **Vitals Logger Form**: Zod-validated entry forms for Blood Pressure, Glucose, and Heart Rate.
   - **Medication Checklist**: Pill dose tracker that saves daily compliance.
   - **Clinical Chat Assistant**: Secure AI bot that analyzes logs and provides advice (falls back to a rule heuristics engine if no OpenAI key is set).
   - **Stability Index Details**: Health stability score tracker with breakdown of positive compliance logs and telemetry caution warnings.
   - **Digital Chronic Care Journey Stepper**: Dynamic milestones mapping stage baselines (e.g. "CGM Synced ✓", "BP Baseline Targets ✓", "Medication Target Adjustment", "Care Review Pending").
   - **AI Lifestyle & Wellness Log**: Dashboard trackers for Daily Steps, Sleep Logs, Hydration checks, and Medication Adherence scores.
   - **Elderly Voice Check-in**: Interactive mic simulator showing voice waves and simulated voice guidance responses ("Setting Omron BP link. Please log readings...").

2. **Doctor Dashboard (`/doctor/dashboard`)**
   - **Pre-Appointment AI Brief**: A 10-second summary before doctor visits, detailing vital trends, compliance rates, and missed doses.
   - **AI Telemetry Forecast**: A predictive engine outlining risk prognoses based on history (e.g. warning if diastolic readings show evening spikes next week).
   - **Family Care Circle**: Nodes mapping coordinates between Patient, Family members, Nurses, and Physicians.
   - **Clinical Directory Grid**: Search, filter by condition, and sort patients by risk score.
   - **AI Care Plan Generator**: Automatically drafts customized care targets based on vitals history.

3. **Care Team Dashboard (`/care-team/dashboard`)**
   - **Live Alert Feed**: Real-time notifications requiring coordinator or nurse triage.
   - **Alert Resolution**: Clinic providers can review alerts and log resolution comments.
   - **Triage Directory**: Review organization-wide patient caseloads.

4. **Admin Analytics Portal (`/admin/dashboard`)**
   - **Population Health Stats**: Stable percentages vs. High Attention triage scope.
   - **Audit Logs**: Full secure log table of all HIPAA system audits.

---

## 🚨 Alert Engine Threshold Logic

The alert engine automatically evaluates new vital logs and fires alerts matching these ranges:

* **Blood Pressure**
  * **CRITICAL**: Systolic $\ge 160$ or Diastolic $\ge 100$ mmHg (e.g. logs 165/102).
  * **WARNING**: Systolic $\ge 140$ or Diastolic $\ge 90$ mmHg (e.g. logs 142/92).
* **Glucose levels**
  * **CRITICAL**: $\le 65$ mg/dL (Hypoglycemia warning).
  * **WARNING**: Fasting $\ge 130$ mg/dL or Post-Meal $\ge 180$ mg/dL.
* **Heart Rate**
  * **CRITICAL**: Resting HR $\ge 140$ BPM or $\le 45$ BPM.
  * **WARNING**: Resting HR $\ge 110$ BPM or $\le 50$ BPM.

---

## 🔐 Seeded Test Credentials

You can log in instantly with 1-click on the login page, or use the credentials below (Password is `password123` for all accounts):

| Profile Role | Email | Clinical Context |
| :--- | :--- | :--- |
| **Sarah Jenkins (Patient)** | `sarah.jenkins@vitalsync.com` | Hypertension Care Plan, logs BP, has active critical alert |
| **John Smith (Patient)** | `john.smith@vitalsync.com` | Type 2 Diabetes Care Plan, logs daily glucose levels |
| **Dr. Robert Chen (Doctor)** | `doctor.chen@vitalsync.com` | Cardiologist Specialist, manages Sarah & generates AI plans |
| **Nurse Emily Jackson (Care Team)** | `nurse.emily@vitalsync.com` | Chronic Coordinator, triages alerts & resolves alarms |
| **System Admin** | `admin@vitalsync.com` | Monitors Population Health metrics & HIPAA Audit Logs |

---

## 🚀 Setup & Installation

1. Install project dependencies:
   ```bash
   npm install
   ```
2. Reset and build the database schema (using Prisma v6 and SQLite):
   ```bash
   npx prisma db push
   ```
3. Populate database with seeded clinical logs:
   ```bash
   node prisma/seed.js
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
