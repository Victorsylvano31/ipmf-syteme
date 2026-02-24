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
            <header className={`${styles.header} flex-wrap gap-4`}>
                <div style={{ minWidth: '200px' }}>
                    <h1 className={styles.title}>Gestion Financière</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Vue d'ensemble et rapports</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/expenses/new" className={styles.btnSecondary}>
                        <Plus size={18} />
                        <span>Dépense</span>
                    </Link>
                    <Link to="/finances/incomes/new" className={styles.btnPrimary}>
                        <ArrowUpCircle size={18} />
                        <span>Enregistrer Entrée</span>
                    </Link>
                </div>
            </header>

            {/* Role-Based Action Sections */}
            <div style={{ marginBottom: '32px' }}>
                {['comptable', 'admin'].includes(user?.role) && <DashboardComptable />}
                {['caisse', 'admin'].includes(user?.role) && <DashboardCaisse />}
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.incomeIcon}`}>
                        <ArrowUpCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Entrées</span>
                        <span className={styles.statValue}>
                            {stats.loading ? '...' : formatCurrency(stats.totalIncome)}
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.expenseIcon}`}>
                        <ArrowDownCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Dépenses</span>
                        <span className={styles.statValue}>
                            {stats.loading ? '...' : formatCurrency(stats.totalExpenses)}
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.balanceIcon}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Solde Actuel</span>
                        <span className={`${styles.statValue} ${stats.balance >= 0 ? styles.amountPositive : styles.amountNegative}`}>
                            {stats.loading ? '...' : formatCurrency(stats.balance)}
                        </span>
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Modules Financiers</h2>

            <div className={styles.cardGrid}>
                <Link to="/finances/incomes" className={`${styles.navCard} premium-card group`}>
                    <div className={styles.navCardIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
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
                    <div className={styles.navCardIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
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
                    <div className={styles.navCardIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
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
