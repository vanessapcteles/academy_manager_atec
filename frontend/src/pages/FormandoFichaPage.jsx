import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { authService, API_URL } from '../services/authService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function FormandoFichaPage() {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [extra, setExtra] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExtra = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch(`${API_URL}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setExtra(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchExtra();
    }, []);

    const exportPDF = () => {
        const doc = jsPDF();

        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('FICHA DO FORMANDO', 105, 25, { align: 'center' });

        // Personal Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Informação Pessoal', 20, 55);

        const personalData = [
            ['Nome Completo', user.nome_completo],
            ['Email', user.email],
            ['Telemóvel', extra?.telemovel || 'N/A'],
            ['Morada', extra?.morada || 'N/A'],
            ['Data Nascimento', extra?.data_nascimento ? new Date(extra.data_nascimento).toLocaleDateString() : 'N/A']
        ];

        doc.autoTable({
            startY: 65,
            head: [['Campo', 'Valor']],
            body: personalData,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });

        // Academic History (Mock for now or fetch)
        doc.setFontSize(16);
        doc.text('Cursos e Avaliações', 20, doc.lastAutoTable.finalY + 15);

        const academicData = [
            ['Desenvolvimento de Software', '2025/2026', '16.5', 'Aprovado'],
            ['Redes e Sistemas', '2024/2025', '14.0', 'Aprovado']
        ];

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 25,
            head: [['Curso', 'Ano Letivo', 'Média', 'Estado']],
            body: academicData,
            theme: 'grid',
            headStyles: { fillColor: [56, 189, 248] }
        });

        // Footer
        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Gerado em: ${date} - Academy Manager System`, 105, 285, { align: 'center' });

        doc.save(`Ficha_Formando_${user.nome_completo.replace(/ /g, '_')}.pdf`);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>A carregar dados...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Minha Ficha de Formando</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize e exporte os seus dados e histórico escolar.</p>
                </div>
                <button onClick={exportPDF} className="btn-primary" style={{ gap: '0.75rem' }}>
                    <Download size={20} /> Exportar PDF
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Visual Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '60px', background: 'rgba(56, 189, 248, 0.1)',
                            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--border-glass)'
                        }}>
                            {extra?.foto_url ? (
                                <img src={extra.foto_url} alt="Foto" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={60} color="var(--primary)" />
                            )}
                        </div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{user.nome_completo}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nº de Formando: 2026_{user.id}</p>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Estatísticas</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Média Global</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>16.2</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Faltas</span>
                                <span style={{ fontWeight: 'bold', color: '#f87171' }}>2h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Tab */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={20} color="var(--primary)" /> Dados Cadastrais
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Mail size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</p>
                                    <p style={{ fontSize: '0.9rem' }}>{user.email}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Phone size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Telemóvel</p>
                                    <p style={{ fontSize: '0.9rem' }}>{extra?.telemovel || 'Não definido'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <MapPin size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Morada</p>
                                    <p style={{ fontSize: '0.9rem' }}>{extra?.morada || 'Não definido'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Calendar size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data Nasc.</p>
                                    <p style={{ fontSize: '0.9rem' }}>{extra?.data_nascimento ? new Date(extra.data_nascimento).toLocaleDateString() : 'Não definido'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Award size={20} color="#fbbf24" /> Histórico de Cursos
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: 'bold' }}>Técnico de Informática</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ano: 2025/2026</p>
                                </div>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>16.5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormandoFichaPage;
