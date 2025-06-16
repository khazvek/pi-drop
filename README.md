# 🍓 Kaury Pi Hub

**Local File Transfer & Real-time Messaging System**

Une application web moderne pour le transfert de fichiers et la messagerie en temps réel sur réseau local, parfaite pour les Raspberry Pi et autres serveurs domestiques.

## ✨ Fonctionnalités

### 📁 Transfert de Fichiers
- **Glisser-déposer** ou sélection de fichiers
- Support de **fichiers jusqu'à 25GB**
- **Téléchargement** depuis n'importe quel appareil connecté
- **Gestion** complète des fichiers (suppression, visualisation)
- **Interface responsive** pour mobile et desktop

### 💬 Messagerie Temps Réel
- **Messages instantanés** via WebSocket
- **Synchronisation automatique** entre tous les appareils
- **Historique persistant** des messages
- **Statut de connexion** en temps réel

### 🎨 Interface Moderne
- **Mode sombre/clair** avec persistance
- **Design responsive** adaptatif
- **Notifications** en temps réel
- **Statut système** détaillé

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/USERNAME/kaury-pi-hub.git
cd kaury-pi-hub

# Installer les dépendances
npm install

# Construire l'application
npm run build

# Démarrer le serveur
npm start
```

### Développement
```bash
# Mode développement avec rechargement automatique
npm run dev

# Dans un autre terminal, démarrer le serveur backend
npm run server
```

## 🌐 Accès Multi-Appareils

### Configuration Réseau
1. **Démarrez le serveur** sur votre machine principale
2. **Trouvez votre IP locale** :
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` ou `ip addr show`
3. **Connectez les autres appareils** au même réseau WiFi
4. **Accédez via navigateur** : `http://[VOTRE-IP]:3001`

### Exemple d'utilisation
```
Serveur principal : 192.168.1.100:3001
Accès mobile     : http://192.168.1.100:3001
Accès tablette   : http://192.168.1.100:3001
```

## 📱 Compatibilité

- ✅ **Navigateurs modernes** (Chrome, Firefox, Safari, Edge)
- ✅ **Appareils mobiles** (iOS, Android)
- ✅ **Tablettes** et ordinateurs
- ✅ **Raspberry Pi** et serveurs ARM
- ✅ **Réseaux locaux** WiFi et Ethernet

## 🛠️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **WebSocket** pour la messagerie temps réel

### Backend
- **Node.js** avec Express
- **WebSocket Server** pour les messages
- **Multer** pour l'upload de fichiers
- **CORS** activé pour l'accès multi-origine

### Structure des fichiers
```
kaury-pi-hub/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx      # Gestion des fichiers
│   │   ├── MessageSystem.tsx   # Système de messagerie
│   │   └── SystemStatus.tsx    # Statut du système
│   ├── App.tsx                 # Application principale
│   └── main.tsx               # Point d'entrée
├── server.cjs                 # Serveur backend
├── uploads/                   # Dossier des fichiers uploadés
└── messages.json             # Stockage des messages
```

## 🔧 Configuration

### Variables d'environnement
```bash
PORT=3001                    # Port du serveur
```

### Limites par défaut
- **Taille de fichier** : 25GB par fichier
- **Messages** : 1000 messages maximum en mémoire
- **Connexions WebSocket** : Illimitées

## 🚨 Sécurité

⚠️ **Important** : Cette application est conçue pour un usage sur **réseau local uniquement**. 

- Pas d'authentification par défaut
- Accès libre aux fichiers uploadés
- Messages non chiffrés
- **Ne pas exposer sur Internet** sans sécurisation supplémentaire

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **React** et l'écosystème moderne du web
- **Tailwind CSS** pour le design system
- **Lucide** pour les icônes élégantes
- La communauté **Raspberry Pi** pour l'inspiration

---

**Fait avec ❤️ pour la communauté des makers et des passionnés de technologie**