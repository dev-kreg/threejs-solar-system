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

    constructor(canvas: HTMLCanvasElement) {
        this.sceneManager = SceneManager.initialize(canvas)
        
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

        // Setup bloom effect
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        )
        this.sceneManager.effectComposer.addPass(this.bloomPass)
    }

    private setupEnvironment() {
        const rgbeLoader = new RGBELoader()
        rgbeLoader.load('./assets/HDR_blue_nebulae.hdr', (envMap) => {
            envMap.mapping = THREE.EquirectangularReflectionMapping
            this.sceneManager.scene.background = envMap
            this.sceneManager.scene.environment = envMap
        })
    }

    private createCelestialBodies() {
        const sunTexture = new THREE.TextureLoader().load(sunData.texture)
        this.sun = new THREE.Mesh(
            new THREE.SphereGeometry(sunData.radius),
            new THREE.MeshBasicMaterial({ map: sunTexture })
        )
        this.sceneManager.addObject(this.sun)

        const initialDate = new Date()
        this.planets = planetaryData.map(data => new Planet(data, initialDate))
        
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