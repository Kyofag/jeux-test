// La classe GameScene est le cœur de votre jeu.
// Elle gère la logique principale, les objets et les interactions.
class GameScene extends Phaser.Scene {
    constructor() {
        // Définit la clé de la scène pour la lancer depuis le menu.
        super({ key: 'GameScene' });
        // Initialise les propriétés de la scène.
        this.player = null;
        this.arena = null;
    }

    preload() {
        // Charge toutes les ressources nécessaires pour le jeu.
        this.load.image('background', 'image/background.png');
        this.load.image('platform', 'image/platform.png');
        // Charge la feuille de sprites du personnage.
        this.load.spritesheet('player_sprite', 'image/asset1.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Crée l'arrière-plan du jeu.
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Crée une instance de la classe Arena pour générer le niveau.
        this.arena = new Arena(this);
        // Crée une instance de la classe Player pour gérer le personnage.
        this.player = new Player(this);

        // Ajoute une collision entre le sprite du joueur et les plateformes de l'arène.
        this.physics.add.collider(this.player.sprite, this.arena.getPlatforms());
    }

    update() {
        // Met à jour la logique du joueur à chaque image.
        if (this.player) {
            this.player.update();
        }
    }
}