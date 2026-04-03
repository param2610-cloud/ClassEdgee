# ClassEdgee - Smart Classroom Management System

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![InsightFace](https://img.shields.io/badge/InsightFace-0.7.3-purple)

## 🚀 Live Demo
- **Frontend**: [Vercel Deployment](#) *(Coming Soon)*
- **API Docs**: [Swagger UI](#) *(Coming Soon)*

## Overview
ClassEdgee is a comprehensive Smart Classroom Management System designed to revolutionize education through advanced technology. The platform provides a suite of tools for personalized learning, real-time insights, and seamless educational interactions. It aims to enhance the classroom experience for students, faculty, and administrators by offering features such as attendance tracking, schedule management, resource sharing, and performance analytics.

## ✨ Key Features
- **🔍 AI Face Recognition**: State-of-the-art attendance tracking using **InsightFace** (~99.86% accuracy on LFW benchmark)
- **📚 Interactive Classroom**: Real-time quizzes, assignments, and feedback
- **📅 Smart Scheduling**: Automated schedule generation and conflict resolution
- **📤 Resource Sharing**: Faculty can share lecture slides, assignments, and materials
- **📊 Performance Analytics**: Detailed insights into student performance and engagement
- **🔔 Real-time Notifications**: Important updates delivered instantly

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │  Main Backend   │     │ Python Backend  │
│   (Vercel)      │────▶│   (Railway)     │────▶│   (Railway)     │
│   React/Vite    │     │  Express/Prisma │     │ FastAPI/AI      │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   PostgreSQL    │     │   Cloudinary    │
                        │   (Neon Free)   │     │   (Free Tier)   │
                        └─────────────────┘     └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Redux Toolkit |
| **Main Backend** | Node.js, Express, Prisma ORM, PostgreSQL |
| **AI Backend** | Python 3.10, FastAPI, InsightFace, OpenCV, ONNX Runtime |
| **Database** | PostgreSQL (Neon - Free Tier) |
| **Storage** | Cloudinary (Free Tier) |
| **Deployment** | Vercel (Frontend), Railway (Backends) |

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+ (or Neon account)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/classedgee.git
   cd classedgee
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Main Backend Setup**
   ```bash
   cd main-backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

5. **Python Backend Setup**
   ```bash
   cd python-backend/app
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

### 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build
```

## 📁 Project Structure

```
classedgee/
├── frontend/           # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── store/      # Redux store
│   └── package.json
├── main-backend/       # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── Router/
│   │   └── middlewares/
│   ├── prisma/
│   └── package.json
├── python-backend/     # FastAPI + InsightFace
│   └── app/
│       ├── routes/
│       │   ├── face_recognition.py
│       │   └── insightface_service.py
│       └── requirements.txt
└── docker-compose.yml
```

## 🤖 Face Recognition System

### InsightFace Integration
The system uses **InsightFace** with the `buffalo_s` model for:
- **Face Detection**: RetinaFace with 320x320 input resolution
- **Face Recognition**: ArcFace with 512-dimensional embeddings
- **Performance**: ~99.86% accuracy on LFW benchmark
- **Optimized for CPU**: Works on free-tier cloud (512MB RAM)

### How It Works
1. **Registration**: Students upload 3-5 photos
2. **Embedding Extraction**: InsightFace extracts 512-D face vectors
3. **Model Storage**: Embeddings stored in Cloudinary as pickle files
4. **Attendance**: Real-time video stream matching against registered faces

## ☁️ Free Tier Deployment Guide

### 1. Database (Neon PostgreSQL)
```bash
# Sign up at neon.tech and create a project
# Copy the connection string to your .env
```

### 2. Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### 3. Backends (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy Main Backend
cd main-backend
railway up

# Deploy Python Backend
cd python-backend
railway up
```

## 📋 Requirements

### Functional Requirements
- **User Authentication**: Role-based access (student, faculty, admin)
- **Dashboard**: Personalized views for each role
- **Course Management**: CRUD operations for courses and content
- **Interactive Classroom**: Quizzes, assignments, feedback
- **Attendance Tracking**: AI-powered face recognition
- **Resource Sharing**: File upload and download
- **Performance Analytics**: Grades, attendance, engagement metrics
Schedule Management:

Automate the creation and management of class schedules.
Ensure optimal utilization of resources.
Notifications:

Send notifications to students and faculty about important updates, assignments, and class schedules.
Non-Functional Requirements
Scalability:

The system should be able to handle a large number of users and data without performance degradation.
Security:

Ensure secure authentication and authorization mechanisms.
Protect user data and privacy.
Usability:

Provide an intuitive and user-friendly interface.
Ensure easy navigation and accessibility for all users.
Performance:

The system should have fast response times and low latency.
Ensure efficient handling of real-time interactions.
Reliability:

The system should be highly available and reliable.
Implement backup and recovery mechanisms.
Maintainability:

The codebase should be well-documented and modular.
Ensure easy maintenance and updates.
System Requirements
Frontend:

React
TypeScript
Tailwind CSS
Vite
Backend:

Node.js
Express
Prisma
PostgreSQL
Python Backend:

FastAPI
OpenCV
Pydantic
Cloudinary
Development Environment:

Node.js (v14 or higher)
Python (v3.8 or higher)
PostgreSQL (v12 or higher)
Git
Deployment:

Docker
Kubernetes (optional)
Cloud provider (e.g., AWS, Azure, GCP)
By meeting these requirements, the ClassEdgee platform will provide a robust and efficient solution for smart classroom management.
Usage
For Students
Login: Students can log in using their credentials.
Dashboard: Access the dashboard to view upcoming classes, assignments, and notifications.
Interactive Classroom: Join virtual classrooms, participate in quizzes, and interact with faculty in real-time.
Resource Download: Download lecture slides, assignment guidelines, and other educational resources shared by faculty.
Performance Tracking: View detailed insights into your performance, including grades, attendance, and engagement metrics.
For Faculty
Login: Faculty members can log in using their credentials.
Dashboard: Access the dashboard to manage classes, view schedules, and track student performance.
Create and Manage Courses: Create new courses, add syllabus details, and manage course content.
Interactive Classroom: Conduct virtual classes, share resources, and interact with students in real-time.
Attendance Tracking: Utilize face recognition technology to automate attendance tracking.
Performance Analytics: Monitor student performance and provide feedback.
For Administrators
Login: Administrators can log in using their credentials.
Dashboard: Access the dashboard to manage the entire educational ecosystem.
Schedule Management: Automate the creation and management of class schedules.
Resource Management: Oversee the sharing of educational resources and ensure optimal utilization.
Reports and Analytics: Generate detailed reports on student and faculty performance, attendance, and resource usage.
Navigation
Home: Access the main landing page with an overview of the platform.
About: Learn more about the vision, mission, and key features of ClassEdgee.
Notices: Stay updated with the latest notices and announcements.
Events: View upcoming events and important dates.