import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BookOpen, Search, Edit2, Save, X, FileText, Upload, Download, Trash2, User } from 'lucide-react';
import { API_URL } from '../services/authService';

function FormadoresPage() {
    const [formadores, setFormadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormador, setSelectedFormador] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [editData, setEditData] = useState({
        biografia: ''
    });

    useEffect(() => {
        fetchFormadores();
    }, []);

    const getAuthHeader = () => ({
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    });

    const fetchFormadores = async () => {
        try {
            const response = await fetch(`${API_URL}/api/formadores`, { headers: getAuthHeader() });
            const data = await response.json();
            setFormadores(data);
        } catch (error) {
            console.error('Erro ao carregar formadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFormador = async (userId) => {
        try {
            const profileRes = await fetch(`${API_URL}/api/formadores/${userId}/profile`, { headers: getAuthHeader() });
            const profileData = await profileRes.json();

            const filesRes = await fetch(`${API_URL}/api/files/user/${userId}`, { headers: getAuthHeader() });
            const filesData = await filesRes.json();

            setSelectedFormador({ ...profileData, id: userId });
            setFiles(filesData);
            setEditData({
                biografia: profileData.biografia || ''
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/formadores/${selectedFormador.id}/profile`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });

            setFormadores(prev => prev.map(f => f.id === selectedFormador.id ? { ...f, ...editData } : f));
            setSelectedFormador(prev => ({ ...prev, ...editData }));
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao atualizar:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoria', 'documento');

        setUploading(true);
        try {
            await fetch(`${API_URL}/api/files/user/${selectedFormador.id}`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: formData
            });

            const filesRes = await fetch(`${API_URL}/api/files/user/${selectedFormador.id}`, { headers: getAuthHeader() });
            const filesData = await filesRes.json();
            setFiles(filesData);

        } catch (error) {
            console.error('Erro upload:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await fetch(`${API_URL}/api/files/${fileId}`, { headers: getAuthHeader() });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro download:', error);
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Tem a certeza?')) return;
        try {
            await fetch(`${API_URL}/api/files/${fileId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            console.error('Erro delete:', error);
        }
    };

    const filteredFormadores = formadores.filter(f =>
        f.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Formadores</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Gerir equipa pedagógica e documentos</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="search-bar" style={{ width: '300px' }}>
                    <Search size={20} style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Pesquisar formador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFormador ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
                {/* LISTA */}
                <div className="glass-card">
                    {loading ? (
                        <p>A carregar...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nome</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Email</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFormadores.map(formador => (
                                    <tr key={formador.id}
                                        style={{
                                            borderBottom: '1px solid var(--border-glass)',
                                            background: selectedFormador?.id === formador.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '500' }}>{formador.nome_completo}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {formador.email}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleSelectFormador(formador.id)}
                                                className="btn-glass"
                                                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                                            >
                                                Ver Perfil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* DETALHES */}
                <AnimatePresence>
                    {selectedFormador && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3>Perfil do Formador</h3>
                                <button onClick={() => setSelectedFormador(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem' }}>{selectedFormador.nome_completo}</h2>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="btn-glass"
                                        style={{ padding: '0.5rem', color: 'var(--primary)' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Biografia / Notas</label>
                                            <textarea
                                                className="input-field"
                                                value={editData.biografia}
                                                onChange={e => setEditData({ ...editData, biografia: e.target.value })}
                                                rows={4}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                                            <Save size={16} /> Guardar
                                        </button>
                                    </form>
                                ) : (
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Biografia</h4>
                                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                            {selectedFormador.biografia || 'Sem biografia definida.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* FICHEIROS */}
                            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>Documentos</h4>
                                    <label className="btn-primary" style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                        <Upload size={16} />
                                        {uploading ? 'A enviar...' : 'Upload'}
                                        <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {files.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum ficheiro.</p>}

                                    {files.map(file => (
                                        <div key={file.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileText size={16} color="var(--accent)" />
                                                <span style={{ fontSize: '0.9rem' }}>{file.nome_original}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleDownload(file.id, file.nome_original)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

export default FormadoresPage;
