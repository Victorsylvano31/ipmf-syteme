import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ClipboardList,
    ArrowRight,
    Activity,
    Clock as ClockIcon,
    CheckCircle,
    Shield,
    Calendar,
    Wallet,
    RefreshCw,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import api from '../api/axios';
import { KpiCard, Skeleton } from './Dashboard/DashboardComponents';

// Import specialized dashboards
import DashboardDG from './Dashboard/DashboardDG';
import DashboardComptable from './Dashboard/DashboardComptable';
import DashboardCaisse from './Dashboard/DashboardCaisse';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!user) return;
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('dashboard/donnees/overview/');
            setData(res.data);
        } catch (err) {
            console.error("Dashboard stats error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchData();
        return () => {
            clearInterval(timer);
        };
    }, [fetchData]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    // Role-based Router Logic
    if (user?.role === 'dg') return <DashboardDG />;
    if (user?.role === 'comptable') return <DashboardComptable />;
    if (user?.role === 'caisse') return <DashboardCaisse />;

    // Default / Admin / Agent Dashboard
    if (loading && !data) {
        return (
            <div className="space-y-8 pb-10">
                <Skeleton className="w-full h-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <KpiCard key={i} loading />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="w-full h-96" />
                    <Skeleton className="w-full h-96" />
                </div>
            </div>
        );
    }

    const kpiIcons = [ClipboardList, CheckCircle, Wallet, Shield];

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header with Decorative Background */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 lg:p-10 shadow-xl">
                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJ6TTM0IDM0djJoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

                <div className="absolute top-0 right-0 p-4 z-20">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchData(true)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''} mr-2`} /> Actualiser
                    </Button>
                </div>

                <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                            Bonjour, {user?.full_name || user?.username} <span className="inline-block animate-bounce-slow">👋</span>
                        </h1>
                        <p className="text-slate-300 font-medium text-lg">Votre espace est prêt. {data?.kpis?.[0]?.value || ''} missions vous attendent.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-lg">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                            <ClockIcon size={28} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white tabular-nums">{formatTime(currentTime)}</p>
                            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{formatDate(currentTime)}</p>
                        </div>
                    </div>
                </header>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.kpis?.map((kpi, idx) => (
                    <KpiCard
                        key={idx}
                        {...kpi}
                        icon={kpiIcons[idx] || Activity}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Dashboard Side Column (4 columns) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* STRATEGIC ALERTS */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Alertes & Rappels</h2>
                        <div className="space-y-3">
                            {data?.strategic_alerts?.length > 0 ? (
                                data.strategic_alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border ${alert.type === 'danger' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'} backdrop-blur-md transition-all hover:translate-x-1`}>
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 p-1.5 rounded-lg h-fit ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <AlertCircle size={16} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-slate-900">{alert.title}</p>
                                                <p className="text-[11px] text-slate-600 leading-tight">{alert.description}</p>
                                                <button
                                                    onClick={() => navigate(alert.action)}
                                                    className={`mt-2 flex items-center text-[10px] font-bold uppercase tracking-widest ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'} hover:gap-2 transition-all`}
                                                >
                                                    Agir <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-emerald-50/20 rounded-2xl border border-emerald-100 border-dashed">
                                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Tout est au vert</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACTIONS or ACCOUNT INFO */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">Mon Compte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                    {(user?.full_name || user?.username || 'U').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || user?.username}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full text-xs font-bold text-slate-600 hover:bg-slate-50" onClick={() => navigate('/profile')}>
                                Gérer mon profil <ArrowRight size={14} className="ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Main Column (8 columns) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* RECENT ACTIVITY */}
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
                            <div>
                                <CardTitle className="text-lg font-bold">Activité Récente</CardTitle>
                                <p className="text-xs text-slate-400 font-medium">Vos dernières interactions avec le système</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} className="text-blue-600 font-bold text-xs">
                                Tout voir
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {data?.recent_activity?.length > 0 ? (
                                    data.recent_activity.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(item.numero ? `/tasks/${item.id}` : '#')}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.statut === 'terminee' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    <ClipboardList size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.titre || item.motif}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{item.numero} • {new Date(item.date_creation || item.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant={item.statut === 'terminee' || item.statut === 'validee' ? 'success' : 'primary'} size="sm" className="font-bold scale-90">
                                                {item.statut}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <p className="text-sm font-medium">Aucune activité récente.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* UPCOMING REMINDERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <Calendar className="text-blue-600 mb-4" size={24} />
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Missions à venir</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Consultez votre calendrier pour ne manquer aucune échéance critique.</p>
                            <Button size="sm" variant="ghost" className="mt-4 p-0 text-blue-600 hover:bg-transparent font-bold h-fit" onClick={() => navigate('/calendar')}>
                                Ouvrir le calendrier <ArrowRight size={14} className="ml-1" />
                            </Button>
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
                            <CheckCircle className="text-emerald-600 mb-4" size={24} />
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Objectifs du mois</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Continuez sur votre lancée. Vous avez déjà accompli 80% de vos tâches.</p>
                            <div className="mt-4 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[80%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
