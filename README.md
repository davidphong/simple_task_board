# Task Board Application

A full-stack task management application built with React (frontend) and Flask (backend).

## Features

- User authentication (signup, login, logout)
- Create and manage boards
- Create, update, and delete tasks
- Group tasks by status (In Progress, Completed, Won't do)
- Responsive design

## Tech Stack

### Frontend
- React
- React Router
- Styled Components
- Zustand (state management)
- Axios (API requests)

### Backend
- Flask
- SQLite
- JWT (JSON Web Tokens)

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.7+)
- pip

### Installation

1. Clone the repository
```
git clone <repository-url>
cd task-board
```

2. Set up the backend
```
cd server
pip install -r requirements.txt
python app.py
```
This will start the backend server on http://localhost:5000

3. Set up the frontend (in a new terminal)
```
cd client
npm install
npm start
```
This will start the frontend on http://localhost:3000

4. Open your browser and navigate to http://localhost:3000

## API Endpoints

### Authentication
- POST /api/user/signup - Register a new user
- POST /api/user/login - Login a user

### Boards
- POST /api/boards - Create a new board
- GET /api/boards/:id - Get a board by ID
- PUT /api/boards/:id - Update a board
- DELETE /api/boards/:id - Delete a board

### Tasks
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task

## License
MIT 
 