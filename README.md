# Brew Haven Coffee Shop — React, Express REST API & MongoDB

A full-stack coffee shop application aligned with the assessment rubric: React UI, Express REST endpoints, Fetch API integration, persistent MongoDB storage, menu/order workflows, and separate frontend/backend deployment.

## Features
- Public customer pages: menu, Our Story, basket, checkout and order confirmation.
- Customers can submit orders but cannot access staff order-management endpoints.
- Customers provide an email address and receive order confirmation and status-update emails when SMTP is configured.
- Staff can optionally enter a customer email for counter orders so those customers can also receive updates.
- Private `/staff` page with staff login, order list, counter-order insertion and order-status updates.
- Express validates staff JWTs on every staff route; frontend route hiding is not the security boundary.
- Product prices and order totals are recalculated by the API from MongoDB data.
- Staff passwords are stored as bcrypt hashes.
- MongoDB persists products, staff accounts and orders across devices and sessions.

## Technologies
React 18, Vite, Fetch API, Express 4, Node.js, MongoDB Atlas, Mongoose, JWT and bcryptjs.

## Requirements
Node.js 18+, npm, and a MongoDB Atlas cluster (or another reachable MongoDB deployment).

## MongoDB setup
1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Add your backend host IP to Atlas Network Access. For local development, allow your current development IP. Avoid unrestricted access for production.
4. Copy the MongoDB connection string and replace the username, password and cluster host. URL-encode special characters in credentials.
5. Create `.env` from `.env.example` and set `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_ORIGIN`, and the SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`). Never put the connection string in React/VITE variables or commit `.env`.

Example environment values:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/brew_haven?retryWrites=true&w=majority
JWT_SECRET=use-a-random-secret-at-least-32-characters-long
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Brew Haven <your-email@gmail.com>"
```
Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Install and seed the menu
```bash
npm install
npm run seed-products
```
The seed script inserts the supplied 20 menu items and skips existing product names.

## Create the first staff account
```bash
npm run create-staff
```
Enter the staff name, email and a password of at least 12 characters. No public staff registration exists.

## Run locally
Terminal 1 (API): `npm run server`
Terminal 2 (React): `npm run dev`
Open the Vite URL, usually `http://localhost:5173`. Staff sign-in is at `/staff`.

## REST API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and database health |
| GET | `/api/products` | Public | Read active menu items |
| POST | `/api/orders` | Public | Place a customer order |
| POST | `/api/staff/login` | Public | Authenticate staff and issue JWT |
| GET | `/api/staff/me` | Staff JWT | Validate staff session |
| GET | `/api/staff/orders` | Staff JWT | Read all orders |
| POST | `/api/staff/orders` | Staff JWT | Insert a counter order |
| PATCH | `/api/staff/orders/:code/status` | Staff JWT | Update an order status and send a customer email when configured |

Staff endpoints require `Authorization: Bearer <token>`. Valid order states: Received, Preparing, Ready, Completed, Cancelled.

## Fetch API integration
The React application calls the Express API using browser `fetch()` for menu retrieval, customer checkout, staff login, order retrieval, staff-created orders and order-status updates. The Vite development proxy forwards `/api` requests to the local backend.

## Deployment
1. Deploy the Express backend to a Node.js host and configure `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN` as server environment variables.
2. Deploy the React frontend (`npm run build`, publish `dist`) to a static frontend host.
3. Set the frontend API base URL or configure a reverse proxy so `/api` reaches the deployed Express backend. Enable SPA fallback so `/staff` serves `index.html`.
4. Use HTTPS, restrict Atlas network access, keep secrets server-side, and test the deployed endpoints.

## Testing / demonstration checklist
- [ ] `GET /api/health` reports MongoDB connected.
- [ ] Menu loads after refresh and from a second device.
- [ ] Customer can submit a valid order; it is stored in MongoDB.
- [ ] Customer without a staff token receives HTTP 401 from staff-only endpoints.
- [ ] Staff can log in and view the same order on the dashboard.
- [ ] Staff can insert a counter order and update an order status.
- [ ] Invalid product IDs, quantities and statuses are rejected.
- [ ] Browser refresh does not erase database records.

## GitHub collaboration and student contribution
Commit work in small, meaningful changes, use branches and pull requests, review teammates' changes, and never commit `.env`. In the submitted report, describe each group member's actual contribution and include repository history/screenshots. Each student should understand and be able to explain the code they submit.

## Screenshots and final submission
Capture the customer menu, Our Story page, checkout/order confirmation, staff login, staff order list, updated order status, MongoDB collections and deployed application. Add the real GitHub, frontend and backend URLs to your submission after deployment.
