import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Planet } from './Planet'
import { Ship } from './Ship'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

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

// lighting
const pointLight = new THREE.PointLight('#fefde7', 1000, 0, 1.2)
pointLight.position.set(0,0,0);
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
    new THREE.MeshBasicMaterial({ map: sunTexture }))
scene.add(sun)


const initialDate = new Date('2023-05-23T00:00:00Z')  // You can change this to any date

const planets = [
    new Planet(scene, new THREE.MeshStandardMaterial({ map: mercuryTexture }),  3,    100,  0.24, 58.8,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: venusTexture }),    5,    180,  0.62, -244,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: earthTexture }),    5,    250,  1,    1,     initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: marsTexture }),     4,    380,  1.88, 1.03,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: jupiterTexture }),  15,   650,  11.9, 0.41,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: saturnTexture }),   13,   900,  29.4, 0.44,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: uranusTexture }),   8,    1200, 84,   -0.72, initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: neptuneTexture }),  8,    1500, 165,  0.67,  initialDate),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: plutoTexture }),    2,    1800, 248,  6.41,  initialDate)
]

const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    planets.forEach(planet => {
        planet.orbit(elapsedTime)
    });

    sun.rotation.y = -(elapsedTime * Math.PI / 10)
    const rotationsPerYear = 365.25 / 24.47;
    const rotationAngle = (elapsedTime / 100) * rotationsPerYear * 2 * Math.PI;
    sun.rotation.y = -rotationAngle;

    orbitControls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()