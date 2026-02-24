import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle,
    AlertCircle,
    Info,
    ClipboardList,
    Wallet,
    XCircle,
    CheckCheck,
    Filter,
    ArrowLeft
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from '../components/Notifications/NotificationBell.module.css';

const NotificationsPage = () => {
    const { notifications, markAsRead, markAllAsRead, refresh } = useNotifications();
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return n.type === filter;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'task': return <ClipboardList size={20} />;
            case 'finance': return <Wallet size={20} />;
            case 'success': return <CheckCircle size={20} />;
            case 'warning': return <AlertCircle size={20} />;
            case 'error': return <XCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const getIconClass = (type) => {
        switch (type) {
            case 'task': return styles.iconTask;
            case 'finance': return styles.iconFinance;
            case 'warning': return styles.iconWarning;
            case 'error': return styles.iconError;
            default: return styles.iconInfo;
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const pageStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px'
    };

    const filterBtnStyle = (active) => ({
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        backgroundColor: active ? '#2c3e50' : 'white',
        color: active ? 'white' : '#64748b',
        fontSize: '14px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    });

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Mes Notifications</h1>
                </div>
                <button
                    onClick={markAllAsRead}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    <CheckCheck size={18} /> Tout marquer comme lu
                </button>
            </div>

            <div style={filterContainerStyle}>
                <button onClick={() => setFilter('all')} style={filterBtnStyle(filter === 'all')}>Toutes</button>
                <button onClick={() => setFilter('unread')} style={filterBtnStyle(filter === 'unread')}>Non lues</button>
                <button onClick={() => setFilter('task')} style={filterBtnStyle(filter === 'task')}>Missions</button>
                <button onClick={() => setFilter('finance')} style={filterBtnStyle(filter === 'finance')}>Finances</button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>Aucune notification trouvée</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            style={{
                                padding: '20px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                gap: '16px',
                                backgroundColor: !notif.is_read ? '#f8fafc' : 'white',
                                position: 'relative'
                            }}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            {!notif.is_read && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '4px',
                                    backgroundColor: '#3498db'
                                }} />
                            )}
                            <div className={`${styles.iconWrapper} ${getIconClass(notif.type)}`} style={{ width: '44px', height: '44px' }}>
                                {getIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{notif.title}</h4>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
