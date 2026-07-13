import { SolarSystemScene } from './scenes/SolarSystemScene'
import { TimeManager } from './utils/TimeManager'
import { GUIManager } from './utils/GUI'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement
const solarSystemScene = new SolarSystemScene(canvas)
let timeManager: TimeManager | null = null
let guiManager: GUIManager | null = null

// ?debug — fps counter, no deps
if (new URLSearchParams(location.search).has('debug')) {
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;top:8px;left:8px;color:#20C20E;font:14px monospace;z-index:999'
    document.body.appendChild(el)
    let frames = 0
    let last = performance.now()
    const tick = () => {
        frames++
        const now = performance.now()
        if (now - last >= 500) {
            el.textContent = `${Math.round(frames * 1000 / (now - last))} fps`
            frames = 0
            last = now
        }
        requestAnimationFrame(tick)
    }
    tick()
}

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