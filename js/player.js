// Définition de la classe Player
class Player {
    constructor(scene) {
        this.scene = scene;
        this.player = this.scene.physics.add.sprite(100, 450, 'player_sprite');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.jumpCount = 0;
        this.isAttacking = false;
        this.attackHitbox = this.scene.add.rectangle(0, 0, 40, 40);
        this.scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.allowGravity = false;
        this.attackHitbox.setVisible(false);

        this.createAnimations();
        this.setHitbox();
        this.setControls();
    }

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

    setHitbox() {
        // La hitbox de base du joueur
        this.player.body.setSize(18, 28);
        this.player.body.setOffset(7, 4);
    }

    setControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.jumpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        // Logique de mouvement et d'attaque
        if (this.isAttacking) {
            this.player.setVelocityX(0);
            return;
        }

        // Accroupissement (prioritaire sur le mouvement)
        if (this.cursors.down.isDown) {
            this.player.setVelocityX(0);
            this.player.anims.play('turn'); // Remplacez par une animation d'accroupissement si vous en avez une
            // Ajuste la hitbox pour l'accroupissement
            this.player.body.setSize(18, 18);
            this.player.body.setOffset(7, 14);
            return; // Le joueur ne bouge pas
        } else {
            // Rétablit la hitbox normale si le joueur ne s'accroupit pas
            this.setHitbox();
        }

        // Mouvement latéral
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.touching.down) {
                this.player.anims.play('turn');
            }
        }

        // Réinitialise le nombre de sauts quand le joueur touche le sol
        if (this.player.body.touching.down) {
            this.jumpCount = 2;
        }

        // Saut
        if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.jumpCount > 0) {
            this.player.setVelocityY(-330);
            this.jumpCount--;
            this.player.anims.play('jump');
        }
        
        // Attaque
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.isAttacking = true;
            this.player.anims.play('punch1', true);
            this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.isAttacking = false;
                this.player.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
            });
            this.attackHitbox.x = this.player.x + (this.player.flipX ? -20 : 20);
            this.attackHitbox.y = this.player.y;
            this.attackHitbox.setVisible(true);
            this.scene.time.delayedCall(300, () => {
                this.attackHitbox.setVisible(false);
            });
        }
        
        // Met à jour la position de la hitbox si une attaque est en cours
        if (this.isAttacking) {
            this.attackHitbox.x = this.player.x + (this.player.flipX ? -20 : 20);
            this.attackHitbox.y = this.player.y;
        }
    }
}