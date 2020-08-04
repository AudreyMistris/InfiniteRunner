export default class Player {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(10, 100, 'sprite');
        this.sprite.body.setSize(50, 37);
        // this.sprite.setScale(1.2);
        // this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 8, end: 13 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 8, end: 13 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 14, end: 23 }),
            frameRate: 9,
            repeat: -1
        });
    }
}
