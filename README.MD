
### To Run The Project:

#### Build The App
``` npm run build```

### Run Entire Project
```docker compose up --build```

### Test APIs:

### Add a new template:

```
 curl -X POST http://localhost:3000/api/templates   -H "Content-Type: application/json"   -d '{
    "template_id": "welcome-footer",
    "template_html": "<p>Welcome to the team!</p>",
    "template_text": "Welcome to the team!"
  }'
``` 

#### generate-signature API (missing full-name):
```
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

#### Expected output:
``` 
{"error":"Missing required userData fields","missingFields":["fullName"]}
```

#### generate-signature API:

```
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

#### Expected output:
``` 
{"html":"<p><strong>John Doe</strong> - Software Engineer</p><p>Email: <a href=\"mailto:john.doe@example.com\">john.doe@example.com</a></p>","text":"John Doe - Software Engineer\\nEmail: john.doe@example.com"}
```

#### Bulk api:

```
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

#### expected output:
```
{"message":"Bulk request queued successfully","jobId":"1"}
```

#### Check Status of bulk request:
```
curl http://localhost:3000/api/bulk-generate/status/1
```

#### expected output:
```
{"status":"completed","results":[{"user":{"fullName":"Alice Smith","email":"alice@example.com","position":"CTO"},"htmlSignature":"<p><strong>Alice Smith</strong> - CTO</p><p>Email: <a href=\"mailto:alice@example.com\">alice@example.com</a></p>","textSignature":"Alice Smith - CTO\\nEmail: alice@example.com","status":"success"},{"user":{"fullName":"Bob Johnson","email":"bob@example.com","position":"Marketing Lead"},"htmlSignature":"<p><strong>Bob Johnson</strong> - Marketing Lead</p><p>Email: <a href=\"mailto:bob@example.com\">bob@example.com</a></p>","textSignature":"Bob Johnson - Marketing Lead\\nEmail: bob@example.com","status":"success"}]
```




###### I've implemented the basic backend structure with API endpoints for generating email signatures and handling bulk requests via a queue. Next steps:

1. Implement templateService.ts to render HTML and plain text signatures.

2. Implement queueService.ts to manage bulk requests using Redis (BullMQ).

3. Set up Docker for containerized deployment.

#### the backend for the Email Signature Engine in Node.js with TypeScript, following the requirements outlined in the assignment. The backend includes:

###### API Endpoints:

1. Generate an email signature based on a template and user input.

2. Support HTML and plain text versions.

3. Handle bulk requests asynchronously via a queue or webhook.

###### Technologies:

* Express.js (for API)

* Nunjucks (for templating)

* BullMQ (for job queue)

* Docker (for containerization)

* PostgreSQL (for storing templates & requests)

* Redis (for queue management)