import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, requestForgotPassword, submitResetPassword } from '../services/authAPI';
import { Mail, Lock, Shield, User as UserIcon, ArrowRight, Settings, KeyRound, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);

        // Hit the actual Node.js database
        try {
            const response = await loginUser({ email, password });

            // Ensure the user is logging into the correct portal
            if (response.role && response.role !== role) {
                setError(`Incorrect portal. Please select the '${response.role === 'admin' ? 'Admin' : 'Customer'}' tab to sign in.`);
                return;
            }

            // Set the REAL JWT into Context
            if (response.token) {
                const userRole = response.role;
                localStorage.setItem('userEmail', email);
                login(userRole, response.token);
                if (userRole === 'admin') navigate('/admin-dashboard');
                else navigate('/user-dashboard');
            } else {
                setError("Invalid response from server");
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email) {
            setError('Please enter your email address to receive an OTP.');
            return;
        }
        setIsLoading(true);
        try {
            await requestForgotPassword(email);
            setOtpStep(true);
            setSuccessMsg('OTP systematically sent! Please observe your email inbox.');
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || !newPassword) {
            setError('Please explicitly enter both the OTP and your new password.');
            return;
        }
        setIsLoading(true);
        try {
            await submitResetPassword({ email, otp, newPassword });
            setSuccessMsg('Password successfully reset! You can securely sign in now.');
            setIsForgotPassword(false);
            setOtpStep(false);
            setPassword('');
            setOtp('');
            setNewPassword('');
        } catch (err) {
            setError(err.message || 'Failed to reset password. OTP may be explicitly expired or incorrect.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

            {/* Global Full-Screen Background Image */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>

            {/* Dark Cinematic Gradient Overlay extending globally */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 100%)', zIndex: 1 }}></div>

            {/* Left Content Section */}
            <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white' }} className="auth-hero">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings size={32} color="white" />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>fixhub</span>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Premium Vehicle Care, <br />Expertly Delivered.</h1>
                    <p style={{ fontSize: '1.25rem', color: '#E2E8F0', maxWidth: '450px', lineHeight: 1.6, textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>Access your dashboard to book services, track maintenance history, and manage your vehicles perfectly.</p>
                </div>
            </div>

            {/* Right Form Section (Glassmorphism card sitting gracefully on background) */}
            <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '440px', background: 'var(--surface)', padding: '3rem 2.5rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'fadeIn 0.5s ease-out' }}>

                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            {isForgotPassword ? (otpStep ? 'Reset Password' : 'Forgot Password') : 'Welcome back'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {isForgotPassword ? (otpStep ? 'Enter the OTP explicitly sent to your email.' : 'Enter your email to explicitly receive an OTP.') : 'Please enter your details to sign in.'}
                        </p>
                    </div>

                    {error && (
                        <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} /> {error}
                        </div>
                    )}

                    {successMsg && (
                        <div style={{ background: '#D1FAE5', color: '#059669', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} /> {successMsg}
                        </div>
                    )}

                    {!isForgotPassword ? (
                        /* LOGIN FORM */
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Role Selector */}
                            <div style={{ display: 'flex', background: 'var(--surface-alt)', padding: '0.35rem', borderRadius: '0.75rem', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', background: role === 'user' ? 'white' : 'transparent', color: role === 'user' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: role === 'user' ? 600 : 500, boxShadow: role === 'user' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
                                >
                                    <UserIcon size={18} /> Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', background: role === 'admin' ? 'white' : 'transparent', color: role === 'admin' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: role === 'admin' ? 600 : 500, boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
                                >
                                    <Shield size={18} /> Admin
                                </button>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                        className="auth-input"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem' }}>
                                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                                style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', width: '100%', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Customer'}`}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>

                        </form>
                    ) : (
                        /* FORGOT PASSWORD FLOW */
                        <form onSubmit={otpStep ? handleResetSubmit : handleForgotRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {!otpStep ? (
                                <>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                className="auth-input"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                                        {isLoading ? 'Sending...' : 'Send Explicit OTP'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Enter OTP</label>
                                        <div style={{ position: 'relative' }}>
                                            <KeyRound size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s', letterSpacing: '2px' }}
                                                className="auth-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>New Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--surface)', fontSize: '1rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                                className="auth-input"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', width: '100%', opacity: isLoading ? 0.7 : 1 }}>
                                        {isLoading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button type="button" onClick={() => { setIsForgotPassword(false); setOtpStep(false); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 500 }}>
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    )}

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
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

export default Login;
