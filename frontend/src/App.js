import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordTokenPage from './pages/ResetPasswordTokenPage';
import SettingsPage from './pages/SettingsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardEmployeePage from './pages/DashboardEmployeePage';
import CustomersListPage from './pages/CustomersListPage';
import CustomerEditPage from './pages/CustomerEditPage';
import EmployeesListPage from './pages/EmployeesListPage';
import EmployeeEditPage from './pages/EmployeeEditPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterEmployeePage from './pages/RegisterEmployeePage';
import InsertBookPage from './pages/InsertBookPage';
import InventoryPage from './pages/InventoryPage';
import EditBookPage from './pages/EditBookPage';
import DashboardCustomerPage from './pages/DashboardCustomerPage';
import PullsCustomerPage from './pages/PullsCustomerPage';
import PullsEmployeePage from './pages/PullsEmployeePage';
import ReleasesCustomerPage from './pages/ReleasesCustomerPage';
import RecommendationPage from './pages/RecommendationPage.js';
import ProtectedRoute from './components/ProtectedRoute';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import RedirectIfLoggedIn from './components/RedirectIfLoggedIn';

function App() {

  return (
    <Router>
      <Routes>
        {/* Routes with no restrictions */}
        <Route path="/" element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
        <Route path="/login" element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
        <Route path="/register" element={<RedirectIfLoggedIn><RegisterPage /></RedirectIfLoggedIn>} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordTokenPage />} />
        {/* Employee-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path="/dashempl" element={<DashboardEmployeePage />} />
          <Route path="/regcust" element={<RegisterCustomerPage />} />
          <Route path="/regempl" element={<RegisterEmployeePage />} />
          <Route path="/cust" element={<CustomersListPage />} />
          <Route path="/custedit/:id" element={<CustomerEditPage />} />
          <Route path="/empl" element={<EmployeesListPage />} />
          <Route path="/empledit/:id" element={<EmployeeEditPage />} />
          <Route path="/admin-reset-password/:id" element={<AdminResetPasswordPage />} />
          <Route path="/insertbook" element={<InsertBookPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/editbook/:id" element={<EditBookPage />} />
          <Route path="/pullsempl" element={<PullsEmployeePage />} />
        </Route>
        {/* Customer-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/dashcust" element={<DashboardCustomerPage />} />
          <Route path="/pullscust" element={<PullsCustomerPage />} />
          <Route path="/releasescust" element={<ReleasesCustomerPage />} /> 
          <Route path="/recommendation" element={<RecommendationPage />} />
        </Route>
        {/* Routes for any logged-in user */}
        <Route element={<ProtectedRoute allowedRoles={['employee', 'customer']} />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/resetpass" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
 
export default App;
