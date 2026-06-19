import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CarFront, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <NavLink className="navbar-brand" to="/">
                <CarFront size={28} color="var(--primary)" />
                <span>Fix<span>hub</span></span>
            </NavLink>

            <div className="nav-links">
                {!isAuthenticated ? (
                    <>
                        <NavLink className="nav-link" to="/login">Login</NavLink>
                        <NavLink className="nav-link" to="/register">Register</NavLink>
                    </>
                ) : (
                    <>
                        {userRole === 'admin' ? (
                            <NavLink className="nav-link" to="/admin-dashboard">
                                <LayoutDashboard size={20} />
                                Admin Dashboard
                            </NavLink>
                        ) : (
                            <NavLink className="nav-link" to="/user-dashboard">
                                <LayoutDashboard size={20} />
                                User Dashboard
                            </NavLink>
                        )}
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', width: '100%' }}>
                            <button className="nav-link" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', textAlign: 'left' }}>
                                <LogOut size={20} />
                                Log Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
