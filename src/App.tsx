import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import DashboardPage from '@/pages/home';
import QuizListPage from '@/pages/quiz/quiz-list';
import QuizDetailPage from '@/pages/quiz/quiz-detail';
import QuizTakingPage from '@/pages/quiz/quiz-taking';
import QuizTakingDemoPage from '@/pages/quiz/quiz-taking-demo';
import QuizResultPage from '@/pages/quiz/quiz-result';
import LeaderboardPage from '@/pages/leaderboard';
import LearningMaterialsPage from '@/pages/learning-materials';
import NotificationsPage from '@/pages/notifications';
import UserProfilePage from '@/pages/user-profile';
import AssignmentListPage from '@/pages/assignment/assignment-list';
import AssignmentDetailPage from '@/pages/assignment/assignment-detail';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import './App.css';
import { ThemeProvider } from './components/theme-provider';

// Component chính với AuthProvider
function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  // Route bảo vệ - chỉ cho phép truy cập khi đã đăng nhập
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/auth/login"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <LoginPage />
          }
        />

        <Route
          path="/auth/register"
          element={
            isAuthenticated ?
              <Navigate to="/" replace /> :
              <RegisterPage onRegisterSuccess={() => window.location.href = '/auth/login'} />
          }
        />

        {/* Legacy routes - redirect to new auth paths */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

        {/* Các trang yêu cầu đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout onLogout={logout}>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
          
          {/* Trang danh sách bài thi */}
          <Route 
            path="/quiz/quiz-list"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <QuizListPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Trang chi tiết bài thi */}
          <Route 
            path="/quiz/quiz-detail/:id"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <QuizDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Trang làm bài thi */}
          <Route
            path="/quiz/quiz-taking/:id"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <QuizTakingPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Trang demo làm bài thi */}
          <Route
            path="/quiz/quiz-taking-demo"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <QuizTakingDemoPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/quiz/quiz-result/:submissionId"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <QuizResultPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Trang danh sách bài tập về nhà */}
          <Route 
            path="/assignment/assignment-list"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <AssignmentListPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Trang chi tiết bài tập về nhà */}
          <Route
            path="/assignment/assignment-detail/:id"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <AssignmentDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          
          {/* Trang bảng xếp hạng */}
          <Route 
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <LeaderboardPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Trang tài liệu học tập */}
          <Route 
            path="/learning-materials"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <LearningMaterialsPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Trang thông báo */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <NotificationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Trang hồ sơ cá nhân */}
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <MainLayout onLogout={logout}>
                  <UserProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
  );
}

// App wrapper với AuthProvider và UserProvider
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="edunext-theme">
      <AuthProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
