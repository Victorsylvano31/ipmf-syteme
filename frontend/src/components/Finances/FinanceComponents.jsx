import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    ShieldCheck,
    CreditCard,
    FileText
} from 'lucide-react';
import styles from './Finances.module.css';

export const StatusBadge = ({ status, type = 'expense' }) => {
    const configs = {
        // Incomes
        en_attente: { label: 'En attente', color: '#854d0e', bg: '#fef9c3', icon: <Clock size={14} /> },
        confirmee: { label: 'Confirmée', color: '#166534', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> },
        annulee: { label: 'Annulée', color: '#991b1b', bg: '#fee2e2', icon: <XCircle size={14} /> },

        // Expenses (some overlap)
        verifiee: { label: 'Vérifiée', color: '#1e40af', bg: '#dbeafe', icon: <ShieldCheck size={14} /> },
        validee: { label: 'Validée', color: '#166534', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> },
        payee: { label: 'Payée', color: '#15803d', bg: '#f0fdf4', icon: <CreditCard size={14} /> },
        rejetee: { label: 'Rejetée', color: '#991b1b', bg: '#fee2e2', icon: <AlertCircle size={14} /> }
    };

    const config = configs[status] || configs['en_attente'];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.color}20`
        }}>
            {config.icon}
            {config.label}
        </span>
    );
};

export const FilePreview = ({ url, filename }) => {
    if (!url) return <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucune pièce jointe</div>;

    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);

    return (
        <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>{filename || 'Justificatif'}</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                    Ouvrir / Télécharger
                </a>
            </div>
            {isImage ? (
                <div style={{ padding: '16px', textAlign: 'center', background: 'white' }}>
                    <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                </div>
            ) : (
                <div style={{ padding: '32px', textAlign: 'center', background: 'white', color: '#64748b' }}>
                    <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>Aperçu non disponible pour ce type de fichier.</p>
                </div>
            )}
        </div>
    );
};
