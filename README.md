# SmartFactory DSES (Manufacturing Intelligence Dashboard)

## Overview
SmartFactory DSES is a modern, real-time manufacturing intelligence dashboard designed to monitor and analyze factory performance. It integrates telemetry data, expert system diagnostics, and decision support tools to optimize production efficiency and predict maintenance needs.

This system operates as a **Hybrid Intelligence** platform, combining the "Strategic Brain" of a **Decision Support System (DSS)** with the "Technical Specialist" logic of an **Expert System (ES)**:
*   **Decision Support System (DSS)**: Synthesizes high-volume telemetry into actionable trends to detect health drifts and bottlenecks. It features a "What-If" Scenario Manager that runs simulations to balance production gains against energy costs and risk profiles.
*   **Expert System (ES)**: Uses a Knowledge Base of 200+ codified rules and an Inference Engine to diagnose specific machine faults (e.g., "Critical Bearing Wear") with probability-based confidence scores, providing transparency through reasoning paths.
*   **Hybrid Integration**: By integrating DSS trends with ES logic, the system closes the gap between observation and action. The DSS filters data noise to identify patterns, which the ES validates against engineering rules, ensuring every decision is backed by both statistical prediction and physical verification.

![Dashboard Preview](./assets/dashboard-preview.png)

## Key Features

### Real-Time Telemetry
- **Active Machines**: Live monitoring of machine status (ON/OFF) and operational capacity.
- **Production Output**: Real-time tracking of production metrics against targets.
- **Energy Efficiency**: Analysis of power consumption with identification of inefficient units.
- **Active Alerts**: Use of an Expert System to detect and prioritize critical anomalies (e.g., Bearing Failures, Coolant Degradation).

### Intelligent Diagnostics
- **Detailed Metrics**: Drill-down views for every machine showing:
  - Rule Processing Cost
  - Knowledge Base Hit Rate
  - Current & Projected Reliability
- **Expert System Integration**: Automated pattern matching against 200+ rules to identify faults with high confidence.

### User Experience
- **Interactive Modals**: Detailed breakdowns for Production, Energy, and Alerts with scrollable, content-rich interfaces.
- **Dark/Light Theme**: Fully supported dynamic theming with persistent user preference.
- **PDF Reporting**: One-click generation of professional "Daily Management Reports" for offline analysis.

## Tech Stack
- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS (with custom design system & glassmorphism effects)
- **Icons**: Lucide React
- **Visualization**: Custom Trend Charts
- **PDF Generation**: jsPDF & jsPDF-AutoTable

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dahdio/SmartFactory_DSES.git
    cd SmartFactory_DSES
    ```

2.  **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Run the local development server:**
    ```bash
    npm run dev
    ```

4.  **Open the dashboard:**
    Visit `http://localhost:5173/` in your browser.

## Project Structure
- `/frontend`: Contains the React application.
  - `/src/components`: UI components (Overview, Modals, Stats).
  - `/src/views`: Main dashboard views.
  - `/src/index.css`: Global styles and theme variables.

---
*Built with ❤️ by dahdio.*
