import LoadingScene from './loading-scene.js';
import GameScene from './game-scene.js';

const CONFIG = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: 0x444444,
    parent: 'jogo-runner',

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 100
            },
            debug: false
        }
    },

    scene: [LoadingScene, GameScene]
};

const GAME = new Phaser.Game(CONFIG);
