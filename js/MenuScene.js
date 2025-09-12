// La classe MenuScene gère l'affichage et les interactions du menu de démarrage.
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.controls = {}; // Objet pour stocker la configuration des touches.
        this.controlElements = []; // Tableau pour stocker les éléments du menu de contrôle.
    }

    create() {
        // Définit la couleur de fond de la scène.
        this.cameras.main.setBackgroundColor('#3498db');
        // Charge les touches sauvegardées ou les paramètres par défaut.
        this.loadControls();

        // Crée le titre du jeu.
        this.titleText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 'Jeu test', {
            fontSize: '64px',
            fill: '#fff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Crée le bouton "Jouer".
        this.playButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Jouer', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive();

        // Crée le bouton "Contrôles".
        this.controlsButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 70, 'Contrôles', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setInteractive();
        
        // Crée le bouton "Retour au menu" (initialement caché).
        this.backButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Retour au menu', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive().setVisible(false);

        // Configure les actions des boutons.
        this.playButton.on('pointerdown', () => {
            this.scene.start('GameScene'); // Démarre la scène du jeu.
        });
        this.controlsButton.on('pointerdown', () => {
            this.showControlsMenu(); // Affiche le menu de contrôle.
        });
        this.backButton.on('pointerdown', () => {
            this.showMainMenu(); // Affiche le menu principal.
        });

        // Ajoute les effets de survol pour chaque bouton.
        this.playButton.on('pointerover', () => this.playButton.setTint(0xcccccc));
        this.playButton.on('pointerout', () => this.playButton.setTint(0xffffff));
        this.controlsButton.on('pointerover', () => this.controlsButton.setTint(0xcccccc));
        this.controlsButton.on('pointerout', () => this.controlsButton.setTint(0xffffff));
        this.backButton.on('pointerover', () => this.backButton.setTint(0xcccccc));
        this.backButton.on('pointerout', () => this.backButton.setTint(0xffffff));
    }

    // Affiche le menu de contrôle et cache le menu principal.
    showControlsMenu() {
        this.titleText.setVisible(false);
        this.playButton.setVisible(false);
        this.controlsButton.setVisible(false);
        this.backButton.setVisible(true);
        this.displayControls();
    }

    // Affiche le menu principal et cache le menu de contrôle.
    showMainMenu() {
        this.titleText.setVisible(true);
        this.playButton.setVisible(true);
        this.controlsButton.setVisible(true);
        this.backButton.setVisible(false);
        // Supprime tous les éléments du menu de contrôle pour nettoyer l'écran.
        this.controlElements.forEach(el => el.destroy());
        this.controlElements = [];
    }

    // Charge les configurations de touches depuis le localStorage.
    loadControls() {
        const savedControls = localStorage.getItem('gameControls');
        if (savedControls) {
            this.controls = JSON.parse(savedControls);
        } else {
            // Si aucune configuration n'est trouvée, utilise les touches par défaut.
            this.controls = {
                player1: { left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', jump: 'Space', attack: 'E' },
                player2: { left: 'A', right: 'D', down: 'S', jump: 'W', attack: 'Q' }
            };
            this.saveControls();
        }
    }

    // Sauvegarde les configurations de touches dans le localStorage.
    saveControls() {
        localStorage.setItem('gameControls', JSON.stringify(this.controls));
    }

    // Affiche la liste des touches modifiables.
    displayControls() {
        const player1Text = this.add.text(100, 150, 'Joueur 1', { fontSize: '24px', fill: '#fff' });
        const player2Text = this.add.text(this.cameras.main.width - 200, 150, 'Joueur 2', { fontSize: '24px', fill: '#fff' });
        this.controlElements.push(player1Text, player2Text);

        // Crée un champ cliquable pour chaque touche.
        this.createKeyInput(200, 200, 'Gauche', 'player1', 'left');
        this.createKeyInput(200, 250, 'Droite', 'player1', 'right');
        this.createKeyInput(200, 300, 'Accroupir', 'player1', 'down');
        this.createKeyInput(200, 350, 'Saut', 'player1', 'jump');
        this.createKeyInput(200, 400, 'Attaque', 'player1', 'attack');

        this.createKeyInput(this.cameras.main.width - 200, 200, 'Gauche', 'player2', 'left');
        this.createKeyInput(this.cameras.main.width - 200, 250, 'Droite', 'player2', 'right');
        this.createKeyInput(this.cameras.main.width - 200, 300, 'Accroupir', 'player2', 'down');
        this.createKeyInput(this.cameras.main.width - 200, 350, 'Saut', 'player2', 'jump');
        this.createKeyInput(this.cameras.main.width - 200, 400, 'Attaque', 'player2', 'attack');
    }

    // Fonction pour créer un champ de touche modifiable.
    createKeyInput(x, y, label, player, control) {
        const keyText = this.add.text(x, y, `${label}: ${this.controls[player][control]}`, {
            fontSize: '20px',
            fill: '#fff'
        }).setInteractive();
        this.controlElements.push(keyText);

        // Gère le clic pour modifier la touche.
        keyText.on('pointerdown', () => {
            keyText.setText('Appuyez sur une touche...');
            // Attend la prochaine touche enfoncée pour la sauvegarder.
            this.input.keyboard.once('keydown', (event) => {
                const key = event.key.toUpperCase();
                this.controls[player][control] = key;
                this.saveControls();
                keyText.setText(`${label}: ${key}`);
            });
        });
    }
}