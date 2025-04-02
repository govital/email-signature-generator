
---

# 📧 Email Signature Generator API

A scalable backend service to generate dynamic email signatures (both HTML and plain text) using customizable templates. Supports both single and bulk generation, with asynchronous processing and webhook notifications.

---

## 🧠 Design Overview

The system is designed with flexibility, scalability, and maintainability in mind. Here’s how the components fit together:

### ✨ Key Features

- **Custom Templating Engine**: Templates stored in PostgreSQL can be dynamically rendered using [Nunjucks](https://mozilla.github.io/nunjucks/), supporting personalized content for each user.
- **Signature Rendering**: Outputs both HTML and plain text formats to support email clients of all kinds.
- **Bulk Processing Queue**: Uses [BullMQ](https://docs.bullmq.io/) (Redis-based) to queue and process large volumes of signature generation requests without overwhelming the API.
- **Webhook Support**: Notifies external systems with generated signatures once processing is complete.
- **Containerized Deployment**: Fully dockerized for local development and production-ready deployments.

---

## 🧱 Tech Stack

| Tech        | Purpose                           |
|-------------|-----------------------------------|
| **Node.js + TypeScript** | Backend logic and type safety |
| **Express.js** | HTTP API routing                |
| **Nunjucks**   | Templating engine for signatures |
| **BullMQ**     | Queue management for bulk ops   |
| **PostgreSQL** | Persistent storage for templates |
| **Redis**      | Job queue storage               |
| **Docker**     | Containerization for easy setup |

---

## 🚀 Getting Started

### 🛠 Build the App

```bash
npm run build
```

### 🐳 Run Entire Project with Docker

```bash
docker compose up --build
```

---

## 📡 API Endpoints

### 🔧 Add a New Template

```bash
curl -X POST http://localhost:3000/api/templates \
     -H "Content-Type: application/json" \
     -d '{
           "template_id": "welcome-footer",
           "template_html": "<p>Welcome to the team!</p>",
           "template_text": "Welcome to the team!"
         }'
```

---

### ✍️ Generate a Signature (Error Case: Missing Field)

```bash
curl -X POST http://localhost:3000/api/generate-signature \
     -H "Content-Type: application/json" \
     -d '{
           "templateId": "123",
           "userData": {
             "name": "John Doe",
             "email": "john.doe@example.com",
             "position": "Software Engineer",
             "mobilePhone": "+123456789",
             "logo": "https://example.com/logo.png"
           }
         }'
```

**Expected Response:**

```json
{
  "error": "Missing required userData fields",
  "missingFields": ["fullName"]
}
```

---

### ✅ Generate a Signature (Success Case)

```bash
curl -X POST http://localhost:3000/api/generate-signature \
     -H "Content-Type: application/json" \
     -d '{
           "templateId": "123",
           "userData": {
             "fullName": "John Doe",
             "email": "john.doe@example.com",
             "position": "Software Engineer",
             "mobilePhone": "+123456789",
             "logo": "https://example.com/logo.png"
           }
         }'
```

**Expected Output:**

```json
{
  "html": "<p><strong>John Doe</strong> - Software Engineer</p><p>Email: <a href=\"mailto:john.doe@example.com\">john.doe@example.com</a></p>",
  "text": "John Doe - Software Engineer\nEmail: john.doe@example.com"
}
```

---

### 📦 Bulk Signature Generation

```bash
curl -X POST http://localhost:3000/api/bulk-generate \
     -H "Content-Type: application/json" \
     -d '{
           "templateId": "123",
           "usersList": [
             {
               "fullName": "Alice Smith",
               "email": "alice@example.com",
               "position": "CTO"
             },
             {
               "fullName": "Bob Johnson",
               "email": "bob@example.com",
               "position": "Marketing Lead"
             }
           ],
           "webhookUrl": "http://localhost:4000/webhook"
         }'
```

**Expected Output:**

```json
{
  "message": "Bulk request queued successfully",
  "jobId": "1"
}
```

---

### 📬 Check Status of a Bulk Request

```bash
curl http://localhost:3000/api/bulk-generate/status/1
```

**Expected Output:**

```json
{
  "status": "completed",
  "results": [
    {
      "user": {
        "fullName": "Alice Smith",
        "email": "alice@example.com",
        "position": "CTO"
      },
      "htmlSignature": "<p><strong>Alice Smith</strong> - CTO</p><p>Email: <a href=\"mailto:alice@example.com\">alice@example.com</a></p>",
      "textSignature": "Alice Smith - CTO\nEmail: alice@example.com",
      "status": "success"
    },
    {
      "user": {
        "fullName": "Bob Johnson",
        "email": "bob@example.com",
        "position": "Marketing Lead"
      },
      "htmlSignature": "<p><strong>Bob Johnson</strong> - Marketing Lead</p><p>Email: <a href=\"mailto:bob@example.com\">bob@example.com</a></p>",
      "textSignature": "Bob Johnson - Marketing Lead\nEmail: bob@example.com",
      "status": "success"
    }
  ]
}
```

---

## 🧪 Current Status & Next Steps

The backend structure is mostly scaffolded, and the following features are planned or in progress:

### ✔ Completed

- API routes for generating and retrieving templates
- Basic signature generation logic with error handling
- Docker Compose setup
- Template rendering with HTML & plain text outputs

### 🚧 In Progress

- `templateService.ts`: Render signatures based on user input and stored templates.
- `queueService.ts`: Manage async bulk processing via Redis and BullMQ.
- Webhook implementation for notifying results on bulk completion.

---

## 🤝 Contributing

Pull requests and feedback are welcome! If you have ideas or suggestions, feel free to open an issue or contribute directly.

---

## 📁 Folder Structure (High-Level)

```
email-signature-generator/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── templates/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package-lock.json
├── package.json
├── redis.conf
└── tsconfig.json
```

**Explanation of Key Directories and Files:**

- `src/`: Contains the main source code of the application.
    - `controllers/`: Houses the route handlers that process incoming HTTP requests and produce responses.
    - `services/`: Contains the business logic and interacts with data sources or other APIs.
    - `templates/`: Stores the Nunjucks templates used for rendering email signatures.
    - `utils/`: Utility functions and helpers used across the application.
    - `app.ts`: Initializes the Express application and sets up middleware.
    - `server.ts`: Starts the server and listens for incoming connections.

- `.env`: Environment configuration file containing variables like database connection strings and API keys.

- `Dockerfile`: Defines the Docker image for the application, specifying how the application is packaged and run in a containerized environment.

- `docker-compose.yml`: Configuration file for Docker Compose, used to define and run multi-container Docker applications, such as the app along with its database and Redis services.

- `jest.config.js`: Configuration file for Jest, specifying settings for running tests.

- `package-lock.json` & `package.json`: Manage the project's dependencies and scripts.

- `redis.conf`: Configuration file for Redis, specifying settings for the Redis server used in queue management.

- `tsconfig.json`: Configuration file for TypeScript, specifying compiler options and project settings.

