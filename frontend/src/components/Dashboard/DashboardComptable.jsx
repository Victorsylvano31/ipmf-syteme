import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, CheckCircle, Clock, Wallet, TrendingUp, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { KpiCard, Skeleton } from './DashboardComponents';

export default function DashboardComptable() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('dashboard/donnees/overview/');
            setData(res.data);
        } catch (err) {
            console.error("Erreur dashboard comptable", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data) return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <KpiCard key={i} loading />)}
            </div>
            <Skeleton className="w-full h-96" />
        </div>
    );

    const kpiIcons = [AlertCircle, TrendingUp, Wallet];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Espace Comptable
                    </h1>
                    <p className="text-slate-500 font-medium">Gestion et vérification des flux financiers.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => fetchData(true)}
                        className="bg-white border border-slate-200 text-slate-600"
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''} mr-2`} /> Actualiser
                    </Button>
                    <Link to="/expenses" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black font-bold shadow-lg shadow-slate-200 transition-all flex items-center">
                        Toutes les dépenses
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data?.kpis?.map((kpi, idx) => (
                    <KpiCard
                        key={idx}
                        {...kpi}
                        icon={kpiIcons[idx] || ClipboardList}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Verification List (8 columns) */}
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                            <div>
                                <CardTitle className="text-lg font-bold">Demandes en attente</CardTitle>
                                <p className="text-xs text-slate-400 font-medium">Nécessitent votre vérification de conformité</p>
                            </div>
                            <Badge variant="primary">{data?.recent_activity?.length || 0}</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data?.recent_activity?.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {data.recent_activity.map(expense => (
                                        <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {expense.motif?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{expense.motif}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        {expense.numero} • {formatCurrency(expense.montant)} • {formatDate(expense.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/expenses/${expense.id}`}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-bold text-xs flex items-center gap-2"
                                            >
                                                Vérifier <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-emerald-200" />
                                    <p className="font-bold text-slate-600 uppercase text-xs tracking-widest">Tout est à jour !</p>
                                    <p className="text-[11px] mt-1">Aucune demande en attente de vérification.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Strategic Alerts (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Alertes prioritaires</h2>
                    {data?.strategic_alerts?.length > 0 ? (
                        data.strategic_alerts.map((alert, idx) => (
                            <div key={idx} className="p-5 rounded-2xl border border-orange-100 bg-orange-50/50 backdrop-blur-sm">
                                <div className="flex gap-4">
                                    <div className="p-2 rounded-xl bg-orange-100 text-orange-600 h-fit">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{alert.description}</p>
                                        <button
                                            onClick={() => navigate(alert.action)}
                                            className="mt-3 flex items-center text-[10px] font-black uppercase tracking-widest text-orange-600 hover:gap-2 transition-all"
                                        >
                                            Intervenir <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center bg-emerald-50/30 rounded-2xl border border-emerald-100 border-dashed">
                            <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Opérations fluides</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
