import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { X, Lock, User, Mail } from 'lucide-react';
import './CardView.css';

const AuthModal = ({ onClose }) => {
    const { login, signup, getPortalContainer } = useAppContext();
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
            zIndex: 10001,
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
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {error && (
                        <div style={{ padding: '10px', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '6px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            background: 'var(--accent-primary)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            transition: 'background 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>

                <div style={{
                    marginTop: '1.25rem',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    textAlign: 'left'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        lineHeight: '1.5',
                        color: 'var(--text-secondary)',
                        opacity: 0.8
                    }}>
                        <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px', opacity: 0.6 }} />
                        <strong>Your privacy matters.</strong> No personal data or email is requested. Sign in is only used to keep a record of your visited sites, and this information is stored locally on your device. We do not have access to it. Keep your username and password in a safe place you can remember as no recovery is possible.
                    </p>
                </div>
            </div>
        </div>,
        getPortalContainer()
    );
};

export default AuthModal;
