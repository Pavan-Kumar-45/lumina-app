# Lumina App

A modern, full-stack productivity application that helps users manage their daily tasks, diary entries, goals, and notes. Built with FastAPI and React, Lumina provides a seamless experience for organizing your life.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)

## Features

- **Todo Management**: Create, organize, and track daily tasks with priority levels and date filtering
- **Digital Diary/Journal**: Write and manage daily diary entries with date navigation
- **Goal Tracking**: Set, monitor, and complete personal and professional goals with target dates
- **Notes with Markdown**: Rich note-taking with full Markdown support, LaTeX math, syntax highlighting, tags, and export
- **Authentication**: Secure user registration and login with JWT (Bearer token)
- **Email Notifications**: Email verification via OTP and daily task reminder emails (powered by Resend)
- **Scheduled Reminders**: Automated daily reminders at 8 AM and 6 PM (IST) using APScheduler
- **Theme Support**: Light and dark mode toggle
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dashboard**: Overview with stats, motivational quotes, and task completion streaks
- **Global Search**: Instant search across notes, tasks, diary entries, and goals
- **Task Rollover**: Automatically or manually roll over incomplete tasks to today
- **Export**: Export notes and diary entries as Markdown, text, or PDF

## Tech Stack

### Backend
- **FastAPI** — Modern, async Python web framework
- **SQLAlchemy** — SQL toolkit and ORM (with SQLAlchemy-Utils)
- **PostgreSQL / MySQL** — Database (configurable via environment variable)
- **JWT (PyJWT)** — Token-based authentication with Bearer scheme
- **pwdlib** — Password hashing (Argon2)
- **APScheduler** — Async task scheduling for email reminders
- **Pydantic v2** — Data validation and serialization
- **Resend** — Transactional email API (verification codes and reminders)
- **python-dotenv** — Environment variable management

### Frontend
- **React 19** — UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Animation library
- **Lucide React** — Icon library
- **React Markdown** — Markdown rendering with remark-gfm, remark-math, remark-breaks
- **rehype-katex** — LaTeX math rendering
- **react-syntax-highlighter** — Code block syntax highlighting
- **clsx + tailwind-merge** — Conditional class utilities

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **PostgreSQL** or **MySQL** database
- **Git**

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/lumina-app.git
cd lumina-app
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python -m venv .venv
```

#### Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  .venv\Scripts\activate.bat
  ```
- **macOS/Linux**:
  ```bash
  source .venv/bin/activate
  ```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database connection string
DB=postgresql://user:password@localhost:5432/lumina_db
# or for MySQL:
# DB=mysql+pymysql://user:password@localhost:3306/lumina_db

# JWT Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Resend Email API (for notifications & verification)
RESEND_API_KEY=re_your_resend_api_key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
# From project root directory
python -m uvicorn backend.main:app --reload
```
Backend will run at: **http://localhost:8000**

API documentation available at: **http://localhost:8000/docs**

### Start Frontend Server
```bash
# From frontend directory
cd frontend
npm run dev
```
Frontend will run at: **http://localhost:5173**

## Project Structure

```
lumina-app/
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication (register, login, JWT)
│   │   ├── diary.py        # Diary/Journal CRUD + search
│   │   ├── goals.py        # Goals CRUD + completion
│   │   ├── notes.py        # Notes CRUD + tags + search
│   │   ├── todos.py        # Todos CRUD + status + rollover
│   │   └── users.py        # User profile, email verification, notifications
│   ├── db.py               # Database engine & session management
│   ├── models.py           # Pydantic request/response models
│   ├── schemas.py          # SQLAlchemy ORM table definitions
│   ├── email_utils.py      # Resend email utilities (OTP & reminders)
│   ├── scheduler.py        # APScheduler daily reminder jobs
│   └── main.py             # FastAPI app, CORS, lifespan events
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── api/           # API client & endpoint functions
│   │   ├── components/    # React components
│   │   │   ├── common/    # Reusable UI (Button, Card, Modal, Calendar, etc.)
│   │   │   ├── features/  # Feature components (diary, goals, todos)
│   │   │   └── layout/    # Layout (Sidebar, Topbar, MainLayout)
│   │   ├── pages/         # Page components (Dashboard, Todos, Diary, etc.)
│   │   ├── context/       # React context (Auth, Theme)
│   │   ├── hooks/         # Custom hooks (useAuth, useFetch, useForm, etc.)
│   │   ├── utils/         # Utility functions (date, export)
│   │   └── constants/     # App constants & animation variants
│   └── public/            # Static assets
├── tests/                 # Test suite (pytest)
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login (OAuth2 form, returns JWT) |

### Users (`/users/me`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me/` | Get current user profile |
| PUT | `/users/me/username` | Update username |
| PUT | `/users/me/email` | Update email |
| PUT | `/users/me/password` | Update password |
| PUT | `/users/me/rollover` | Toggle auto-rollover setting |
| PUT | `/users/me/notifications` | Enable/disable notifications |
| PUT | `/users/me/notifications/disable` | Disable notifications |
| POST | `/users/me/send-validation-code` | Send email OTP |
| POST | `/users/me/validate-email` | Verify email with OTP |
| DELETE | `/users/me/` | Delete account |

### Todos (`/todos`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos/` | Get all todos |
| GET | `/todos/search?query=` | Search todos |
| GET | `/todos/date/{date}` | Get todos by date |
| GET | `/todos/{id}` | Get todo by ID |
| POST | `/todos/` | Create a todo |
| PUT | `/todos/{id}` | Update a todo |
| PUT | `/todos/{id}/status` | Toggle todo status |
| POST | `/todos/rollover` | Roll over incomplete past tasks to today |
| DELETE | `/todos/{id}` | Delete a todo |

### Diary (`/diaries`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/diaries/` | Get all diary entries |
| GET | `/diaries/search?query=` | Search diary entries |
| GET | `/diaries/date/{date}` | Get entries by date |
| GET | `/diaries/{id}` | Get entry by ID |
| POST | `/diaries/` | Create a diary entry |
| PUT | `/diaries/{id}` | Update a diary entry |
| DELETE | `/diaries/{id}` | Delete a diary entry |

### Notes (`/notes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes/` | Get all notes |
| GET | `/notes/search?query=` | Search notes |
| GET | `/notes/date/{date}` | Get notes by creation date |
| GET | `/notes/{id}` | Get note by ID |
| POST | `/notes/` | Create a note (with tags) |
| PUT | `/notes/{id}` | Update a note |
| DELETE | `/notes/{id}` | Delete a note |

### Goals (`/goals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals/` | Get all goals |
| GET | `/goals/search?query=` | Search goals |
| GET | `/goals/{id}` | Get goal by ID |
| POST | `/goals/` | Create a goal |
| PUT | `/goals/{id}` | Update a goal |
| PUT | `/goals/complete/{id}` | Mark goal as completed |
| DELETE | `/goals/{id}` | Delete a goal |

For interactive API documentation, visit **http://localhost:8000/docs** after starting the backend.

## Development

### Code Linting (Frontend)
```bash
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend — no build step needed
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
```

## Deployment

The application is configured for deployment on:
- **Backend**: Any platform supporting Python (Render, Railway, DigitalOcean, etc.)
- **Frontend**: Vercel, Netlify, or any static hosting

Update the `origins` list in `backend/main.py` with your production frontend URL.
Update `API_BASE_URL` in `frontend/src/api/client.js` with your production backend URL.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI for the amazing backend framework
- React team for the powerful UI library
- All open-source contributors whose packages made this possible