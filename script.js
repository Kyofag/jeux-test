console.log("Le script est en cours d'exécution !");

// Configuration du jeu
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: true // Active les lignes de collision pour le débogage
        }
    },
    render: {
        powerPreference: 'high-performance',
        willReadFrequently: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Variables globales du jeu
let player;
let platforms;
let cursors;
let jumpKey;
let attackKey;
let attackHitbox;
let isAttacking = false;
let jumpCount = 0;

// Initialisation du jeu
const game = new Phaser.Game(config);

// Fonction de chargement des ressources
function preload() {
    this.load.image('background', 'image/background.png');
    this.load.image('platform', 'image/platform.png');
    // Chargement de la feuille d'assets avec le nouveau nom de fichier
    this.load.spritesheet('player_sprite', 'image/asset1.png', { frameWidth: 32, frameHeight: 32 });
}

// Fonction de création de la scène
function create() {
    // Arrière-plan couvrant tout l'écran
    const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    backgroundImage.displayWidth = this.sys.game.config.width;
    backgroundImage.displayHeight = this.sys.game.config.height;

    // Création du groupe de plateformes
    platforms = this.physics.add.staticGroup();

    // La plateforme du sol
    const floor = platforms.create(
        this.sys.game.config.width / 2, 
        this.sys.game.config.height - 32, 
        'platform'
    ).setScale(this.sys.game.config.width / 200, 1).refreshBody();

    // Création du joueur avec la nouvelle feuille d'assets
    player = this.physics.add.sprite(100, 450, 'player_sprite');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Définition des animations basées sur la feuille d'assets
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 2 }), // Exemple de frames
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player_sprite', frame: 3 }], // Exemple de frame
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player_sprite', { start: 4, end: 6 }), // Exemple de frames
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: [{ key: 'player_sprite', frame: 7 }], // Exemple de frame de saut
        frameRate: 10
    });

    // Animation de coup de poing
    this.anims.create({
        key: 'punch1',
        frames: this.anims.generateFrameNumbers('player_sprite', { start: 8, end: 12 }), // Frames de punch
        frameRate: 15,
        repeat: 0 // Joue une seule fois
    });

    // Ajustement de la hitbox du joueur
    player.body.setSize(18, 28);
    player.body.setOffset(7, 4);

    // Gestion des collisions avec la plateforme
    this.physics.add.collider(player, platforms);

    // Création de la zone de mort
    deathZone = this.add.rectangle(400, 700, 800, 200);
    this.physics.add.existing(deathZone, true);
    this.physics.add.overlap(player, deathZone, onPlayerDeath, null, this);

    // Initialisation des contrôles du clavier
    cursors = this.input.keyboard.createCursorKeys();
    jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Création de la hitbox d'attaque (invisible)
    attackHitbox = this.add.rectangle(0, 0, 40, 40);
    this.physics.add.existing(attackHitbox);
    attackHitbox.body.allowGravity = false;
    attackHitbox.setVisible(false);
}

// Fonction de mise à jour du jeu (boucle de jeu)
function update() {
    // Si le joueur est en train d'attaquer, il ne peut pas bouger
    if (isAttacking) {
        player.setVelocityX(0);
        return; // Sort de la fonction pour ne pas exécuter le reste de la logique de mouvement
    }

    // Mouvement du joueur (gauche/droite)
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
            player.anims.play('turn');
        }
    }

    // Réinitialise le nombre de sauts quand le joueur touche le sol
    if (player.body.touching.down) {
        jumpCount = 2;
    }

    // Saut du joueur
    if (Phaser.Input.Keyboard.JustDown(jumpKey) && jumpCount > 0) {
        player.setVelocityY(-330);
        jumpCount--;
        player.anims.play('jump');
    }

    // Mouvement vers le bas (s'accroupir)
    if (cursors.down.isDown) {
        player.body.setSize(18, 18);
        player.body.setOffset(7, 14);
    } else {
        player.body.setSize(18, 28);
        player.body.setOffset(7, 4);
    }

    // Système d'attaque (Punch 1)
    if (Phaser.Input.Keyboard.JustDown(attackKey) && !isAttacking) {
        isAttacking = true;
        player.anims.play('punch1', true);

        // Détecte la fin de l'animation de punch
        player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            isAttacking = false;
            player.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
        });

        // Positionne la hitbox d'attaque
        attackHitbox.x = player.x + (player.flipX ? -20 : 20);
        attackHitbox.y = player.y;
        attackHitbox.setVisible(true);

        this.time.delayedCall(300, () => { // Cache la hitbox après 300 ms
            attackHitbox.setVisible(false);
        });
    }

    // Met à jour la position de la hitbox si une attaque est en cours
    if (isAttacking) {
        attackHitbox.x = player.x + (player.flipX ? -20 : 20);
        attackHitbox.y = player.y;
    }
}

// Fonction de mort du joueur
function onPlayerDeath(player, deathZone) {
    console.log("Le joueur est tombé dans le vide !");
    player.setX(100);
    player.setY(450);
    player.setVelocity(0, 0);
    jumpCount = 2;
}