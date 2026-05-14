import { useState, useEffect, useCallback } from 'react'
import { fetchBriefing, fetchTasks, createTask, completeTask, deleteTask, fetchStandup, fetchInsights } from './api'

function formatDate() {
  const now = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
}

/* ─── Skeleton ─────────────────────────────────────────────────── */

function Skeleton({ className }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />
}

/* ─── Header ───────────────────────────────────────────────────── */

function Header({ onRefresh }) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 animate-gradient flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
            DailyPulse
          </h1>
          <p className="text-sm text-slate-400 font-light">{formatDate()}</p>
        </div>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:shadow-md active:scale-[0.97] cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
        Refresh Briefing
      </button>
    </header>
  )
}

/* ─── Briefing Card ────────────────────────────────────────────── */

function BriefingCard({ briefing, loading, error }) {
  if (error) {
    return (
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-rose-200 to-rose-300 mb-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8">
          <p className="text-rose-500 text-sm">Could not load briefing. Please try again.</p>
        </div>
      </div>
    )
  }

  if (loading || !briefing || !briefing.quote) {
    return (
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 mb-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 space-y-5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="rounded-2xl bg-gradient-to-br from-white to-indigo-50/40 p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl leading-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" fill="currentColor"/>
            </svg>
          </span>
          <p className="font-[family-name:var(--font-display)] text-lg sm:text-xl text-slate-700 italic leading-relaxed">
            &ldquo;{briefing.quote}&rdquo;
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white/70 rounded-xl p-4 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Focus Tip</p>
            <p className="text-sm text-slate-600 leading-relaxed">{briefing.focus_tip}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Today's Message</p>
            <p className="text-sm text-slate-600 leading-relaxed">{briefing.message}</p>
          </div>
        </div>
        {briefing.web_tip && (
          <div className="mt-4 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 rounded-xl p-4 border border-indigo-100/50 flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Web Tip</p>
              <p className="text-sm text-slate-600 leading-relaxed">{briefing.web_tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Task Card ────────────────────────────────────────────────── */

function TaskCard({ task, onComplete, onDelete, index }) {
  const [checkedSubs, setCheckedSubs] = useState({})
  const [isCompleting, setIsCompleting] = useState(false)

  const toggleSub = (i) => {
    setCheckedSubs(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try { await onComplete(task.id) } finally { setIsCompleting(false) }
  }

  const checkedCount = Object.values(checkedSubs).filter(Boolean).length
  const progress = task.subtasks?.length
    ? Math.round((checkedCount / task.subtasks.length) * 100)
    : 0

  return (
    <div
      className={`animate-fade-in-up group rounded-xl border-l-[3px] border p-4 sm:p-5 transition-all duration-300 ${
        task.completed
          ? 'bg-emerald-50/50 border-l-emerald-400 border-emerald-100'
          : 'bg-white border-l-indigo-500 border-slate-100 hover:shadow-lg hover:border-l-indigo-600'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {task.completed ? (
            <span className="animate-check-pop flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : (
            <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-400">
              {index + 1}
            </span>
          )}
          <h3 className={`font-semibold text-sm sm:text-base leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h3>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all cursor-pointer"
          title="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      {task.subtasks?.length > 0 && !task.completed && (
        <div className="ml-8 space-y-1 mb-4">
          {task.subtasks.map((sub, i) => (
            <label key={i} className="flex items-start gap-2.5 cursor-pointer group/sub py-0.5">
              <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${checkedSubs[i] ? 'bg-indigo-500 border-indigo-500' : 'border-2 border-slate-200 group-hover/sub:border-indigo-300'}`}>
                {checkedSubs[i] && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <input type="checkbox" checked={!!checkedSubs[i]} onChange={() => toggleSub(i)} className="sr-only" />
              <span className={`text-[13px] leading-relaxed transition-colors ${checkedSubs[i] ? 'text-slate-400 line-through' : 'text-slate-500 group-hover/sub:text-slate-700'}`}>
                {sub}
              </span>
            </label>
          ))}
          {task.subtasks.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{progress}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {task.completed && task.subtasks?.length > 0 && (
        <p className="ml-8 text-xs text-emerald-500 font-medium">
          {task.subtasks.length} subtasks completed
        </p>
      )}

      {!task.completed && (
        <div className="ml-8">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-indigo-200/50"
          >
            {isCompleting ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Completing...
              </span>
            ) : 'Complete Task'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Task Manager ─────────────────────────────────────────────── */

function TaskManager({ tasks, onAdd, onComplete, onDelete, addingTask }) {
  const [input, setInput] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const title = input.trim()
    if (!title) return
    onAdd(title)
    setInput('')
  }

  const inProgress = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What do you need to accomplish today?"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={addingTask || !input.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer shadow-sm shadow-indigo-200 transition-all"
          >
            {addingTask ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                AI Working...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Task
              </span>
            )}
          </button>
        </div>
      </form>

      {inProgress.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-soft" />
              In Progress
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">{inProgress.length}</span>
            </h2>
          </div>
          <div className="space-y-3">
            {inProgress.map((task, i) => (
              <TaskCard key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} index={i} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="border-t border-dashed border-slate-200 pt-4">
          <button
            onClick={() => setShowCompleted(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Completed Today
              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">{completed.length}</span>
            </span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${showCompleted ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-3">
              {completed.map((task, i) => (
                <TaskCard key={task.id} task={task} onComplete={onComplete} onDelete={onDelete} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 && !addingTask && (
        <div className="text-center py-14 animate-fade-in-up">
          <div className="relative mx-auto w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 rotate-3" />
            <div className="relative w-full h-full rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-1">No tasks yet</p>
          <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">Add your first task to get started — AI will break it down for you</p>
        </div>
      )}
    </div>
  )
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[\-\*•]\s*/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
}

/* ─── Standup Card ─────────────────────────────────────────────── */

function StandupCard({ completedCount }) {
  const [standup, setStandup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  if (completedCount === 0) return null

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchStandup()
      setStandup(data.standup)
    } catch {
      setError('Failed to generate standup.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(standup)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200/50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800">Standup Report</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">AI-generated daily summary</p>
          </div>
        </div>
        {!standup && (
          <button
            onClick={generate}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-sm active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Generating...
              </>
            ) : 'Generate'}
          </button>
        )}
      </div>

      <div className="px-6 pb-6">
        {loading && (
          <div className="space-y-3 py-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[88%]" />
            <Skeleton className="h-3 w-[75%]" />
            <div className="pt-2" />
            <Skeleton className="h-3 w-[92%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
        )}

        {error && (
          <div className="py-4 text-center bg-rose-50/50 rounded-xl">
            <p className="text-sm text-rose-500">{error}</p>
            <button onClick={generate} className="mt-2 text-xs text-indigo-500 hover:underline cursor-pointer font-medium">Try again</button>
          </div>
        )}

        {standup && !loading && (
          <div className="animate-fade-in-up space-y-3">
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-inner">
              <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[11px] text-slate-500 font-medium tracking-wide">standup.txt</span>
              </div>
              <div className="border-t border-slate-800/60" />
              <div className="px-5 py-4">
                <p className="text-indigo-400 text-[13px] font-semibold mb-3 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  Summary
                </p>
                <div className="text-[13px] text-slate-300 leading-[1.8] whitespace-pre-line font-mono">
                  {stripMarkdown(standup)}
                </div>
              </div>
            </div>
            <div className="relative">
              {copied && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold shadow-lg animate-fade-in-up whitespace-nowrap pointer-events-none">
                  Copied!
                </div>
              )}
              <button
                onClick={copy}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border ${
                  copied
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm'
                }`}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Insights Card ────────────────────────────────────────────── */

const INSIGHT_ICONS = [
  { bg: 'bg-indigo-100', color: 'text-indigo-600', path: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { bg: 'bg-emerald-100', color: 'text-emerald-600', path: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' },
  { bg: 'bg-amber-100', color: 'text-amber-600', path: 'M12 20V10M18 20V4M6 20v-4' },
  { bg: 'bg-rose-100', color: 'text-rose-600', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { bg: 'bg-violet-100', color: 'text-violet-600', path: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z' },
]

function parseInsights(text) {
  const cleaned = stripMarkdown(text)
  const blocks = cleaned.split(/\n\n+/).filter(Boolean)
  return blocks.map((block, i) => {
    const icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length]
    const lines = block.split('\n').filter(Boolean)
    const title = lines[0].replace(/^[\-\*•]\s*/, '').trim()
    const body = lines.slice(1).map(l => l.replace(/^[\-\*•]\s*/, '').trim()).join(' ')
    const highlighted = title.match(/(\d+%)/)
    return { title, body, icon, highlighted, index: i }
  })
}

function InsightsCard({ taskCount }) {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (taskCount < 3) return null

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchInsights()
      setInsights(data.insights)
    } catch {
      setError('Failed to generate insights.')
    } finally {
      setLoading(false)
    }
  }

  const parsed = insights ? parseInsights(insights) : []

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800">Daily Insights</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Productivity analysis & tips</p>
          </div>
        </div>
        {!insights && !loading && (
          <button
            onClick={generate}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-sm active:scale-[0.97] cursor-pointer transition-all"
          >
            Analyze
          </button>
        )}
      </div>

      <div className="px-6 pb-6">
        {loading && (
          <div className="space-y-4 py-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-4 text-center bg-rose-50/50 rounded-xl">
            <p className="text-sm text-rose-500">{error}</p>
            <button onClick={generate} className="mt-2 text-xs text-amber-600 hover:underline cursor-pointer font-medium">Try again</button>
          </div>
        )}

        {insights && !loading && (
          <div className="animate-fade-in-up space-y-0">
            {parsed.map((block, i) => (
              <div key={i} className={`flex gap-3.5 ${i > 0 ? 'pt-4' : ''} ${i < parsed.length - 1 ? 'pb-4 border-b border-slate-100' : 'pb-1'}`}>
                <div className={`w-8 h-8 rounded-lg ${block.icon.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={block.icon.color}>
                    <path d={block.icon.path} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 leading-snug">
                    {block.highlighted ? (
                      <>
                        {block.title.split(/(\d+%)/).map((part, j) =>
                          /\d+%/.test(part) ? (
                            <span key={j} className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md text-[14px] font-bold">{part}</span>
                          ) : part
                        )}
                      </>
                    ) : block.title}
                  </p>
                  {block.body && (
                    <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1">{block.body}</p>
                  )}
                </div>
              </div>
            ))}
            {parsed.length === 0 && insights && (
              <div className="relative bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-xl p-4 text-[13px] text-slate-700 leading-relaxed whitespace-pre-line border border-amber-100/60">
                <div className="absolute top-3 right-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-300">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                {insights}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── App ──────────────────────────────────────────────────────── */

export default function App() {
  const [briefing, setBriefing] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(true)
  const [briefingError, setBriefingError] = useState(false)
  const [tasks, setTasks] = useState([])
  const [addingTask, setAddingTask] = useState(false)

  const loadBriefing = useCallback(async () => {
    setBriefingLoading(true)
    setBriefingError(false)
    try {
      const data = await fetchBriefing()
      setBriefing(data)
    } catch {
      setBriefingError(true)
    } finally {
      setBriefingLoading(false)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch {
      /* silent */
    }
  }, [])

  useEffect(() => {
    loadBriefing()
    loadTasks()
  }, [loadBriefing, loadTasks])

  const handleAddTask = async (title) => {
    setAddingTask(true)
    try {
      const newTask = await createTask(title)
      setTasks(prev => [...prev, newTask])
    } catch {
      /* could add a toast here */
    } finally {
      setAddingTask(false)
    }
  }

  const handleCompleteTask = async (id) => {
    const updated = await completeTask(id)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  const handleDeleteTask = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleRefresh = () => {
    loadBriefing()
  }

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Header onRefresh={handleRefresh} />

        <BriefingCard briefing={briefing} loading={briefingLoading} error={briefingError} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Smart Task Manager</h2>
                  <p className="text-[11px] text-slate-400">AI-powered task breakdown</p>
                </div>
              </div>
              <TaskManager
                tasks={tasks}
                onAdd={handleAddTask}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                addingTask={addingTask}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <StandupCard completedCount={completedCount} />
            <InsightsCard taskCount={tasks.length} />
          </div>
        </div>
      </div>
    </div>
  )
}
