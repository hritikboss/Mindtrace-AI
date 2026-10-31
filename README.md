# MindTrace AI

### Your Intelligent AI-Powered Learning Companion

MindTrace AI is an AI-powered learning platform designed to make learning smarter, more interactive, and accessible. It combines modern web technologies with AI capabilities to provide users with an engaging learning experience.

## Live Demo

**[Visit MindTrace AI →](https://mindtrace-ai-rose.vercel.app/)**

**Backend:** https://mindtrace-ai-kbos.onrender.com

**GitHub Repository:** https://github.com/hritikboss/Mindtrace-AI

---

## Features

- User registration and login with JWT authentication
- AI-powered learning assistance using Groq
- Course browsing and management
- Interactive learning experience
- Secure backend using Spring Security
- PostgreSQL database integration
- Responsive user interface
- Light and dark mode
- REST API documentation using Swagger/OpenAPI

## Tech Stack

**Frontend**
- React.js
- Vite
- JavaScript
- Tailwind CSS
- HTML5
- CSS3

**Backend**
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- JWT Authentication
- Maven

**Database**
- PostgreSQL
- Neon Database

**AI Integration**
- Groq API
- Large Language Models (LLM)

**Deployment & Tools**
- Vercel
- Render
- Git & GitHub
- Swagger / OpenAPI

---

## Application Architecture

```text
              USER
                |
                v
       React + Vite Frontend
                |
                | REST API Requests
                v
       Spring Boot Backend
                |
         +------+------+
         |             |
         v             v
     PostgreSQL      Groq API
      (Neon)       (AI Services)
```

## API Endpoints

**Base URL:**
```text
https://mindtrace-ai-kbos.onrender.com
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/courses` | Retrieve courses |
| GET | `/api/courses/**` | Course-related resources |

**Swagger API Documentation:**  
https://mindtrace-ai-kbos.onrender.com/swagger-ui/index.html

---

## Project Structure

```text
Mindtrace-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│
├── .mvn/
├── mvnw
├── pom.xml
└── Dockerfile
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hritikboss/Mindtrace-AI.git
cd Mindtrace-AI
```

### 2. Backend Setup

Make sure Java 21 is installed.

**Run on Linux/macOS:**
```bash
./mvnw spring-boot:run
```

**Run on Windows:**
```bash
mvnw.cmd spring-boot:run
```

Backend runs at:
```text
http://localhost:8080
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```text
http://localhost:5173
```

---

## Environment Variables

Configure the following environment variables for the backend:

```properties
SPRING_DATASOURCE_URL=your_postgresql_database_url
SPRING_DATASOURCE_USERNAME=your_database_username
SPRING_DATASOURCE_PASSWORD=your_database_password

JWT_SECRET=your_secure_jwt_secret

GROQ_API_KEY=your_groq_api_key
```

**Important:** Never commit actual API keys, database credentials, or JWT secrets to GitHub.

---

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| AI Services | Groq API |

---

## Developer

**Hritik Pandey**

Full Stack Developer

**Technologies:** Java, Spring Boot, React.js, Python, PostgreSQL and AI Integration.

GitHub: https://github.com/hritikboss

---

## Future Enhancements

- Personalized AI learning recommendations
- Advanced learning analytics
- More interactive learning modules
- Improved AI-powered assistance
- Additional courses and learning resources

---

## License

This project is developed for learning and educational purposes.

---

**MindTrace AI – Learn Smarter. Think Deeper. Grow Faster.**
