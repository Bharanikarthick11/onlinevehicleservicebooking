import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authAPI';
import { Mail, Lock, Shield, User as UserIcon, ArrowRight, Wrench, UserPlus } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields thoroughly.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Your passwords do not match. Please verify.');
            return;
        }

        if (password.length < 6) {
            setError('Security standard requires passwords to be 6+ characters.');
            return;
        }

        setIsLoading(true);

        // Hit the real API
        try {
            const response = await registerUser({ name, email, password, role });

            // Registration successfully returns a token and user payload from the backend
            if (response.token) {
                // Determine true role returned from server configuration (admins may have specific overrides)
                const finalRole = response.role || role;
                login(finalRole, response.token);

                if (finalRole === 'admin') navigate('/admin-dashboard');
                else navigate('/user-dashboard');
            } else {
                setError("Registration succeeded but no authorization token was provided.");
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Consider checking your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--surface-alt)' }}>

            {/* Left Image Section */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '4rem', color: 'white', overflow: 'hidden' }} className="auth-hero">
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1503375837264-faeb741d4021?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.95), rgba(15,23,42,0.4))' }}></div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-flex' }}>
                            <Wrench size={32} color="var(--primary)" />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.1 }}>Join Our Network <br />of Automotive Experts.</h1>
                    <p style={{ fontSize: '1.25rem', color: '#CBD5E1', maxWidth: '400px', lineHeight: 1.6 }}>Create your exclusive account to book premium services or manage your professional garage.</p>
                </div>
            </div>

            {/* Right Form Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: 'var(--surface)' }}>
                <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease-out' }}>

                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Create an Account</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Enter your details below to get started.</p>
                    </div>

                    {error && (
                        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Role Selector */}
                        <div style={{ display: 'flex', background: 'var(--surface-alt)', padding: '0.35rem', borderRadius: '0.75rem', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setRole('user')}
                                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '0.5rem', background: role === 'user' ? 'white' : 'transparent', color: role === 'user' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: role === 'user' ? 600 : 500, boxShadow: role === 'user' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
                            >
                                <UserIcon size={18} /> Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '0.5rem', background: role === 'admin' ? 'white' : 'transparent', color: role === 'admin' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: role === 'admin' ? 600 : 500, boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
                            >
                                <Wrench size={18} /> Service Center Admin
                            </button>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '0.85rem 0.5rem 0.85rem 2.8rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block', whiteSpace: 'nowrap' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '0.85rem 0.5rem 0.85rem 2.8rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                        className="auth-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '1rem', width: '100%', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'Processing...' : `Create Account`}
                            {!isLoading && <UserPlus size={18} />}
                        </button>

                    </form>

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In here</Link>
                    </p>
                </div>
            </div>

            <style>{`
                .auth-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                @media (max-width: 900px) {
                    .auth-hero { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Register;
