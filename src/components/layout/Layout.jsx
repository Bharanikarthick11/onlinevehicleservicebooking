import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

    return (
        <div className="layout" style={isAuthPage ? { backgroundColor: 'var(--surface-alt)' } : {}}>
            {!isAuthPage && <Navbar />}
            <main
                className={isAuthPage ? "" : "main-content"}
                style={isAuthPage ? { flex: 1, display: 'flex', padding: 0, margin: 0, maxWidth: '100%' } : {}}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
