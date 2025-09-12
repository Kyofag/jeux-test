// La classe GameScene est le cœur du jeu.
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player1 = null;
        this.player2 = null;
        this.arena = null;
        this.gameOver = false; // Variable pour vérifier si le jeu est terminé.
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
        this.physics.add.overlap(this.player1.attackHitbox, this.player2.sprite, () => {
            if (this.player1.isAttacking) {
                this.player2.takeDamage();
            }
        });
        this.physics.add.overlap(this.player2.attackHitbox, this.player1.sprite, () => {
            if (this.player2.isAttacking) {
                this.player1.takeDamage();
            }
        });

        // Texte de fin de partie (initialement caché).
        this.gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setVisible(false);

        this.backToMenuButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Retour au menu', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive().setVisible(false);
        
        this.backToMenuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        this.backToMenuButton.on('pointerover', () => {
            this.backToMenuButton.setTint(0xcccccc);
        });
        
        this.backToMenuButton.on('pointerout', () => {
            this.backToMenuButton.setTint(0xffffff);
        });
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Met à jour la logique des deux joueurs à chaque image.
        if (this.player1) {
            this.player1.update();
        }
        if (this.player2) {
            this.player2.update();
        }

        // Vérifie si un joueur est mort.
        if (this.player1.hp <= 0 && !this.gameOver) {
            this.endGame('Joueur 2 a gagné !');
        } else if (this.player2.hp <= 0 && !this.gameOver) {
            this.endGame('Joueur 1 a gagné !');
        }
    }

    endGame(winnerText) {
        this.gameOver = true;
        this.gameOverText.setText(winnerText).setVisible(true);
        this.backToMenuButton.setVisible(true);

        // Arrête les mouvements des joueurs
        this.player1.sprite.setVelocity(0);
        this.player2.sprite.setVelocity(0);
        this.player1.sprite.body.enable = false;
        this.player2.sprite.body.enable = false;
    }
}