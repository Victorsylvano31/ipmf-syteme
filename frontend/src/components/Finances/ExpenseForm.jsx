import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, Calculator, Tag, Briefcase, Info } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import styles from './Finances.module.css';

export default function ExpenseForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledData = location.state || {};

    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        motif: prefilledData.motif || '',
        categorie: prefilledData.categorie || 'fonctionnement',
        quantite: 1,
        prix_unitaire: '',
        commentaire: '',
        tache: '' // ID de la tâche sélectionnée
    });

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const qty = parseInt(formData.quantite) || 0;
        const pu = parseFloat(formData.prix_unitaire) || 0;
        setTotal(qty * pu);
    }, [formData.quantite, formData.prix_unitaire]);

    // Fetch active tasks for linking
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // On récupère les tâches où l'utilisateur est impliqué
                const res = await api.get('tasks/taches/', {
                    params: { statut: 'en_cours' } // On filtre pour n'avoir que les actives
                });
                const allTasks = res.data.results || res.data;
                // Filtrer localement si l'API ne le fait pas parfaitement (ex: user assigné)
                // Mais l'endpoint 'mes_taches' serait mieux, ou le get_queryset filtre déjà.
                // Ici on assume que l'API renvoie les tâches visibles par l'user.
                // On ne garde que celles en cours ou validées (si on permet dépenses post-mission)
                const activeTasks = allTasks.filter(t => ['en_cours', 'validee'].includes(t.statut));
                setTasks(activeTasks);
            } catch (err) {
                console.error("Erreur chargement missions", err);
            }
        };
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'tache') {
            const task = tasks.find(t => t.id === parseInt(value));
            setSelectedTask(task || null);
            // Auto-categorize as Mission if task selected
            if (task && formData.categorie !== 'mission') {
                setFormData(prev => ({ ...prev, categorie: 'mission', [name]: value }));
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });
        if (file) data.append('piece_justificative', file);

        try {
            await api.post('finances/depenses/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/expenses');
        } catch (err) {
            console.error(err);
            const errorData = err.response?.data;
            let errorMessage = "Erreur lors de l'enregistrement de la dépense.";

            if (errorData) {
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else {
                    const firstKey = Object.keys(errorData)[0];
                    if (firstKey && Array.isArray(errorData[firstKey])) {
                        errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
                    }
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.financeContainer}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/expenses" className={styles.btnSecondary} style={{ padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className={styles.title}>Nouvelle Dépense</h1>
                        <p style={{ color: '#64748b', marginTop: '4px' }}>Enregistrer un décaissement ou une demande d'achat</p>
                    </div>
                </div>
            </header>

            <div className={styles.tableWrapper} style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>

                    {/* Mission Selection Linked to Auto-Approval */}
                    {tasks.length > 0 && (
                        <div className={styles.formGroup} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Briefcase size={18} /> Lier à une Mission (Optionnel)
                            </label>
                            <select
                                name="tache"
                                value={formData.tache}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                            >
                                <option value="">-- Aucune mission liée --</option>
                                {tasks.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.numero} - {t.titre}
                                    </option>
                                ))}
                            </select>

                            {selectedTask && (
                                <div style={{ marginTop: '12px', fontSize: '0.875rem', color: '#475569' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span>Budget Restant :</span>
                                        <span style={{ fontWeight: '700', color: (selectedTask.budget_restant - total) >= 0 ? '#10b981' : '#ef4444' }}>
                                            {formatCurrency(selectedTask.budget_restant)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: '#eff6ff', borderRadius: '6px', color: '#1e40af' }}>
                                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>
                                            {(selectedTask.budget_restant - total) >= 0
                                                ? "Cette dépense sera automatiquement approuvée si elle respecte le solde."
                                                : "Attention : Cette dépense dépasse le budget de la mission."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Motif / Objet de la dépense</label>
                        <input
                            type="text"
                            name="motif"
                            required
                            placeholder="Ex: Achat de fournitures de bureau"
                            value={formData.motif}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Catégorie</label>
                        <div style={{ position: 'relative' }}>
                            <Tag size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <select
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}
                            >
                                <option value="fonctionnement">Fonctionnement</option>
                                <option value="investissement">Investissement</option>
                                <option value="personnel">Personnel</option>
                                <option value="formation">Formation</option>
                                <option value="mission">Mission</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className={styles.formGroup}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Quantité</label>
                            <input
                                type="number"
                                name="quantite"
                                min="1"
                                required
                                value={formData.quantite}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Prix Unitaire (Ar)</label>
                            <input
                                type="number"
                                name="prix_unitaire"
                                required
                                placeholder="0.00"
                                value={formData.prix_unitaire}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                            <Calculator size={20} />
                            <span style={{ fontWeight: '500' }}>Total calculé :</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            {formatCurrency(total)}
                        </span>
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Justificatif (PDF, Image)</label>
                        <div style={{ position: 'relative' }}>
                            <Upload size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Commentaire / Justification</label>
                        <textarea
                            name="commentaire"
                            required
                            placeholder="Pourquoi cette dépense est-elle nécessaire ?"
                            value={formData.commentaire}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ flex: 1, justifyContent: 'center' }}>
                            {loading ? 'Envoi...' : <><Save size={18} /> Soumettre la demande</>}
                        </button>
                        <Link to="/expenses" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }}>
                            <X size={18} /> Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
