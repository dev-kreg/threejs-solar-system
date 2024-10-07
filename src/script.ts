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
    3000
)
camera.position.z = 400
camera.position.y = 150
// gui.add(camera.position, 'x').min(-500).max(500).step(10).name('x')
// gui.add(camera.position, 'y').min(-500).max(500).step(10).name('y')
// gui.add(camera.position, 'z').min(-500).max(500).step(10).name('z')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// lighting
const pointLight = new THREE.PointLight(0xfdfbd3, 1000 ,0, 1.5)
pointLight.position.set(0,0,0);
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0x353e4e, 1)
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
const marsTexture = textureLoader.load('./assets/mars.jpg')
const jupiterTexture = textureLoader.load('./assets/jupiter.jpg')
const mercuryTexture = textureLoader.load('./assets/mercury.jpg')
const neptuneTexture = textureLoader.load('./assets/neptune.jpg')
const earthTexture = textureLoader.load('./assets/earth_daymap.jpg')

// planets
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10),
    new THREE.MeshBasicMaterial({ map: sunTexture }))
scene.add(sun)


const planets = [
    new Planet(scene, new THREE.MeshStandardMaterial({ map: mercuryTexture }), 2, 20, 5),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: earthTexture }), 5, 50, 4),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: marsTexture }), 8, 100, 3),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: jupiterTexture }), 6, 200, 2),
    new Planet(scene, new THREE.MeshStandardMaterial({ map: neptuneTexture }), 6, 300, 1)
]

const ship = new Ship(scene, planets, planets[1])


// ship.travelTo(planets[4])

const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    planets.forEach(planet => {
        planet.orbit(elapsedTime)
    });

    sun.rotation.y = -(elapsedTime * Math.PI / 10)

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()