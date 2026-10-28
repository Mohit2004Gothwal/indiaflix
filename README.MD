# Indiaflix Backend

A backend service for **Indiaflix**, a subscription pricing management system inspired by Netflix. It allows users to view pricing plans and provides APIs to manage plans, features, and plan-feature mappings.

The application uses Node.js and Express for REST APIs and Neon PostgreSQL for persistent database storage.

## Features

- Fetch all active subscription plans with their prices and features.
- Create new pricing plans.
- Update existing plan details.
- Activate or deactivate plans.
- Create and retrieve feature definitions.
- Rename features globally.
- Retrieve features associated with a particular plan.
- Add or update feature values for individual plans.
- Remove features from plans without deleting the feature definition.
- Check backend and database connectivity through a health endpoint.

## Tech Stack

- **Runtime:** Node.js
- **Backend framework:** Express.js
- **Database:** PostgreSQL
- **Database hosting:** Neon
- **PostgreSQL client:** `pg`
- **Environment variables:** dotenv
- **API testing:** Postman or curl

## Project Structure

```text
indiaflix-backend/
├── src/
│   ├── db.js
│   ├── schema.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Database Design

The application uses three relational database tables.

### 1. `plans_table`

Stores subscription plan information.

| Column | Description |
|---|---|
| `id` | Unique plan identifier |
| `name` | Name of the plan |
| `price` | Plan price |
| `currency` | Currency code, such as INR |
| `billing_period` | Billing interval |
| `is_active` | Whether the plan is available |
| `created_at` | Record creation timestamp |

### 2. `feature_table`

Stores unique feature definitions.

| Column | Description |
|---|---|
| `id` | Unique feature identifier |
| `feature_name` | Name of the feature |

### 3. `plan_features`

Maps features to plans and stores their values.

| Column | Description |
|---|---|
| `plan_id` | Reference to `plans_table` |
| `feature_id` | Reference to `feature_table` |
| `feature_value` | Value of the feature for that plan |

This design supports many-to-many relationships between plans and features. For example, multiple plans can share the `Resolution` feature while having different values such as `720p`, `1080p`, or `4K`.

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- A Neon account
- Postman or curl for API testing

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd indiaflix-backend
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

Required packages:

```bash
npm install express pg dotenv cors
npm install --save-dev nodemon
```

### 3. Configure the Neon database

1. Create a PostgreSQL project at [Neon](https://console.neon.tech/).
2. Open the database connection details.
3. Copy the connection string.
4. Create a `.env` file in the project root.

Add the following configuration:

```env
PORT=3000
DATABASE_URL=your_neon_connection_string
FRONTEND_URL=http://localhost:5173
```

Replace `your_neon_connection_string` with the connection string provided by Neon.

**Security:** Never commit your `.env` file, database password, or other secrets to GitHub.

### 4. Configure `.gitignore`

Make sure the following entries exist in `.gitignore`:

```text
node_modules/
.env
```

### 5. Configure package scripts

Ensure your `package.json` contains these scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Keep the existing dependencies in your `package.json`.

### 6. Start the backend

Run the development server:

```bash
npm run dev
```

If the database connection and initialization succeed, the server should report that the database tables have been initialized and the API is running on port 3000.

The database initialization code creates the tables if they do not already exist.

## API Documentation

Base URL for local development:

```text
http://localhost:3000
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Checks backend and database connectivity |

### Plan APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plans` | Fetch all active plans with their features |
| GET | `/api/plans/:id` | Fetch a specific plan, if implemented |
| POST | `/api/plans` | Create a new plan |
| PUT | `/api/plans/:id` | Update plan details |
| PATCH | `/api/plans/:id/status` | Activate or deactivate a plan |

### Feature APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/features` | Fetch all feature definitions |
| POST | `/api/features` | Create a feature |
| PUT | `/api/features/:id` | Rename an existing feature |

### Plan-Feature APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plans/:id/features` | Fetch features associated with a plan |
| PUT | `/api/plans/:id/features/:featureId` | Add or update a feature value |
| DELETE | `/api/plans/:id/features/:featureId` | Remove a feature from a plan |

**Note:** The `GET /api/plans/:id` endpoint should be documented as available only after it has been implemented. Confirm that each listed endpoint exists in `src/server.js` before publishing the README.

## Example API Requests

### Fetch all plans

```bash
curl http://localhost:3000/api/plans
```

### Create a plan

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium",
    "price": 649,
    "currency": "INR",
    "billing_period": "Monthly"
  }'
```

### Update a plan

```bash
curl -X PUT http://localhost:3000/api/plans/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Plus",
    "price": 799,
    "currency": "INR",
    "billing_period": "Monthly"
  }'
```

### Create a feature

```bash
curl -X POST http://localhost:3000/api/features \
  -H "Content-Type: application/json" \
  -d '{
    "feature_name": "Spatial Audio"
  }'
```

### Update a plan's feature value

```bash
curl -X PUT \
  http://localhost:3000/api/plans/1/features/2 \
  -H "Content-Type: application/json" \
  -d '{
    "feature_value": "4K"
  }'
```

Replace the sample IDs with IDs that exist in your Neon database.

## How It Works

1. The frontend requests pricing information from `GET /api/plans`.
2. The backend retrieves active plans and their associated features from Neon PostgreSQL.
3. The backend returns the combined information as JSON.
4. The frontend renders the pricing cards dynamically.
5. Admin operations create or update records through backend APIs.
6. Changes are stored in Neon and are available to subsequent API requests.

## Error Handling

The APIs use standard HTTP status codes, including:

- `200 OK` — Request completed successfully.
- `201 Created` — A record was created.
- `400 Bad Request` — Request data is invalid.
- `404 Not Found` — The requested resource does not exist.
- `409 Conflict` — A unique value already exists.
- `500 Internal Server Error` — An unexpected server error occurred.
- `503 Service Unavailable` — The health check cannot reach the database.

## Deployment

The application can be deployed using a Node.js-compatible hosting provider, with Neon providing the managed PostgreSQL database.

Deployment checklist:

1. Push the backend repository to GitHub.
2. Create a web service with your hosting provider.
3. Configure `DATABASE_URL` and other environment variables in the hosting dashboard.
4. Set the production frontend URL in `FRONTEND_URL`.
5. Deploy the service and test `/api/health`.
6. Test the public API endpoints.

Never expose the Neon connection string in frontend code or public documentation.

## Future Improvements

- Admin authentication and authorization.
- Request validation using a validation library.
- Automated API tests.
- Versioned database migrations.
- Pagination for large datasets.
- Audit logs for pricing changes.
- API documentation using Swagger or OpenAPI.
- React-based pricing page and admin dashboard.

## License

This project is intended for learning and demonstration purposes. Add a license if you intend to distribute or reuse the project publicly.
