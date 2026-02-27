

# MEDICARE+

# 🏥 Healthcare Management Platform

A modern, full-stack healthcare management system designed to streamline hospital operations, enhance doctor and patient experiences, and leverage AI for smarter healthcare. Built with React, Node.js, Python, MongoDB, and Docker.



## 🚀 Features

- **👩‍⚕️ Doctor Portal:**

  - View and manage appointments
  - Access and update patient records
  - Generate smart prescriptions with real-time suggestions (MCP Server)
  - Voice-enabled registration and prescription

- **🧑‍💼 Admin Dashboard:**

  - Manage doctors, patients, and departments
  - View analytics and hospital statistics
  - Approve appointments and monitor activity

- **👨‍💻 Frontdesk:**

  - Register new patients
  - Schedule appointments

- **🤖 AI & NLP Integration:**

  - Medical knowledge graph and ontology
  - Prescription validation and smart suggestions
  - Entity and relation extraction from medical text

- **🔊 Voice Registration:**

  - Voice-based patient registration and prescription input

- **📦 Microservices Architecture:**

  - React frontend
  - Node.js backend (API, authentication, business logic)
  - Python backend (AI/NLP, knowledge graph)
  - MCP Server (real-time doctor assistance)
  - MongoDB database

- **🐳 Dockerized Deployment:**
  - Easy setup and scaling with Docker Compose

---

## 🗂️ Project Structure

```
Healthcare/
  client/           # React frontend
  server/           # Node.js backend (API)
  python_backend/   # Python backend (AI/NLP)
  README.md
```

---

## ⚙️ Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion, CountUp.js
- **Backend:** Node.js, Express, Socket.IO (MCP Server)
- **AI/NLP:** Python, FastAPI/Flask, NLTK, custom knowledge graph
- **Database:** MongoDB
- **DevOps:** Docker, Docker Compose, Nginx

---

## 🏗️ Setup & Installation

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/Healthcare.git
cd Healthcare
```

### 2. **Environment Variables**

- Copy and configure `.env` files for each service as needed (see sample `.env.example` in each directory).

### 3. **Build & Run with Docker**

```bash
docker-compose up --build
```

- Frontend: [http://localhost](http://localhost)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Python Backend: [http://localhost:8000](http://localhost:8000)
- MCP Server: [http://localhost:4000](http://localhost:4000)
- MongoDB: `mongodb://localhost:27017`

### 4. **Access the App**

- Open your browser and go to [http://localhost](http://localhost)

---

## 🧩 Services Overview

### 🖥️ **Frontend (client/)**

- Built with React, Tailwind CSS, Framer Motion
- Responsive, modern UI for doctors, admins, and frontdesk
- Connects to backend and MCP server for real-time features

### 🗄️ **Backend (server/)**

- Node.js + Express REST API
- Handles authentication, appointments, prescriptions, and more
- Integrates with MongoDB

### 🧠 **Python Backend (python_backend/)**

- FastAPI/Flask for AI/NLP endpoints
- Knowledge graph, entity extraction, summarization, and more
- Communicates with Node.js backend and MCP server

### ⚡ **MCP Server (server/mcp-server/)**

- Real-time communication for doctors using Socket.IO
- Provides smart suggestions, validation, and chat for prescription generator
- Can integrate with AI/NLP backend for advanced features

### 🍃 **MongoDB**

- Stores all application data (users, appointments, prescriptions, etc.)

---

## 🩺 Example: MCP Server Usage

1. **Doctor types prescription** in the frontend
2. **Frontend sends input** to MCP server via WebSocket
3. **MCP server responds** with smart suggestions (e.g., drug names, dosages)
4. **Doctor selects suggestion** or continues typing
5. **Prescription is validated** and saved via backend API

---

## 🛠️ Development

- **Frontend:**
  ```bash
  cd client
  npm install
  npm run dev
  ```
- **Backend:**
  ```bash
  cd server
  npm install
  npm start
  ```
- **Python Backend:**
  ```bash
  cd python_backend
  pip install -r requirements.txt
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- **MCP Server:**
  ```bash
  cd server/mcp-server
  npm install
  node index.js
  ```

---

## 📚 Documentation

- API docs available at `/docs` (for Python backend if using FastAPI)
- See each service's README for more details

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

>>>>>>> 0d58466a0de4bbad748e9e5d5ecb039558f31e8c
