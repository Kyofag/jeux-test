// La classe Arena est responsable de la création du niveau et des plateformes.
class Arena {
    constructor(scene) {
        this.scene = scene;
        // Crée un groupe statique pour les plateformes, optimisé pour les objets qui ne bougent pas.
        this.platforms = this.scene.physics.add.staticGroup();
        this.createPlatforms();
    }

    // Crée les plateformes du niveau.
    createPlatforms() {
        // Crée une plateforme de sol qui s'étend sur toute la largeur de l'écran.
        const floor = this.platforms.create(
            this.scene.sys.game.config.width / 2, // Position X au centre
            this.scene.sys.game.config.height - 32, // Position Y en bas
            'platform'
        ).setScale(this.scene.sys.game.config.width / 200, 1) // Étend la plateforme horizontalement.
          .refreshBody(); // Met à jour le corps physique après avoir modifié l'échelle.
    }

    // Retourne le groupe de plateformes pour que d'autres objets puissent interagir avec.
    getPlatforms() {
        return this.platforms;
    }
}