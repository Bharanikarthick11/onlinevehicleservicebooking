import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import BookingConfirmation from './pages/BookingConfirmation';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                        path="user-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payment"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <PaymentPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payment-success"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <PaymentSuccess />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="payment-failure"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <PaymentFailure />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="booking-confirmation"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <BookingConfirmation />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="admin-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback route */}
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
