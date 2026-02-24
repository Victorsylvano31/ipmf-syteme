from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
import os

User = get_user_model()

class Tache(models.Model):
    STATUT_CHOICES = [
        ('creee', 'Créée'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
        ('validee', 'Validée'),
        ('annulee', 'Annulée'),
    ]
    
    PRIORITE_CHOICES = [
        ('basse', 'Basse'),
        ('moyenne', 'Moyenne'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]
    
    # Identifiants et informations de base
    numero = models.CharField(max_length=20, unique=True, editable=False, verbose_name="Numéro")  # Auto-généré (ex: TSK-2026-001)
    titre = models.CharField(max_length=200, verbose_name="Titre")  # Titre de la tâche (ex: "Audit financier Q1")
    description = models.TextField(verbose_name="Description")  # Description détaillée des objectifs et livrables
    
    # Gestion des dates et heures (Planning)
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")  # Date/heure de création automatique
    date_debut = models.DateTimeField(null=True, blank=True, verbose_name="Date de début")  # Date/heure de début planifiée (optionnel)
    date_echeance = models.DateTimeField(verbose_name="Date d'échéance")  # Date/heure limite de réalisation (obligatoire)
    
    # Classification et état
    priorite = models.CharField(max_length=20, choices=PRIORITE_CHOICES, default='moyenne', verbose_name="Priorité")  # Niveau d'urgence
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='creee', verbose_name="Statut")  # État d'avancement
    
    
    # Relations
    createur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='taches_crees', verbose_name="Créateur")
    agents_assignes = models.ManyToManyField(
        User, 
        related_name='taches_assignees', 
        verbose_name="Agents assignés",
        blank=True
    )
    
    # Budget et résultats
    budget_alloue = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.00'))],
        null=True, 
        blank=True,
        verbose_name="Budget alloué (Ar)"
    )
    resultat = models.TextField(blank=True, verbose_name="Résultat")
    piece_jointe_resultat = models.FileField(
        upload_to='taches/resultats/%Y/%m/', 
        null=True, 
        blank=True,
        verbose_name="Pièce jointe (résultat)"
    )
    
    # Suivi
    date_debut_reelle = models.DateTimeField(null=True, blank=True, verbose_name="Date de début réelle")
    date_fin_reelle = models.DateTimeField(null=True, blank=True, verbose_name="Date de fin réelle")
    commentaire_validation = models.TextField(blank=True, verbose_name="Commentaire de validation")
    valide_par = models.ForeignKey(
        User, 
        on_delete=models.PROTECT, 
        related_name='taches_validees', 
        null=True, 
        blank=True,
        verbose_name="Validé par"
    )
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    
    class Meta:
        verbose_name = "📋 Tâche"
        verbose_name_plural = "📋 Tâches"
        ordering = ['-date_creation']
        permissions = [
            ("can_assign_tasks", "Peut assigner des tâches"),
            ("can_validate_tasks", "Peut valider des tâches"),
        ]
    
    def save(self, *args, **kwargs):
        if not self.numero:
            self.numero = self.generate_numero()
        super().save(*args, **kwargs)
    
    def generate_numero(self):
        annee = timezone.now().year
        dernier = Tache.objects.filter(
            date_creation__year=annee
        ).order_by('id').last()
        
        if dernier:
            try:
                dernier_num = int(dernier.numero.split('-')[-1])
                nouveau_num = dernier_num + 1
            except (ValueError, IndexError):
                nouveau_num = 1
        else:
            nouveau_num = 1
            
        return f"TSK-{annee}-{nouveau_num:03d}"
    
    def __str__(self):
        return f"{self.numero} - {self.titre}"
    
    @property
    def jours_restants(self):
        """Calcule le nombre de jours restants jusqu'à l'échéance"""
        aujourdhui = timezone.now().date()
        if self.date_echeance:
            return (self.date_echeance.date() - aujourdhui).days
        return None
    
    @property
    def est_en_retard(self):
        """Vérifie si la tâche est en retard"""
        if self.statut in ['terminee', 'validee', 'annulee']:
            return False
        return self.jours_restants < 0 if self.jours_restants is not None else False
    
    @property
    def pourcentage_avancement(self):
        """Calcule le pourcentage d'avancement basé sur le statut"""
        avancement_map = {
            'creee': 0,
            'en_cours': 50,
            'terminee': 100,
            'validee': 100,
            'annulee': 0
        }
        return avancement_map.get(self.statut, 0)
    
    def peut_demarrer(self, user):
        """Vérifie si l'utilisateur peut démarrer cette tâche"""
        return self.agents_assignes.filter(id=user.id).exists() and self.statut == 'creee'
    
    def peut_terminer(self, user):
        """Vérifie si l'utilisateur peut terminer cette tâche"""
        return self.agents_assignes.filter(id=user.id).exists() and self.statut == 'en_cours'
    
    def peut_valider(self, user):
        """Vérifie si l'utilisateur peut valider cette tâche"""
        return (
            user.role in ['admin', 'dg'] or 
            user.is_superuser
        ) and self.statut == 'terminee'
    
    def peut_annuler(self, user):
        """Vérifie si l'utilisateur peut annuler cette tâche"""
        return (
            user.role in ['admin', 'dg'] or 
            user.is_superuser
        )
    
    def get_piece_jointe_name(self):
        """Retourne le nom du fichier de la pièce jointe"""
        if self.piece_jointe_resultat:
            return os.path.basename(self.piece_jointe_resultat.name)
        return "Aucune pièce"

class CommentaireTache(models.Model):
    tache = models.ForeignKey(Tache, on_delete=models.CASCADE, related_name='commentaires')
    auteur = models.ForeignKey(User, on_delete=models.PROTECT)
    message = models.TextField()
    piece_jointe = models.FileField(
        upload_to='taches/commentaires/%Y/%m/', 
        null=True, 
        blank=True,
        verbose_name="Pièce jointe"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "💬 Commentaire de tâche"
        verbose_name_plural = "💬 Commentaires de tâche"
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"Commentaire par {self.auteur.username} sur {self.tache.numero}"

class DemandeReport(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('approuvee', 'Approuvée'),
        ('rejetee', 'Rejetée'),
    ]

    tache = models.ForeignKey(Tache, on_delete=models.CASCADE, related_name='demandes_report', verbose_name="Tâche")
    demandeur = models.ForeignKey(User, on_delete=models.PROTECT, related_name='demandes_report_emises', verbose_name="Demandeur")
    date_demandee = models.DateTimeField(verbose_name="Nouvelle date d'échéance souhaitée")
    motif = models.TextField(verbose_name="Motif du report")
    pj_justificatif = models.FileField(upload_to='taches/reports/', null=True, blank=True, verbose_name="Pièce jointe justificative")
    
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente', verbose_name="Statut")
    
    # Réponse
    date_reponse = models.DateTimeField(null=True, blank=True, verbose_name="Date de réponse")
    repondu_par = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name='demandes_report_traitees', verbose_name="Répondu par")
    commentaire_reponse = models.TextField(blank=True, verbose_name="Commentaire de réponse")
    
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de demande")

    class Meta:
        verbose_name = "📅 Demande de report"
        verbose_name_plural = "📅 Demandes de report"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Report {self.tache.numero} - {self.demandeur.username}"
class SousTache(models.Model):
    tache = models.ForeignKey(Tache, on_delete=models.CASCADE, related_name='sous_taches', verbose_name='Mission parente')
    titre = models.CharField(max_length=255, verbose_name='Titre de la sous-tâche')
    est_terminee = models.BooleanField(default=False, verbose_name='Terminée')
    assigne_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sous_taches_assignees', verbose_name='Assigné à')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = ' Sous-tâche'
        verbose_name_plural = ' Sous-tâches'
        ordering = ['date_creation']

    def __str__(self):
        return f'{self.tache.numero} - {self.titre}'
