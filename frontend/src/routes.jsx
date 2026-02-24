// src/routes.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import UsersList from './components/UsersList';
import TasksList from './components/Tasks/TasksList';
import TaskDetail from './components/Tasks/TaskDetail';
import TaskForm from './components/Tasks/TaskForm';
import ExpenseList from './components/Finances/ExpenseList';
import ExpenseForm from './components/Finances/ExpenseForm';
import ExpenseDetail from './components/Finances/ExpenseDetail';
import IncomeList from './components/Finances/IncomeList';
import IncomeForm from './components/Finances/IncomeForm';
import IncomeDetail from './components/Finances/IncomeDetail';
import FinancesDashboard from './components/Finances/FinancesDashboard';
import FinanceAnalytics from './components/Finances/FinanceAnalytics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AuditLogs from './components/Audit/AuditLogs';
import AuditStats from './components/Audit/AuditStats';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import NotificationsPage from './pages/NotificationsPage';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-main)]">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header className={isSidebarOpen ? 'lg:left-72' : 'left-0'} />
                <main className={`
                    flex-1 transition-all duration-300
                    p-4 pt-24 md:p-6 md:pt-24 lg:p-8 lg:pt-28
                    ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}
                `}>
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default function Router() {
    const { isAuthenticated, hasRole } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route: Login */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>
                    <Route element={<MainLayout />}>

                        {/* Accessible by all authenticated users */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/tasks" element={<TasksList />} />
                        <Route path="/tasks/new" element={<TaskForm />} />
                        <Route path="/tasks/:id" element={<TaskDetail />} />

                        {/* Management & Finance (Restricted to non-agents) */}
                        <Route element={<ProtectedRoute isAllowed={hasRole(['admin', 'dg', 'comptable', 'caisse'])} redirectPath="/dashboard" />}>
                            <Route path="/finances" element={<FinancesDashboard />} />

                            {/* Analytics (Restricted to admin, dg, comptable) */}
                            <Route element={<ProtectedRoute isAllowed={hasRole(['admin', 'dg', 'comptable'])} redirectPath="/finances" />}>
                                <Route path="/finances/analytics" element={<FinanceAnalytics />} />
                            </Route>

                            <Route path="/finances/incomes" element={<IncomeList />} />
                            <Route path="/finances/incomes/new" element={<IncomeForm />} />
                            <Route path="/finances/incomes/:id" element={<IncomeDetail />} />
                        </Route>

                        {/* Expenses */}
                        <Route path="/expenses" element={<ExpenseList />} />
                        <Route path="/expenses/new" element={<ExpenseForm />} />
                        <Route path="/expenses/:id" element={<ExpenseDetail />} />
                        <Route path="/profile" element={<Profile />} />

                        {/* Restricted to Admin and DG */}
                        <Route element={<ProtectedRoute isAllowed={hasRole(['admin', 'dg'])} redirectPath="/dashboard" />}>
                            <Route path="/users" element={<UsersList />} />
                            <Route path="/audit" element={<AuditLogs />} />
                            <Route path="/audit/stats" element={<AuditStats />} />
                        </Route>

                    </Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
