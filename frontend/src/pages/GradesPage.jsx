import { motion } from 'framer-motion';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

function GradesPage() {
    const grades = [
        { module: 'Programação Orientada a Objetos', grade: 18, status: 'Aprovado', date: '12/01/2026' },
        { module: 'Bases de Dados Avançadas', grade: 16, status: 'Aprovado', date: '05/01/2026' },
        { module: 'Sistemas Operativos', grade: 14, status: 'Aprovado', date: '20/12/2025' },
        { module: 'Redes de Computadores', grade: 9, status: 'Recurso', date: '15/12/2025' },
        { module: 'Interface Homem-Máquina', grade: 19, status: 'Aprovado', date: '01/12/2025' },
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Minhas Avaliações</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Consulte aqui as suas notas e o histórico escolar.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Award size={40} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>16.2</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Média Geral</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>4</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Módulos Concluídos</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <AlertCircle size={40} color="#f87171" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Módulos em Aberto</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Módulo</th>
                            <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data</th>
                            <th style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nota</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((item, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ borderBottom: '1px solid var(--border-glass)' }}
                                className="hover-row"
                            >
                                <td style={{ padding: '1.25rem', fontWeight: '500' }}>{item.module}</td>
                                <td style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.date}</td>
                                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                    <span style={{
                                        fontSize: '1.1rem', fontWeight: 'bold',
                                        color: item.grade >= 10 ? '#10b981' : '#f87171'
                                    }}>
                                        {item.grade}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                    <span style={{
                                        padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                        background: item.status === 'Aprovado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: item.status === 'Aprovado' ? '#10b981' : '#f87171'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GradesPage;
