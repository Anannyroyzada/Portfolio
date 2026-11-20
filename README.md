# Ananny Royzada | Backend & Distributed Systems Portfolio

> Production-grade personal portfolio showcasing high-concurrency systems, low-latency microservices, Java 21 Virtual Threads, and cloud architectures.

---

## 📁 Repository Structure

```
Portfolio/
├── index.html                   # Customized portfolio entry point
├── assets/
│   ├── css/
│   │   └── style.css            # Responsive dark-mode styling with tech badge & modal additions
│   ├── js/
│   │   └── script.js            # Vanilla JS navigation, filtering, and architecture modals
│   └── images/
│       ├── project-ratelimiter.svg  # Distributed Rate Limiter & Gateway Blueprint
│       ├── project-jobqueue.svg     # Distributed Job Queue & Virtual Threads Blueprint
│       ├── project-fullstack.svg    # Cloudflare Pages + Render Deployment Topology
│       ├── project-benchmarks.svg   # JMH Microbenchmarks & Project Loom Analysis
│       └── ...                      # Avatars, icons, logos
├── .gitignore                   # Ignores OS files, editor metadata, and temporary clone
└── README.md                    # Deployment & engineering execution guide
```

---

## 🚀 Quick Local Preview

To test and preview the portfolio locally, you can use any static file server:

### Option A: VS Code Live Server
Right-click `index.html` and click **"Open with Live Server"**.

### Option B: Python
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

### Option C: Node.js (npx)
```bash
npx serve .
```

---

## 🧹 Transition from Clone to Fresh Git Repository

As requested, all required assets and customized files are placed cleanly in the root `Portfolio/` directory and do **not** depend on `vcard-personal-portfolio/`.

### Step 1: Delete the temporary clone directory
In PowerShell or terminal:
```powershell
Remove-Item -Recurse -Force vcard-personal-portfolio
```

### Step 2: Initialize your fresh Git repository & push to GitHub
```powershell
git init
git add .
git commit -m "feat: initial commit for distributed systems portfolio"
git branch -M main
git remote add origin https://github.com/<your-github-username>/portfolio.git
git push -u origin main
```

---

## 🌐 Cloudflare Pages Hosting Setup (Free & Global Edge CDN)

### Deploying This Portfolio:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your `portfolio` repository.
4. Set the build configuration:
   - **Framework preset**: `None`
   - **Build command**: *(leave empty)*
   - **Build output directory**: `.` *(root)*
5. Click **Save and Deploy**.
6. Cloudflare provides an instant URL (e.g. `https://ananny-portfolio.pages.dev`) with automated SSL and global edge caching.

### Deploying Future React Frontends on Cloudflare Pages:
* Framework preset: `Vite` (or `Create React App`)
* Build command: `npm run build`
* Build output directory: `dist`
* Custom domain/subdomain: e.g., `admin.yourdomain.com` or `queue.yourdomain.com`.

---

## ☁️ Render Hosting Setup (Spring Boot + PostgreSQL + Redis)

For your backend microservices and databases:

### 1. Spring Boot API Gateway / Service Deployment:
* Create a **New Web Service** on [Render](https://render.com/).
* Connect your Spring Boot repository.
* Configure runtime: **Docker** (recommended) or **Java**.
* If using Docker, Render builds your multi-stage `Dockerfile`:
  ```dockerfile
  FROM eclipse-temurin:21-jdk-alpine AS builder
  WORKDIR /workspace
  COPY . .
  RUN ./gradlew bootJar --no-daemon

  FROM eclipse-temurin:21-jre-alpine
  WORKDIR /app
  COPY --from=builder /workspace/build/libs/*.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

### 2. Managed PostgreSQL on Render:
* Create a **New PostgreSQL Database** on Render.
* Copy the Internal Connection String and set it in your Spring Boot environment variables:
  * `SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<dbname>`
  * `SPRING_DATASOURCE_USERNAME=<user>`
  * `SPRING_DATASOURCE_PASSWORD=<password>`

### 3. Redis Instance:
* Spin up a Redis instance on Render or [Upstash Redis](https://upstash.com/) (free tier with REST/Lettuce support).
* Set `SPRING_DATA_REDIS_HOST` and `SPRING_DATA_REDIS_PORT`.

---

## 🛠️ Project Implementation Roadmaps

### Project 1: Distributed Rate Limiter + API Gateway
1. **Core Gateway**: Spring Cloud Gateway route predicates with custom reactive `GatewayFilterFactory`.
2. **Atomic Lua Scripts**:
   - `sliding_window.lua`: Ordered set (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`, `EXPIRE`) to enforce precision windows without race conditions.
   - `token_bucket.lua`: Atomic token replenishment based on timestamp delta.
3. **Resilience**: Resilience4j Circuit Breaker with fallback to fail-open (prioritize availability) or fail-closed (protect downstream core services).
4. **Benchmarking**:
   - Gatling scenario simulating 50k RPS with p50, p95, and p99 latency reporting.
   - JMH test on local evaluation methods.

### Project 2: Distributed Job Queue / Workflow Engine
1. **Database Schema & Migrations**:
   - Flyway migration defining `jobs` table with `id`, `status` (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`), `retry_count`, `visibility_timeout`, and `idempotency_key`.
2. **Worker Polling Loop**:
   ```sql
   SELECT id, payload FROM jobs
   WHERE status = 'PENDING' AND visibility_timeout <= NOW()
   ORDER BY priority DESC, created_at ASC
   LIMIT 10
   FOR UPDATE SKIP LOCKED;
   ```
3. **Java 21 Virtual Threads**:
   - Dispatch fetched jobs onto `Executors.newVirtualThreadPerTaskExecutor()`.
   - Implement heartbeat updater to extend visibility timeout for long-running tasks.
4. **Reliability & Testing**:
   - Dead-letter queue (DLQ) after maximum retry count with exponential backoff.
   - Testcontainers test: Kill Postgres container mid-task to verify retry recovery and zero message loss.
