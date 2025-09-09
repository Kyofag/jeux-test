// Ce fichier est le point d'entrée de votre jeu.
// Il ne contient que la configuration initiale.

// La configuration principale du jeu.
const config = {
    type: Phaser.AUTO, // Utilise WebGL si possible, sinon Canvas.
    width: window.innerWidth, // Définit la largeur du jeu à celle de la fenêtre.
    height: window.innerHeight, // Définit la hauteur du jeu à celle de la fenêtre.
    parent: 'game-container', // Cible l'élément HTML avec l'ID 'game-container' si besoin.
    physics: {
        default: 'arcade', // Utilise le moteur physique Arcade, plus simple et rapide.
        arcade: {
            gravity: { y: 500 }, // Définit la gravité sur l'axe Y.
            debug: true // Affiche les boîtes de collision pour le débogage. Mettez à 'false' en production.
        }
    },
    render: {
        powerPreference: 'high-performance', // Demande au navigateur d'utiliser une carte graphique dédiée.
        willReadFrequently: true // Optimise le rendu pour les opérations fréquentes de lecture.
    },
    // Définit les scènes du jeu. La première scène dans le tableau sera lancée par défaut.
    scene: [MenuScene, GameScene]
};

// Crée une nouvelle instance du jeu Phaser avec la configuration définie.
const game = new Phaser.Game(config);