class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player1 = null;
        this.player2 = null;
        this.arena = null;
        this.gameOver = false;
        this.canDamageP1 = true;
        this.canDamageP2 = true;
    }

    preload() {
        this.load.image('background', 'image/background.png');
        this.load.image('platform', 'image/platform.png');
        // On charge l'atlas de sprites avec le bon nom de fichier.
        this.load.atlas('player_sprite', 'image/test.png', 'test_atlas.json');
    }

    create() {
        this.resetGame();

        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        
        this.arena = new Arena(this);
        this.player1 = new Player(this, 1);
        this.player2 = new Player(this, 2);

        this.physics.add.collider(this.player1.sprite, this.arena.getPlatforms());
        this.physics.add.collider(this.player2.sprite, this.arena.getPlatforms());
        this.physics.add.collider(this.player1.sprite, this.player2.sprite);

        this.player1.createHealthBar(50, 20);
        this.player2.createHealthBar(this.sys.game.config.width - 250, 20);

        this.physics.add.overlap(this.player1.attackHitbox, this.player2.sprite, () => {
            if (this.player1.attackHitbox.body.enable && this.canDamageP1) {
                this.player2.takeDamage();
                this.canDamageP1 = false;
                this.time.delayedCall(500, () => { this.canDamageP1 = true; });
            }
        });
        this.physics.add.overlap(this.player2.attackHitbox, this.player1.sprite, () => {
            if (this.player2.attackHitbox.body.enable && this.canDamageP2) {
                this.player1.takeDamage();
                this.canDamageP2 = false;
                this.time.delayedCall(500, () => { this.canDamageP2 = true; });
            }
        });

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

    resetGame() {
        this.gameOver = false;
        this.canDamageP1 = true;
        this.canDamageP2 = true;

        if (this.player1) {
            this.player1.sprite.destroy();
            this.player1.healthBar.destroy();
            this.player1.attackHitbox.destroy();
        }
        if (this.player2) {
            this.player2.sprite.destroy();
            this.player2.healthBar.destroy();
            this.player2.attackHitbox.destroy();
        }
        if (this.arena) {
            this.arena.platforms.clear(true, true);
        }
    }

    update() {
        if (this.gameOver) {
            return;
        }

        if (this.player1) {
            this.player1.update();
        }
        if (this.player2) {
            this.player2.update();
        }

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

        this.player1.sprite.setVelocity(0);
        this.player2.sprite.setVelocity(0);
        this.player1.sprite.body.enable = false;
        this.player2.sprite.body.enable = false;
    }
}