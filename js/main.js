import LoadingScene from './loading-scene.js';
import GameScene from './game-scene.js';

const CONFIG = {
    type: Phaser.AUTO,
    width: 549,
    height: 360,
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