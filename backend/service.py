import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import requests
from google import genai
from dotenv import load_dotenv

load_dotenv()

_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
logger = logging.getLogger("dailypulse")

DATA_DIR = Path(__file__).parent / "data"
TASKS_FILE = DATA_DIR / "tasks.json"
BRIEFING_FILE = DATA_DIR / "briefing.json"


# ── helpers ─────────────────────────────────────────────────────────────────


def _read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def _today_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _today_tasks():
    today = _today_str()
    return [t for t in _read_json(TASKS_FILE) if t["created_at"].startswith(today)]


def _ask_gemini(prompt: str) -> str:
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return response.text.strip()


def _strip_fences(raw: str) -> str:
    return raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()


def _fetch_web_tip() -> str | None:
    if os.getenv("TAVILY_ENABLED", "").lower() != "true":
        return None

    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        logger.warning("TAVILY_ENABLED=true but TAVILY_API_KEY not set")
        return None

    today = _today_str()
    try:
        resp = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": f"productivity tip for developers {today}",
                "max_results": 1,
                "include_answer": True,
            },
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("answer") or None
    except Exception as exc:
        logger.warning("Tavily search failed: %s", exc)
        return None


# ── briefing ────────────────────────────────────────────────────────────────


def get_briefing() -> dict:
    briefing = _read_json(BRIEFING_FILE)
    today = _today_str()

    if briefing.get("date") == today:
        return briefing

    prompt = (
        "Generate a daily briefing as JSON with exactly these keys:\n"
        '- "quote": a motivational quote\n'
        '- "focus_tip": one practical focus/productivity tip for the day\n'
        '- "message": an encouraging message under 50 words\n'
        "Return ONLY valid JSON, no markdown fences."
    )

    raw = _strip_fences(_ask_gemini(prompt))

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"quote": raw, "focus_tip": "", "message": ""}

    briefing = {"date": today, **parsed}

    web_tip = _fetch_web_tip()
    if web_tip:
        briefing["web_tip"] = web_tip

    _write_json(BRIEFING_FILE, briefing)
    return briefing


# ── tasks ───────────────────────────────────────────────────────────────────


def list_tasks() -> list:
    return _read_json(TASKS_FILE)


def create_task(title: str) -> dict:
    prompt = (
        f'Break this task into 3-5 concrete actionable subtasks:\n"{title}"\n\n'
        "Return ONLY a JSON array of strings, no markdown fences."
    )

    try:
        raw = _strip_fences(_ask_gemini(prompt))
        subtasks = json.loads(raw)
        if not isinstance(subtasks, list) or not subtasks:
            subtasks = ["Break this task down manually"]
    except Exception:
        subtasks = ["Break this task down manually"]

    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subtasks": subtasks,
        "completed": False,
        "completed_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    tasks = _read_json(TASKS_FILE)
    tasks.append(task)
    _write_json(TASKS_FILE, tasks)
    return task


def complete_task(task_id: str) -> dict | None:
    tasks = _read_json(TASKS_FILE)

    for t in tasks:
        if t["id"] == task_id:
            t["completed"] = True
            t["completed_at"] = datetime.now(timezone.utc).isoformat()
            _write_json(TASKS_FILE, tasks)
            return t

    return None


def delete_task(task_id: str) -> bool:
    tasks = _read_json(TASKS_FILE)
    filtered = [t for t in tasks if t["id"] != task_id]

    if len(filtered) == len(tasks):
        return False

    _write_json(TASKS_FILE, filtered)
    return True


def breakdown_task(task_description: str) -> dict:
    prompt = (
        f'Provide a detailed breakdown for this task:\n"{task_description}"\n\n'
        "Return ONLY a JSON array of objects, each with:\n"
        '- "subtask": a clear action-oriented description\n'
        '- "time_estimate": estimated duration (e.g. "30 min", "1-2 hours")\n'
        '- "priority": "high", "medium", or "low"\n\n'
        "Provide 4-8 subtasks. No markdown fences."
    )

    try:
        raw = _strip_fences(_ask_gemini(prompt))
        steps = json.loads(raw)
        if not isinstance(steps, list) or not steps:
            return {"task_description": task_description, "breakdown": []}
    except Exception:
        return {"task_description": task_description, "breakdown": []}

    return {"task_description": task_description, "breakdown": steps}


# ── standup ─────────────────────────────────────────────────────────────────


def get_standup() -> dict:
    completed = [t for t in _today_tasks() if t["completed"]]

    if not completed:
        return {"standup": "No tasks completed today yet. Keep pushing!"}

    titles = "\n".join(f"- {t['title']}" for t in completed)

    prompt = (
        "Write a professional daily standup summary based on these completed tasks:\n"
        f"{titles}\n\n"
        "Include: what was accomplished, and a brief forward-looking statement.\n"
        "Keep it concise and professional."
    )

    return {"standup": _ask_gemini(prompt)}


# ── insights ────────────────────────────────────────────────────────────────


def get_insights() -> dict:
    today = _today_tasks()

    if not today:
        return {"insights": "No tasks recorded today yet. Start adding tasks to get insights!"}

    completed = sum(1 for t in today if t["completed"])
    total = len(today)
    titles = "\n".join(f'- {"DONE" if t["completed"] else "TODO"}: {t["title"]}' for t in today)

    prompt = (
        "Analyze today's task data and provide productivity insights:\n"
        f"{titles}\n\n"
        f"Stats: {completed}/{total} completed.\n\n"
        "Include: completion rate assessment, peak productivity observations, "
        "and 2-3 actionable suggestions for improvement.\n"
        "Keep it encouraging and concise."
    )

    return {"insights": _ask_gemini(prompt)}

