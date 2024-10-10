import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Planet } from '../components/Planet'
import { planetaryData, sunData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'

export class SolarSystemScene {
    private sceneManager: SceneManager
    private planets: Planet[] | undefined
    private sun!: THREE.Mesh
    private bloomPass!: UnrealBloomPass
    private loadingManager: THREE.LoadingManager

    constructor(canvas: HTMLCanvasElement) {
        this.sceneManager = SceneManager.initialize(canvas)
        this.loadingManager = new THREE.LoadingManager(
            // onLoad
            () => {
                const loadingOverlay = document.getElementById('loading-overlay')
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none'
                }
            },
            // onProgress
            (url, itemsLoaded, itemsTotal) => {
                console.log(`Loading file: ${url}. ${itemsLoaded} of ${itemsTotal} files.`)
            },
            // onError
            (url) => {
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
        const rgbeLoader = new RGBELoader(this.loadingManager)
        rgbeLoader.load('HDR_blue_nebulae.hdr', (envMap) => {
            envMap.mapping = THREE.EquirectangularReflectionMapping
            this.sceneManager.scene.background = envMap
            this.sceneManager.scene.environment = envMap
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

    update(elapsedTime: number) {
        this.planets?.forEach(planet => planet.orbit(elapsedTime))

        const rotationAngle = (elapsedTime % sunData.rotationPeriod) / sunData.rotationPeriod * 2 * Math.PI
        this.sun.rotation.y = -rotationAngle

        this.sceneManager.update()
    }

    setOrbitLineVisibility(visible: boolean) {
        this.planets?.forEach(planet => planet.setOrbitLineVisibility(visible))
    }

    getBloomPass() {
        return this.bloomPass
    }
}