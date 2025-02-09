# RecycleHub 🌱

## Description
RecycleHub est une application web moderne qui facilite la gestion des déchets recyclables en connectant les particuliers avec des collecteurs professionnels. Cette plateforme encourage le recyclage en récompensant les utilisateurs avec des points convertibles en bons d'achat.

## Fonctionnalités Principales

### Pour les Particuliers 👥
- Création de demandes de collecte de déchets
- Suivi en temps réel du statut des collectes
- Système de points de fidélité
- Conversion des points en bons d'achat
- Gestion du profil utilisateur

### Pour les Collecteurs 🚛
- Visualisation des demandes de collecte dans leur zone
- Acceptation/refus des collectes
- Validation des collectes avec pesée réelle
- Gestion de leur profil professionnel

### Système de Points et Récompenses 🎁
- Attribution automatique des points selon le type et le poids des déchets
- Différentes options de conversion en bons d'achat
- Historique des transactions et des points gagnés

## Technologies Utilisées

- **Frontend**: Angular 17
- **State Management**: NgRx
- **Styling**: TailwindCSS
- **Storage**: Local Storage (pour la démo)
- **Authentication**: Custom auth system

## Architecture
```bash
src/
├── app/
│ ├── core/ # Services, models, guards
│ │ ├── constants/ # Constantes
│ │ ├── models/ # Models
│ │ ├── services/ # Services
│ │ ├── guards/ # Guards
│ │ └── store/ # Store
│ ├── features/ # Modules fonctionnels
│ │ ├── auth/ # Authentification
│ │ └── dashboard/ # Interface principale
│ │    ├── components/ # Composants
│ │    └── pages/ # Pages
│ ├── app.component.html # Template principal
│ ├── app.component.scss # Styles principaux
│ ├── app.component.ts # Logique principale
│ └──── app.routes.ts # Routes principales

```

## Cloner le repository

```bash
git clone https://github.com/Yassinean/RecycleHub
```

## Installation des dépendances

```bash
cd RecycleHub
npm install
```

## Lancer l'application en mode développement

```bash
ng serve
```

## Utilisation

## Utilisation

1. Créer un compte (Particulier)
2. Se connecter à l'application
3. Pour les particuliers :
   - Créer une demande de collecte
   - Suivre l'état de la collecte
   - Convertir les points en bons d'achat
4. Pour les collecteurs :
   - Consulter les demandes de collecte
   - Accepter/refuser les collectes
   - Valider les collectes effectuées

## Sécurité

- Authentification requise pour accéder aux fonctionnalités
- Validation des données côté client et serveur
- Protection des routes avec des guards
- Gestion sécurisée des tokens

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Contact

Yassine Hanach - [@votrelinkedin](https://www.linkedin.com/in/yassine-hanach-2073b222a/)

Lien du projet: [https://github.com/Yassinean/RecycleHub](https://github.com/Yassinean/RecycleHub)

## Remerciements

- [Angular](https://angular.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [NgRx](https://ngrx.io/)