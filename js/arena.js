// Définition de la classe Arena
class Arena {
    constructor(scene) {
        this.scene = scene;
        this.platforms = this.scene.physics.add.staticGroup();
        this.createPlatforms();
    }

    createPlatforms() {
        const floor = this.platforms.create(
            this.scene.sys.game.config.width / 2,
            this.scene.sys.game.config.height - 32,
            'platform'
        ).setScale(this.scene.sys.game.config.width / 200, 1).refreshBody();
    }

    getPlatforms() {
        return this.platforms;
    }
}