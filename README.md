# Cafe KOT (Kitchen Order Ticket) Application

A progressive and production-ready **Kitchen Order Ticket (KOT)** and restaurant table management backend system. Built using the **NestJS** framework, **TypeScript**, **TypeORM**, and **PostgreSQL**, this application provides a robust API to manage users (with role hierarchies), menu items, dining tables, order sessions, coupons, and real-time kitchen preparation tickets.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Supports fine-grained permissions and hierarchy constraints for roles: `Admin`, `Manager`, `Waiter`, `Chef`, and `Cashier`.
*   **User Management:** Secure user registration, credential updates, profile views, and soft-delete capabilities. Managers are restricted to creating only staff roles (`Waiter`, `Chef`, `Cashier`).
*   **Dining Table Management:** Real-time tracking of dining table availability status (`AVAILABLE`, `OCCUPIED`).
*   **Menu Item Catalog:** Full CRUD operations on categorized menu items with pagination, name uniqueness checks, and search/filter functionality.
*   **Order Session Lifecycle:**
    *   **Start Session:** Automatically occupies the dining table and creates a unique order tracking session.
    *   **Kitchen Order Tickets (KOT):** Add and manage preparation tickets under active sessions.
    *   **Bill Generation:** Computes order totals with automated GST calculation, optional coupon code application (FLAT/PERCENTAGE), and sets session state to `BILL_GENERATED`.
    *   **Void Bills:** Cancel a generated bill and revert the order status to `ACTIVE` to permit item edits or additions.
    *   **Session Completion:** Records payment mode (`CASH`, `CARD`, `UPI`), sets table to `AVAILABLE`, and saves transaction timestamps.
    *   **Session Cancellation:** Cancels active sessions and voids all associated tickets.
*   **Kitchen Order Ticket (KOT) State Machine:** Enforces strict sequential transitions for food preparation:
    $$\text{PENDING} \longrightarrow \text{PREPARING (assigns Chef)} \longrightarrow \text{READY} \longrightarrow \text{SERVED}$$
    *Note: Tickets can be `CANCELLED` from any prior state.*
*   **Discount Coupon System:** Manage active dates, discount types (`FLAT` or `PERCENTAGE`), and validate coupon status dynamically.
*   **System Health Check:** Real-time application and database health reports using `@nestjs/terminus`.
*   **Interactive OpenAPI Docs:** Fully-interactive API testing UI powered by Swagger.

---

## 🛠️ Technology Stack

*   **Core:** [NestJS](https://github.com/nestjs/nest) (v10) & TypeScript
*   **Database:** PostgreSQL
*   **ORM:** TypeORM
*   **Security & Auth:** Passport.js, JWT, and bcrypt
*   **Validation:** Class-validator & Class-transformer
*   **Documentation:** Swagger (OpenAPI)
*   **Containerization:** Docker & Docker Compose

---

## 📄 API Endpoints Reference

All endpoints (except health and auth login) require a valid **JWT Bearer Token** passed in the `Authorization` header.

### Authentication & Health
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user credentials and return a JWT access token. | Public |
| `GET` | `/health` | Check application and PostgreSQL database health status. | Public |

### Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | Create a new user account. | Admin, Manager |
| `GET` | `/users` | Retrieve all active user profiles. | Admin, Manager |
| `GET` | `/users/:id` | Retrieve details of a specific user. | Admin, Manager, Self |
| `PATCH` | `/users/:id` | Update user profile fields or password. | Admin, Manager, Self |
| `DELETE` | `/users/:id` | Soft-delete a user account. | Admin, Manager |

### Tables
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/tables` | Add a new dining table. | Admin, Manager |
| `GET` | `/tables` | Retrieve paginated list of tables (filter by status). | All Authenticated |
| `GET` | `/tables/:id` | Retrieve specific table details. | All Authenticated |
| `PATCH` | `/tables/:id` | Update table properties (e.g. table number, capacity). | Admin, Manager |
| `PATCH` | `/tables/:id/status` | Update a table's occupancy status. | Admin, Manager, Waiter |
| `DELETE` | `/tables/:id` | Soft-delete a table. | Admin, Manager |

### Menu Items
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/menu-items` | Create a new menu item. | Admin, Manager |
| `GET` | `/menu-items` | Get paginated menu catalog (with search & category filters). | All Authenticated |
| `GET` | `/menu-items/:id` | Retrieve menu item details. | All Authenticated |
| `PATCH` | `/menu-items/:id` | Update menu item details (price, description, availability). | Admin, Manager |
| `DELETE` | `/menu-items/:id` | Soft-delete a menu item. | Admin, Manager |

### Orders (Table Sessions)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Start a new order session for a table (sets table status to `OCCUPIED`). | Admin, Manager, Waiter |
| `GET` | `/orders` | Get paginated list of order sessions. | Admin, Manager, Waiter, Cashier, Chef |
| `GET` | `/orders/:id` | Retrieve complete details of an order, including all tickets and bills. | All Authenticated |
| `POST` | `/orders/:id/bill` | Generate bill (applies discount coupon, adds GST, transitions order to `BILL_GENERATED`). | Admin, Manager, Cashier, Waiter |
| `DELETE` | `/orders/:id/bill` | Void the generated bill (reverts order back to `ACTIVE` to edit items). | Admin, Manager, Cashier |
| `PATCH` | `/orders/:id/complete`| Complete session (accepts payment mode, sets table to `AVAILABLE`). | Admin, Manager, Cashier |
| `PATCH` | `/orders/:id/cancel` | Cancel order session and void all associated tickets. | Admin, Manager, Cashier, Waiter |

### Tickets (KOT)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/tickets` | Create a Kitchen Order Ticket (waiter is auto-assigned from token). | Admin, Manager, Waiter |
| `GET` | `/tickets` | Get paginated list of kitchen tickets (with status & role filters). | All Authenticated |
| `GET` | `/tickets/:id` | Retrieve complete ticket details (items, waiter, chef). | All Authenticated |
| `PATCH` | `/tickets/:id/status`| Transition ticket status: `PENDING` $\to$ `PREPARING` $\to$ `READY` $\to$ `SERVED`. | Chef (preparing/ready), Waiter/Cashier (served), All (cancel) |
| `PUT` | `/tickets/:id/items` | Modify ticket item quantities (only allowed while ticket is `PENDING`). | Admin, Manager, Waiter |

### Coupons
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/coupons` | Create a discount coupon. | Admin, Manager |
| `GET` | `/coupons` | List all discount coupons. | Admin, Manager |
| `GET` | `/coupons/:code/validate`| Validate a coupon code to check validity, status, and value. | Admin, Manager, Cashier, Waiter |
| `DELETE` | `/coupons/:id` | Soft-delete a coupon. | Admin, Manager |

---

## ⚙️ Environment Variables

Create a `.env` file in the root folder. You can base it on the values below:

| Parameter | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `3000` | Port on which the NestJS application will run. |
| `DB_HOST` | `string` | `localhost` | PostgreSQL database host address. |
| `DB_PORT` | `number` | `5432` | PostgreSQL port. |
| `DB_USERNAME` | `string` | `postgres` | PostgreSQL login username. |
| `DB_PASSWORD` | `string` | `postgres` | PostgreSQL login password. |
| `DB_DATABASE` | `string` | `cafe_kot` | Target database name. |
| `DB_SSL` | `boolean` | `false` | Enable SSL connection to database (e.g. for cloud providers). |
| `JWT_SECRET` | `string` | `super_secret_jwt_key_...` | Encryption key for signing JWTs. |
| `JWT_EXPIRATION`| `string` | `24h` | Validity duration of issued JWT. |
| `SEED_ADMIN_EMAIL`| `string`| `admin@cafekot.com` | Initial super-administrator email seeded on startup. |
| `SEED_ADMIN_PASSWORD`| `string`| `AdminSecurePassword123!`| Initial super-administrator password. |
| `GST_RATE` | `number` | `5` | Percentage of Goods and Services Tax applied on bills. |

---

## 🏃 Local Run Instructions

Follow these steps to set up and run the application locally without Docker.

### Prerequisites
*   Node.js (v18.x or v20.x)
*   npm (v9.x or higher)
*   A running **PostgreSQL** instance with a database matching `DB_DATABASE`.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy and customize the env configuration to a `.env` file in the project root:
```bash
cp .env.example .env  # Or create one manually with variables described above
```

### 3. Run Database Migrations
Run the schema setup script to construct database tables:
```bash
npm run db:migrate
```

### 4. Seed Initial Super-Admin
Run the database seeder to create the initial admin user credentials configured in your `.env` (defaults to `admin@cafekot.com` / `AdminSecurePassword123!`):
```bash
npm run db:seed
```

### 5. Start the Application
*   **Development / Watch Mode:**
    ```bash
    npm run start:dev
    ```
*   **Production Build & Run:**
    ```bash
    npm run build
    npm run start:prod
    ```

---

## 🐳 Running with Docker (Alternative)

To build and run the application including its database using Docker:

### 1. Build and Start Services
This spins up the application and runs automated database migrations and seeds on startup.
```bash
docker compose up --build
```

### 2. Shut Down Services
```bash
docker compose down -v
```

---

## 🔍 Verification & Testing

### 1. Access interactive Swagger API Docs
Navigate to:
```url
http://localhost:3000/docs
```
Here, you can log in with the seeded credentials, copy the JWT token, authorize the Swagger client, and perform live API queries.

### 2. Perform a Health Check
Verify backend connectivity to the database:
```url
http://localhost:3000/health
```
**Expected healthy output:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

### 3. Run Automated Tests
```bash
# Run Unit Tests
npm run test

# Run E2E Tests
npm run test:e2e
```
