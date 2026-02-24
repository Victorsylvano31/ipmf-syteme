import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Wallet,
    Users,
    User,
    LogOut,
    Briefcase,
    Menu,
    X,
    Moon,
    Sun,
    ChevronLeft,
    BarChart3,
    Activity
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Avatar from './ui/Avatar';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();

    if (!user) return null;

    const canSeeAnalytics = ['admin', 'dg', 'comptable'].includes(user.role);
    const isAdminOrDG = ['admin', 'dg'].includes(user.role);

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: '/tasks', icon: ClipboardList, label: 'Missions' },
        { to: '/expenses', icon: Wallet, label: 'Dépenses' },
        ...(user.role !== 'agent' ? [{ to: '/finances', icon: Wallet, label: 'Finances' }] : []),
        ...(canSeeAnalytics ? [{ to: '/finances/analytics', icon: BarChart3, label: 'Rapports' }] : []),
        ...(isAdminOrDG ? [{ to: '/users', icon: Users, label: 'Utilisateurs' }] : []),
        ...(isAdminOrDG ? [{ to: '/audit', icon: Activity, label: 'Journal d\'Audit' }] : []),
        { to: '/profile', icon: User, label: 'Profil' },
    ];

    return (
        <>
            {/* Mobile Mobile Overlay */}
            {!isOpen && (
                <button
                    className="fixed top-4 left-4 z-50 p-2 bg-[var(--color-bg-card)] rounded-lg shadow-md lg:hidden border border-[var(--color-border)] text-slate-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <Menu size={24} />
                </button>
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-[var(--color-bg-sidebar)] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col shadow-2xl border-r border-slate-800/20
                `}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Briefcase size={22} />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">IPMF SYSTEM</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/finances' || item.to === '/dashboard'}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={20}
                                        className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                                    />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800/50 space-y-4">
                    {/* User Profile Mini */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <Avatar
                            src={user.photo_url}
                            name={user.username}
                            size="md"
                            className="ring-2 ring-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <button
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all border border-slate-700/30 hover:border-red-500/20"
                            title="Se déconnecter"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-semibold tracking-wide">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
