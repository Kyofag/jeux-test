// La classe MenuScene gère tout ce qui se passe dans le menu de démarrage.
class MenuScene extends Phaser.Scene {
    constructor() {
        // Définit la clé de la scène pour pouvoir la démarrer plus tard.
        super({ key: 'MenuScene' });
    }

    preload() {
        // Cette fonction est vide car notre menu n'a pas d'assets à charger.
        // Si vous aviez des images ou de la musique pour le menu, ce serait ici.
    }

    create() {
        // Définit la couleur de fond de la caméra principale.
        this.cameras.main.setBackgroundColor('#3498db');

        // Ajoute le texte du titre du jeu.
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 'Mon Super Jeu', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5); // Centre le texte.

        // Crée le texte du bouton "Jouer".
        const playButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Jouer', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
          .setInteractive(); // Rend le texte cliquable.

        // Ajoute un écouteur d'événement pour le clic de la souris.
        playButton.on('pointerdown', () => {
            // Démarre la scène de jeu lorsque le bouton est cliqué.
            this.scene.start('GameScene');
        });

        // Ajoute un effet visuel lorsque la souris survole le bouton.
        playButton.on('pointerover', () => {
            playButton.setTint(0xcccccc);
        });

        // Supprime l'effet visuel lorsque la souris quitte le bouton.
        playButton.on('pointerout', () => {
            playButton.setTint(0xffffff);
        });
    }
}