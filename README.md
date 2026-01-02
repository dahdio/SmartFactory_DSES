# SmartFactory DSES (Manufacturing Intelligence Dashboard)

## Overview
SmartFactory DSES is a modern, real-time manufacturing intelligence dashboard designed to monitor and analyze factory performance. It integrates telemetry data, expert system diagnostics, and decision support tools to optimize production efficiency and predict maintenance needs.

![Dashboard Preview](https://via.placeholder.com/800x450?text=SmartFactory+Dashboard+Preview)

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
