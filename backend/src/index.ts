import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

const tasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Deploy AI model to Kubernetes cluster',
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Configure AWS EKS auto-scaling policies',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Review Docker multi-stage build optimizations',
    priority: 'low',
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'infinite-ai-backend' });
});

app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(tasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, priority } = req.body as { title?: string; priority?: string };

  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required and must be a non-empty string' });
    return;
  }

  const validPriorities = ['low', 'medium', 'high'];
  const taskPriority = validPriorities.includes(priority ?? '') ? (priority as Task['priority']) : 'medium';

  const newTask: Task = {
    id: uuidv4(),
    title: title.trim(),
    priority: taskPriority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { title, priority, completed } = req.body as Partial<Task>;
  const task = tasks[index];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ error: 'title must be a non-empty string' });
      return;
    }
    task.title = title.trim();
  }

  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      res.status(400).json({ error: 'priority must be low, medium, or high' });
      return;
    }
    task.priority = priority;
  }

  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  res.json(task);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 iNFINITE AI Backend running on port ${PORT}`);
});

export default app;
