# 🌟 Lumina App

A modern, full-stack productivity application that helps users manage their daily tasks, diary entries, goals, and notes. Built with FastAPI and React, Lumina provides a seamless experience for organizing your life.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)

## ✨ Features

- **📝 Todo Management**: Create, organize, and track your daily tasks
- **📔 Digital Diary**: Write and manage daily diary entries
- **🎯 Goal Tracking**: Set and monitor your personal and professional goals
- **📌 Notes**: Quick note-taking with markdown support
- **🔐 Authentication**: Secure user registration and login with JWT
- **📧 Email Integration**: Email notifications and reminders
- **⏰ Scheduled Tasks**: Automated reminders using APScheduler
- **🌓 Theme Support**: Light and dark mode
- **📱 Responsive Design**: Works seamlessly across all devices
- **📊 Dashboard**: Comprehensive overview of all your activities

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL/MySQL**: Database (configurable)
- **JWT**: Token-based authentication
- **APScheduler**: Task scheduling
- **Pydantic**: Data validation
- **FastAPI-Mail**: Email integration

### Frontend
- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **React Markdown**: Markdown rendering with KaTeX support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **PostgreSQL** or **MySQL** (depending on your configuration)
- **Git**

## 🚀 Installation

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
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lumina_db
# or for MySQL:
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/lumina_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Optional)
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@example.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=Lumina App

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## 🏃 Running the Application

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

## 📁 Project Structure

```
lumina-app/
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── diary.py        # Diary management
│   │   ├── goals.py        # Goals tracking
│   │   ├── notes.py        # Notes management
│   │   ├── todos.py        # Todo list operations
│   │   └── users.py        # User management
│   ├── db.py               # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── email_utils.py      # Email utilities
│   ├── scheduler.py        # Task scheduler
│   └── main.py             # FastAPI application
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   │   ├── common/    # Reusable components
│   │   │   ├── features/  # Feature-specific components
│   │   │   └── layout/    # Layout components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── constants/     # Constants and configs
│   └── public/            # Static assets
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/token` - Get access token

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update user profile
- `DELETE /users/me` - Delete user account

### Todos
- `GET /todos` - Get all todos
- `POST /todos` - Create new todo
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo

### Diary
- `GET /diary` - Get diary entries
- `POST /diary` - Create diary entry
- `GET /diary/{id}` - Get specific entry
- `PUT /diary/{id}` - Update entry
- `DELETE /diary/{id}` - Delete entry

### Goals
- `GET /goals` - Get all goals
- `POST /goals` - Create new goal
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal

### Notes
- `GET /notes` - Get all notes
- `POST /notes` - Create new note
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note

For detailed API documentation, visit: **http://localhost:8000/docs** after starting the backend server.

 
## 🔧 Development

### Code Formatting (Frontend)
```bash
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend - No build needed, just ensure dependencies are installed
pip install -r requirements.txt

# Frontend
cd frontend
npm run build
```

## 🌐 Deployment

The application is configured for deployment on:
- **Backend**: Any platform supporting Python (Heroku, Railway, DigitalOcean, etc.)
- **Frontend**: Vercel (as indicated in CORS settings)

Update the `origins` list in [backend/main.py](backend/main.py) with your production frontend URL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

 

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- React team for the powerful UI library
- All open-source contributors whose packages made this possible

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

 