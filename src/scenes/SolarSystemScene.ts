import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Planet } from '../components/Planet'
import { planetaryData, sunData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'
import { PlanetDetailScene } from './PlanetDetailScene'

export class SolarSystemScene {
    private sceneManager: SceneManager
    private planets: Planet[] | undefined
    private sun!: THREE.Mesh
    private bloomPass!: UnrealBloomPass
    private loadingManager: THREE.LoadingManager
    public isLoaded: boolean = false
    private raycaster: THREE.Raycaster
    private mouse: THREE.Vector2
    private planetDetailScene: PlanetDetailScene;
    private hoveredPlanet: Planet | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.sceneManager = SceneManager.initialize(canvas)
        this.planetDetailScene = new PlanetDetailScene(this.sceneManager.scene, this.sceneManager.camera);
        this.loadingManager = new THREE.LoadingManager(
            // onLoad
            () => {
                const loadingOverlay = document.getElementById('loading-overlay')
                const dateDisplay = document.getElementById('date-display')

                loadingOverlay!.style.display = 'none'
                dateDisplay!.style.display = 'block'

                this.isLoaded = true
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

        // Initialize raycaster and mouse vector for click detection
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        // Add click event listener
        canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
        canvas.addEventListener('click', this.onCanvasClick.bind(this));
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

    private onCanvasMouseMove(event: MouseEvent) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        const intersects = this.raycaster.intersectObjects(this.sceneManager.scene.children);

        let hoveredObject: Planet | null = null;

        for (let intersect of intersects) {
            const planet = this.planets?.find(p => p.mesh === intersect.object || p.orbitHitbox === intersect.object);
            
            if (planet) {
                hoveredObject = planet;
                break;
            }
        }

        if (this.hoveredPlanet !== hoveredObject) {
            if (this.hoveredPlanet) {
                this.hoveredPlanet.highlightOrbit(false);
            }
            if (hoveredObject) {
                hoveredObject.highlightOrbit(true);
            }
            this.hoveredPlanet = hoveredObject;
        }
    }

    private onCanvasClick(event: MouseEvent) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        const intersects = this.raycaster.intersectObjects(this.sceneManager.scene.children);

        for (let intersect of intersects) {
            const clickedPlanet = this.planets?.find(planet => 
                planet.mesh === intersect.object || planet.orbitHitbox === intersect.object
            );
            if (clickedPlanet) {
                console.log(`Clicked on ${clickedPlanet.data.name}:`, clickedPlanet.data);
                this.planetDetailScene.show(clickedPlanet);
                break;
            }
        }
    }

    update(elapsedTime: number) {
        if (!this.isLoaded) return;

        this.planets?.forEach(planet => planet.orbit(elapsedTime));

        const rotationAngle = (elapsedTime % sunData.rotationPeriod) / sunData.rotationPeriod * 2 * Math.PI;
        this.sun.rotation.y = -rotationAngle;

        this.sceneManager.update();

        // Update hover state
        if (this.hoveredPlanet) {
            this.hoveredPlanet.highlightOrbit(true);
        }
    }
}