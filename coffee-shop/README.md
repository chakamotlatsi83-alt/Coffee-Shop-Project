# ☕ Coffee Shop Management System

A full-stack web application for a local coffee shop. Customers can view the menu and place orders; staff can manage menu items and process orders.

**Live links**

| Part | URL |
|---|---|
| Frontend (React) | `https://<your-frontend>.vercel.app` |
| Backend (Express API) | `https://<your-backend>.onrender.com` |
| Health check | `https://<your-backend>.onrender.com/api/health` |

> ⚠️ The backend runs on Render's free tier and may take ~50 seconds to wake up on the first request.

---

## 1. Features

**Customer**
- Browse menu items (name, description, price, availability, category)
- Add to cart and change quantities
- Place an order with customer name and details
- See an order confirmation with a unique order number

**Staff**
- Log in to the staff dashboard
- Add, edit and delete menu items; change price and availability
- View all customer orders
- Update order status: `Pending → Preparing → Ready → Collected`
- View order totals and a basic daily summary

---

## 2. Technologies

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React (Vite), Fetch API | Vercel / Netlify |
| Backend | Node.js, Express.js | Render |
| Database | Redis (key-value, persistence enabled) | Upstash / Redis Cloud |
| Collaboration | Git, GitHub (branches, pull requests, reviews) | GitHub |

**Architecture**

```
React (Vercel/Netlify)  --Fetch API-->  Express REST API (Render)  -->  Redis (persistent)
```

---

## 3. Project structure

```
coffee-shop/
├── client/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js     # all Fetch API calls live here
│   └── .env.example
├── server/            # Express backend
│   ├── routes/
│   ├── middleware/    # auth, validation, error handler
│   ├── db.js          # Redis connection
│   ├── index.js
│   └── .env.example
├── CONTRIBUTIONS.md
└── README.md
```

---

## 4. Installation (run locally)

**Requirements:** Node.js 18+, Git, a Redis connection URL (hosted or local).

```bash
# 1. Clone
git clone https://github.com/<org-or-user>/<repo>.git
cd <repo>

# 2. Backend
cd server
npm install
cp .env.example .env      # then fill in the values
npm run dev               # runs on http://localhost:5000

# 3. Frontend (new terminal)
cd client
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:5000
npm run dev               # runs on http://localhost:5173
```

### Environment variables

**server/.env**
```
PORT=5000
REDIS_URL=<your redis connection url>
ADMIN_USERNAME=<staff username>
ADMIN_PASSWORD=<staff password>
JWT_SECRET=<long random string>
CLIENT_URL=http://localhost:5173
```

**client/.env**
```
VITE_API_URL=http://localhost:5000
```

> Never commit `.env` files. Only `.env.example` (with no real values) is committed.

---

## 5. Data model (Redis key-value)

| Key pattern | Value (JSON) |
|---|---|
| `menu:<id>` | `{ id, name, description, price, category, available }` |
| `order:<id>` | `{ id, customerName, items: [{ menuItemId, name, price, quantity }], total, status, createdAt }` |

- IDs are generated uniquely (e.g. `crypto.randomUUID()`).
- Order status is one of: `Pending`, `Preparing`, `Ready`, `Collected`.

---

## 6. API endpoints

All responses are JSON. Errors use the format `{ "error": "message" }`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Check backend availability | Public |
| GET | `/api/menu` | Get all menu items | Public |
| GET | `/api/menu/:id` | Get one menu item | Public |
| POST | `/api/menu` | Add a menu item | Staff |
| PUT | `/api/menu/:id` | Update a menu item | Staff |
| DELETE | `/api/menu/:id` | Delete a menu item | Staff |
| POST | `/api/orders` | Place a customer order | Public |
| GET | `/api/orders` | Get all orders | Staff |
| GET | `/api/orders/:id` | Get one order | Staff / order owner |
| PATCH | `/api/orders/:id/status` | Update order status | Staff |
| GET | `/api/orders/summary/daily` | Daily order summary | Staff |
| POST | `/api/auth/login` | Staff login (returns token) | Public |

**Status codes used:** `200` OK, `201` Created, `400` Invalid input, `401` Not logged in, `403` Not allowed, `404` Not found, `500` Server error.

### Example: place an order

`POST /api/orders`
```json
{
  "customerName": "Thabo",
  "items": [
    { "menuItemId": "abc123", "quantity": 2 }
  ]
}
```
Response `201`:
```json
{
  "id": "ord_001",
  "customerName": "Thabo",
  "total": 60,
  "status": "Pending",
  "createdAt": "2026-11-20T09:30:00.000Z"
}
```

---

## 7. Deployment

**Database (Redis)**
1. Create a free database on Upstash or Redis Cloud with persistence enabled.
2. Copy the connection URL.

**Backend (Render)**
1. New → Web Service → connect the GitHub repo.
2. Root directory: `server` · Build: `npm install` · Start: `node index.js`
3. Add environment variables (`REDIS_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `CLIENT_URL`).
4. Verify `https://<backend>/api/health` returns OK.

**Frontend (Vercel / Netlify)**
1. Import the GitHub repo, root directory: `client`.
2. Add environment variable `VITE_API_URL=https://<backend>.onrender.com`.
3. Deploy, then add the frontend URL to `CLIENT_URL` on Render (CORS).

---

## 8. Testing

Manual test checklist (all must pass before submission):

- [ ] `/api/health` works on the live backend
- [ ] Menu loads on the live frontend
- [ ] Add item to cart, change quantity, remove item
- [ ] Place an order and receive an order number
- [ ] Staff login works; wrong password is rejected
- [ ] Staff can add, edit and delete a menu item
- [ ] Staff can change an order through all four statuses
- [ ] Data is still there after restarting the backend
- [ ] Invalid requests (empty name, negative price) return a clear error

---

## 9. Screenshots

Add images to a `/screenshots` folder and link them here.

- Customer menu page
- Cart and checkout
- Order confirmation
- Staff dashboard (menu management)
- Staff dashboard (orders and status)
- Redis records (`menu:*` and `order:*` keys)

---

## 10. Team and contributions

See [CONTRIBUTIONS.md](./CONTRIBUTIONS.md) for the full log of who did what, with pull request links.

| Member | Role |
|---|---|
| Member 1 | Backend lead: Redis, menu API |
| Member 2 | Backend: orders API, authentication, validation, backend reviews |
| Member 3 | Backend support: daily summary, seed data, health endpoint |
| Member 4 | QA and testing, order confirmation page, screenshots |
| Member 5 | Frontend lead: customer interface, design, `api.js` |
| Member 6 | Staff dashboard |
| Member 7 | Documentation, contribution log, test checklist |
| Member 8 (Group Leader) | Repo management, deployment, integration, final testing |

*(Replace "Member N" with real names.)*

---

## 11. Branching and workflow

- `main` is protected: no direct pushes.
- Each task gets its own branch: `feature/<name>`, `fix/<name>`.
- Every change is merged by pull request with at least one review.
- Commit messages are short and clear (e.g. `Add PATCH order status endpoint`).

---

## 12. Known limitations / future improvements

- Payment is not implemented.
- Free-tier hosting may be slow on first load.
- *(Add anything else your group notices.)*
