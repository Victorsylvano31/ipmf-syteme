from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Case, When, IntegerField
from django.utils import timezone
from datetime import timedelta
import csv
from django.http import HttpResponse
from .models import Tache, CommentaireTache, DemandeReport, SousTache
from audit.models import AuditLog
from notifications.services import NotificationService
from .serializers import (
    TacheSerializer, CommentaireTacheSerializer, TacheActionSerializer,
    DemandeReportSerializer, SousTacheSerializer
)
from rest_framework.exceptions import PermissionDenied
from .permissions import CanAssignTasks, CanValidateTasks, IsTaskOwnerOrAssignee, CanViewAllTasks

class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['statut', 'priorite', 'createur', 'agents_assignes']
    search_fields = ['numero', 'titre', 'description']
    ordering_fields = ['date_creation', 'date_echeance', 'priorite', 'statut']
    ordering = ['-date_creation']
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated, CanAssignTasks]
        elif self.action in ['valider', 'annuler']:
            permission_classes = [permissions.IsAuthenticated, CanValidateTasks]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsTaskOwnerOrAssignee | CanAssignTasks]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'dg']:
            return Tache.objects.all()
        else:
            # Les utilisateurs voient les tâches qu'ils ont créées ou qui leur sont assignées
            return Tache.objects.filter(
                Q(createur=user) | Q(agents_assignes=user)
            ).distinct()
    
    def perform_create(self, serializer):
        tache = serializer.save(createur=self.request.user)
        self.log_action(self.request.user, f"Tache {tache.numero} creee", tache, action_type='create')
        # Notifier les agents assignés
        NotificationService.notify_task_assigned(tache)
    
    @action(detail=True, methods=['post'])
    def demarrer(self, request, pk=None):
        """Démarrer une tâche (agent assigné)"""
        tache = self.get_object()
        serializer = TacheActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if not tache.peut_demarrer(request.user):
            return Response(
                {'error': "Vous ne pouvez pas démarrer cette tâche"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tache.statut = 'en_cours'
        tache.date_debut_reelle = timezone.now()
        tache.save()
        
        # Créer un commentaire si fourni
        if serializer.validated_data.get('commentaire') or serializer.validated_data.get('attachment'):
            CommentaireTache.objects.create(
                tache=tache,
                auteur=request.user,
                message=f"Début de la tâche: {serializer.validated_data.get('commentaire', '')}",
                piece_jointe=serializer.validated_data.get('attachment')
            )
        
        self.log_action(request.user, f"Tache {tache.numero} demarree", tache)
        
        return Response(TacheSerializer(tache).data)
    
    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        """Terminer une tâche (agent assigné)"""
        tache = self.get_object()
        serializer = TacheActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if not tache.peut_terminer(request.user):
            return Response(
                {'error': "Vous ne pouvez pas terminer cette tâche"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tache.statut = 'terminee'
        tache.date_fin_reelle = timezone.now()
        tache.resultat = serializer.validated_data.get('resultat', '')
        tache.save()
        
        # Créer un commentaire si fourni
        if serializer.validated_data.get('commentaire') or serializer.validated_data.get('attachment'):
            CommentaireTache.objects.create(
                tache=tache,
                auteur=request.user,
                message=f"Tâche terminée: {serializer.validated_data.get('commentaire', '')}",
                piece_jointe=serializer.validated_data.get('attachment')
            )
        
        self.log_action(request.user, f"Tache {tache.numero} terminee", tache)
        
        return Response(TacheSerializer(tache).data)
    
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Valider une tâche (DG ou admin)"""
        tache = self.get_object()
        serializer = TacheActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if not tache.peut_valider(request.user):
            return Response(
                {'error': "Vous ne pouvez pas valider cette tâche"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if tache.statut != 'terminee':
            return Response(
                {'error': "Seules les tâches terminées peuvent être validées"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tache.statut = 'validee'
        tache.valide_par = request.user
        tache.date_validation = timezone.now()
        tache.commentaire_validation = serializer.validated_data.get('commentaire', '')
        tache.save()
        
        # Créer un commentaire
        CommentaireTache.objects.create(
            tache=tache,
            auteur=request.user,
            message=f"Tâche validée: {serializer.validated_data.get('commentaire', 'Validation effectuée')}",
            piece_jointe=serializer.validated_data.get('attachment')
        )
        
        self.log_action(request.user, f"Tache {tache.numero} validee", tache, action_type='validation')
        
        return Response(TacheSerializer(tache).data)
    
    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """Annuler une tâche (DG ou admin)"""
        tache = self.get_object()
        serializer = TacheActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if not tache.peut_annuler(request.user):
            return Response(
                {'error': "Vous ne pouvez pas annuler cette tâche"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tache.statut = 'annulee'
        tache.save()
        
        # Créer un commentaire
        CommentaireTache.objects.create(
            tache=tache,
            auteur=request.user,
            message=f"Tâche annulée: {serializer.validated_data.get('commentaire', 'Annulation effectuée')}",
            piece_jointe=serializer.validated_data.get('attachment')
        )
        
        self.log_action(request.user, f"Tache {tache.numero} annulee", tache)
        
        return Response(TacheSerializer(tache).data)
    
    @action(detail=False, methods=['get'])
    def mes_taches(self, request):
        """Liste des tâches de l'utilisateur connecté"""
        user = request.user
        queryset = self.get_queryset().filter(agents_assignes=user)
        
        # Filtres supplémentaires
        statut = request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def en_retard(self, request):
        """Liste des tâches en retard"""
        if request.user.role not in ['admin', 'dg']:
            return Response(
                {'error': "Permission refusée"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        taches_retard = self.get_queryset().filter(est_en_retard=True)
        serializer = self.get_serializer(taches_retard, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques des tâches"""
        user = request.user
        if user.role not in ['admin', 'dg']:
            return Response(
                {'error': "Permission refusée"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Statistiques globales
        stats_globales = Tache.objects.aggregate(
            total=Count('id'),
            en_retard=Count('id', filter=Q(est_en_retard=True)),
            terminees=Count('id', filter=Q(statut='terminee')),
            validees=Count('id', filter=Q(statut='validee')),
        )
        
        # Par statut
        par_statut = Tache.objects.values('statut').annotate(
            count=Count('id')
        ).order_by('statut')
        
        # Par priorité
        par_priorite = Tache.objects.values('priorite').annotate(
            count=Count('id')
        ).order_by('priorite')
        
        # Tâches par utilisateur (pour les admins/DG)
        par_utilisateur = Tache.objects.values('agents_assignes__username').annotate(
            total=Count('id'),
            en_cours=Count('id', filter=Q(statut='en_cours')),
            terminees=Count('id', filter=Q(statut='terminee')),
        ).order_by('-total')
        
        return Response({
            'stats_globales': stats_globales,
            'par_statut': list(par_statut),
            'par_priorite': list(par_priorite),
            'par_utilisateur': list(par_utilisateur),
        })
    
    def log_action(self, user, message, tache=None, action_type='update'):
        """Log une action via le module audit"""
        AuditLog.log_action(
            action_type=action_type,
            module='tasks',
            message=message,
            utilisateur=user,
            objet_type='Tache',
            objet_id=str(tache.pk) if tache else None,
            objet_repr=str(tache) if tache else None
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Exporter les tâches en CSV"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="missions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Numéro', 'Titre', 'Priorité', 'Statut', 'Créateur', 'Date Échéance', 'Date Création'])
        
        queryset = self.get_queryset()
        for item in queryset:
            writer.writerow([
                item.numero,
                item.titre,
                item.get_priorite_display(),
                item.get_statut_display(),
                item.createur.username if item.createur else '',
                item.date_echeance.strftime('%Y-%m-%d %H:%M') if item.date_echeance else '',
                item.date_creation.strftime('%Y-%m-%d %H:%M') if item.date_creation else ''
            ])
            
        return response
    
class CommentaireTacheViewSet(viewsets.ModelViewSet):
    queryset = CommentaireTache.objects.all()
    serializer_class = CommentaireTacheSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'dg']:
            return CommentaireTache.objects.all()
        else:
            # Les utilisateurs voient les commentaires des tâches qui les concernent
            return CommentaireTache.objects.filter(
                Q(tache__createur=user) | Q(tache__agents_assignes=user)
            ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)

class DemandeReportViewSet(viewsets.ModelViewSet):
    queryset = DemandeReport.objects.all()
    serializer_class = DemandeReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'dg']:
            return DemandeReport.objects.all()
        else:
            return DemandeReport.objects.filter(demandeur=user)
    
    def perform_create(self, serializer):
        # Vérifier que l'utilisateur est assigné à la tâche
        tache = serializer.validated_data['tache']
        user = self.request.user
        if not tache.agents_assignes.filter(id=user.id).exists():
             raise PermissionDenied("Vous n'êtes pas assigné à cette tâche.")
             
        demande = serializer.save(demandeur=user)
        
        # Notifier les admins/DG
        NotificationService.send_notification(
            recipient=None, # Broadcast to group if possible, or loop admins? 
            # Simplified: assuming we notify specific roles later or loop here.
            # For now, let's notify the task creator or a generic admin account if exists.
            # Ideally NotificationService handles role-based notifs.
            title="Nouvelle demande de report",
            message=f"L'agent {user.username} demande un report pour la tâche {tache.numero}",
            type='warning',
            link=f"/tasks/{tache.id}"
        )
        # Notify task creator if different from demandeur
        if tache.createur != user:
             NotificationService.send_notification(
                recipient=tache.createur,
                title="Demande de report",
                message=f"Demande de report pour votre tâche {tache.numero}",
                type='warning',
                link=f"/tasks/{tache.id}"
            )

    @action(detail=True, methods=['post'])
    def approuver(self, request, pk=None):
        demande = self.get_object()
        user = request.user
        
        if user.role not in ['admin', 'dg']:
            return Response({'error': "Permission refusée"}, status=status.HTTP_403_FORBIDDEN)
            
        if demande.statut != 'en_attente':
            return Response({'error': "Cette demande a déjà été traitée"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Appliquer le report
        tache = demande.tache
        ancien_echeance = tache.date_echeance
        tache.date_echeance = demande.date_demandee
        
        # Si la tâche était en échec/terminée, on la remet en cours
        if tache.statut == 'terminee' or tache.resultat == "ECHEC_AUTOMATIQUE":
            tache.statut = 'en_cours'
            tache.resultat = '' # Clear failure result
            # tache.date_fin_reelle = None # Keep history? Or clear? Let's clear to indicate active.
            tache.date_fin_reelle = None
            
        tache.save()
        
        # Mettre à jour la demande
        demande.statut = 'approuvee'
        demande.repondu_par = user
        demande.date_reponse = timezone.now()
        demande.commentaire_reponse = request.data.get('commentaire', '')
        demande.save()
        
        # Audit
        AuditLog.log_action(
            user, 
            f"Report approuvé pour tâche {tache.numero}. Nouvelle échéance: {tache.date_echeance}", 
            demande, 
            action_type='update'
        )
        
        # Notification
        NotificationService.send_notification(
            recipient=demande.demandeur,
            title="Demande de report approuvée",
            message=f"Votre demande pour la tâche {tache.numero} a été approuvée.",
            type='success',
            link=f"/tasks/{tache.id}"
        )
        
        return Response({'status': 'approuvee'})

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        demande = self.get_object()
        user = request.user
        
        if user.role not in ['admin', 'dg']:
            return Response({'error': "Permission refusée"}, status=status.HTTP_403_FORBIDDEN)
            
        if demande.statut != 'en_attente':
            return Response({'error': "Cette demande a déjà été traitée"}, status=status.HTTP_400_BAD_REQUEST)
            
        demande.statut = 'rejetee'
        demande.repondu_par = user
        demande.date_reponse = timezone.now()
        demande.commentaire_reponse = request.data.get('commentaire', '')
        demande.save()
        
        AuditLog.log_action(
            user, 
            f"Report rejeté pour tâche {demande.tache.numero}", 
            demande, 
            action_type='update'
        )
        
        NotificationService.send_notification(
            recipient=demande.demandeur,
            title="Demande de report rejetée",
            message=f"Votre demande pour la tâche {demande.tache.numero} a été rejetée.",
            type='error',
            link=f"/tasks/{demande.tache.id}"
        )
        
        return Response({'status': 'rejetee'})
class SousTacheViewSet(viewsets.ModelViewSet):
    queryset = SousTache.objects.all()
    serializer_class = SousTacheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'dg']:
            return SousTache.objects.all()
        else:
            return SousTache.objects.filter(
                Q(tache__createur=user) | Q(tache__agents_assignes=user)
            ).distinct()

    def perform_create(self, serializer):
        tache = serializer.validated_data['tache']
        user = self.request.user
        if user.role not in ['admin', 'dg'] and tache.createur != user and not tache.agents_assignes.filter(id=user.id).exists():
            raise PermissionDenied('Vous n''avez pas la permission d''ajouter des sous-tâches à cette mission.')
        serializer.save()

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        sous_tache = self.get_object()
        sous_tache.est_terminee = not sous_tache.est_terminee
        if sous_tache.est_terminee:
            sous_tache.date_fin = timezone.now()
        else:
            sous_tache.date_fin = None
        sous_tache.save()
        return Response(SousTacheSerializer(sous_tache).data)
