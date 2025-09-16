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

        // Code ajouté pour doubler la taille du personnage
        this.sprite.setScale(2);

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
        this.setHitbox();
        this.setControls();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'left',
            frames: [
                { key: 'player_sprite', frame: 'princess_walk_1' },
                { key: 'player_sprite', frame: 'princess_walk_2' },
                { key: 'player_sprite', frame: 'princess_walk_3' },
                { key: 'player_sprite', frame: 'princess_walk_4' }
            ],
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'right',
            frames: [
                { key: 'player_sprite', frame: 'princess_walk_1' },
                { key: 'player_sprite', frame: 'princess_walk_2' },
                { key: 'player_sprite', frame: 'princess_walk_3' },
                { key: 'player_sprite', frame: 'princess_walk_4' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'turn',
            frames: [
                { key: 'player_sprite', frame: 'princess_idle_1' },
                { key: 'player_sprite', frame: 'princess_idle_2' },
                { key: 'player_sprite', frame: 'princess_idle_3' },
                { key: 'player_sprite', frame: 'princess_idle_4' }
            ],
            frameRate: 10,
            repeat: -1
        });
        
        this.scene.anims.create({
            key: 'jump',
            frames: [{ key: 'player_sprite', frame: 'princess_walk_2' }],
            frameRate: 10
        });

        this.scene.anims.create({
            key: 'punch1',
            frames: [
                { key: 'player_sprite', frame: 'princess_walk_1' },
                { key: 'player_sprite', frame: 'princess_walk_2' },
                { key: 'player_sprite', frame: 'princess_walk_3' },
                { key: 'player_sprite', frame: 'princess_walk_4' }
            ],
            frameRate: 15,
            repeat: 0
        });
    }

    // Hitbox mise à jour avec des valeurs doublées
    setHitbox() {
        this.sprite.body.setSize(32, 56);
        this.sprite.body.setOffset(16, 8);
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
            this.sprite.body.setSize(36, 36);
            this.sprite.body.setOffset(14, 28);
            return;
        } else {
            this.setHitbox();
        }

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