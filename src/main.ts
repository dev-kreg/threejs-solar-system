import { SolarSystemScene } from './scenes/SolarSystemScene'
import { TimeManager } from './utils/TimeManager'
import { GUIManager } from './utils/GUI'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement
const solarSystemScene = new SolarSystemScene(canvas)
const timeManager = new TimeManager()
const guiManager = new GUIManager(solarSystemScene.getBloomPass(), timeManager, solarSystemScene)

const dateDisplay = document.getElementById('simulated-date')!
const initialDate = new Date()

function updateDateDisplay(elapsedTime: number) {
    const milliseconds = initialDate.getTime() + elapsedTime * 1000
    const currentDate = new Date(milliseconds)
    dateDisplay.textContent = currentDate.toUTCString()
}

function animate() {
    const elapsedTime = timeManager.updateTime()
    solarSystemScene.update(elapsedTime)
    updateDateDisplay(elapsedTime)
    requestAnimationFrame(animate)
}

animate()