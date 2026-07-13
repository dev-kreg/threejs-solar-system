import * as THREE from 'three'
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
    private isDragging: boolean = false;
    private dragStartTime: number = 0;
    private dragThreshold: number = 100; // milliseconds
    private labelContainer!: HTMLElement;
    private labels: HTMLElement[] = [];
    private labelsVisible: boolean = true;
    private lastFollowed: Planet | null = null;
    private flyingIn: boolean = false;
    private flyingOut: boolean = false;
    private flyFrames: number = 0;
    private lastAnchor: THREE.Vector3 | null = null;
    private overviewDist: number = 250; // zoom distance to restore when returning to the sun

    constructor(canvas: HTMLCanvasElement) {
        this.sceneManager = new SceneManager(canvas)
        this.planetDetailScene = new PlanetDetailScene(this.sceneManager.camera);
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

        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Manual zoom takes over from the automatic fly-in/out dolly
        const cancelFly = () => {
            if (this.flyingIn) {
                this.flyingIn = false;
                this.planetDetailScene.reveal();
            }
            this.flyingOut = false;
        };
        canvas.addEventListener('wheel', cancelFly, { passive: true });
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length >= 2) cancelFly(); // pinch
        }, { passive: true });
    }

    private setupLighting() {
        const pointLight = new THREE.PointLight('#fefde7', 750, 0, 1)
        pointLight.position.set(0, 0, 0)
        this.sceneManager.scene.add(pointLight)

        const ambientLight = new THREE.AmbientLight('#fefde7', 0.2)
        this.sceneManager.scene.add(ambientLight)

        // ponytail: half-res bloom — it's a blur, full res is invisible and doubles mobile GPU cost
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
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
        this.sceneManager.scene.add(this.sun)

        const initialDate = new Date()
        this.planets = planetaryData.map(data => new Planet(data, initialDate, this.loadingManager, this.sceneManager.scene))

        this.labelContainer = document.createElement('div')
        this.labelContainer.id = 'planet-labels'
        document.body.appendChild(this.labelContainer)
        this.labels = this.planets.map(planet => {
            const label = document.createElement('div')
            label.className = 'planet-label'
            label.textContent = planet.data.name
            label.addEventListener('click', () => this.selectPlanet(planet))
            this.labelContainer.appendChild(label)
            return label
        })
    }

    setOrbitLineVisibility(visible: boolean) {
        this.planets?.forEach(planet => planet.setOrbitLineVisibility(visible))
    }

    setLabelVisibility(visible: boolean) {
        this.labelsVisible = visible
        this.labelContainer.style.display = visible ? 'block' : 'none'
    }

    setCompactDistances(compact: boolean) {
        this.planets?.forEach(planet => planet.setCompactDistances(compact))
    }

    getBloomPass() {
        return this.bloomPass
    }
    private onMouseDown(event: MouseEvent) {
        this.isDragging = false;
        this.dragStartTime = Date.now();
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isDragging) {
            this.onCanvasClick(event);
        }
        this.isDragging = false;
    }

    // Closest planet whose mesh or orbit hitbox is under the cursor
    private planetUnderCursor(event: MouseEvent): Planet | null {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

        // Only test planet meshes/hitboxes, not the whole scene graph
        const targets: THREE.Object3D[] = [];
        this.planets?.forEach(p => targets.push(p.mesh, p.orbitHitbox));
        for (let intersect of this.raycaster.intersectObjects(targets, false)) {
            const planet = this.planets?.find(p => p.mesh === intersect.object || p.orbitHitbox === intersect.object);
            if (planet) return planet;
        }
        return null;
    }

    private onCanvasMouseMove(event: MouseEvent) {
        if (Date.now() - this.dragStartTime > this.dragThreshold) {
            this.isDragging = true;
        }

        const hoveredObject = this.planetUnderCursor(event);
        document.body.style.cursor = hoveredObject ? 'pointer' : 'default';

        if (this.hoveredPlanet !== hoveredObject) {
            this.hoveredPlanet?.highlightOrbit(false);
            hoveredObject?.highlightOrbit(true);
            this.hoveredPlanet = hoveredObject;
        }
    }

    private onCanvasClick(event: MouseEvent) {
        if (this.isDragging) return;

        const clickedPlanet = this.planetUnderCursor(event);
        if (clickedPlanet) this.selectPlanet(clickedPlanet);
    }

    private selectPlanet(planet: Planet) {
        if (this.planetDetailScene.planet === planet) {
            this.planetDetailScene.hide();
        } else {
            this.planetDetailScene.show(planet);
        }
    }

    // Fly the camera to the selected planet, then track it as it orbits.
    // Runs before render; user can still rotate/zoom via OrbitControls while locked on
    private updateFollowCamera() {
        const followed = this.planetDetailScene.planet;
        const camera = this.sceneManager.camera;
        const controls = this.sceneManager.orbitControls;
        const offset = camera.position.clone().sub(controls.target);

        if (followed !== this.lastFollowed) {
            if (followed && !this.lastFollowed) {
                this.overviewDist = offset.length(); // remember zoom before diving in
            }
            this.flyingIn = followed !== null;
            this.flyingOut = followed === null;
            this.flyFrames = 0;
            this.lastAnchor = null;
            this.lastFollowed = followed;
        }

        if (!followed) {
            if (!this.flyingOut) return;
            // Glide back to the sun-centered view at the pre-follow zoom level
            controls.target.lerp(new THREE.Vector3(), 0.08);
            offset.setLength(THREE.MathUtils.lerp(offset.length(), this.overviewDist, 0.08));
            camera.position.copy(controls.target).add(offset);
            if (controls.target.length() < 1 && Math.abs(offset.length() - this.overviewDist) < this.overviewDist * 0.05) {
                this.flyingOut = false;
            }
            return;
        }

        const viewDist = followed.data.radius * 8;

        // Camera anchors on the planet; on phones anchor below it (in screen space)
        // so the planet renders above center, clear of the bottom sheet
        const anchor = followed.mesh.position.clone();
        if (window.innerWidth <= 768) {
            const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
            anchor.addScaledVector(screenUp, -0.2 * viewDist);
        }

        // Ride along with the planet's own motion, then ease out the residual aim
        // error — one continuous rule, so finishing the fly-in causes no snap
        if (this.lastAnchor) controls.target.add(anchor.clone().sub(this.lastAnchor));
        controls.target.lerp(anchor, 0.08);
        this.lastAnchor = anchor;

        if (this.flyingIn) {
            offset.setLength(THREE.MathUtils.lerp(offset.length(), viewDist, 0.08));
            const arrived = controls.target.distanceTo(anchor) < followed.data.radius * 0.5
                && Math.abs(offset.length() - viewDist) < viewDist * 0.1;
            // frame cap: at extreme time scales a fast planet outruns the lerp forever
            if (arrived || ++this.flyFrames > 180) {
                this.flyingIn = false;
                this.planetDetailScene.reveal();
            }
        }
        camera.position.copy(controls.target).add(offset);
    }

    private updateLabels() {
        if (!this.labelsVisible) return;
        this.planets?.forEach((planet, i) => {
            const label = this.labels[i];
            const projected = planet.mesh.position.clone().project(this.sceneManager.camera);
            if (projected.z > 1 || planet === this.planetDetailScene.planet) { // behind camera or being followed
                label.style.display = 'none';
                return;
            }
            label.style.display = 'block';
            label.style.left = `${(projected.x * 0.5 + 0.5) * window.innerWidth}px`;
            label.style.top = `${(-projected.y * 0.5 + 0.5) * window.innerHeight}px`;
        });
    }

    update(elapsedTime: number) {
        if (!this.isLoaded) return;

        this.planets?.forEach(planet => planet.orbit(elapsedTime));

        const rotationAngle = (elapsedTime % sunData.rotationPeriod) / sunData.rotationPeriod * 2 * Math.PI;
        this.sun.rotation.y = -rotationAngle;

        this.updateFollowCamera();
        this.updateLabels();
        this.sceneManager.update();

        // Update hover state
        if (this.hoveredPlanet) {
            this.hoveredPlanet.highlightOrbit(true);
        }
    }
}