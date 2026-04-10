# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# MiniMinds Frontend

React frontend for the **MiniMinds Kids Science Learning Platform**.

This frontend consumes the backend API and provides separate flows for kids and admins. Kids can register, log in, view experiments, follow tutorials, take quizzes, submit feedback, place orders, and track progress. Admins can manage kids, experiments, tutorials, quizzes, orders, feedback, and progress.

## Features

### Public Features
- Landing page with project introduction
- Kid registration
- Login
- Email verification page
- Forgot password page
- Reset password page

### Kid Features
- Kid dashboard
- View experiments
- Place science kit orders
- View tutorials by experiment
- View tutorial details and learning steps
- Submit feedback
- Track completed experiments and badge progress
- Take quizzes
- View quiz history
- Manage own profile

### Admin Features
- Admin dashboard
- View and manage kid accounts
- Activate or deactivate users
- Manage experiments
- Manage tutorials
- Search YouTube videos and attach video to tutorials
- Manage quizzes
- View quiz results by experiment
- Manage orders
- View all feedback
- View all progress records

## Tech Stack

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Context API for authentication/session state
- Chart.js + react-chartjs-2

## Folder Structure

```text
Frontend/
├── public/
├── src/
│   ├── api/
│   │   └── http.js
│   ├── assets/
│   ├── components/
│   │   ├── Loader.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProgressBar.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── RegisterKid.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Profile.jsx
│   │   ├── KidDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminKids.jsx
│   │   ├── kid/
│   │   ├── admin/
│   │   ├── quizzes/
│   │   └── NotFound.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## Main Frontend Modules

### 1. Authentication Module
- Register kid account with image upload
- Login
- Email verification
- Forgot password
- Reset password
- Profile update
- Logout

### 2. Kid Learning Module
- Browse experiments
- Access tutorials by experiment
- View tutorial steps and linked YouTube video
- Take quizzes
- Review quiz history
- Submit experiment feedback
- Mark experiments as completed
- Earn badges based on progress

### 3. Ordering Module
- View selected experiment
- Place an order for science kits

### 4. Admin Module
- View admin dashboard
- Manage kids
- Manage experiments
- Manage tutorials
- Manage quizzes
- View quiz results
- Manage orders
- View all feedback
- View all progress

## Routing Overview

### Public Routes
- `/`
- `/register`
- `/login`
- `/verify/:token`
- `/forgot-password`
- `/reset-password/:token`

### Protected Shared Route
- `/profile`

### Kid Routes
- `/kid`
- `/kid/experiments`
- `/place-order/:id`
- `/kid/tutorials`
- `/kid/tutorials/experiment/:experimentId`
- `/kid/tutorials/:id`
- `/kid/quizzes`
- `/kid/quizzes/:experiment_id`
- `/kid/quizzes/result`
- `/kid/quizzes/history`

### Admin Routes
- `/admin`
- `/admin/kids`
- `/admin/experiments`
- `/admin/tutorials`
- `/admin/quizzes/manage`
- `/admin/quizzes/results`
- `/admin/orders`
- `/admin/feedback`
- `/admin/progress`

## Session Management

The frontend uses **Context API** in `AuthContext.jsx`.

### Stored in localStorage
- `token`
- `user`

### Session Behavior
- Token is attached automatically using Axios interceptor
- Current user is refreshed through `/auth/me`
- Protected routes redirect unauthenticated users to `/login`
- Role-based routes restrict access to `admin` or `kid`

## API Integration

The frontend connects to the backend using Axios.

### Axios Base URL
Set this in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Main integrated backend APIs
- `/auth/*`
- `/admin/*`
- `/experiments/*`
- `/tutorials/*`
- `/youtube/search`
- `/quizzes/*`
- `/feedback/*`
- `/progress/*`
- `/orders/*`

## Installation and Setup

```bash
git clone <your-repository-url>
cd AF-Project-feature-user-management/Frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file inside `Frontend`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## UI / UX Notes

- Built with responsive React components
- Styled with Tailwind CSS
- Uses background illustrations and themed cards
- Separate kid and admin experiences
- Toast and loader components for feedback and loading states

## Frontend Deployment (Vercel)
 
 The React frontend application was deployed using Vercel.

Steps:
- Created a new project in Vercel.
- Imported the frontend repository from GitHub.
- Set the root directory to:Frontend
- Configured environment variables.
- Set build configuration:
- Build Command: npm run build
- Output Directory: dist
- Deployed the application and obtained a live URL.


## Deployment Evidence

### Frontend Deployment (Vercel)
![Frontend Deployment](/deployment/vercel.jpeg)
*Frontend successfully deployed on Vercel*


## Testing Instructions

> Update this section after adding actual frontend tests.

Suggested areas to test:
- login flow
- protected routes
- role-based route behavior
- form validation
- API error handling
- quiz submission flow
- order placement flow

## Known Gaps to Improve

- Add Redux only if the project needs more complex shared state
- Add unit/component tests using Vitest and React Testing Library
- Add end-to-end tests for major user flows
- Add deployment screenshots
- Add better form validation and reusable form helpers



## License

This project was developed for the **SE3040 – Application Frameworks** assignment.