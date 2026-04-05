# AI-Powered Ticket Management System (Prototype)

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

```DATABASE_URL=postgresql://username:password@localhost:5432/ticket_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

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

 - Backend: [https://ticket-system-backend.onrender.com](https://ticket-system-backend-iybe.onrender.com)

 - Frontend: [https://ticket-system-frontend.onrender.com](https://ticket-system-frontend-wejp.onrender.com)

 - Database: PostgreSQL managed by Render.

### License

## MIT

Sign in Page:
<img width="1918" height="908" alt="image" src="https://github.com/user-attachments/assets/16466555-6aaf-46df-a854-af5bb4ca7b44" />

Sign up page:
<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/9c446208-6db6-45e2-befd-296b4522ae31" />

Admin Panel:
<img width="1920" height="1492" alt="image" src="https://github.com/user-attachments/assets/8429a153-f7f7-476d-bbbf-0e3d79df596a" />

Agent Panel:
<img width="1920" height="916" alt="image" src="https://github.com/user-attachments/assets/90438ccf-c832-49ac-af7c-e54500844e8d" />

Client Panel:
<img width="1920" height="980" alt="image" src="https://github.com/user-attachments/assets/c4e1cef7-e97a-4490-a460-c21428236a22" />








