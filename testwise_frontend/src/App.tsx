import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import TestListPage from './pages/TestListPage';
import CreateTestPage from './components/forms/TestForm';
import { Toaster } from 'sonner'; // <-- 1. Import from 'sonner'
import EditTestPage from './pages/EditTestPage';
import TakeTestPage from './pages/TakeTestPage';
import AvailableTestsPage from './pages/AvailableTestsPage';
import DashboardIndex from './pages/DashboardIndex';

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<DashboardIndex />} />
            <Route path="tests" element={<TestListPage />} />
            <Route path="tests/new" element={<CreateTestPage />} />
            <Route path="tests/:testId/edit" element={<EditTestPage />} />
            <Route path="available-tests" element={<AvailableTestsPage />} />
            <Route path="take-test/:sessionId" element={<TakeTestPage />} />
             
          </Route>
          <Route path="/tests/:testId/take" element={<TakeTestPage />} />
        </Route>


        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster richColors /> {/* <-- 2. Use the new Toaster. `richColors` provides nice styling. */}
    </>
  );
}

export default App;