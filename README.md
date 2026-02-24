# IPMF SYSTEME

IPMF Systeme est une application de gestion complète comprenant un backend robuste en Django et un frontend moderne en React.

## 🚀 Fonctionnalités

- **Dashboard** : Visualisation des données et statistiques.
- **Gestion des Utilisateurs** : Système d'authentification et de rôles.
- **Gestion Financière** : Suivi des revenus et dépenses.
- **Gestion des Tâches** : Attribution et suivi de l'état des tâches.
- **Audit et Logs** : Historique des actions effectuées sur le système.
- **Notifications** : Système d'alertes en temps réel.

## 🛠️ Stack Technique

### Backend
- **Framework** : Django 5.x / Django REST Framework
- **Base de données** : SQLite (développement) / PostgreSQL (production prêt)
- **Authentification** : JWT (Simple JWT)
- **Outils** : Django Extensions, Decouple, Pillow

### Frontend
- **Framework** : React 19
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Graphiques** : Recharts
- **Calendrier** : React Big Calendar

## 📦 Installation

### 1. Prérequis
- Python 3.10+
- Node.js & npm

### 2. Configuration du Backend
```bash
# Accéder au dossier backend
cd ipmf

# Créer un environnement virtuel
python -m venv venv
# Activer l'environnement (Windows)
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Créer un fichier .env basé sur l'exemple si nécessaire

# Appliquer les migrations
python manage.py migrate

# Lancer le serveur
python manage.py runserver
```

### 3. Configuration du Frontend
```bash
# Accéder au dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

## 📜 Scripts Utiles (Backend)
- `python manage.py create_users` : Initialise les utilisateurs par défaut.
- `python manage.py create_tasks` : Génère des tâches de test.
- `python manage.py create_db` : Script personnalisé d'initialisation de la base de données.

## 📄 Licence
Ce projet est propriétaire.
