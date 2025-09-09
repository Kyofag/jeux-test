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

// Variables pour les objets principaux
let player;
let arena;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'image/background.png');
    this.load.image('platform', 'image/platform.png');
    this.load.spritesheet('player_sprite', 'image/asset1.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    arena = new Arena(this);
    player = new Player(this);

    this.physics.add.collider(player.player, arena.getPlatforms());
}

function update() {
    player.update();
}