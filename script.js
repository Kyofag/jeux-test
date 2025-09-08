console.log("Le script est en cours d'exécution !");

// Configuration du jeu
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: true
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
let deathZone;
let attackKey;
let attackHitbox;
let isAttacking = false; // Nouvelle variable pour gérer l'état d'attaque

// Initialisation du jeu
const game = new Phaser.Game(config);

// Fonction de chargement des ressources
function preload() {
    this.load.image('background', 'image/background.png');
    this.load.image('platform', 'image/platform.png');
    // --- CHANGEMENT TEMPORAIRE POUR LE DÉBOGAGE DU "DUDE" ---
    this.load.image('dude_temp', 'image/dude.png');
}

// Fonction de création de la scène
function create() {
    // Arrière-plan couvrant tout l'écran
    const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
    backgroundImage.displayWidth = config.width;
    backgroundImage.displayHeight = config.height;

    // Création du groupe de plateformes
    platforms = this.physics.add.staticGroup();

    // Agencement "Champ de Bataille"
    platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    platforms.create(400, 300, 'platform').setScale(1.5, 1).refreshBody();
    platforms.create(150, 420, 'platform').setScale(1, 1).refreshBody();
    platforms.create(650, 420, 'platform').setScale(1, 1).refreshBody();

    // Création du joueur - UTILISE LE FICHIER TEMPORAIRE
    player = this.physics.add.sprite(100, 450, 'dude_temp');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(0.1);
    player.body.setSize(32, 48);

    // --- ANIMATIONS DÉSACTIVÉES TEMPORAIREMENT ---

    // Gestion des collisions avec les plateformes
    this.physics.add.collider(player, platforms);

    // Création de la zone de mort
    deathZone = this.add.rectangle(400, 700, 800, 200);
    this.physics.add.existing(deathZone, true);
    this.physics.add.overlap(player, deathZone, onPlayerDeath, null, this);

    // Initialisation des contrôles du clavier
    cursors = this.input.keyboard.createCursorKeys();
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Création de la hitbox d'attaque (invisible)
    attackHitbox = this.add.rectangle(0, 0, 40, 40);
    this.physics.add.existing(attackHitbox);
    attackHitbox.body.allowGravity = false;
    attackHitbox.setVisible(false);
}

// Fonction de mise à jour du jeu (boucle de jeu)
function update() {
    // Mouvement du joueur (gauche/droite)
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.flipX = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }

    // Saut du joueur
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Mouvement vers le bas (s'accroupir)
    if (cursors.down.isDown) {
        player.body.setSize(32, 24, true);
        player.body.offset.y = 24;
    } else {
        player.body.setSize(32, 48, true);
        player.body.offset.y = 0;
    }

    // --- MISE À JOUR : SYSTÈME D'ATTAQUE PLUS FIABLE ---
    // Si la touche d'attaque est enfoncée (une seule fois)
    if (Phaser.Input.Keyboard.JustDown(attackKey)) {
        isAttacking = true;
        // Positionne la hitbox devant le joueur
        attackHitbox.x = player.x + (player.flipX ? -20 : 20);
        attackHitbox.y = player.y;
        attackHitbox.setVisible(true);

        // Arrête l'attaque après un court délai
        this.time.delayedCall(150, () => {
            isAttacking = false;
            attackHitbox.setVisible(false);
        });
    }

    // Positionne la hitbox pour qu'elle suive le joueur pendant l'attaque
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
}