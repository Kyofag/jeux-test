// La configuration principale du jeu.
const config = {
    type: Phaser.AUTO, // Utilise WebGL si possible, sinon Canvas.
    width: window.innerWidth, // Largeur du jeu = largeur de la fenêtre.
    height: window.innerHeight, // Hauteur du jeu = hauteur de la fenêtre.
    parent: 'game-container', // Cible l'élément HTML avec l'ID 'game-container'.
    physics: {
        default: 'arcade', // Moteur physique simple et performant.
        arcade: {
            gravity: { y: 500 }, // Définit la gravité sur l'axe Y.
            debug: true // Affiche les boîtes de collision pour le débogage.
        }
    },
    render: {
        powerPreference: 'high-performance', // Demande une carte graphique dédiée si disponible.
        willReadFrequently: true
    },
    // Définit les scènes du jeu. La première scène dans la liste est lancée par défaut.
    scene: [MenuScene, GameScene]
};

// Crée une nouvelle instance du jeu Phaser avec la configuration définie.
const game = new Phaser.Game(config);