import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Users, Search, Edit2, Save, X, FileText, Upload, Download, Trash2, Smartphone, MapPin } from 'lucide-react';
import { API_URL } from '../services/authService';

function FormandosPage() {
    const [formandos, setFormandos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormando, setSelectedFormando] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [editData, setEditData] = useState({
        morada: '',
        telemovel: '',
        data_nascimento: ''
    });

    useEffect(() => {
        fetchFormandos();
    }, []);

    const getAuthHeader = () => ({
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    });

    const fetchFormandos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/formandos`, { headers: getAuthHeader() });
            const data = await response.json();
            setFormandos(data);
        } catch (error) {
            console.error('Erro ao carregar formandos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFormando = async (userId) => {
        try {
            // Carregar Detalhes do Perfil
            const profileRes = await fetch(`${API_URL}/api/formandos/${userId}/profile`, { headers: getAuthHeader() });
            const profileData = await profileRes.json();

            // Carregar Ficheiros
            const filesRes = await fetch(`${API_URL}/api/files/user/${userId}`, { headers: getAuthHeader() });
            const filesData = await filesRes.json();

            setSelectedFormando({ ...profileData, id: userId }); // userId para identificação
            setFiles(filesData);
            setEditData({
                morada: profileData.morada || '',
                telemovel: profileData.telemovel || '',
                data_nascimento: profileData.data_nascimento ? profileData.data_nascimento.split('T')[0] : ''
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/formandos/${selectedFormando.id}/profile`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });

            // Atualizar lista local
            setFormandos(prev => prev.map(f => f.id === selectedFormando.id ? { ...f, ...editData } : f));
            setSelectedFormando(prev => ({ ...prev, ...editData }));
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
        formData.append('categoria', 'documento'); // Default

        setUploading(true);
        try {
            // Upload
            await fetch(`${API_URL}/api/files/user/${selectedFormando.id}`, {
                method: 'POST',
                headers: getAuthHeader(), // FormData não leva Content-Type manual
                body: formData
            });

            // Recarregar ficheiros
            const filesRes = await fetch(`${API_URL}/api/files/user/${selectedFormando.id}`, { headers: getAuthHeader() });
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

    const filteredFormandos = formandos.filter(f =>
        f.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Formandos</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Gerir lista de formandos e documentos</p>
                    </div>
                </div>

                <div className="search-bar" style={{ width: '300px' }}>
                    <Search size={20} style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Pesquisar formando..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFormando ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
                {/* LISTA */}
                <div className="glass-card">
                    {loading ? (
                        <p>A carregar...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nome</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contacto</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFormandos.map(formando => (
                                    <tr key={formando.id}
                                        style={{
                                            borderBottom: '1px solid var(--border-glass)',
                                            background: selectedFormando?.id === formando.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '500' }}>{formando.nome_completo}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formando.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {formando.telemovel || '-'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleSelectFormando(formando.id)}
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
                    {selectedFormando && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3>Detalhes do Formando</h3>
                                <button onClick={() => setSelectedFormando(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem' }}>{selectedFormando.nome_completo}</h2>
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
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Telemóvel</label>
                                            <input
                                                className="input-field"
                                                value={editData.telemovel}
                                                onChange={e => setEditData({ ...editData, telemovel: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Morada</label>
                                            <input
                                                className="input-field"
                                                value={editData.morada}
                                                onChange={e => setEditData({ ...editData, morada: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Data Nascimento</label>
                                            <input
                                                type="date"
                                                className="input-field"
                                                value={editData.data_nascimento}
                                                onChange={e => setEditData({ ...editData, data_nascimento: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                                            <Save size={16} /> Guardar
                                        </button>
                                    </form>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                            <Smartphone size={16} /> {selectedFormando.telemovel || 'Sem telemóvel'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                            <MapPin size={16} /> {selectedFormando.morada || 'Sem morada'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {selectedFormando.data_nascimento ? new Date(selectedFormando.data_nascimento).toLocaleDateString() : 'Sem data de nascimento'}
                                        </div>
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

export default FormandosPage;
