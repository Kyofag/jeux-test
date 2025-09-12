// La classe Player gère tout ce qui est lié au personnage.
class Player {
    constructor(scene, playerIndex) {
        this.scene = scene;
        this.playerIndex = playerIndex;
        
        let startX, startColor;
        if (this.playerIndex === 1) {
            startX = 100;
            startColor = 0xffffff; // Joueur 1 en blanc.
        } else {
            startX = this.scene.sys.game.config.width - 100;
            startColor = 0x00ff00; // Joueur 2 en vert.
        }

        // Crée le sprite et le rend physique.
        this.sprite = this.scene.physics.add.sprite(startX, 450, 'player_sprite');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setTint(startColor);

        // Initialise les variables de jeu.
        this.jumpCount = 0;
        this.isAttacking = false;
        this.hp = 100; // Points de vie.
        this.healthBar = null;

        // Crée la zone de collision pour l'attaque (initialement invisible et sans gravité).
        this.attackHitbox = this.scene.add.rectangle(0, 0, 40, 40);
        this.scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.allowGravity = false;
        this.attackHitbox.setVisible(false);

        // Appelle les fonctions d'initialisation.
        this.createAnimations();
        this.setHitbox();
        this.setControls();
    }

    // Crée les animations du personnage.
    createAnimations() {
        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'turn',
            frames: [{ key: 'player_sprite', frame: 3 }],
            frameRate: 20
        });
        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 4, end: 6 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'jump',
            frames: [{ key: 'player_sprite', frame: 7 }],
            frameRate: 10
        });
        this.scene.anims.create({
            key: 'punch1',
            frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 8, end: 12 }),
            frameRate: 15,
            repeat: 0
        });
    }

    // Définit la taille et la position de la hitbox du joueur.
    setHitbox() {
        this.sprite.body.setSize(18, 28);
        this.sprite.body.setOffset(7, 4);
    }

    // Configure les touches de contrôle en lisant les paramètres sauvegardés.
    setControls() {
        const savedControls = JSON.parse(localStorage.getItem('gameControls'));
        const controls = savedControls[`player${this.playerIndex}`];

        this.leftKey = this.scene.input.keyboard.addKey(controls.left);
        this.rightKey = this.scene.input.keyboard.addKey(controls.right);
        this.downKey = this.scene.input.keyboard.addKey(controls.down);
        this.jumpKey = this.scene.input.keyboard.addKey(controls.jump);
        this.attackKey = this.scene.input.keyboard.addKey(controls.attack);
    }

    // Crée la barre de vie du joueur.
    createHealthBar(x, y) {
        this.healthBar = this.scene.add.graphics();
        this.drawHealthBar(x, y);
    }

    // Met à jour la barre de vie visuellement.
    drawHealthBar(x, y) {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 1); // Fond noir
        this.healthBar.fillRect(x, y, 204, 24);
        this.healthBar.fillStyle(0x880000, 1); // Fond rouge (vie perdue)
        this.healthBar.fillRect(x + 2, y + 2, 200, 20);
        if (this.hp > 0) {
            this.healthBar.fillStyle(0x00ff00, 1); // Barre verte (vie restante)
            this.healthBar.fillRect(x + 2, y + 2, this.hp * 2, 20);
        }
    }

    // Gère la perte de points de vie.
    takeDamage() {
        this.hp -= 10;
        if (this.hp < 0) this.hp = 0;
        if (this.healthBar) {
            this.drawHealthBar(this.healthBar.x, this.healthBar.y);
        }
        if (this.hp === 0) {
            // Logique de mort : teint le sprite en rouge, désactive les mouvements et les collisions.
            this.sprite.setTint(0xff0000); 
            this.sprite.setVelocity(0, 0);
            this.sprite.setCollideWorldBounds(false);
            this.sprite.body.enable = false;
        }
    }

    // La logique de mise à jour, appelée à chaque image du jeu.
    update() {
        // Si le joueur est mort, on ne fait rien.
        if (this.hp <= 0) {
            return;
        }

        // Le joueur ne peut pas bouger s'il est en train d'attaquer.
        if (this.isAttacking) {
            this.sprite.setVelocityX(0);
            return;
        }

        // Gère l'accroupissement.
        if (this.downKey.isDown) {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('turn');
            this.sprite.body.setSize(18, 18);
            this.sprite.body.setOffset(7, 14);
            return;
        } else {
            this.setHitbox();
        }

        // Gère le mouvement horizontal (gauche et droite).
        if (this.leftKey.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.anims.play('left', true);
            this.sprite.flipX = true;
        } else if (this.rightKey.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.anims.play('right', true);
            this.sprite.flipX = false;
        } else {
            this.sprite.setVelocityX(0);
            if (this.sprite.body.touching.down) {
                this.sprite.anims.play('turn');
            }
        }

        // Gère le double saut.
        if (this.sprite.body.touching.down) {
            this.jumpCount = 2;
        }
        if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.jumpCount > 0) {
            this.sprite.setVelocityY(-330);
            this.jumpCount--;
            this.sprite.anims.play('jump');
        }

        // Gère l'attaque.
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.isAttacking = true;
            this.sprite.anims.play('punch1', true);
            this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.isAttacking = false;
            });
            this.attackHitbox.x = this.sprite.x + (this.sprite.flipX ? -20 : 20);
            this.attackHitbox.y = this.sprite.y;
            this.attackHitbox.setVisible(true);
            this.scene.time.delayedCall(300, () => {
                this.attackHitbox.setVisible(false);
            });
        }

        // Maintient la hitbox d'attaque près du joueur pendant l'attaque.
        if (this.isAttacking) {
            this.attackHitbox.x = this.sprite.x + (this.sprite.flipX ? -20 : 20);
            this.attackHitbox.y = this.sprite.y;
        }
    }
}