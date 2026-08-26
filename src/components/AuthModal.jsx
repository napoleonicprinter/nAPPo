import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { X, Lock, User, Mail } from 'lucide-react';
import './CardView.css';

const AuthModal = ({ onClose }) => {
    const { login, signup, getPortalContainer, authMessage } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isLogin) {
            const success = login(username, password);
            if (success) {
                onClose();
            } else {
                setError('Invalid username or password');
            }
        } else {
            const success = signup(username, password);
            if (success) {
                onClose();
            } else {
                setError('Username already exists');
            }
        }
    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} className="animate-fade-in" onClick={onClose}>
            <div
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    position: 'relative',
                    textAlign: 'center'
                }}
            >
                <button
                    className="modal-close-btn"
                    onClick={onClose}
                    title="Close"
                    style={{ position: 'absolute', top: '15px', right: '15px' }}
                >
                    <X size={18} strokeWidth={2.5} color="white" />
                </button>

                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: authMessage ? '1.3rem' : '1.65rem', lineHeight: '1.4', fontWeight: '700' }}>
                    {authMessage ? authMessage : (isLogin ? 'Welcome Back' : 'Create Account')}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                    {error && (
                        <div style={{ padding: '10px 12px', background: 'rgba(248, 81, 73, 0.15)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', opacity: 0.8 }} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500', outline: 'none' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', opacity: 0.8 }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '13px',
                            background: 'var(--accent-primary)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.4rem',
                            transition: 'background 0.2s',
                            fontSize: '1.05rem'
                        }}
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.98rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', textDecoration: 'underline' }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>

                <div style={{
                    marginTop: '1.25rem',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textAlign: 'left'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        lineHeight: '1.55',
                        color: 'var(--text-primary)',
                        opacity: 0.95,
                        fontWeight: '400'
                    }}>
                        <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', opacity: 0.9 }} />
                        <strong style={{ fontWeight: '700' }}>Your privacy matters.</strong> No personal data or email is requested. Sign in is only used to keep a record of your visited sites, and this information is stored locally on your device. You can export a JSON backup file of your visited sites anytime from the Settings menu (⚙️) to transfer or restore your data on a new device!
                    </p>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default AuthModal;
