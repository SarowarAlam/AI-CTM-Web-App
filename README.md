# AI-Powered Ticket Management System

A full‑stack web application that automatically classifies customer tickets using zero‑shot AI. Built with FastAPI (Python), React (TypeScript), and PostgreSQL.

## Features

- **User roles**: Admin, Agent, Customer – each with distinct permissions.
- **AI classification**: Uses Hugging Face’s zero‑shot model to categorize tickets based on description (e.g., `billing`, `technical`, `feature request`).
- **Ticket management**: Create, view, edit, and delete tickets.
- **Admin portal**: Manage users, view statistics, and adjust AI categories on the fly.
- **Persistent storage**: PostgreSQL database.

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Transformers (Hugging Face), bcrypt, JWT.
- **Frontend**: React, TypeScript, TailwindCSS, React Query, Axios.

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or use Render’s free DB)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Create a .env file in backend/:

## .env file creation

DATABASE_URL=postgresql://username:password@localhost:5432/ticket_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
Run database migrations (tables are created automatically on first run):

## Backend Setup
```bash
uvicorn app.main:app --reload
```
## Frontend Setup
```bash
cd frontend
npm install
npm start
Open http://localhost:3000 to use the app.
```

### Deployment
The app is deployed on Render (free tier).

 - Backend: https://ticket-system-backend.onrender.com

 - Frontend: https://ticket-system-frontend.onrender.com

 - Database: PostgreSQL managed by Render.

### License

## MIT

Add screenshots of the login page, dashboard, admin portal, etc. You can create a `screenshots` folder in your repo and link to images.

