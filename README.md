# DisasterReady 

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-blue?style=for-the-badge&logo=vercel)](https://disaster-ready-zpj1.vercel.app/)
[![Smart India Hackathon](https://img.shields.io/badge/Target-Smart_India_Hackathon_(SIH)-orange?style=for-the-badge)](https://sih.gov.in/)
[![Made with Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Made with FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

**DisasterReady** is a comprehensive disaster management web platform engineered to revolutionize emergency education and crisis preparedness across India. Built explicitly for the **Smart India Hackathon (SIH)**, the platform transitions traditional, static survival manuals into an immersive, digital-first training ecosystem that equips citizens with the life-saving reflexes needed during crises.

---

##  Overview

In moments of sudden crisis, preparation is the definitive boundary between chaos and survival. DisasterReady directly addresses India's critical gap in localized, practical disaster management training. By providing interactive virtual drills, structured safety checklists, and immediate access to emergency protocols, the platform ensures individuals and communities know exactly how to act when every second counts.

The application features a modern, ultra-clean interface tailored for rapid comprehension under high-stress conditions, ensuring that critical safety data is clear, readable, and instantly actionable.

---

##  Key Features

*   **Interactive Virtual Drills:** Immersive digital simulations that guide users step-by-step through real-world emergency scenarios (e.g., earthquakes, flash floods, structural fires) to build practical muscle memory.
*   **Bento-Box & Cyber-Grid UI:** A highly scannable dashboard utilizing clean grid modules. Designed to present dense emergency metrics, survival steps, and live alerts logically without inducing visual fatigue.
*   **Comprehensive Educational Hub:** A centralized, localized repository containing interactive survival guides, first-aid workflows, and official government safety protocols tailored to regional geographic challenges.
*   **Community Action & Preparedness:** Custom planning tools, downloadable emergency checklists, and family readiness trackers to coordinate hyper-local community responses and resource allocation.

---

##  Tech Stack & Architecture

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) | Fast, modular, and responsive user interface rendering the Bento-box style dashboards. |
| **Backend** | FastAPI (Python) | High-performance, asynchronous REST API handling simulation logic, data persistence, and educational routes. |
| **Deployment** | Vercel | Seamless cloud hosting ensuring high availability and rapid content delivery. |

### Repository Structure

### Architecure 
isasterReady/
├── sih_fron/                  # Next.js frontend client application
├── disasterready-backend/     # FastAPI backend service and API routing
├── package.json               # Root configuration files
└── README.md                  # Project documentation

## 🚀 Live Demo

Experience the deployment directly on Vercel:  
🔗 **[DisasterReady Live Application](https://disaster-ready-zpj1.vercel.app/)**

---

## ⚙️ Local Setup & Installation

Follow these steps to configure and run the entire ecosystem locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/Megha737/DisasterReady.git](https://github.com/Megha737/DisasterReady.git)
cd DisasterReady
2. Frontend Configuration (sih_fron)
cd sih_fron
npm install
npm run dev
3. Backend Configuration (disasterready-backend)
cd disasterready-backend
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload
