import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { formatStatus, formatPriority, formatDate } from '../../utils/formatters';
import { Search, Plus, ChevronRight, User, Calendar, List, Filter, Download } from 'lucide-react';
import TasksCalendar from './TasksCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';

export default function TasksList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('tous');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('tasks/taches/');
                const data = res.data.results || res.data;
                setTasks(data);
                setFilteredTasks(data);
            } catch (err) {
                console.error("Erreur chargement tâches", err);
                setError("Impossible de charger les tâches.");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        let result = tasks;
        if (searchTerm) {
            result = result.filter(t =>
                t.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.numero?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'tous') {
            result = result.filter(t => t.statut === statusFilter);
        }
        setFilteredTasks(result);
    }, [searchTerm, statusFilter, tasks]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get('tasks/taches/export_csv/', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `missions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export error", err);
            alert("Erreur lors de l'exportation CSV");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <Card className="border-red-100 bg-red-50">
            <CardContent className="p-6 text-red-600 flex items-center gap-2">
                <span className="font-bold">Erreur:</span> {error}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Liste des Missions</h1>
                        <p className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide">Gérez et suivez l'avancement de vos tâches.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button variant="secondary" onClick={handleExportCSV} className="gap-2">
                            <Download size={18} />
                            <span>Exporter CSV</span>
                        </Button>
                        {/* View Toggle - Moved inside the same row for better desktop visibility */}
                        <div className="inline-flex bg-[var(--color-bg-hover)] p-1 rounded-xl border border-[var(--color-border)] shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list'
                                    ? 'bg-[var(--color-bg-card)] text-blue-600 shadow-sm'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                <List size={16} />
                                <span>Liste</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'calendar'
                                    ? 'bg-[var(--color-bg-card)] text-blue-600 shadow-sm'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                    }`}
                            >
                                <Calendar size={16} />
                                <span>Calendrier</span>
                            </button>
                        </div>

                        {['admin', 'dg'].includes(user?.role?.toLowerCase()) && (
                            <Link to="/tasks/new">
                                <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10">
                                    <Plus size={18} />
                                    <span>Nouvelle Mission</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="shadow-sm border-[var(--color-border-light)] overflow-visible">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher par titre ou numéro..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--color-bg-hover)] border-[var(--color-border-light)]"
                        />
                    </div>
                    <div className="md:w-64">
                        <div className="relative group">
                            <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-blue-500 transition-colors z-10" />
                            <select
                                className="w-full pl-11 pr-4 h-[42px] bg-[var(--color-bg-hover)] border border-[var(--color-border-light)] rounded-xl focus:ring-4 focus:ring-blue-100/20 focus:border-blue-500 outline-none transition-all text-sm text-[var(--color-text-primary)] appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="tous">Tous les statuts</option>
                                <option value="creee">Nouveau</option>
                                <option value="en_cours">En cours</option>
                                <option value="terminee">Terminé</option>
                                <option value="validee">Validé</option>
                                <option value="annulee">Annulé</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {viewMode === 'list' ? (
                <Card className="shadow-sm border-[var(--color-border-light)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-bg-hover)] border-b border-[var(--color-border)]">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Numéro</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Mission</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Priorité</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Échéance</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Assigné</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-light)]">
                                {filteredTasks.map(task => {
                                    const statusStyle = formatStatus(task.statut);

                                    return (
                                        <tr key={task.id} className={`group hover:bg-blue-500/5 transition-colors ${task.est_en_retard ? 'bg-red-500/5' : ''}`}>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-[var(--color-text-secondary)] font-mono text-sm">{task.numero}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-blue-500 transition-colors line-clamp-1">{task.titre}</span>
                                                    {task.est_en_retard && (
                                                        <span className="inline-flex mt-1">
                                                            <Badge variant="danger" size="sm" className="px-1.5 py-0 text-[10px]">RETARD</Badge>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={task.priorite === 'urgente' ? 'danger' : task.priorite === 'haute' ? 'accent' : 'primary'}
                                                    className="font-bold tracking-tight"
                                                >
                                                    {task.priorite.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset"
                                                    style={{
                                                        backgroundColor: `${statusStyle.bg}20`,
                                                        color: statusStyle.color,
                                                        borderColor: `${statusStyle.color}40`,
                                                        boxShadow: `0 0 10px ${statusStyle.color}10`
                                                    }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.color }}></div>
                                                    {statusStyle.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${task.est_en_retard ? 'text-red-500 font-bold' : 'text-[var(--color-text-secondary)]'}`}>
                                                    {formatDate(task.date_echeance)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.agents_assignes_names?.length > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            src={task.agents_assignes_photos?.[0]}
                                                            name={task.agents_assignes_names[0]}
                                                            size="base"
                                                        />
                                                        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                                            {task.agents_assignes_names.length === 1
                                                                ? task.agents_assignes_names[0]
                                                                : `${task.agents_assignes_names[0]} + ${task.agents_assignes_names.length - 1}`}
                                                        </span>
                                                    </div>
                                                ) : <span className="text-[var(--color-text-muted)] text-sm italic">Non assigné</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/tasks/${task.id}`}>
                                                    <Button variant="outline" size="sm" icon={ChevronRight}>Détails</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredTasks.length === 0 && (
                        <div className="py-12 text-center bg-[var(--color-bg-hover)] border-t border-[var(--color-border)]">
                            <p className="text-[var(--color-text-muted)] font-medium">Aucune mission ne correspond à vos critères.</p>
                        </div>
                    )}
                </Card>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <TasksCalendar tasks={filteredTasks} />
                </div>
            )}
        </div>
    );
}

