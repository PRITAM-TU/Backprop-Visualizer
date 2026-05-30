# Backprop Visualizer — Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 18+

---

## 1. Start the Backend (FastAPI)

```powershell
# In PowerShell, navigate to the backend folder
cd "c:\Users\prita\OneDrive\Desktop\Educational Tech\backprop-visualizer\backend"

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

---

## 2. Start the Frontend (React + Vite)

```powershell
# Open a NEW PowerShell window
cd "c:\Users\prita\OneDrive\Desktop\Educational Tech\backprop-visualizer\frontend"

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## How to Use

1. **Adjust hidden nodes** using the +/− buttons (1–8 nodes)
2. **Set inputs x1, x2** and **target y** (0 or 1)
3. **Select activation function** (Sigmoid, ReLU, Tanh, Leaky ReLU, Linear)
4. **Select loss function** (BCE, MSE, MAE)
5. **Set learning rate** with the slider
6. **Step Forward** → watch data flow left→right with math details shown
7. **Step Backward** → watch gradients flow right→left, see chain rule
8. **Train N Epochs** → train for many epochs and watch the loss curve drop
9. **Hover over nodes/edges** to see activation values and weight labels
