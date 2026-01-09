import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ text: '', type: '' })

        try {
            const response = await authService.login(email, password)
            setMessage({ text: `Bem-vindo, ${response.user.nome_completo}!`, type: 'success' })
        } catch (error) {
            setMessage({ text: error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', fontSize: '2rem', fontWeight: 'bold', fontFamily: 'Outfit', color: 'white' }}>
                        Academy <span style={{ color: 'var(--primary)' }}>Manager</span>
                    </Link>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        Inicie sessão para gerir a sua academia
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="custom-input"
                            placeholder="exemplo@atec.pt"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Palavra-passe</label>
                        <input
                            type="password"
                            className="custom-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <a href="#" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                            Esqueceu a palavra-passe?
                        </a>
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#4ade80' : '#f87171',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>

                    <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    </div>

                    <button type="button" className="social-btn">
                        <img src="https://www.svgrepo.com/show/475656/google.svg" width="20" alt="Google" />
                        Continuar com Google
                    </button>

                    <button type="button" className="social-btn">
                        <img src="https://www.svgrepo.com/show/475647/facebook.svg" width="20" alt="Facebook" />
                        Continuar com Facebook
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                    Ainda não tem conta? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Registe-se</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;
