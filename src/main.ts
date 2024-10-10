import { SolarSystemScene } from './scenes/SolarSystemScene'
import { TimeManager } from './utils/TimeManager'
import { GUIManager } from './utils/GUI'

const webglCanvas = document.getElementById('webgl') as HTMLCanvasElement
const overlayCanvas = document.getElementById('overlay') as HTMLCanvasElement
const solarSystemScene = new SolarSystemScene(webglCanvas, overlayCanvas)
let timeManager: TimeManager | null = null
let guiManager: GUIManager | null = null

const dateDisplay = document.getElementById('simulated-date')!
const initialDate = new Date()

function updateDateDisplay(elapsedTime: number) {
    const milliseconds = initialDate.getTime() + elapsedTime * 1000
    const currentDate = new Date(milliseconds)
    dateDisplay.textContent = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
}

function animate() {
    if (solarSystemScene.isLoaded) {
        if (!timeManager) {
            // Initialize TimeManager and GUIManager when loading is complete
            timeManager = new TimeManager()
            guiManager = new GUIManager(solarSystemScene.getBloomPass(), timeManager, solarSystemScene)
        }
        const elapsedTime = timeManager.updateTime()
        solarSystemScene.update(elapsedTime)
        updateDateDisplay(elapsedTime)
    }
    requestAnimationFrame(animate)
}

animate()