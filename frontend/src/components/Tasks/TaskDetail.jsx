import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { notificationService } from '../../services/notificationService';
import { formatStatus, formatPriority, formatDate } from '../../utils/formatters';
import {
    User,
    AlignLeft,
    Activity,
    Play,
    CheckCircle,
    XCircle,
    FileText,
    ArrowLeft,
    MessageSquare,
    Paperclip,
    PlusCircle,
    Wallet,
    CalendarClock,
    AlertTriangle,
    Clock,
    ChevronRight,
    Calendar,
    Send,
    ListChecks,
    Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';

export default function TaskDetail() {
    const { user } = useAuth();
    const [attachment, setAttachment] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [resultResult, setResultResult] = useState('');
    const { refresh: fetchNotifications } = useNotifications();
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDate, setReportDate] = useState('');
    const [reportMotif, setReportMotif] = useState('');
    const [newSubTask, setNewSubTask] = useState('');
    const [subTaskAssignee, setSubTaskAssignee] = useState('');

    const fetchTask = useCallback(async () => {
        try {
            const res = await api.get(`tasks/taches/${id}/`);
            setTask(res.data);
            // Marquer les notifications liées comme lues
            await notificationService.markRelatedAsRead(`/tasks/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error(err);
            setError("Impossible de charger la tâche.");
        } finally {
            setLoading(false);
        }
    }, [id, fetchNotifications]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    const handleAction = async (action) => {
        try {
            let payload;
            if (action === 'terminer' || action === 'valider') {
                payload = new FormData();
                payload.append('commentaire', comment);
                if (action === 'terminer') {
                    payload.append('resultat', resultResult);
                }
                if (attachment) {
                    payload.append('attachment', attachment);
                }
                await api.post(`tasks/taches/${id}/${action}/`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                payload = { commentaire: comment };
                await api.post(`tasks/taches/${id}/${action}/`, payload);
            }
            fetchTask();
            setComment('');
            setResultResult('');
            setAttachment(null);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'action : " + (err.response?.data?.error || err.message));
        }
    };

    const handleRequestReport = async () => {
        try {
            await api.post('tasks/demandes-report/', {
                tache: id,
                date_demandee: reportDate,
                motif: reportMotif
            });
            setShowReportModal(false);
            setReportDate('');
            setReportMotif('');
            fetchTask();
            alert("Demande de report envoyée avec succès.");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la demande : " + (err.response?.data?.error || err.message));
        }
    };

    const handleAddSubTask = async () => {
        if (!newSubTask.trim()) return;
        try {
            await api.post('tasks/sous-taches/', {
                tache: id,
                titre: newSubTask,
                assigne_a: subTaskAssignee || undefined
            });
            setNewSubTask('');
            setSubTaskAssignee('');
            fetchTask();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout de la sous-tâche.");
        }
    };

    const handleToggleSubTask = async (subTaskId) => {
        try {
            await api.post(`tasks/sous-taches/${subTaskId}/toggle/`);
            fetchTask();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSubTask = async (subTaskId) => {
        if (!window.confirm("Supprimer cette sous-tâche ?")) return;
        try {
            await api.delete(`tasks/sous-taches/${subTaskId}/`);
            fetchTask();
        } catch (err) {
            console.error(err);
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
                <AlertTriangle size={20} />
                <span className="font-bold">Erreur:</span> {error}
            </CardContent>
        </Card>
    );

    if (!task) return null;

    const statusStyle = formatStatus(task.statut);
    const isAdminOrDG = ['admin', 'dg'].includes(user?.role);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowLeft}
                    onClick={() => navigate('/tasks')}
                    className="text-slate-500 hover:text-blue-600"
                >
                    Retour à la liste
                </Button>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={task.priorite === 'urgente' ? 'danger' : task.priorite === 'haute' ? 'accent' : 'primary'}
                        className="px-3 py-1 font-bold text-xs uppercase"
                    >
                        Priorité {task.priorite}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mission Overview */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="h-1.5 w-full bg-blue-600"></div>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-[0.1em] mb-2">
                                <FileText size={14} />
                                <span>Mission {task.numero}</span>
                            </div>
                            <CardTitle className="text-3xl font-extrabold text-slate-900 leading-tight">
                                {task.titre}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                                    <AlignLeft size={16} className="text-blue-500" />
                                    <span>Description & Objectifs</span>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                                    {task.description}
                                </div>
                            </div>

                            {/* Sub-tasks Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                                        <ListChecks size={16} className="text-blue-500" />
                                        <span>Liste de contrôle (Sous-tâches)</span>
                                    </div>
                                    <Badge variant="primary" className="bg-blue-50 text-blue-600 border-blue-100">
                                        {task.sous_taches?.filter(st => st.est_terminee).length || 0} / {task.sous_taches?.length || 0}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {task.sous_taches?.map((st) => (
                                        <div key={st.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl group hover:shadow-sm transition-all">
                                            <input
                                                type="checkbox"
                                                checked={st.est_terminee}
                                                onChange={() => handleToggleSubTask(st.id)}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className={`flex-1 text-sm font-medium ${st.est_terminee ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {st.titre}
                                            </span>
                                            {st.assigne_a_name && (
                                                <Badge size="sm" className="bg-slate-100 text-slate-500 text-[10px]">
                                                    {st.assigne_a_name}
                                                </Badge>
                                            )}
                                            {(isAdminOrDG || task.createur === user?.id) && (
                                                <button
                                                    onClick={() => handleDeleteSubTask(st.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nouvelle étape..."
                                                value={newSubTask}
                                                onChange={e => setNewSubTask(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleAddSubTask()}
                                                className="flex-1 h-10 text-sm"
                                            />
                                            <Button
                                                size="sm"
                                                icon={PlusCircle}
                                                onClick={handleAddSubTask}
                                                disabled={!newSubTask.trim()}
                                            >
                                                Ajouter
                                            </Button>
                                        </div>
                                        <select
                                            value={subTaskAssignee}
                                            onChange={e => setSubTaskAssignee(e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        >
                                            <option value="">Assigner à... (Optionnel)</option>
                                            {task.agents_assignes?.map((agentId, idx) => (
                                                <option key={agentId} value={agentId}>
                                                    {task.agents_assignes_names?.[idx]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Workflow Actions */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wider mb-4">
                                    <Activity size={16} className="text-blue-500" />
                                    <span>Actions & Workflow</span>
                                </div>

                                <div className="space-y-4">
                                    {task.peut_demarrer && (
                                        <Card className="bg-blue-50 border-blue-100 shadow-none">
                                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <p className="font-semibold text-blue-900 text-sm">Prêt à commencer le travail ?</p>
                                                <Button icon={Play} onClick={() => handleAction('demarrer')} className="shadow-lg shadow-blue-500/20">
                                                    Démarrer la mission
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {task.peut_terminer && (
                                        <Card className="bg-emerald-50 border-emerald-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                <p className="font-semibold text-emerald-900 text-sm">Veuillez soumettre votre rapport final :</p>
                                                <textarea
                                                    placeholder="Décrivez les résultats, accomplissements et livrables..."
                                                    value={resultResult}
                                                    onChange={e => setResultResult(e.target.value)}
                                                    className="w-full p-4 bg-white border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm min-h-[120px]"
                                                />
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase mb-2">
                                                            <Paperclip size={14} /> Pièce jointe (Optionnel)
                                                        </label>
                                                        <input
                                                            type="file"
                                                            onChange={e => setAttachment(e.target.files[0])}
                                                            className="text-xs text-emerald-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                                                        />
                                                    </div>
                                                    <Button variant="success" icon={CheckCircle} onClick={() => handleAction('terminer')} className="shadow-lg shadow-emerald-500/20">
                                                        Transmettre pour Validation
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {task.peut_valider && isAdminOrDG && (
                                        <Card className="bg-blue-50 border-blue-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                <p className="font-semibold text-blue-900 text-sm">Vérification de la conformité du travail :</p>
                                                <textarea
                                                    placeholder="Commentaire d'approbation ou remarques..."
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    className="w-full p-4 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm min-h-[80px]"
                                                />
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                                                    <div className="flex-1">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase mb-2">
                                                            <Paperclip size={14} /> Preuve de validation (Optionnel)
                                                        </label>
                                                        <input
                                                            type="file"
                                                            onChange={e => setAttachment(e.target.files[0])}
                                                            className="text-xs text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="success" icon={CheckCircle} onClick={() => handleAction('valider')}>Approuver</Button>
                                                        <Button variant="danger" icon={XCircle} onClick={() => handleAction('annuler')}>Rejeter</Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {!task.peut_demarrer && !task.peut_terminer && (!task.peut_valider || !isAdminOrDG) && (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-medium italic">
                                            En attente de la prochaine étape du workflow...
                                        </div>
                                    )}
                                </div>

                                {/* Overdue Handling */}
                                {(task.est_en_retard || (task.statut === 'terminee' && task.resultat === 'ECHEC_AUTOMATIQUE')) && (
                                    <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                                        <div className="flex items-center gap-3 text-red-700">
                                            <AlertTriangle size={24} className="animate-pulse" />
                                            <div>
                                                <p className="font-bold text-lg">Problème de délai détecté</p>
                                                <p className="text-sm opacity-80">La mission est en retard ou en échec. Un report est nécessaire.</p>
                                            </div>
                                        </div>

                                        {task.pending_report ? (
                                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-red-100">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-900">Demande de report en attente</p>
                                                    <p className="text-xs text-slate-500">Pour le : {new Date(task.pending_report.date_demandee).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="danger"
                                                icon={CalendarClock}
                                                onClick={() => setShowReportModal(true)}
                                                className="w-full shadow-lg shadow-red-500/20"
                                            >
                                                Demander un report (Dérogation)
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline & Activity */}
                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardHeader className="border-b border-slate-50 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-500" />
                                Historique & Commentaires
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {task.messages?.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-100">
                                    {task.messages.map((msg, idx) => (
                                        <div key={idx} className="relative pl-10 group">
                                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-500 transition-colors z-10 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-800 text-sm">{msg.author}</span>
                                                    <Badge variant="primary" size="sm" className="bg-slate-100 text-slate-500 text-[10px]">Action</Badge>
                                                </div>
                                                <div className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 leading-relaxed font-medium">
                                                    {msg.text}
                                                </div>
                                                {msg.attachment && (
                                                    <a
                                                        href={msg.attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Paperclip size={12} />
                                                        Voir la pièce jointe
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-medium italic">
                                    Aucune activité enregistrée pour le moment.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Status Overview Card */}
                    <Card className="border-none shadow-lg shadow-slate-200/50 text-center">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Statut Actuel</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 px-6">
                            <div
                                className="p-5 rounded-2xl ring-1 ring-inset shadow-inner overflow-hidden relative"
                                style={{
                                    backgroundColor: `${statusStyle.bg}15`,
                                    color: statusStyle.color,
                                    borderColor: `${statusStyle.color}30`
                                }}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: statusStyle.color }}></div>
                                    <span className="text-xl font-black uppercase tracking-tight">{statusStyle.label}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Info Card */}
                    <Card className="border-none shadow-lg shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clock size={16} className="text-blue-500" />
                                Informations Clés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                <div className="p-5 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">Échéance</p>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-bold ${task.est_en_retard ? 'text-red-600' : 'text-slate-900'}`}>{formatDate(task.date_echeance)}</p>
                                        <Calendar size={16} className="text-slate-300" />
                                    </div>
                                </div>
                                <div className="p-5 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">Budget Alloué</p>
                                    <div className="flex items-center justify-between text-[var(--color-text-primary)]">
                                        <p className="text-lg font-black">{task.budget_alloue ? task.budget_alloue.toLocaleString() + ' Ar' : '-'}</p>
                                        <Wallet size={16} className="text-slate-300" />
                                    </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">Équipe Assignée</p>
                                    <div className="space-y-2">
                                        {task.agents_assignes_names?.length > 0 ? (
                                            task.agents_assignes_names.map((name, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-bg-hover)]/50 dark:bg-slate-800/40 border border-[var(--color-border-light)] group hover:bg-[var(--color-bg-card)] hover:shadow-md transition-all">
                                                    <Avatar
                                                        src={task.agents_assignes_photos?.[idx]}
                                                        name={name}
                                                        size="base"
                                                    />
                                                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Aucun agent assigné</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Extra Stats */}
                    {(task.date_debut_reelle || task.date_fin_reelle) && (
                        <Card className="border-none shadow-lg shadow-slate-200/50 bg-slate-900 text-white">
                            <CardContent className="p-6 space-y-4">
                                {task.date_debut_reelle && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Commencé le</p>
                                        <p className="text-sm font-semibold">{new Date(task.date_debut_reelle).toLocaleString('fr-FR')}</p>
                                    </div>
                                )}
                                {task.date_fin_reelle && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Terminé le</p>
                                        <p className="text-sm font-semibold">{new Date(task.date_fin_reelle).toLocaleString('fr-FR')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Financial Action */}
                    {task.statut === 'en_cours' && (
                        <Card className="bg-indigo-600 border-none shadow-xl shadow-indigo-500/20 text-white">
                            <CardContent className="p-6 space-y-4 text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                                    <Wallet size={24} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold">Besoin de fonds ?</p>
                                    <p className="text-xs opacity-70">Créez une demande de budget pour cette mission.</p>
                                </div>
                                <Button
                                    className="w-full bg-white text-indigo-600 hover:bg-slate-50 border-none font-bold"
                                    onClick={() => navigate('/expenses/new', {
                                        state: {
                                            motif: `Frais pour : ${task.titre} (${task.numero})`,
                                            categorie: 'mission',
                                            task_id: task.id
                                        }
                                    })}
                                >
                                    Faire une demande
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {task.pending_report && isAdminOrDG && (
                <div className="fixed bottom-8 right-8 z-50 max-w-sm w-full animate-in slide-in-from-right-8 duration-500">
                    <Card className="bg-slate-900 border-none shadow-2xl text-white">
                        <CardHeader className="pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-amber-500" />
                                <CardTitle className="text-sm text-white font-bold tracking-tight">Report demandé</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        src={task.pending_report.demandeur_photo}
                                        name={task.pending_report.demandeur_name}
                                        size="base"
                                    />
                                    <span className="text-xs font-bold">{task.pending_report.demandeur_name}</span>
                                </div>
                                <p className="text-xs text-slate-400 italic bg-[var(--color-bg-hover)] p-3 rounded-lg border border-[var(--color-border-light)] line-clamp-2">
                                    "{task.pending_report.motif}"
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">
                                    Cible: {new Date(task.pending_report.date_demandee).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Button size="sm" variant="success" className="text-[10px] h-8" onClick={async () => {
                                    if (!window.confirm("Approuver ce report ?")) return;
                                    try {
                                        await api.post(`tasks/demandes-report/${task.pending_report.id}/approuver/`);
                                        fetchTask();
                                    } catch (e) { console.error(e); }
                                }}>Approuver</Button>
                                <Button size="sm" variant="danger" className="text-[10px] h-8" onClick={async () => {
                                    if (!window.confirm("Rejeter ce report ?")) return;
                                    try {
                                        await api.post(`tasks/demandes-report/${task.pending_report.id}/rejeter/`);
                                        fetchTask();
                                    } catch (e) { console.error(e); }
                                }}>Rejeter</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de demande de report */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border-none animate-in zoom-in-95 duration-300">
                        <CardHeader>
                            <CardTitle className="text-xl">Demande de Report</CardTitle>
                            <CardDescription>Expliquez pourquoi le délai n'a pas été respecté.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nouvelle échéance</label>
                                <Input
                                    type="datetime-local"
                                    value={reportDate}
                                    onChange={e => setReportDate(e.target.value)}
                                    className="bg-slate-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Motif / Justification</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm min-h-[120px]"
                                    value={reportMotif}
                                    onChange={e => setReportMotif(e.target.value)}
                                    placeholder="Détaillez les raisons du retard..."
                                />
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-slate-50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowReportModal(false)}>Annuler</Button>
                            <Button icon={Send} onClick={handleRequestReport} disabled={!reportDate || !reportMotif}>Envoyer</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
