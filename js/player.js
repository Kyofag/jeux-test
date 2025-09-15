class Player {
    constructor(scene, playerIndex) {
        this.scene = scene;
        this.playerIndex = playerIndex;
        
        let startX, startColor;
        if (this.playerIndex === 1) {
            startX = 100;
            startColor = 0xffffff;
        } else {
            startX = this.scene.sys.game.config.width - 100;
            startColor = 0x00ff00;
        }

        this.sprite = this.scene.physics.add.sprite(startX, 450, 'player_sprite');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setTint(startColor);

        this.jumpCount = 0;
        this.isAttacking = false;
        this.hp = 7000;
        this.healthBar = null;

        this.attackHitbox = this.scene.add.rectangle(0, 0, 40, 40);
        this.scene.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.allowGravity = false;
        this.attackHitbox.setVisible(false);
        this.attackHitbox.body.enable = false;

        this.createAnimations();
        this.setHitbox(); // La fonction corrigée est appelée ici
        this.setControls();
    }

    createAnimations() {
        // Animation de marche pour les deux directions
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 0, end: 5 }), // Utilise les 6 premières frames
            frameRate: 10,
            repeat: -1
        });

        // Le code de l'animation 'turn' pour l'état d'inactivité
        this.scene.anims.create({
            key: 'turn',
            frames: [{ key: 'player_sprite', frame: 0 }],
            frameRate: 20
        });
        
        // Animation de saut
        this.scene.anims.create({
            key: 'jump',
            frames: [{ key: 'player_sprite', frame: 6 }],
            frameRate: 10
        });

        // Animation de coup de poing
        this.scene.anims.create({
            key: 'punch1',
            frames: this.scene.anims.generateFrameNumbers('player_sprite', { start: 7, end: 11 }),
            frameRate: 15,
            repeat: 0
        });
    }

    // Fonction corrigée
    setHitbox() {
        this.sprite.body.setSize(20, 32); // Taille du corps physique
        this.sprite.body.setOffset(6, 0); // Décalage pour aligner le corps sur le sprite
    }

    setControls() {
        const savedControls = JSON.parse(localStorage.getItem('gameControls'));
        const controls = savedControls[`player${this.playerIndex}`];

        this.leftKey = this.scene.input.keyboard.addKey(controls.left);
        this.rightKey = this.scene.input.keyboard.addKey(controls.right);
        this.downKey = this.scene.input.keyboard.addKey(controls.down);
        this.jumpKey = this.scene.input.keyboard.addKey(controls.jump);
        this.attackKey = this.scene.input.keyboard.addKey(controls.attack);
    }

    createHealthBar(x, y) {
        this.healthBar = this.scene.add.graphics();
        this.drawHealthBar(x, y);
    }

    drawHealthBar(x, y) {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 1);
        this.healthBar.fillRect(x, y, 204, 24);
        this.healthBar.fillStyle(0x880000, 1);
        this.healthBar.fillRect(x + 2, y + 2, 200, 20);
        if (this.hp > 0) {
            this.healthBar.fillStyle(0x00ff00, 1);
            this.healthBar.fillRect(x + 2, y + 2, (this.hp / 7000) * 200, 20);
        }
    }

    takeDamage() {
        this.hp -= 100;
        if (this.hp < 0) this.hp = 0;
        if (this.healthBar) {
            this.drawHealthBar(this.healthBar.x, this.healthBar.y);
        }
        if (this.hp === 0) {
            this.sprite.setTint(0xff0000); 
            this.sprite.setVelocity(0, 0);
            this.sprite.setCollideWorldBounds(false);
            this.sprite.body.enable = false;
        }
    }

    update() {
        if (this.hp <= 0) {
            return;
        }

        if (this.isAttacking) {
            this.sprite.setVelocityX(0);
            return;
        }

        if (this.downKey.isDown) {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('turn');
            this.sprite.body.setSize(20, 16);
            this.sprite.body.setOffset(6, 16);
            return;
        } else {
            this.setHitbox();
        }

        if (this.leftKey.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.anims.play('walk', true);
            this.sprite.flipX = true;
        } else if (this.rightKey.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.anims.play('walk', true);
            this.sprite.flipX = false;
        } else {
            this.sprite.setVelocityX(0);
            if (this.sprite.body.touching.down) {
                this.sprite.anims.play('turn');
            }
        }

        if (this.sprite.body.touching.down) {
            this.jumpCount = 2;
        }
        if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.jumpCount > 0) {
            this.sprite.setVelocityY(-330);
            this.jumpCount--;
            this.sprite.anims.play('jump');
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.isAttacking = true;
            this.sprite.anims.play('punch1', true);
            this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.isAttacking = false;
            });
            
            this.attackHitbox.body.enable = true;
            this.attackHitbox.x = this.sprite.x + (this.sprite.flipX ? -20 : 20);
            this.attackHitbox.y = this.sprite.y;
            this.attackHitbox.setVisible(true);

            this.scene.time.delayedCall(1000, () => {
                this.attackHitbox.setVisible(false);
                this.attackHitbox.body.enable = false;
            });
        }

        if (this.isAttacking) {
            this.attackHitbox.x = this.sprite.x + (this.sprite.flipX ? -20 : 20);
            this.attackHitbox.y = this.sprite.y;
        }
    }
}