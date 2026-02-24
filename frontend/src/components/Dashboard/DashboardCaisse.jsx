import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, Clock, CheckCircle, TrendingUp, RefreshCw, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { KpiCard, Skeleton } from './DashboardComponents';

export default function DashboardCaisse() {
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
            console.error("Erreur dashboard caisse", err);
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

    const kpiIcons = [Clock, TrendingUp, Wallet];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Espace Caisse
                    </h1>
                    <p className="text-slate-500 font-medium">Traitement des paiements et gestion de la trésorerie.</p>
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
                    <Link to="/finances" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black font-bold shadow-lg shadow-slate-200 transition-all flex items-center">
                        Module Finance
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data?.kpis?.map((kpi, idx) => (
                    <KpiCard
                        key={idx}
                        {...kpi}
                        icon={kpiIcons[idx] || Wallet}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Payments List (8 columns) */}
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                            <div>
                                <CardTitle className="text-lg font-bold">Paiements à effectuer</CardTitle>
                                <p className="text-xs text-slate-400 font-medium">Demandes validées prêtes au décaissement</p>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Activity size={18} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data?.recent_activity?.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {data.recent_activity.map(expense => (
                                        <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                    {expense.motif?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{expense.motif}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        {expense.numero} • {formatCurrency(expense.montant)} • {formatDate(expense.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/expenses/${expense.id}`}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all font-bold text-xs flex items-center gap-2"
                                            >
                                                Payer <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-emerald-200" />
                                    <p className="font-bold text-slate-600 uppercase text-xs tracking-widest">Caisse à jour</p>
                                    <p className="text-[11px] mt-1">Aucun paiement en attente de décaissement.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Alertes Trésorerie</h2>
                    {data?.strategic_alerts?.length > 0 ? (
                        data.strategic_alerts.map((alert, idx) => (
                            <div key={idx} className={`p-5 rounded-2xl border ${alert.type === 'danger' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'} backdrop-blur-sm`}>
                                <div className="flex gap-4">
                                    <div className={`p-2 rounded-xl h-fit ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{alert.description}</p>
                                        <button
                                            onClick={() => navigate(alert.action)}
                                            className={`mt-3 flex items-center text-[10px] font-black uppercase tracking-widest ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'} hover:gap-2 transition-all`}
                                        >
                                            Consulter <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center bg-emerald-50/30 rounded-2xl border border-emerald-100 border-dashed">
                            <CheckCircle size={24} className="mx-auto mb-2 text-emerald-400" />
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Ressources suffisantes</p>
                        </div>
                    )}

                    <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                        <CardContent className="p-6">
                            <TrendingUp className="text-emerald-400 mb-4" size={24} />
                            <h3 className="text-white font-bold mb-1">Rapport de Caisse</h3>
                            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Générez votre rapport de fin de journée en un clic.</p>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none font-bold text-xs">
                                Imprimer le rapport
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
