import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-[var(--color-border)] opacity-50 rounded-xl ${className}`} />
);

export const KpiCard = ({ label, value, trend, sparkline, color, icon: Icon, loading }) => {
    if (loading) {
        return (
            <Card className="border-none shadow-sm overflow-hidden bg-[var(--color-bg-hover)] backdrop-blur-sm">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="w-10 h-10" />
                        <Skeleton className="w-12 h-5" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-3" />
                        <Skeleton className="w-32 h-8" />
                    </div>
                    <Skeleton className="w-full h-8 mt-2" />
                </CardContent>
            </Card>
        );
    }

    const isPositive = trend > 0;
    const colorClasses = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', spark: '#3b82f6' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', spark: '#f97316' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', spark: '#10b981' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', spark: '#6366f1' },
    }[color] || { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', spark: '#64748b' };

    return (
        <Card className="overflow-hidden border border-[var(--color-border-light)] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-[var(--color-bg-card)] relative">
            <div className={`absolute top-0 left-0 w-1 h-full ${colorClasses.bg.replace('50', '500')} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${colorClasses.bg} ${colorClasses.text} group-hover:rotate-12 transition-transform duration-500`}>
                        <Icon size={20} />
                    </div>
                    {trend !== undefined && trend !== 0 && (
                        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-widest">{label}</h3>
                    <p className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">{value}</p>
                </div>

                {sparkline && (
                    <div className="h-10 mt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparkline}>
                                <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke={colorClasses.spark}
                                    strokeWidth={2.5}
                                    dot={false}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
