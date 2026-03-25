import { useState, useEffect, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'active' | 'completed';

const API_BASE = '/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), priority: newPriority }),
      });
      if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
      const created: Task = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount     = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount    = totalCount - completedCount;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <span className="header-badge">Docker · K8s · AWS · AI</span>
        <h1>∞ iNFINITE AI Task Manager</h1>
        <p>Orchestrate your work with intelligence &amp; scale</p>
      </header>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </span>
          <span className="stat-label">Progress</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Add task form */}
      <form className="add-task-form" onSubmit={(e) => { void handleAddTask(e); }}>
        <h2>➕ New Task</h2>
        <div className="form-row">
          <input
            className="form-input"
            type="text"
            placeholder="Enter task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={200}
          />
          <select
            className="form-select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <button className="btn btn-primary" type="submit" disabled={adding || !newTitle.trim()}>
            {adding ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      </form>

      {/* Filter bar */}
      <div className="filter-bar">
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="loading-ring">
          <div className="spinner" />
          <span>Loading tasks…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="task-empty">
          <span className="empty-icon">🤖</span>
          {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
        </div>
      ) : (
        <ul className="task-list">
          {filtered.map((task) => (
            <li key={task.id} className={`task-item${task.completed ? ' completed' : ''}`}>
              <div className={`priority-bar ${task.priority}`} />
              <input
                className="task-checkbox"
                type="checkbox"
                checked={task.completed}
                onChange={() => { void handleToggleComplete(task); }}
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  <span className="task-date">{formatDate(task.createdAt)}</span>
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="btn-icon"
                  onClick={() => { void handleDelete(task.id); }}
                  aria-label={`Delete "${task.title}"`}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="footer">
        <p>∞ iNFINITE AI 2025 · Powered by React, Node.js, Docker, Kubernetes &amp; AWS</p>
      </footer>
    </div>
  );
}
