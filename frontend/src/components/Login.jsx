import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, AlertCircle, Loader2, Building2, Shield, TrendingUp } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login({ username, password });

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-['Inter']">
            {/* Left Side - Branding & Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative overflow-hidden">
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJ6TTM0IDM0djJoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo & Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">IPMF</h1>
                                <p className="text-slate-300 text-sm">Système de Gestion Interne</p>
                            </div>
                        </div>
                    </div>

                    {/* Center - Main Visual */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="max-w-md">
                            <div className="relative">
                                {/* Abstract Illustration using CSS */}
                                <div className="relative w-80 h-80 mx-auto">
                                    {/* Central Circle */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 backdrop-blur-md rounded-full border-2 border-white/20 flex items-center justify-center">
                                        <Shield className="w-16 h-16 text-white/70" />
                                    </div>

                                    {/* Orbiting Elements */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl rotate-12 shadow-xl opacity-60 flex items-center justify-center animate-float">
                                        <TrendingUp className="w-10 h-10 text-white/80" />
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full shadow-xl opacity-50 animate-float-delayed"></div>

                                    <div className="absolute bottom-8 right-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl -rotate-12 shadow-xl opacity-55 animate-float"></div>

                                    <div className="absolute top-20 right-4 w-16 h-16 bg-gradient-to-br from-cyan-700 to-blue-800 rounded-xl rotate-45 shadow-xl opacity-60 animate-float-delayed"></div>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                <h2 className="text-3xl font-bold mb-4">
                                    Plateforme de Gestion Intégrée
                                </h2>
                                <p className="text-slate-300 text-lg leading-relaxed">
                                    Gérez vos missions, finances et équipes en toute sécurité avec notre solution professionnelle.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Features */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">100%</div>
                            <div className="text-slate-400 text-sm">Sécurisé</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">24/7</div>
                            <div className="text-slate-400 text-sm">Disponible</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">5+</div>
                            <div className="text-slate-400 text-sm">Modules</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">IPMF</span>
                </div>

                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 lg:p-10">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Connexion</h2>
                            <p className="text-slate-500">Accédez à votre espace de gestion</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-shake">
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block">
                                    Nom d'utilisateur
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Entrez votre identifiant"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block">
                                    Mot de passe
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••••"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                                © 2026 IPMF - Institut Professionnel Mémo Formation
                            </p>
                        </div>
                    </div>

                    {/* Admin Link */}
                    <div className="mt-6 text-center">
                        <a
                            href="/admin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                            <Shield size={16} />
                            Espace d'Administration
                        </a>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-15px) scale(1.05); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                    animation-delay: 1s;
                }
            `}} />
        </div>
    );
}
