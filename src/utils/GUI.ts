import GUI from 'lil-gui';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TimeManager } from './TimeManager';
import { SolarSystemScene } from '../scenes/SolarSystemScene';

export class GUIManager {
    private gui: GUI;

    constructor(bloomPass: UnrealBloomPass, timeManager: TimeManager, scene: SolarSystemScene) {
        this.gui = new GUI();
        this.setupTimeControls(timeManager);
        this.setupOrbitLineControls(scene);
    }

    private setupTimeControls(timeManager: TimeManager) {
        const timeControl = { exponent: 5 };
        const updateTimeScale = (value: number) => {
            const scale = Math.pow(10, value);
            timeManager.setTimeScale(scale);
            timeScaleGUI.name(`Time Scale: ${scale.toFixed()}x`);
        };

        const timeScaleGUI = this.gui.add(timeControl, 'exponent', 0, 7, 0.25)
            .name('Time Scale: 100000x')
            .onChange(updateTimeScale);

        // Initialize with 100000x speed (10^5)
        updateTimeScale(5);
    }

    private setupOrbitLineControls(scene: SolarSystemScene) {
        const orbitLineVisibility = { visible: true };
        this.gui.add(orbitLineVisibility, 'visible')
            .name('Show Orbit Lines')
            .onChange((value: boolean) => {
                scene.setOrbitLineVisibility(value);
            });
    }
}