# LuxeCut & Spa Salon Appointment System

A full-stack salon appointment management website with customer booking, admin dashboard, service management, calendar view, email reminders, and working hours controls.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT-based authentication
- Notifications: Nodemailer email reminders

## Project Structure
- `backend/` — Express API, models, controllers, email service, settings
- `frontend/` — React SPA with customer panel and admin dashboard

## Local Setup
1. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```
2. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```
3. Start backend server
   ```bash
   cd ../backend
   npm run start
   ```
4. Start frontend dev server
   ```bash
   cd ../frontend
   npm run dev
   ```

## Default Credentials
- Admin email: `admin@luxecut.com`
- Admin password: `adminpassword`

## Notes
- The backend falls back to an in-memory MongoDB instance if a configured MongoDB connection fails.
- Email notifications are logged to the console when SMTP is not configured.
- Frontend API requests use proxy config in `frontend/vite.config.js` to route `/api` to `http://localhost:5000`.
