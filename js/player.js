// La classe Player gère toutes les propriétés et les actions du personnage.
class Player {
    constructor(scene) {
        this.scene = scene;
        // Crée le sprite du joueur et le rend physique (gravité, collision).
        this.sprite = this.scene.physics.add.sprite(100, 450, 'player_sprite');
        this.sprite.setBounce(0.2); // Donne un léger rebond au joueur.
        this.sprite.setCollideWorldBounds(true); // Le joueur ne peut pas sortir de l'écran.

        // Initialise les variables d'état du joueur.
        this.jumpCount = 0;
        this.isAttacking = false;

        // Crée la zone de collision pour l'attaque (initialement invisible et sans gravité).
        this.attackHitbox = this.scene.add.rectangle(0, 0, 40, 40);
        this.scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.allowGravity = false;
        this.attackHitbox.setVisible(false);

        // Appelle les fonctions pour créer les animations, la hitbox et les contrôles.
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

    // Configure les touches de contrôle.
    setControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.jumpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    // La logique de mise à jour, appelée à chaque image du jeu.
    update() {
        // Le joueur ne peut pas bouger s'il est en train d'attaquer.
        if (this.isAttacking) {
            this.sprite.setVelocityX(0);
            return;
        }

        // Gère l'accroupissement.
        if (this.cursors.down.isDown) {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('turn'); // Remplacez par une animation d'accroupissement si vous en avez une.
            this.sprite.body.setSize(18, 18);
            this.sprite.body.setOffset(7, 14);
            return;
        } else {
            this.setHitbox(); // Rétablit la hitbox normale.
        }

        // Gère le mouvement horizontal (gauche et droite).
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.anims.play('left', true);
            this.sprite.flipX = true; // Inverse l'image pour qu'il regarde à gauche.
        } else if (this.cursors.right.isDown) {
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
            this.jumpCount = 2; // Réinitialise les sauts lorsque le joueur touche le sol.
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
            // Événement déclenché à la fin de l'animation d'attaque.
            this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.isAttacking = false;
            });
            // Positionne et active la hitbox d'attaque.
            this.attackHitbox.x = this.sprite.x + (this.sprite.flipX ? -20 : 20);
            this.attackHitbox.y = this.sprite.y;
            this.attackHitbox.setVisible(true);
            // Désactive la hitbox d'attaque après 300ms.
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