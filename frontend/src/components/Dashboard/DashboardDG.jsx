import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    TrendingUp,
    TrendingDown,
    ClipboardList,
    Wallet,
    AlertCircle,
    ArrowUpRight,
    Search,
    CheckCircle,
    Clock,
    User,
    ChevronRight,
    Activity,
    RefreshCw,
    Percent
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { KpiCard, Skeleton } from './DashboardComponents';

export default function DashboardDG() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('dashboard/donnees/overview/');
            setData(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Erreur dashboard DG", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Polling every 5 minutes
        const interval = setInterval(() => fetchData(true), 300000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading && !data) return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="w-64 h-8" />
                    <Skeleton className="w-48 h-4" />
                </div>
                <Skeleton className="w-32 h-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <KpiCard key={i} loading />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Skeleton className="w-full h-[400px]" />
                    <Skeleton className="w-full h-[300px]" />
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <Skeleton className="w-full h-[500px]" />
                </div>
            </div>
        </div>
    );

    const kpiIcons = [ClipboardList, Wallet, TrendingUp, Percent];

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Header Stratégique */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Tableau de Bord Stratégique</h1>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)] text-sm font-medium">
                        <span className="flex items-center gap-1.5 bg-[var(--color-bg-hover)] border border-[var(--color-border-light)] px-2 py-0.5 rounded-md">
                            <Activity size={14} className="text-blue-500" /> Pilotage opérationnel
                        </span>
                        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                            <Clock size={14} /> Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {refreshing && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => fetchData(true)}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''} mr-2`} /> Actualiser
                    </Button>
                    <Button onClick={() => navigate('/audit')} className="bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] font-bold shadow-lg shadow-blue-500/10">
                        <Activity size={18} className="mr-2" /> Journal Audit
                    </Button>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {data?.kpis?.map((kpi, idx) => (
                    <KpiCard
                        key={idx}
                        {...kpi}
                        icon={kpiIcons[idx] || Activity}
                    />
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Evolution & Cashflow (8 columns) */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-sm bg-[var(--color-bg-card)] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)]">Évolution du Cashflow</CardTitle>
                                <p className="text-xs text-[var(--color-text-muted)] font-medium">Analyse des flux réels sur 30 jours</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="success" className="animate-pulse">Live</Badge>
                                <Badge variant="outline">Ariary (Ar)</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[320px] mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.charts?.cashflow_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--color-text-muted)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-muted)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-bg-card)',
                                            borderRadius: '16px',
                                            border: '1px solid var(--color-border)',
                                            boxShadow: 'var(--shadow-xl)',
                                            padding: '12px',
                                            color: 'var(--color-text-primary)'
                                        }}
                                        itemStyle={{
                                            color: 'var(--color-text-primary)',
                                            fontWeight: 'bold'
                                        }}
                                        cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                                        formatter={(v) => [formatCurrency(v), 'Flux Cash']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="valeur"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCashflow)"
                                        animationBegin={200}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Mission Budget Analysis */}
                    <Card className="border-none shadow-sm bg-[var(--color-bg-card)]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-[var(--color-text-primary)]">Surveillance Budget Missions</CardTitle>
                                <p className="text-xs text-[var(--color-text-muted)] font-medium">Ratio de consommation des budgets alloués</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider">
                                Tout voir <ArrowUpRight size={14} className="ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data?.charts?.budget_distribution?.map(mission => (
                                <div
                                    key={mission.id}
                                    className="group cursor-pointer p-2 -m-2 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors"
                                    onClick={() => navigate(`/tasks/${mission.id}`)}
                                >
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">{mission.titre}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">{mission.numero}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${mission.percent > 90 ? 'text-red-600' : 'text-[var(--color-text-primary)]'}`}>{mission.percent}%</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] font-medium">{formatCurrency(mission.spent)} / {formatCurrency(mission.budget)}</p>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-[var(--color-bg-hover)] rounded-full overflow-hidden border border-[var(--color-border-light)]">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out relative ${mission.percent > 100 ? 'bg-red-500' : mission.percent > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(mission.percent, 100)}%` }}
                                        >
                                            {mission.percent > 80 && (
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts & Activity (4 columns) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* ACTION CENTER */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Alertes Stratégiques</h2>
                            {data?.strategic_alerts?.length > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-red-500" />
                            )}
                        </div>
                        {data?.strategic_alerts?.length > 0 ? (
                            data.strategic_alerts.map((alert, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl border ${alert.type === 'danger' ? 'bg-red-50/40 dark:bg-red-500/10 border-red-100 dark:border-red-900/30' : 'bg-orange-50/40 dark:bg-orange-500/10 border-orange-100 dark:border-orange-900/30'} backdrop-blur-sm transition-all hover:translate-x-1`}>
                                    <div className="flex gap-4">
                                        <div className={`mt-0.5 p-2 rounded-xl h-fit ${alert.type === 'danger' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                                            <AlertCircle size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[var(--color-text-primary)]">{alert.title}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">{alert.description}</p>
                                            <button
                                                onClick={() => navigate(alert.action)}
                                                className={`mt-3 flex items-center text-[10px] font-black uppercase tracking-widest ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'} hover:gap-2 transition-all`}
                                            >
                                                Intervenir <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center bg-emerald-50/20 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 border-dashed backdrop-blur-sm">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={24} />
                                </div>
                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Opérations au vert</p>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1 font-medium">Aucune anomalie détectée</p>
                            </div>
                        )}
                    </div>

                    {/* ACTIVITY FEED */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] px-1">Flux d'Activité</h2>
                        <Card className="border-none shadow-sm overflow-hidden bg-[var(--color-bg-card)]">
                            <div className="divide-y divide-slate-50">
                                {data?.recent_activity?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 flex gap-4 hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer group"
                                        onClick={() => navigate(item.type === 'task' ? '/tasks' : '/expenses')}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.type === 'task' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500'}`}>
                                            {item.type === 'task' ? <ClipboardList size={18} /> : <Wallet size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</p>
                                            </div>
                                            <p className="text-[11px] text-[var(--color-text-muted)] font-semibold mt-0.5 truncate">{item.subtitle}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant={item.status === 'validee' || item.status === 'payee' ? 'success' : 'primary'} className="scale-90 origin-left font-black tracking-tighter uppercase whitespace-nowrap">{item.status}</Badge>
                                                <span className="text-[10px] text-[var(--color-text-muted)] font-medium whitespace-nowrap"><Clock size={10} className="inline mr-1" />{new Date(item.time).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Button
                            variant="ghost"
                            className="w-full text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] group"
                            onClick={() => navigate('/audit')}
                        >
                            Consulter l'historique complet <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
