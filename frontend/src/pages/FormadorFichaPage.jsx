import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, User, Mail, Phone, MapPin, Briefcase, BookOpen } from 'lucide-react';
import { authService, API_URL } from '../services/authService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function FormadorFichaPage() {
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
        doc.text('FICHA DO FORMADOR', 105, 25, { align: 'center' });

        // Personal Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Dados do Formador', 20, 55);

        const personalData = [
            ['Nome Completo', user.nome_completo],
            ['Email', user.email],
            ['Telemóvel', extra?.telemovel || 'N/A'],
            ['Especialidade', extra?.especialidade || 'Informática'],
            ['Data de Admissão', '01/09/2024']
        ];

        doc.autoTable({
            startY: 65,
            body: personalData,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });

        // Teaching History
        doc.setFontSize(16);
        doc.text('Módulos Lecionados', 20, doc.lastAutoTable.finalY + 15);

        const teachingData = [
            ['Programação Web', 'Engenharia Informática', '120h'],
            ['Bases de Dados', 'Cibersegurança', '90h'],
            ['Algoritmos', 'Informática de Gestão', '60h']
        ];

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 25,
            head: [['Módulo', 'Curso', 'Duração']],
            body: teachingData,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Academy Manager System - Ficha Gerada em ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });

        doc.save(`Ficha_Formador_${user.nome_completo.replace(/ /g, '_')}.pdf`);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>A carregar dados...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Minha Ficha de Formador</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visualize seu currículo e atividades lecionadas.</p>
                </div>
                <button onClick={exportPDF} className="btn-primary" style={{ gap: '0.75rem', backgroundColor: 'var(--secondary)' }}>
                    <Download size={20} /> Exportar Ficha
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '60px', background: 'rgba(99, 102, 241, 0.1)',
                            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--border-glass)'
                        }}>
                            {extra?.foto_url ? (
                                <img src={extra.foto_url} alt="Foto" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={60} color="var(--secondary)" />
                            )}
                        </div>
                        <h3 style={{ fontWeight: 'bold' }}>{user.nome_completo}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Especialista Senior</p>
                    </div>

                    <div className="glass-card">
                        <h4 style={{ marginBottom: '1rem' }}>Resumo</h4>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>270 Horas</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lecionadas este ano</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Briefcase size={20} color="var(--secondary)" /> Informação Profissional
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Institucional</p>
                                <p style={{ fontSize: '0.9rem' }}>{user.email}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Especialidade</p>
                                <p style={{ fontSize: '0.9rem' }}>Informática / Desenvolvimento</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Departamento</p>
                                <p style={{ fontSize: '0.9rem' }}>Tecnologias de Informação</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Telefone</p>
                                <p style={{ fontSize: '0.9rem' }}>{extra?.telemovel || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <BookOpen size={20} color="var(--secondary)" /> Módulos Atribuídos
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['Bases de Dados', 'Programação Avançada', 'Sistemas Cloud'].map((mod, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{mod}</span>
                                    <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Ativo</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormadorFichaPage;
