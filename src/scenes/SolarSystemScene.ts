import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Planet } from '../components/Planet'
import { planetaryData, sunData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'
import { InteractionManager } from '../utils/InteractionManager'

export class SolarSystemScene {
    private sceneManager: SceneManager
    private planets: Planet[] | undefined
    private sun!: THREE.Mesh
    private bloomPass!: UnrealBloomPass
    private loadingManager: THREE.LoadingManager
    private interactionManager: InteractionManager | undefined
    public isLoaded: boolean = false

    constructor(canvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
        this.sceneManager = SceneManager.initialize(canvas)
        this.loadingManager = new THREE.LoadingManager(
            // onLoad
            () => {
                const loadingOverlay = document.getElementById('loading-overlay')
                const dateDisplay = document.getElementById('date-display')

                loadingOverlay!.style.display = 'none'
                dateDisplay!.style.display = 'block'

                this.isLoaded = true

                if (this.planets) {
                    this.interactionManager = new InteractionManager(this.planets, overlayCanvas)
                }
            },
            // onProgress
            (url, itemsLoaded, itemsTotal) => {
                const loadingText = document.getElementById('loading-text')

                loadingText!.textContent = `Loading assets... (${itemsLoaded}/${itemsTotal})`
                console.log(`Loading file: ${url}. ${itemsLoaded} of ${itemsTotal} files.`)
            },
            // onError
            (url) => {
                const errorContainer = document.getElementById('error-container')!
                const error = document.createElement('p')
                error.textContent = `Failed to load: ${url}`
                errorContainer.appendChild(error)
            
                window.setTimeout(() => {
                    error.style.opacity = '0'
                    error.addEventListener('transitionend', () => {
                        errorContainer.removeChild(error)
                    })
                }, 4000)
            
                console.error(`There was an error loading ${url}`)
            }
        )

        this.setupLighting()
        this.setupEnvironment()
        this.createCelestialBodies()
    }

    private setupLighting() {
        const pointLight = new THREE.PointLight('#fefde7', 1000, 0, 1.2)
        pointLight.position.set(0, 0, 0)
        this.sceneManager.addObject(pointLight)

        const ambientLight = new THREE.AmbientLight('#fefde7', 0.2)
        this.sceneManager.addObject(ambientLight)

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        )
        this.sceneManager.effectComposer.addPass(this.bloomPass)
    }

    private setupEnvironment() {
        const textureLoader = new THREE.TextureLoader(this.loadingManager)
        textureLoader.load('HDR_blue_nebulae.webp', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping
            this.sceneManager.scene.background = texture
            this.sceneManager.scene.environment = texture
        })
    }

    private createCelestialBodies() {
        const textureLoader = new THREE.TextureLoader(this.loadingManager)
        const sunTexture = textureLoader.load(sunData.texture)
        this.sun = new THREE.Mesh(
            new THREE.SphereGeometry(sunData.radius),
            new THREE.MeshBasicMaterial({ map: sunTexture })
        )
        this.sceneManager.addObject(this.sun)

        const initialDate = new Date()
        this.planets = planetaryData.map(data => new Planet(data, initialDate, this.loadingManager))
    }

    setOrbitLineVisibility(visible: boolean) {
        this.planets?.forEach(planet => planet.setOrbitLineVisibility(visible))
    }

    getBloomPass() {
        return this.bloomPass
    }

    update(elapsedTime: number) {
        if (!this.isLoaded) return

        this.planets?.forEach(planet => planet.orbit(elapsedTime))

        const rotationAngle = (elapsedTime % sunData.rotationPeriod) / sunData.rotationPeriod * 2 * Math.PI
        this.sun.rotation.y = -rotationAngle

        this.sceneManager.update()
        this.interactionManager?.render()
    }
}