from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone
from pathlib import Path
import json

import service

app = FastAPI(title="DailyPulse")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    title: str


# ── briefing ────────────────────────────────────────────────────────────────


@app.get("/briefing")
def briefing():
    return service.get_briefing()


# ── tasks ───────────────────────────────────────────────────────────────────


@app.get("/tasks")
def tasks():
    return service.list_tasks()


@app.post("/tasks")
def add_task(body: TaskCreate):
    return service.create_task(body.title)


@app.put("/tasks/{task_id}/complete")
def complete(task_id: str):
    result = service.complete_task(task_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return result


@app.delete("/tasks/{task_id}")
def remove_task(task_id: str):
    if not service.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}


# ── standup ─────────────────────────────────────────────────────────────────


@app.get("/standup")
def standup():
    return service.get_standup()


# ── insights ────────────────────────────────────────────────────────────────


@app.get("/insights")
def insights():
    return service.get_insights()


# ── notifications ─────────────────────────────────────────────────────────────


@app.post("/notifications/check")
def check_notifications():
    return service.check_and_send_notifications()
