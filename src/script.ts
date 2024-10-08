import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Planet } from './Planet'
import { Ship } from './Ship'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/**
 * Base
 */
const gui = new GUI()

const canvas = document.querySelector('canvas.webgl') as HTMLElement

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
})

// Camera
const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    50000
)
camera.position.set(0, 50, 200)
scene.add(camera)

// Controls
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Post processing
const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
)
const effectComposer = new EffectComposer(renderer)
effectComposer.addPass(renderScene)
effectComposer.addPass(bloomPass)

// Add bloom parameters to GUI
gui.add(bloomPass, 'strength', 0, 3, 0.01).name('Bloom strength')
gui.add(bloomPass, 'radius', 0, 1, 0.01).name('Bloom radius')
gui.add(bloomPass, 'threshold', 0, 1, 0.01).name('Bloom threshold')

// lighting
const pointLight = new THREE.PointLight('#fefde7', 1000, 0, 1.2)
pointLight.position.set(0, 0, 0);
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight('#fefde7', 0.2);
scene.add(ambientLight)

// Textures
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./assets/HDR_blue_nebulae.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = envMap
    scene.environment = envMap
})

const loadManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadManager)
const sunTexture = textureLoader.load('./assets/sun.jpg')
const mercuryTexture = textureLoader.load('./assets/mercury.jpg')
const venusTexture = textureLoader.load('./assets/venus_surface.jpg')
const earthTexture = textureLoader.load('./assets/earth_daymap.jpg')
const marsTexture = textureLoader.load('./assets/mars.jpg')
const jupiterTexture = textureLoader.load('./assets/jupiter.jpg')
const saturnTexture = textureLoader.load('./assets/saturn.jpg')
const uranusTexture = textureLoader.load('./assets/uranus.jpg')
const neptuneTexture = textureLoader.load('./assets/neptune.jpg')
const plutoTexture = textureLoader.load('./assets/pluto.jpg')

// planets
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(35),
    new THREE.MeshBasicMaterial({ map: sunTexture })
)
scene.add(sun)


// Add date display function
const dateDisplay = document.getElementById('simulated-date')!;
const initialDate = new Date()

function updateDateDisplay(elapsedTime: number) {
    const milliseconds = initialDate.getTime() + elapsedTime * 1000;
    const currentDate = new Date(milliseconds);
    dateDisplay.textContent = currentDate.toUTCString();
}

const planets = [
    new Planet(scene, mercuryTexture, 3, 100, 88, 58.65, initialDate),
    new Planet(scene, venusTexture, 5, 180, 224.7, -243, initialDate),
    new Planet(scene, earthTexture, 5, 250, 365.25, 1, initialDate),
    new Planet(scene, marsTexture, 4, 380, 687, 1.03, initialDate),
    new Planet(scene, jupiterTexture, 15, 650, 4333, 0.41, initialDate),
    new Planet(scene, saturnTexture, 13, 900, 10759, 0.44, initialDate),
    new Planet(scene, uranusTexture, 8, 1200, 30687, -0.72, initialDate),
    new Planet(scene, neptuneTexture, 8, 1500, 60190, 0.67, initialDate),
    new Planet(scene, plutoTexture, 2, 1800, 90560, 6.39, initialDate)
]

// Add orbit line visibility toggle to GUI
const orbitLineVisibility = { visible: true }
gui.add(orbitLineVisibility, 'visible')
    .name('Show Orbit Lines')
    .onChange((value: boolean) => {
        planets.forEach(planet => planet.setOrbitLineVisibility(value))
    })

// Add exponential time scale control to GUI
const timeControl = { scale: 1, exponent: 5 }
let accumulatedTime = 0;
let lastFrameTime = 0;

const updateTimeScale = (value: number) => {
    timeControl.exponent = value;
    timeControl.scale = Math.pow(10, value);
    timeScaleGUI.name(`Time Scale: ${timeControl.scale.toFixed()}x`);
}

const timeScaleGUI = gui.add(timeControl, 'exponent', 0, 7, 0.25)
    .name('Time Scale: 1x')
    .onChange(updateTimeScale);

// Initialize with 100000x speed (10^5)
updateTimeScale(5);

const clock = new THREE.Clock()
clock.start();

const tick = () => {
    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    accumulatedTime += deltaTime * timeControl.scale;

    planets.forEach(planet => {
        planet.orbit(accumulatedTime);
    });

    // Sun rotation
    const solarRotationPeriod = 25.38 * 24 * 60 * 60; // 25.38 days in seconds
    const rotationAngle = (accumulatedTime % solarRotationPeriod) / solarRotationPeriod * 2 * Math.PI;
    sun.rotation.y = -rotationAngle;

    // Update date display
    updateDateDisplay(accumulatedTime);

    orbitControls.update()
    effectComposer.render()
    window.requestAnimationFrame(tick)
}

tick()