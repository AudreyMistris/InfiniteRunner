let GAME;

// Global game settings
let SETTINGS = {
    platformSpeedRange: [250, 300],
    spawnRange: [80, 300],
    platformSizeRange: [75, 300],
    platformHeightRange: [-10, 10],
    platformHeighScale: 20,
    platformVerticalLimit: [0.4, 0.8],
    playerGravity: 900,
    jumpForce: 400,
    jumps: 2,

    // % of probability a coin appears on the platform
    coinChance: 33
}

window.onload = function () {

    // Configuration options
    let CONFIG = {
        type: Phaser.AUTO,
        width: 1330,
        height: 750,

        // backgroundColor: 0x0C88C7,
        backgroundColor: 0x000000,
        parent: 'game-infiniteRunner',

        physics: {
            default: "arcade",
            arcade: {
                /* gravity: {
                    y: 300
                }, */
                debug: false
            }
        },

        scene: [loadGame, playGame],
    }
    GAME = new Phaser.Game(CONFIG);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
}

// loadGame scene
class loadGame extends Phaser.Scene {
    constructor() {
        super("LoadGame");
    }

    preload() {
        const LARGURA_JOGO = this.sys.canvas.width;
        const PROGRESS_BAR = this.add.graphics();
        const LARGURA_BARRA = 0.7 * LARGURA_JOGO;

        this.load.on('progress', (value) => {
            PROGRESS_BAR.clear();
            PROGRESS_BAR.fillStyle(0xB33B44, 1);
            PROGRESS_BAR.fillRect((LARGURA_JOGO - LARGURA_BARRA) / 2, this.sys.game.config.height / 2, LARGURA_BARRA * value, 20);
            PROGRESS_BAR.lineStyle(4, 0xFFFFFF, 1);
            PROGRESS_BAR.strokeRect((LARGURA_JOGO - LARGURA_BARRA) / 2, this.sys.game.config.height / 2, LARGURA_BARRA, 20);
        });

        this.load.on('complete', () => {
            this.scene.start('PlayGame');
        });

        // this.load.image('background', 'sky.png');
        this.load.image('background', 'deep_space.gif');

        this.load.image("platform", "Platform03.png");

        this.load.spritesheet('sprite', 'character_spritesheet_3px.png', {
            frameWidth: 29,
            frameHeight: 43
        });
        this.load.spritesheet('ruby', 'ruby_spritesheet.png', {
            frameWidth: 25,
            frameHeight: 26
        });

        this.load.audio('theme', 'ukulele.mp3');
        this.load.audio('gotCoin', 'pick_coin.wav');
        this.load.audio('jumped', 'jump1.wav');
        this.load.audio('death', 'Debuff1.ogg');
    }

    create() {
        // Coin animation
        this.anims.create({
            key: "turn",
            frames: this.anims.generateFrameNumbers("ruby", {
                start: 0,
                end: 15
            }),
            frameRate: 10,
            yoyo: true, // Better dynamic animation I guess
            repeat: -1
        });

        // Set background music
        const BGM = this.sound.add('theme', {
            volume: 0.3,
            loop: true
        });
        BGM.play();

        this.scene.start("PlayGame");
    }
}

// playGame scene
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    preload() {

    }

    create() {

        // Set background image and new origin
        const IMG_BACKGROUND = this.add.image(0, 0, 'background');
        IMG_BACKGROUND.setOrigin(0, 0).setScale(4.2);

        // API -> setBoundsCollision(checkLeft, checkRight, checkUp, checkDown);
        // Collision bounds on west, east and north walls, open on south wall
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Keeping track of added platforms
        this.addedPlatforms = 0;

        // Group of dynamic platforms
        this.platformGroup = this.add.group({

            // once a platform is removed, it's added to the storage
            removeCallback: function (platform) {
                platform.scene.platformStorage.add(platform)
            }
        });

        // Storage of platforms
        this.platformStorage = this.add.group({

            // once a platform is removed from the storage, it's added to the dynamic platforms group
            removeCallback: function (platform) {
                platform.scene.platformGroup.add(platform)
            }
        });

        // Group of active coins/rubies.
        this.coinGroup = this.add.group({

            // once a coin is removed, it's added to the storage
            removeCallback: function (coin) {
                coin.scene.coinStorage.add(coin)
            }
        });

        // Ruby coin storage
        this.coinStorage = this.add.group({

            // once a coin is removed from the storage, it's added to the active coins group
            removeCallback: function (coin) {
                coin.scene.coinGroup.add(coin)
            }
        });

        let ruby_coins = 0;
        let coinText = this.add.text(20, 10, 'Ruby Coins: 0', {
            fontSize: '30px',
            fill: '#FFFFFF'
        });

        // Create the player
        this.player = new Player(this);

        // Qtt of consecutive jumps made by the player
        this.playerJumps = 0;

        // Adding a platform with [platform width, x position and y position]
        this.addPlatform(GAME.config.width, GAME.config.width / 2, GAME.config.height * 0.8 * SETTINGS.platformVerticalLimit[1]);

        // Adding the player and specific gravity
        this.player.sprite.setGravityY(SETTINGS.playerGravity);

        // Setting collisions between the player and the platform group
        this.physics.add.collider(this.player.sprite, this.platformGroup);

        // Checking if player overlaps with any of the ruby coins, then call function
        this.physics.add.overlap(this.player.sprite, this.coinGroup, collectCoin, null, this);

        function collectCoin(player, ruby) {
            ruby.disableBody(true, true);

            //  Add and update the ruby coins info
            ruby_coins += 1;
            coinText.setText('Ruby Coins: ' + ruby_coins);

            const coin_soud = this.sound.add('gotCoin', {
                volume: 0.5
            });
            coin_soud.play();
        }

        // Setting collisions between the player and the ruby coin group
        this.physics.add.overlap(this.player.sprite, this.coinGroup, function (player, coin) {
            this.tweens.add({
                targets: coin,
                y: coin.y - 100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,

                onComplete: function () {
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                }
            });
        }, null, this);

        // Checking for input for jump (enables Double Jump)
        this.input.keyboard.on('keydown-UP', this.jump, this);

        this.teclas = this.input.keyboard.createCursorKeys();
    }

    // Platform are added from the storage or created instantly
    addPlatform(platformWidth, posX, posY) {
        this.addedPlatforms++;
        let platform;

        if (this.platformStorage.getLength()) {
            platform = this.platformStorage.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformStorage.remove(platform);
            let newRatio = platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;

        } else {
            platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(SETTINGS.platformSpeedRange[0], SETTINGS.platformSpeedRange[1]) * -1);
            this.platformGroup.add(platform);
        }

        this.nextPlatformDistance = Phaser.Math.Between(SETTINGS.spawnRange[0], SETTINGS.spawnRange[1]);

        // Calculate chances to have a coin over a new platform
        if (this.addedPlatforms > 1) {
            if (Phaser.Math.Between(1, 100) <= SETTINGS.coinChance) {
                if (this.coinStorage.getLength()) {
                    let coin = this.coinStorage.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinStorage.remove(coin);

                } else {
                    let coin = this.physics.add.sprite(posX, posY - 96, "ruby");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("turn");
                    this.coinGroup.add(coin);
                }
            }
        }
    }

    // Double Jump!
    jump() {
        if (this.player.sprite.body.touching.down || (this.playerJumps > 0 && this.playerJumps < SETTINGS.jumps)) {
            if (this.player.sprite.body.touching.down) {
                this.playerJumps = 0;
                this.player.sprite.anims.play('jump')

                const jump_sound = this.sound.add('jumped', {
                    volume: 0.4
                });
                jump_sound.play();
            }
            this.player.sprite.setVelocityY(SETTINGS.jumpForce * (-1));
            this.playerJumps++;
        }
    }

    update() {
        const PLAYER = this.player.sprite;

        // Game over
        if (PLAYER.y >= GAME.config.height) {
            this.physics.pause();
            PLAYER.anims.play('midair');

            const dead_sound = this.sound.add('death', {
                volume: 0.5
            });
            dead_sound.play();

            this.scene.start("PlayGame");
        }

        if (this.teclas.left.isDown) {
            PLAYER.setVelocityX(-275);
            PLAYER.setFlip(true, false)
            PLAYER.anims.play('left', true);

        } else if (this.teclas.right.isDown) {
            PLAYER.setVelocityX(275);
            PLAYER.setFlip(false, false)
            PLAYER.anims.play('right', true);

        } else {
            PLAYER.setVelocityX(0);

            if (PLAYER.body.touching.down) {
                PLAYER.anims.play('idle');
            }
            if (!PLAYER.body.touching.down) {
                PLAYER.anims.play('midair');
            }
        }

        if (this.teclas.up.isDown && PLAYER.body.touching.down) {
            PLAYER.setVelocityY(-330);
            PLAYER.anims.play('jump')
        }

        // Recycling platforms for memory
        let minDistance = GAME.config.width;
        let rightmostPlatformHeight = 0;

        this.platformGroup.getChildren().forEach(function (platform) {
            let platformDistance = GAME.config.width - platform.x - platform.displayWidth / 2;
            if (platformDistance < minDistance) {
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if (platform.x < - platform.displayWidth / 2) {
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // Recycling coins for memory
        this.coinGroup.getChildren().forEach(function (coin) {
            if (coin.x < - coin.displayWidth / 2) {
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        // Adding new platforms
        if (minDistance > this.nextPlatformDistance) {
            let nextPlatformWidth = Phaser.Math.Between(SETTINGS.platformSizeRange[0], SETTINGS.platformSizeRange[1]);
            let platformRandomHeight = SETTINGS.platformHeighScale * Phaser.Math.Between(SETTINGS.platformHeightRange[0], SETTINGS.platformHeightRange[1]);

            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = GAME.config.height * SETTINGS.platformVerticalLimit[0];
            let maxPlatformHeight = GAME.config.height * SETTINGS.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);

            this.addPlatform(nextPlatformWidth, GAME.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }
    }
};

class Player {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(200, GAME.config.height / 2, 'sprite');
        this.sprite.body.setSize(29, 43);
        this.sprite.setScale(1.5);
        // this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);

        scene.anims.create({
            key: 'idle',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 0, end: 11 }),
            frameRate: 20,
            repeat: -1
        });

        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 16, end: 23 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 16, end: 23 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 12, end: 13 }),
            frameRate: 3,
            repeat: -1
        });

        scene.anims.create({
            key: 'midair',
            frames: scene.anims.generateFrameNumbers('sprite', { start: 14, end: 15 }),
            frameRate: 3,
            repeat: -1
        });
    }
};

function resize() {
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = GAME.config.width / GAME.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
