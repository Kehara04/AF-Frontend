import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterKid from "./pages/RegisterKid";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import KidDashboard from "./pages/KidDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKids from "./pages/AdminKids";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import KidQuizHome from "./pages/quizzes/KidQuizHome";
import TakeQuiz from "./pages/quizzes/TakeQuiz";
import QuizResultView from "./pages/quizzes/QuizResultView";
import MyQuizResults from "./pages/quizzes/MyQuizResults";

import AdminQuizManage from "./pages/admin/AdminQuizManage";
import AdminQuizResults from "./pages/admin/AdminQuizResults";

import ExperimentManagement from "./pages/admin/ExperimentManagement";
import OrderManagement from "./pages/admin/OrderManagement";

import ExperimentList from "./pages/kid/ExperimentList";
import PlaceOrder from "./pages/kid/PlaceOrder";

import TutorialManager from "./pages/admin/tutorialManager";

import TutorialList from "./pages/kid/TutorialList";
import TutorialView from "./pages/kid/TutorialView";

import AdminFeedbackManagement from "./pages/admin/AdminFeedbackManagement";
import AdminProgressManagement from "./pages/admin/AdminProgressManagement";
import kidBackground from "./assets/background5.PNG";

export default function App() {
  return (
    <div
      className="min-h-screen bg-slate-50 relative"
      style={{
        backgroundImage: `url("${kidBackground}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay to ensure text remains readable if cards are transparent, but the user requested "leave the white cards as it is", so we just need the background. */}
      {/* Cards should be white because of their own bg classes. */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterKid />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />

            {/* Kid-only */}
            <Route element={<RoleRoute allowed={["kid"]} />}>
              <Route path="/kid" element={<KidDashboard />} />
            </Route>

            {/* Admin-only */}
            <Route element={<RoleRoute allowed={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/kids" element={<AdminKids />} />
              <Route path="/admin/tutorials" element={<TutorialManager />} />
              <Route path="/admin/feedback" element={<AdminFeedbackManagement />} />
              <Route path="/admin/progress" element={<AdminProgressManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />

          {/* Kid-only */}
          <Route element={<RoleRoute allowed={["kid"]} />}>
            <Route path="/kid" element={<KidDashboard />} />

            {/* Quiz */}
            <Route path="/kid/quizzes" element={<KidQuizHome />} />
            <Route path="/kid/quizzes/:experiment_id" element={<TakeQuiz />} />
            <Route path="/kid/quizzes/result" element={<QuizResultView />} />
            <Route path="/kid/quizzes/history" element={<MyQuizResults />} />
          </Route>

          {/* Admin-only */}
          <Route element={<RoleRoute allowed={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/kids" element={<AdminKids />} />

            {/* Quiz Admin */}
            <Route path="/admin/quizzes/manage" element={<AdminQuizManage />} />
            <Route
              path="/admin/quizzes/results"
              element={<AdminQuizResults />}
            />
          </Route>

          {/* ADMIN ROUTES */}
          <Route path="/admin/experiments" element={<ExperimentManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />

          {/* KID ROUTES */}
          <Route path="/kid/experiments" element={<ExperimentList />} />
          <Route path="/place-order/:id" element={<PlaceOrder />} />
          <Route path="/kid/tutorials" element={<TutorialList />} />
          <Route path="/kid/tutorials/experiment/:experimentId" element={<TutorialList />} />
          <Route path="/kid/tutorials/:id" element={<TutorialView />} />

        </Routes>
      </main>
    </div>
  );
}



