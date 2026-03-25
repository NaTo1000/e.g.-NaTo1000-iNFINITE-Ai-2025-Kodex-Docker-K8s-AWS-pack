# ∞ iNFINITE AI Task Manager

> A full-stack AI-themed Task Manager demonstrating production-ready architecture with **React**, **Node.js**, **Docker**, **Kubernetes**, and **AWS**.

[![CI/CD](https://github.com/your-org/iNFINITE-Ai-2025-Kodex-Docker-K8s-AWS-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/iNFINITE-Ai-2025-Kodex-Docker-K8s-AWS-pack/actions)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      iNFINITE AI 2025                           │
│                                                                  │
│  ┌──────────────┐    REST API     ┌──────────────────────────┐  │
│  │   Frontend   │ ─────────────▶  │       Backend API        │  │
│  │ React + Vite │ ◀─────────────  │  Node.js + Express + TS  │  │
│  │  TypeScript  │  /api/tasks     │  In-memory task store    │  │
│  │  Port: 3000  │                 │  Port: 4000              │  │
│  └──────────────┘                 └──────────────────────────┘  │
│         │                                    │                   │
│         └──────────────────┬─────────────────┘                  │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │   PostgreSQL    │                           │
│                    │   (optional)    │                           │
│                    │   Port: 5432    │                           │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘

Deployment Targets:
  Local Dev   →  docker-compose up
  Kubernetes  →  kubectl apply -f k8s/
  AWS EKS     →  eksctl + ALB Ingress Controller
```

---

## Features

- 🤖 **AI-themed dark/purple UI** built with React + TypeScript + Vite
- ⚡ **REST API** with full CRUD for tasks (GET / POST / PUT / DELETE)
- 🐳 **Docker** multi-stage builds for both services
- ☸️  **Kubernetes** manifests (Deployments, Services, Ingress, PVC)
- ☁️  **AWS-ready** — EKS, ALB Ingress, gp2 PersistentVolumes
- 🔄 **GitHub Actions** CI/CD pipeline

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| Docker | ≥ 24 |
| Docker Compose | ≥ 2.x |
| kubectl | ≥ 1.28 |
| (optional) AWS CLI | ≥ 2.x |
| (optional) eksctl | ≥ 0.170 |

---

## Quick Start — Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-org/iNFINITE-Ai-2025-Kodex-Docker-K8s-AWS-pack.git
cd iNFINITE-Ai-2025-Kodex-Docker-K8s-AWS-pack

# Build and start all services
docker compose up --build

# Services:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:4000
#   Postgres  →  localhost:5432
```

---

## Individual Service Setup

### Backend

```bash
cd backend
npm install
npm run dev        # development with hot reload  (port 4000)
npm run build      # compile TypeScript → dist/
npm start          # run compiled production build
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server with proxy   (port 3000)
npm run build      # type-check + Vite production build → dist/
npm run preview    # preview the production build
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

### Task schema

```json
{
  "id": "uuid",
  "title": "string",
  "priority": "low | medium | high",
  "completed": false,
  "createdAt": "ISO 8601"
}
```

### Example requests

```bash
# Get all tasks
curl http://localhost:4000/api/tasks

# Create a task
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy to EKS","priority":"high"}'

# Mark complete
curl -X PUT http://localhost:4000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:4000/api/tasks/<id>
```

---

## Kubernetes Deployment

### Local cluster (minikube / kind)

```bash
# Create namespace + all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# Check rollout
kubectl rollout status deployment/backend  -n infinite-ai
kubectl rollout status deployment/frontend -n infinite-ai

# Port-forward for local access
kubectl port-forward svc/frontend 3000:80   -n infinite-ai &
kubectl port-forward svc/backend  4000:4000 -n infinite-ai &
```

### AWS EKS

```bash
# Create cluster
eksctl create cluster \
  --name infinite-ai \
  --region us-east-1 \
  --node-type t3.medium \
  --nodes 2

# Update kubeconfig
aws eks update-kubeconfig --name infinite-ai --region us-east-1

# Install AWS Load Balancer Controller
# https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html

# Create secret for Postgres credentials
kubectl create secret generic postgres-secret \
  --from-literal=username=admin \
  --from-literal=password=<strong-password> \
  -n infinite-ai

# Deploy all manifests
kubectl apply -f k8s/

# Edit k8s/ingress.yaml: uncomment ALB annotations, set your hostname
kubectl apply -f k8s/ingress.yaml
```

---

## Project Structure

```
.
├── .github/
│   └── workflows/ci.yml          # GitHub Actions CI/CD
├── backend/
│   ├── src/index.ts               # Express app + routes
│   ├── Dockerfile                 # Multi-stage build
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Task Manager UI
│   │   ├── main.tsx
│   │   └── index.css              # Dark AI theme
│   ├── index.html
│   ├── vite.config.ts
│   ├── nginx.conf                 # Nginx serving + API proxy
│   ├── Dockerfile                 # Multi-stage: Vite → Nginx
│   ├── package.json
│   └── tsconfig.json
├── k8s/
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── postgres-pvc.yaml
│   └── ingress.yaml
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR:

1. **Backend job** — `npm ci` → `npm run build` (TypeScript compilation)
2. **Frontend job** — `npm ci` → `npm run build` (Vite production build)

Extend with Docker build + push to ECR and `kubectl rollout` for full CD.

---

## License

MIT © iNFINITE AI 2025
