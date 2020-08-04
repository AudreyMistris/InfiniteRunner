export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'LoadingScene'
        });
    }

    preload() {
        const LARGURA_JOGO = this.sys.canvas.width;
        const PROGRESS_BAR = this.add.graphics();
        const LARGURA_BARRA = 0.7 * LARGURA_JOGO;

        this.load.on('progress', (value) => {
            PROGRESS_BAR.clear();
            // PROGRESS_BAR.fillStyle(0x52BF8B, 1);
            PROGRESS_BAR.fillStyle(0xE31C92, 1);
            PROGRESS_BAR.fillRect((LARGURA_JOGO - LARGURA_BARRA) / 2, this.sys.game.config.height / 2, LARGURA_BARRA * value, 20);
            // PROGRESS_BAR.lineStyle(4, 0xE31C92, 1);
            PROGRESS_BAR.lineStyle(4, 0x52BF8B, 1);
            PROGRESS_BAR.strokeRect((LARGURA_JOGO - LARGURA_BARRA) / 2, this.sys.game.config.height / 2, LARGURA_BARRA, 20);
        });

        this.load.on('complete', () => {
            this.scene.start('GameScene');
        });

        this.load.image('room', 'background.png');
        this.load.image('floor', 'Platform03.png');
        this.load.image('platform1', 'Platform01.png');
        this.load.image('platform2', 'Platform02.png');
        this.load.image('platform3', 'Platform03.png');
        this.load.image('platform4', 'Platform04.png');
        this.load.image('platform5', 'Platform05.png');
        // this.load.audio('theme', '...');
        // this.load.sound();
        this.load.spritesheet('sprite', 'adventurer-Sheet.png', { frameWidth: 50, frameHeight: 37 });

    
    }

    create() {

    }

    update() {

    }
}
