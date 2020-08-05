import Player from "./player.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload() {

    }

    create() {
        // const LARGURA_JOGO = this.sys.canvas.width;
        // const ALTURA_JOGO = this.sys.canvas.height;
        // const IMG_BACKGROUND = this.add.image(LARGURA_JOGO, ALTURA_JOGO, 'room');
        const IMG_BACKGROUND = this.add.image(0, 0, 'room');
        IMG_BACKGROUND.setOrigin(0, 0);

        /* const BGM = this.sound.add('theme', {
            volume: 0.2,
            loop: true
        });
        BGM.play(); */

        const PLATAFORMAS = this.physics.add.staticGroup();
        // Teste
        PLATAFORMAS.create(100, 500, 'platform1').setOrigin(0, 0).refreshBody();
        PLATAFORMAS.create(150, 600, 'platform2').setOrigin(0, 0).refreshBody();
        PLATAFORMAS.create(300, 400, 'platform3').setOrigin(0, 0).refreshBody();
        PLATAFORMAS.create(450, 700, 'platform4').setOrigin(0, 0).refreshBody();
        PLATAFORMAS.create(600, 300, 'platform5').setOrigin(0, 0).refreshBody();

        this.player = new Player(this);
        this.physics.add.collider(this.player.sprite, PLATAFORMAS);
        this.teclas = this.input.keyboard.createCursorKeys();
    }

    update() {
        const PLAYER = this.player.sprite;

        if (this.teclas.left.isDown) {
            PLAYER.setVelocityX(-160);
            PLAYER.setFlip(true, false)
            PLAYER.anims.play('left', true);

        } else if (this.teclas.right.isDown) {
            PLAYER.setVelocityX(160);
            PLAYER.setFlip(false, false)
            PLAYER.anims.play('right', true);

        } else {
            PLAYER.setVelocityX(0);

            if (PLAYER.body.touching.down) {
                PLAYER.anims.play('idle');
            }
        }

        if (this.teclas.up.isDown && PLAYER.body.touching.down) {
            PLAYER.setVelocityY(-100);
            PLAYER.anims.play('jump')
        }
    }
}
