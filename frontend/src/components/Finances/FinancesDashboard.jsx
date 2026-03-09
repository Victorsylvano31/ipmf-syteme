import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardComptable from '../Dashboard/DashboardComptable';
import DashboardCaisse from '../Dashboard/DashboardCaisse';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Receipt,
    ChevronRight,
    Plus
} from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import styles from './Finances.module.css';

export default function FinancesDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Use analytics endpoint to get correct overall totals (avoids pagination issues)
                const response = await api.get('finances/analytics/');
                const { overall_totals } = response.data;

                setStats({
                    totalIncome: overall_totals.total_entrees,
                    totalExpenses: overall_totals.total_depenses,
                    balance: overall_totals.solde,
                    loading: false
                });
            } catch (err) {
                console.error("Error fetching finance stats:", err);
                setStats(s => ({ ...s, loading: false }));
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.financeContainer}>
            {/* Premium Strategic Banner */}
            <div className="relative overflow-hidden rounded-[32px] bg-slate-900 bg-mesh-slate p-10 lg:p-12 shadow-2xl animate-slide-up border border-white/10 mb-10">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                <div className="absolute top-0 right-0 p-6 z-20 flex flex-wrap gap-3 justify-end items-center">
                    <Link to="/expenses/new">
                        <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-md rounded-full px-6 border border-white/5 font-bold text-xs uppercase tracking-widest h-11">
                            <Plus size={18} className="mr-2" />
                            <span>Dépense</span>
                        </Button>
                    </Link>
                    <Link to="/finances/incomes/new">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xl shadow-emerald-600/20 font-black rounded-full px-8 py-2.5 h-11 text-[11px] uppercase tracking-widest group">
                            <ArrowUpCircle size={20} className="mr-2 group-hover:translate-y--0.5 transition-transform" />
                            <span>Enregistrer Entrée</span>
                        </Button>
                    </Link>
                </div>

                <header className="relative z-10 flex flex-col justify-center min-h-[140px]">
                    <div className="space-y-4">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-xl px-4 py-1.5 font-black tracking-[0.2em] uppercase text-[10px] w-fit">
                            PILOTAGE FINANCIER
                        </Badge>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                            Gestion <span className="text-blue-400">Financière</span>
                        </h1>
                        <p className="text-white/70 font-semibold text-lg max-w-2xl leading-relaxed">
                            Orchestration des flux de trésorerie et analyse de la performance budgétaire.
                        </p>
                    </div>
                </header>
            </div>

            {/* Role-Based Action Sections */}
            <div style={{ marginBottom: '32px' }}>
                {['comptable', 'admin'].includes(user?.role) && <DashboardComptable />}
                {['caisse', 'admin'].includes(user?.role) && <DashboardCaisse />}
            </div>

            <div className={`${styles.statsGrid} animate-slide-up stagger-1`}>
                <div className={`${styles.statCard} premium-card soft-glow-blue`}>
                    <div className={`${styles.statIcon} ${styles.incomeIcon}`} style={{ boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.1)' }}>
                        <ArrowUpCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Entrées</span>
                        <span className={styles.statValue} style={{ fontSize: '1.75rem' }}>
                            {stats.loading ? '...' : formatCurrency(stats.totalIncome)}
                        </span>
                    </div>
                </div>

                <div className={`${styles.statCard} premium-card`}>
                    <div className={`${styles.statIcon} ${styles.expenseIcon}`} style={{ boxShadow: 'inset 0 0 10px rgba(239, 68, 68, 0.1)' }}>
                        <ArrowDownCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Dépenses</span>
                        <span className={styles.statValue} style={{ fontSize: '1.75rem' }}>
                            {stats.loading ? '...' : formatCurrency(stats.totalExpenses)}
                        </span>
                    </div>
                </div>

                <div className={`${styles.statCard} premium-card soft-glow-blue`}>
                    <div className={`${styles.statIcon} ${styles.balanceIcon}`} style={{ boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.1)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Solde Actuel</span>
                        <span className={`${styles.statValue} ${stats.balance >= 0 ? styles.amountPositive : styles.amountNegative}`} style={{ fontSize: '1.75rem' }}>
                            {stats.loading ? '...' : formatCurrency(stats.balance)}
                        </span>
                    </div>
                </div>
            </div>

            <h2 className={`${styles.sectionTitle} animate-slide-up stagger-2`} style={{ marginTop: '40px', fontSize: '1.5rem', opacity: '0.9' }}>Modules Financiers</h2>

            <div className={`${styles.cardGrid} animate-slide-up stagger-3`}>
                <Link to="/finances/incomes" className={`${styles.navCard} premium-card group`}>
                    <div className={styles.navCardIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <ArrowUpCircle size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className={styles.navCardTitle}>
                            Flux de Trésorerie (Entrées)
                            <span className={styles.activeBadge}>Actif</span>
                        </div>
                        <p className={styles.navCardDesc}>
                            Suivez toutes les recettes, paiements de clients et injections de fonds.
                        </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#10b981', fontWeight: '700', fontSize: '0.8125rem', gap: '4px' }} className="group-hover:gap-2 transition-all">
                        Voir les détails <ChevronRight size={14} />
                    </div>
                </Link>

                <Link to="/expenses" className={`${styles.navCard} premium-card group`}>
                    <div className={styles.navCardIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <ArrowDownCircle size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className={styles.navCardTitle}>Gestion des Dépenses</div>
                        <p className={styles.navCardDesc}>
                            Suivi des coûts opérationnels, salaires, achats et frais de mission.
                        </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#ef4444', fontWeight: '700', fontSize: '0.8125rem', gap: '4px' }} className="group-hover:gap-2 transition-all">
                        Voir les détails <ChevronRight size={14} />
                    </div>
                </Link>

                <Link to="/finances/analytics" className={`${styles.navCard} premium-card group`}>
                    <div className={styles.navCardIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Receipt size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <div className={styles.navCardTitle}>Budgets & Rapports</div>
                        <p className={styles.navCardDesc}>
                            Analyse prévisionnelle et rapports financiers mensuels.
                        </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: '700', fontSize: '0.8125rem', gap: '4px' }} className="group-hover:gap-2 transition-all">
                        Voir les analyses <ChevronRight size={14} />
                    </div>
                </Link>
            </div>
        </div>
    );
}
