# 🧠 Backprop Visualizer 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Backprop Visualizer** is a dynamic, interactive pedagogical web application designed to demystify the core mechanics of Deep Learning: **Backpropagation**. With real-time mathematical feedback and visual animations, it serves as a powerful educational tool to understand how a Multilayer Perceptron (MLP) learns.

---

## ✨ Unique Features

- **Interactive 2-N-1 Architecture**: Dynamically add or remove hidden nodes (1–8 nodes) to see how network complexity affects learning.
- **Pedagogical Step-by-Step Flow**:
  - **Forward Pass**: Watch data flow left-to-right with clear mathematical calculations.
  - **Backward Pass**: Observe gradients flowing right-to-left, visualizing the chain rule in action.
- **Real-Time Configurations**: Tweak activation functions (Sigmoid, ReLU, Tanh, Leaky ReLU, Linear), loss functions (BCE, MSE, MAE), and learning rates on the fly.
- **N-Epoch Training**: Train the network continuously and watch the loss curve drop using an interactive chart.
- **Rigorous Mathematical Engine**: Powered by a robust Python/NumPy backend to calculate precise gradients and weight updates.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, TailwindCSS, Framer Motion (Animations), Recharts
- **Backend**: FastAPI, Python 3.9+, NumPy, Uvicorn

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Start the Backend (FastAPI)

```powershell
# Navigate to the backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```
> Backend runs at: `http://localhost:8000`
> API Docs at: `http://localhost:8000/docs`

### 2. Start the Frontend (React + Vite)

```powershell
# Open a NEW terminal window and navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## 🌐 Vercel Deployment Guide

You can deploy both the Frontend and Backend to Vercel for free! Follow these step-by-step instructions.

### 🎨 Deploying the Frontend

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository.
2. **Login to Vercel**: Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. **Add New Project**: Click on **Add New...** > **Project**.
4. **Import Repository**: Select the GitHub repository containing this project.
5. **Configure Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: Select the `frontend` folder.
   - **Environment Variables**: If your deployed backend has a public URL (e.g., `https://my-backend.vercel.app`), add an environment variable `VITE_API_URL` pointing to it. Otherwise, it will default to localhost.
6. **Deploy**: Click the **Deploy** button. Vercel will build and publish your frontend!

### ⚙️ Deploying the Backend (Serverless)

Vercel supports Python via Serverless Functions. To deploy the FastAPI backend:

1. **Create `vercel.json`**: In the `backend` folder, create a file named `vercel.json` with the following content:
   ```json
   {
     "builds": [
       {
         "src": "app/main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app/main.py"
       }
     ]
   }
   ```

2. **Add `requirements.txt`**: Ensure your `backend/requirements.txt` includes `fastapi` and `uvicorn`. (Already present in this project).

3. **Install Vercel CLI (Optional but recommended)**:
   ```powershell
   npm i -g vercel
   ```

4. **Deploy from Terminal**:
   ```powershell
   cd backend
   vercel
   ```
   - Follow the prompts to link to a Vercel project.
   - Vercel will package the Python environment and deploy it.
   - For production, run `vercel --prod`.

5. **CORS Configuration**: Ensure your FastAPI `CORSMiddleware` in `app/main.py` allows the Vercel frontend URL so the two can communicate. Example:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## 📖 How to Use the Visualizer

1. **Adjust hidden nodes** using the +/− buttons (1–8 nodes).
2. **Set inputs ($x_1$, $x_2$)** and **target $y$** (0 or 1).
3. **Select activation function** (Sigmoid, ReLU, Tanh, Leaky ReLU, Linear).
4. **Select loss function** (BCE, MSE, MAE).
5. **Set learning rate** using the slider.
6. **Step Forward** → Watch data flow left-to-right with math details shown.
7. **Step Backward** → Watch gradients flow right-to-left, see the chain rule in action.
8. **Train N Epochs** → Train for many epochs and watch the loss curve drop.
9. **Hover over nodes/edges** to see exact activation values and weight labels.

---

<p align="center">Built with 💡 for educational purposes.</p>
