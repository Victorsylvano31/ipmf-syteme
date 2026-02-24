import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './Notifications/NotificationBell';
import {
    Search,
    Bell,
    X,
    ClipboardList,
    Wallet,
    TrendingUp,
    User as UserIcon,
    Loader2
} from 'lucide-react';
import Avatar from './ui/Avatar';
import api from '../api/axios';
import ThemeToggle from './ThemeToggle';

const Header = ({ className = '' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await api.get(`dashboard/donnees/search/?q=${searchQuery}`);
                    setResults(response.data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Erreur de recherche:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleResultClick = (url) => {
        navigate(url);
        setSearchQuery('');
        setShowResults(false);
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'ClipboardList': return <ClipboardList size={16} />;
            case 'Wallet': return <Wallet size={16} />;
            case 'TrendingUp': return <TrendingUp size={16} />;
            case 'User': return <UserIcon size={16} />;
            default: return <Search size={16} />;
        }
    };

    return (
        <header className={`
                fixed top-0 right-0 left-0 h-20 bg-[var(--glass-bg)] backdrop-blur-md 
                border-b border-[var(--color-border)] z-30 px-4 md:px-8
                flex items-center justify-between transition-all duration-300
                ${className}
            `}
        >
            {/* Search Bar */}
            <div className="hidden sm:flex items-center flex-1 max-w-md relative" ref={searchRef}>
                <div className="relative w-full group">
                    <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Recherche (Missions, Finances, Users...)"
                        className="w-full pl-11 pr-10 py-2.5 bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-xl focus:ring-4 focus:ring-blue-100/20 focus:border-blue-500 outline-none transition-all text-sm text-[var(--color-text-primary)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        </button>
                    )}
                </div>

                {/* Results Dropdown */}
                {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-[400px] overflow-y-auto p-2">
                            {results.length > 0 ? (
                                results.map((res, idx) => (
                                    <button
                                        key={`${res.type}-${res.id}-${idx}`}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-bg-hover)] rounded-xl transition-colors text-left group"
                                        onClick={() => handleResultClick(res.url)}
                                    >
                                        <div className={`
                                            p-2 rounded-lg 
                                            ${res.type === 'task' ? 'bg-amber-50 text-amber-600' : ''}
                                            ${res.type === 'expense' ? 'bg-red-50 text-red-600' : ''}
                                            ${res.type === 'income' ? 'bg-emerald-50 text-emerald-600' : ''}
                                            ${res.type === 'user' ? 'bg-blue-50 text-blue-600' : ''}
                                        `}>
                                            {getIcon(res.icon)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-blue-600 transition-colors">{res.title}</p>
                                            <p className="text-[11px] text-[var(--color-text-muted)] font-medium">{res.subtitle}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-slate-400 font-medium">Aucun résultat pour "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Search Icon only */}
            <button className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Search size={22} />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-5">
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <NotificationBell />
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={() => navigate('/profile')}>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                            {user?.username}
                        </p>
                        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                            {user?.role}
                        </p>
                    </div>
                    <Avatar
                        src={user?.photo_url}
                        name={user?.username}
                        size="md"
                        className="group-hover:ring-4 group-hover:ring-blue-100 transition-all"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
