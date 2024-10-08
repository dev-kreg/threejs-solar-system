import * as THREE from 'three';

export class TimeManager {
    private clock: THREE.Clock;
    private timeScale: number;
    private lastFrameTime: number;
    private accumulatedTime: number;

    constructor() {
        this.clock = new THREE.Clock();
        this.timeScale = 100000; // Initialize with 100000x speed (10^5)
        this.lastFrameTime = 0;
        this.accumulatedTime = 0;
        this.clock.start();
    }

    updateTime() {
        const currentTime = this.clock.getElapsedTime();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.accumulatedTime += deltaTime * this.timeScale;
        return this.accumulatedTime;
    }

    setTimeScale(scale: number) {
        this.timeScale = scale;
    }

    getAccumulatedTime() {
        return this.accumulatedTime;
    }
}