# Task Manager

A full-stack Task Manager application built with **React, Tailwind CSS, Express.js, PostgreSQL, and Docker**.

The application is designed for a **server-based local network environment** where the main server runs the application and multiple client PCs access it through a browser.

---

## 1. Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Nginx

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* HTTP-only Cookies
* Multer for profile image uploads

### Database

* Neon PostgreSQL
* PostgreSQL connection through `DATABASE_URL`

### Deployment

* Docker
* Docker Compose
* Nginx reverse proxy

---

# 2. Project Architecture

```text
                         Internet
                            │
                            │
                    ┌───────▼────────┐
                    │   Neon Cloud   │
                    │   PostgreSQL   │
                    └───────▲────────┘
                            │
                            │
                    ┌───────┴────────┐
                    │   SERVER PC    │
                    │                │
                    │ Docker         │
                    │                │
                    │ ┌────────────┐ │
                    │ │   Nginx    │ │
                    │ │ Frontend   │ │
                    │ └─────┬──────┘ │
                    │       │ /api   │
                    │ ┌─────▼──────┐ │
                    │ │  Express   │ │
                    │ │  Backend   │ │
                    │ └────────────┘ │
                    └───────▲────────┘
                            │
                       Local Network
                            │
                 ┌──────────┴──────────┐
                 │                     │
          ┌──────▼──────┐       ┌──────▼──────┐
          │  Client PC  │       │  Client PC  │
          │   Browser   │       │   Browser   │
          │             │       │             │
          │ Internet ❌  │       │ Internet ❌  │
          └─────────────┘       └─────────────┘
```

### Important

The client PCs do **not** need direct Internet access.

The **server PC requires Internet access** because the current database is hosted on Neon Cloud.

Clients only communicate with the server through the local network.

---

# 3. Project Structure

```text
taskmanager/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   └── taskModel.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── uploads/
│   │   └── profiles/
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── index.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── database/
│   └── init.sql
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# 4. Prerequisites

Only the **Server PC** requires the following:

* Docker Desktop
* Internet connection
* Neon PostgreSQL database
* Git (optional)

Client PCs only require:

* A web browser
* Connection to the same local network as the server

---

# 5. Environment Variables

Create a `.env` file in the **project root**:

```env
DATABASE_URL=YOUR_NEON_DATABASE_URL

JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=15m

NODE_ENV=production
PORT=5000

COOKIE_SECURE=false

FRONTEND_URL=http://localhost
```

### Security

Never commit `.env` to Git.

Make sure `.env` is included in `.gitignore`.

Never expose:

* `DATABASE_URL`
* Database password
* `JWT_SECRET`

If a database password or JWT secret is accidentally exposed, rotate it immediately.

---

# 6. Neon PostgreSQL

The application currently uses **Neon Cloud PostgreSQL**.

The database connection is provided through:

```env
DATABASE_URL=YOUR_NEON_DATABASE_URL
```

The backend reads this variable and establishes the PostgreSQL connection.

Verify the backend logs after starting Docker:

```powershell
docker compose logs backend
```

Expected output:

```text
Server running on port 5000
PostgreSQL is connected
```

---

# 7. Build Docker Images

From the project root:

```powershell
docker compose build
```

Expected result:

```text
Image taskmanager-backend Built
Image taskmanager-frontend Built
```

---

# 8. Start the Application

Run:

```powershell
docker compose up -d
```

Check running containers:

```powershell
docker compose ps
```

Expected services:

```text
taskmanager-backend
taskmanager-frontend
```

The frontend is exposed on:

```text
Port 80
```

The backend runs internally on:

```text
Port 5000
```

The backend does not need to expose port 5000 to the LAN because Nginx communicates with it internally.

---

# 9. Docker Architecture

Docker Compose runs two services:

```text
frontend
    │
    └── Nginx + React

backend
    │
    └── Express + Node.js
```

There is **no PostgreSQL Docker container** because PostgreSQL is hosted on Neon.

---

# 10. Docker Compose

The production Compose configuration contains:

```text
frontend
backend
uploads_data volume
```

The persistent upload volume is:

```text
taskmanager-uploads-data
```

It is mounted inside the backend container:

```text
/app/uploads
```

This keeps uploaded profile images persistent when the backend container is recreated.

---

# 11. Nginx Routing

Nginx serves the React application and proxies backend requests.

```text
/        → React frontend
/api/    → Express backend
/uploads/ → Express uploaded files
```

For example:

```text
http://SERVER-IP/
```

loads the frontend.

An API request:

```text
http://SERVER-IP/api/auth/me
```

is internally forwarded to:

```text
backend:5000/api/auth/me
```

Uploaded profile images are served through:

```text
http://SERVER-IP/uploads/...
```

---

# 12. Frontend API Configuration

The production frontend uses:

```js
const API_URL = "/api";
```

This is important because the frontend and backend are accessed through the same server.

The browser does not need to know the backend container address.

Do **not** use:

```text
http://localhost:5000
```

for production client requests.

---

# 13. Test on Server PC

After starting Docker, open:

```text
http://localhost
```

Test:

1. Register
2. Login
3. Create task
4. Edit task
5. Complete task
6. Delete task
7. Upload profile image
8. Logout
9. Login again

---

# 14. Find Server LAN IP

On the Server PC run:

```powershell
ipconfig
```

Find:

```text
IPv4 Address
```

For example:

```text
192.168.1.10
```

The actual address depends on the local network.

---

# 15. Client PC Access

A client PC does not need Docker.

It only needs a browser and access to the same local network as the server.

Open:

```text
http://SERVER-IP
```

For example:

```text
http://192.168.1.10
```

The client browser communicates with the server:

```text
Client Browser
      ↓
Server IP :80
      ↓
Nginx
      ↓
React / Express
      ↓
Neon PostgreSQL
```

---

# 16. Client Internet Requirement

The client does **not** need direct Internet access.

For example:

```text
Server PC
Internet: YES
Docker: YES
Neon: YES

Client PC
Internet: NO
Browser: YES
Local Network: YES
```

The client only needs a communication path to the server.

### Important networking rule

"Offline" in this architecture means:

> **No Internet is required on the client.**

It does **not** mean that the client can be completely disconnected from the server.

The client must have some local network connection to reach the server.

Possible local network methods include:

* Wi-Fi LAN
* Ethernet LAN
* Server-created hotspot
* Dedicated local router/access point

---

# 17. Windows Firewall

If the application works on the Server PC but cannot be opened from another PC, check Windows Firewall.

The server needs to accept inbound HTTP traffic on:

```text
TCP 80
```

Docker publishes:

```text
0.0.0.0:80 → frontend container:80
```

Do not expose port 5000 to clients unless there is a specific reason.

---

# 18. Useful Docker Commands

### Start containers

```powershell
docker compose up -d
```

### Stop containers

```powershell
docker compose down
```

### Restart containers

```powershell
docker compose restart
```

### Rebuild containers

```powershell
docker compose build
```

### Rebuild and start

```powershell
docker compose up -d --build
```

### Check containers

```powershell
docker compose ps
```

### Backend logs

```powershell
docker compose logs backend
```

### Frontend logs

```powershell
docker compose logs frontend
```

### Follow backend logs

```powershell
docker compose logs -f backend
```

### Follow frontend logs

```powershell
docker compose logs -f frontend
```

---

# 19. Updating the Application

After changing source code:

```powershell
docker compose up -d --build
```

Docker will rebuild the affected images and restart the containers.

Check:

```powershell
docker compose ps
```

---

# 20. Persistent Profile Images

Profile images are stored inside:

```text
/app/uploads
```

The Docker volume:

```text
taskmanager-uploads-data
```

ensures uploaded images survive container recreation.

Do not remove the volume unless you intentionally want to delete uploaded files.

---

# 21. Troubleshooting

## Backend is not running

Check:

```powershell
docker compose logs backend
```

Look for:

```text
PostgreSQL is connected
```

If PostgreSQL connection fails, verify:

```env
DATABASE_URL=...
```

and confirm the Server PC has Internet access.

---

## Frontend is not opening

Check:

```powershell
docker compose logs frontend
```

Then:

```powershell
docker compose ps
```

The frontend should show:

```text
0.0.0.0:80->80/tcp
```

---

## Client cannot access server

Check:

1. Client and server are connected to the same local network.
2. Server IP is correct.
3. Docker frontend container is running.
4. TCP port 80 is allowed through Windows Firewall.
5. Client can reach the server IP.

---

## Login/API problems on LAN

Check:

```powershell
docker compose logs backend
```

Also verify browser requests are going to:

```text
/api/...
```

rather than:

```text
localhost:5000
```

The production frontend should use:

```js
const API_URL = "/api";
```

---

# 22. Production Checklist

Before deployment:

* [ ] Docker Desktop installed on Server PC
* [ ] Neon database created
* [ ] Database schema initialized
* [ ] `.env` configured
* [ ] Secrets not committed to Git
* [ ] Docker images built successfully
* [ ] Backend container running
* [ ] Frontend container running
* [ ] PostgreSQL connection successful
* [ ] Server PC can open `http://localhost`
* [ ] Registration tested
* [ ] Login tested
* [ ] Tasks tested
* [ ] Profile image upload tested
* [ ] Server LAN IP identified
* [ ] Windows Firewall allows TCP 80
* [ ] Client PC can access `http://SERVER-IP`
* [ ] Client can use application without direct Internet access

---

# 23. Current Deployment Model

The current application uses:

```text
React
   ↓
Nginx
   ↓
Express
   ↓
Neon PostgreSQL
```

with:

```text
Docker
├── frontend container
└── backend container
```

and:

```text
Client PCs
    ↓
Local Network
    ↓
Server PC
    ↓
Docker
    ↓
Neon Cloud
```

This allows multiple users on the local network to use the application through the Server PC.

---

# 24. Important Limitation

The current database is hosted on Neon Cloud.

Therefore:

```text
Server Internet ON
        ↓
Application + Neon
        ↓
Works
```

If the Server PC loses Internet:

```text
Server
   ↓
Express
   ↓
Neon ❌
```

database-dependent operations will not work.

For a **fully offline system**, PostgreSQL would need to be moved from Neon Cloud into the Server PC, typically as another Docker service.

That would create a completely local deployment:

```text
Client PCs
     ↓
Local Network
     ↓
Server PC
     ↓
Docker
 ┌───────────────┐
 │ Nginx         │
 │ Express       │
 │ PostgreSQL    │
 └───────────────┘
```

In that model, neither the clients nor the server would require Internet for normal application usage.

---

# 25. Summary

The current deployment provides:

* Dockerized frontend
* Dockerized backend
* Nginx reverse proxy
* Neon PostgreSQL
* Persistent profile image storage
* Same-origin `/api` communication
* Server-based local network access
* Multiple client support
* No direct Internet requirement for client PCs

**Server PC:** Internet required because of Neon.

**Client PC:** Internet not required, but a local connection to the Server PC is required.
