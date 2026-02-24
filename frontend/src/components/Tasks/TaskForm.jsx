import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { Calendar, AlertTriangle, User, CreditCard, Send, PlusCircle, Search, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';

export default function TaskForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useNotifications();
    const queryParams = new URLSearchParams(location.search);

    // Helper to format ISO or Date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        date_debut: formatDateForInput(queryParams.get('start')),
        date_echeance: formatDateForInput(queryParams.get('end')),
        priorite: 'moyenne',
        agents_assignes: [],
        budget_alloue: ''
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('users/');
                const data = res.data.results || res.data;
                const usersData = Array.isArray(data) ? data : [];
                setUsers(usersData);
            } catch (err) {
                console.error("Erreur chargement utilisateurs", err);
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleUser = (userId) => {
        const current = [...formData.agents_assignes];
        const index = current.indexOf(userId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(userId);
        }
        setFormData({ ...formData, agents_assignes: current });
    };

    const getSelectedUsers = () => {
        return users.filter(u => formData.agents_assignes.includes(u.id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = { ...formData };

        try {
            await api.post('tasks/taches/', payload);
            addToast("La mission a été créée avec succès", "success", "Succès");
            navigate('/tasks');
        } catch (err) {
            console.error(err);
            const errorData = err.response?.data;
            let errorMessage = "Erreur lors de la création de la tâche.";

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
            addToast(errorMessage, "error", "Erreur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => navigate('/tasks')}
                    className="text-slate-400 hover:text-red-500"
                >
                    Annuler
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <PlusCircle size={24} className="text-blue-500" />
                        Nouvelle Mission
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Définissez les détails et assignez des agents.</p>
                </div>
            </div>

            {error && (
                <Card className="border-red-100 bg-red-50 border-l-4 border-l-red-500">
                    <CardContent className="p-4 text-red-700 flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span className="font-semibold text-sm">{error}</span>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="h-1.5 w-full bg-blue-600"></div>
                    <CardContent className="p-8 space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Titre de la mission</label>
                                <Input
                                    name="titre"
                                    placeholder="Audit financier Q1, Déplacement sur site..."
                                    value={formData.titre}
                                    onChange={handleChange}
                                    required
                                    className="text-lg font-semibold h-12 bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description détaillée</label>
                                <textarea
                                    name="description"
                                    placeholder="Décrivez les objectifs, les étapes et les livrables attendus pour cette mission..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 outline-none transition-all text-sm min-h-[150px] leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Section 2: Dates & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500" /> Date de début
                                </label>
                                <Input
                                    type="datetime-local"
                                    name="date_debut"
                                    value={formData.date_debut}
                                    onChange={handleChange}
                                    className="bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} className="text-red-500" /> Échéance
                                </label>
                                <Input
                                    type="datetime-local"
                                    name="date_echeance"
                                    value={formData.date_echeance}
                                    onChange={handleChange}
                                    required
                                    className="bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-500" /> Priorité
                                </label>
                                <div className="relative group">
                                    <select
                                        name="priorite"
                                        value={formData.priorite}
                                        onChange={handleChange}
                                        className="w-full px-4 h-11 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-900 appearance-none cursor-pointer"
                                    >
                                        <option value="basse">🟢 Basse</option>
                                        <option value="moyenne">🟡 Moyenne</option>
                                        <option value="haute">🟠 Haute</option>
                                        <option value="urgente">🔴 Urgente</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Assignment */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User size={16} className="text-blue-500" /> Assignation des agents
                                </label>
                                <p className="text-[10px] font-bold text-slate-400 italic">Maintenez Ctrl/Cmd pour sélections multiples</p>
                            </div>

                            <div className="space-y-4">
                                {/* Chips for selected users */}
                                <div className="flex flex-wrap gap-2">
                                    {getSelectedUsers().map(u => (
                                        <div key={u.id} className="flex items-center gap-2 pr-3 pl-1 py-1 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30 animate-in zoom-in-95 duration-200">
                                            <Avatar
                                                src={u.photo_url}
                                                name={u.full_name || u.username}
                                                size="xs"
                                                className="bg-[var(--color-bg-hover)] dark:bg-slate-800"
                                            />
                                            <span className="text-xs font-bold">{u.full_name || u.username}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleUser(u.id)}
                                                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.agents_assignes.length === 0 && (
                                        <p className="text-sm text-slate-400 italic">Aucun agent sélectionné</p>
                                    )}
                                </div>

                                {/* Search and results */}
                                <div className="relative">
                                    <div className="relative group">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                        <Input
                                            placeholder="Rechercher un agent par nom ou rôle..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setShowResults(true);
                                            }}
                                            onFocus={() => setShowResults(true)}
                                            className="pl-12 bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50"
                                        />
                                    </div>

                                    {showResults && searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {users.filter(u => {
                                                    const search = searchTerm.toLowerCase().trim();
                                                    const fullName = (u.full_name || '').toLowerCase();
                                                    const username = (u.username || '').toLowerCase();
                                                    const roleDisplay = (u.role_display || u.role || '').toLowerCase();
                                                    return (fullName.includes(search) || username.includes(search) || roleDisplay.includes(search)) &&
                                                        !formData.agents_assignes.includes(u.id);
                                                }).length > 0 ? (
                                                    users.filter(u => {
                                                        const search = searchTerm.toLowerCase().trim();
                                                        const fullName = (u.full_name || '').toLowerCase();
                                                        const username = (u.username || '').toLowerCase();
                                                        const roleDisplay = (u.role_display || u.role || '').toLowerCase();
                                                        return (fullName.includes(search) || username.includes(search) || roleDisplay.includes(search)) &&
                                                            !formData.agents_assignes.includes(u.id);
                                                    }).map(u => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                toggleUser(u.id);
                                                                setSearchTerm('');
                                                                setShowResults(false);
                                                            }}
                                                            className={`
                                                                flex items-center gap-3 p-3 cursor-pointer transition-all border-b border-[var(--color-border-light)] last:border-0
                                                                ${formData.agents_assignes.includes(u.id)
                                                                    ? 'bg-blue-500/10 dark:bg-blue-500/20'
                                                                    : 'hover:bg-[var(--color-bg-hover)]'
                                                                }
                                                            `}
                                                        >
                                                            <Avatar
                                                                src={u.photo_url}
                                                                name={u.full_name || u.username}
                                                                size="base"
                                                                className="bg-[var(--color-bg-hover)] dark:bg-slate-800"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-[var(--color-text-primary)]">{u.full_name || u.username}</p>
                                                                <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">{u.role}</p>
                                                            </div>
                                                            <PlusCircle size={16} className="text-slate-300" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <p className="text-sm text-slate-400 font-medium italic">Aucun agent trouvé</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Close search results on click outside (simplified for now) */}
                                    {showResults && (
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowResults(false)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Budget */}
                        <div className="pt-6 border-t border-[var(--color-border-light)]">
                            <div className="max-w-xs space-y-2">
                                <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={16} className="text-emerald-500" /> Budget alloué (Ar)
                                </label>
                                <Input
                                    type="number"
                                    name="budget_alloue"
                                    placeholder="Ex: 500000"
                                    value={formData.budget_alloue}
                                    onChange={handleChange}
                                    className="font-mono font-bold text-lg bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 focus:border-emerald-500 focus:ring-emerald-500/10"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <div className="p-8 bg-[var(--color-bg-hover)]/30 flex items-center justify-between border-t border-[var(--color-border-light)]">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/tasks')}
                            type="button"
                            className="text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all font-bold"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            icon={Send}
                            className="px-10 h-12 shadow-xl shadow-blue-500/20"
                        >
                            {loading ? 'Création en cours...' : 'Créer la mission'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div >
    );
}

