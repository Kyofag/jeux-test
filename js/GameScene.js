// La classe GameScene est le cœur du jeu.
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player1 = null;
        this.player2 = null;
        this.arena = null;
    }

    preload() {
        // Charge toutes les ressources nécessaires pour le jeu.
        this.load.image('background', 'image/background.png');
        this.load.image('platform', 'image/platform.png');
        this.load.spritesheet('player_sprite', 'image/asset1.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Crée l'arrière-plan.
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        
        // Crée une instance de l'arène et des deux joueurs.
        this.arena = new Arena(this);
        this.player1 = new Player(this, 1);
        this.player2 = new Player(this, 2);

        // Gère les collisions entre les objets physiques.
        this.physics.add.collider(this.player1.sprite, this.arena.getPlatforms());
        this.physics.add.collider(this.player2.sprite, this.arena.getPlatforms());
        this.physics.add.collider(this.player1.sprite, this.player2.sprite);

        // Crée les barres de vie des joueurs.
        this.player1.createHealthBar(50, 20);
        this.player2.createHealthBar(this.sys.game.config.width - 250, 20);

        // Détecte les collisions entre les hitboxes d'attaque et les sprites des joueurs pour infliger des dégâts.
        this.physics.add.overlap(this.player1.attackHitbox, this.player2.sprite, this.player2.takeDamage, null, this.player2);
        this.physics.add.overlap(this.player2.attackHitbox, this.player1.sprite, this.player1.takeDamage, null, this.player1);
    }

    update() {
        // Met à jour la logique des deux joueurs à chaque image.
        if (this.player1) {
            this.player1.update();
        }
        if (this.player2) {
            this.player2.update();
        }
    }
}