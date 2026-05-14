# DailyPulse

An AI-powered productivity dashboard that generates personalized morning briefings, breaks down tasks into actionable subtasks, and provides daily standup summaries and productivity insights.

Built with **FastAPI + Gemini AI** on the backend and **React + Tailwind CSS** on the frontend.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Features

- **Morning Briefing** — AI-generated motivational quote, focus tip, and daily message. Includes a web tip fetched live via Tavily search.
- **Smart Task Manager** — Add a task and Gemini automatically breaks it into 3-5 actionable subtasks with a progress tracker.
- **Standup Report** — One-click AI-generated daily standup summary from your completed tasks, with copy-to-clipboard.
- **Productivity Insights** — AI analysis of your task completion rate with actionable suggestions.
- **Responsive Design** — Works across desktop, tablet, and mobile.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Google Gemini API (google-generativeai) |
| Frontend | React 19 (Vite), Tailwind CSS |
| Search | Tavily API (for web tips) |
| Storage | JSON files (no database required) |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/alokstomar/daily-pulse.git
cd daily-pulse
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_ENABLED=true
TAVILY_API_KEY=your_tavily_api_key
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/briefing` | Today's AI-generated briefing with web tip |
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a task (AI auto-generates subtasks) |
| `PUT` | `/tasks/{id}/complete` | Mark a task as complete |
| `DELETE` | `/tasks/{id}` | Delete a task |
| `GET` | `/standup` | Generate standup from today's completed tasks |
| `GET` | `/insights` | Get productivity insights |

## Project Structure

```
daily-pulse/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── service.py           # Business logic + Gemini/Tavily calls
│   ├── requirements.txt     # Python dependencies
│   └── data/
│       ├── tasks.json       # Task storage
│       └── briefing.json    # Daily briefing cache
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React app
│   │   ├── api.js           # API client
│   │   └── index.css        # Tailwind + custom animations
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## License

MIT

## Images
**Briefing via Gemini API key**
<img width="1916" height="691" alt="image" src="https://github.com/user-attachments/assets/831cc1a8-4539-4142-931c-c7872ea1716b" />
-----------------
**Adding Task manually and getting subtast with AI**
<img width="1925" height="730" alt="image" src="https://github.com/user-attachments/assets/ec9fe74c-ef6a-4a6b-b6bf-f73716e35ada" />
-----------------
**Tavily MCP**
<img width="1569" height="870" alt="image" src="https://github.com/user-attachments/assets/d7ab1b3f-4e44-4cc3-9b53-587a7711c625" />
-----------------
**Gemini API key**
<img width="1642" height="353" alt="image" src="https://github.com/user-attachments/assets/7a104165-99a3-486f-b191-8492606b536e" />




