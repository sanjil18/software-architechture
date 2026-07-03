# Traffic Fine System — Spring Boot backend

This is the original Node.js/Express + Mongoose backend
(`software-architechture-main/backend`) migrated to **Spring Boot 3 / Java 17**.
MongoDB was kept as the database, and every REST endpoint, JSON response
shape, and access rule was preserved, so **the existing React frontend and
React Native mobile app work against this backend with zero changes** —
just point them at the new server's URL.

## What changed vs. the MERN backend

| MERN piece | Spring Boot equivalent |
|---|---|
| `mongoose` schemas (`models/*.js`) | `@Document` classes in `model/` (`User`, `TrafficFine`, `FineCategory`) |
| `express.Router()` (`routes/*.js`) | `@RestController` classes in `controller/` |
| Controller functions (`controllers/*.js`) | `@Service` classes in `service/` |
| `middleware/auth.js` (`protect`, `authorize`) | `JwtAuthenticationFilter` + role rules in `SecurityConfig` |
| `middleware/errorHandler.js` | `GlobalExceptionHandler` (`@RestControllerAdvice`) |
| `jsonwebtoken` | `io.jsonwebtoken` (jjwt) in `security/JwtUtil.java` |
| `bcryptjs` | Spring Security's `BCryptPasswordEncoder(12)` (same cost factor) |
| `services/smsService.js` (Twilio) | `service/SmsService.java` — calls the Twilio REST API directly, or logs a mock SMS if no credentials are configured (same fallback behavior) |
| `express-rate-limit` | `config/RateLimitFilter.java` (in-memory, same 100 req / 15 min default) |
| `utils/seed.js` | `util/DataSeeder.java`, a `CommandLineRunner` gated by `SEED_ON_STARTUP=true` |
| `server.js` bootstrap | `TrafficFineApplication.java` + `application.yml` |

## Project layout

```
src/main/java/com/police/trafficfine/
  config/       SecurityConfig, MongoConfig, RateLimitFilter, WebConfig
  security/     JwtUtil, JwtAuthenticationFilter, UserPrincipal, CustomUserDetailsService
  model/        User, TrafficFine, FineCategory + enums (Role, FineStatus, VehicleType, PaymentMethod)
  repository/   Spring Data MongoDB repositories
  dto/          Request/response payloads
  service/      AuthService, FineService, CategoryService, SmsService
  controller/   AuthController, FineController, CategoryController, HealthController
  exception/    Custom exceptions + GlobalExceptionHandler
  util/         DataSeeder
```

## Running it

1. **Prerequisites:** Java 17+, Maven, and a MongoDB instance (local or Atlas) — the same database your MERN app used works as-is; the collection/document shapes line up.
2. Copy `.env.example` to `.env` and fill in values, or export them as real environment variables (Spring Boot doesn't read `.env` files itself — use `export $(cat .env | xargs)` on Linux/macOS, or a plugin like `spring-dotenv` if you want it read automatically).
3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   or run the packaged jar:
   ```bash
   mvn clean package
   java -jar target/traffic-fine-system.jar
   ```
4. The API is available at `http://localhost:5000/api/...`, same paths as before:
   - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
   - `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`
   - `GET /api/fines/lookup`, `POST /api/fines/:id/pay`, `POST /api/fines`, `GET /api/fines/my-fines`, `GET /api/fines/analytics`, `GET /api/fines`, `PUT /api/fines/:id`
   - `GET /health`

## Seeding demo data

Set `SEED_ON_STARTUP=true` once and start the app — it inserts the same 10
fine categories and 3 demo users (`admin@police.lk` / `admin123`,
`kamal.perera@police.lk` / `officer123`, `saman.silva@police.lk` /
`officer123`) as the original `seed.js`, but only if those collections are
empty, so it's safe to leave the flag on.

## Serving the React frontend from Spring Boot (optional)

The original server.js served the built React app itself (payment portal
at `/`, admin portal at `/admin`). To do the same here:

```bash
cd ../frontend
npm run build
cp -r build/* ../springboot-backend/src/main/resources/static/
```

Rebuild the Spring Boot jar and it will serve those files the same way —
`WebConfig` already forwards unmatched non-API routes to `index.html` for
client-side routing. Otherwise, just run the frontend separately (`npm
start`) pointed at this backend's URL, exactly like before.

## Notes on the migration

- **Pagination** (`page`/`limit` query params) and **filtering**
  (`status`, `district`, `categoryId` on `GET /api/fines`) behave the same
  as the original.
- **Analytics** (`GET /api/fines/analytics`) reproduces the same Mongo
  aggregation pipelines (overview totals, district/category/payment-method
  breakdowns, 6-month trend) using Spring Data MongoDB's aggregation
  framework.
- **Validation messages** mirror the Mongoose `required` messages where
  practical (e.g. "Name is required").
- Password hashing uses BCrypt at strength 12, matching
  `bcrypt.hash(password, 12)` from the original `User.js`, so **existing
  password hashes in your database keep working** — no user needs to
  reset their password after migration.
