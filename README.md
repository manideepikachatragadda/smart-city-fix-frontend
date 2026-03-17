# SmartCity Fix

SmartCity Fix is a comprehensive, modern frontend application designed to streamline civic issue reporting and management. It provides an intuitive interface for citizens to report problems like potholes, broken streetlights, or cleanliness issues, and equips city administrators, managers, and municipal workers with robust tools to assign, track, and resolve these issues efficiently.

## Features

### 🏢 Citizen Portal (Public)
*   **Easy Issue Reporting**: Seamlessly report issues with location context, descriptive text, and photographic evidence.
*   **Real-time Tracking**: Track the status of submitted complaints using unique Tracking IDs.
*   **Categorization & Intelligent Routing**: Automatically routes complaints to appropriate departments (Simulated NLP integration via backend).
*   **Responsive Landing Page**: Interactive 3D globe visualization and smooth "glassmorphism" UI highlighting civic duty.

### 💼 Worker Dashboard
*   **Assigned Tasks View**: Mobile-friendly, stacked-card layout for workers to see their currently assigned tasks.
*   **Proof of Work Submission**: Workers can resolve issues directly by uploading photographic proof of the completed work.
*   **Quick Status Updates**: Easy and intuitive task management.

### 🏢 Command Center (Managers & Admins)
*   **Kanban Board**: Managers can drag-and-drop or manage issues visually through stages (Pending -> In Progress -> Needs Verify -> Closed).
*   **Recent Complaints Data Table**: Admins can view comprehensive overviews of all complaints happening across the city.
*   **Worker Assignment**: Efficiently assign or reassign unassigned tickets to specific workers within a department.
*   **Review Work**: Managers can review the photographic evidence submitted by workers, approving or rejecting the resolution.
*   **System Health & Metrics**: Overview of system escalations, SLA breaches, and resolution rates.

## 🛠️ Technology Stack

This application is built with a modern, high-performance web stack:

*   **Core Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: 
    *   [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling.
    *   Custom "Glassmorphism" effects (Frosted glass navigation headers and docks floating above dynamic backgrounds).
*   **Routing**: [React Router DOM v7](https://reactrouter.com/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight, scalable global state (e.g., Auth Context).
*   **Animations**: 
    *   [GSAP (GreenSock)](https://gsap.com/) for complex, performant timeline animations.
    *   [Framer Motion](https://www.framer.com/motion/) for micro-interactions (e.g., the Mac-like floating dock).
*   **Icons & UI Components**:
    *   [Lucide React](https://lucide.dev/)
    *   [Tabler Icons](https://tabler-icons.io/)
    *   [Radix UI](https://www.radix-ui.com/)
*   **3D Visualizations**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Three.js](https://threejs.org/) for the interactive globe on the landing page.

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: Make sure you have Node.js installed (v18+ recommended).
*   **Backend**: Ensure the SmartCity Fix backend server is running. You will need to configure the `VITE_API_BASE_URL` to point to it.

### Installation

1.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory and configure your backend API URL (modify as needed for your local setup):
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api/v1
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## 🎨 UI/UX Highlights

*   **Macbook-Style Dock**: A highly responsive, animated floating dock acts as the primary navigation alternative to the traditional navbar, especially optimized for interaction.
*   **Dark/Light Mode**: Full adherence to system themes, utilizing precise Tailwind color mapping for high-contrast accessibility in both modes.
*   **Fluid Typography**: Modern fonts integrated seamlessly across all dashboards and public views.
