import * as THREE from 'three'
import { SceneManager } from './SceneManager'
import { Planet } from '../components/Planet'

export class InteractionManager {
    private raycaster: THREE.Raycaster
    private mouse: THREE.Vector2
    private sceneManager: SceneManager
    private planets: Planet[]
    private hoveredPlanet: Planet | null = null
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor(planets: Planet[], canvas: HTMLCanvasElement) {
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.sceneManager = SceneManager.getInstance()
        this.planets = planets
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!

        this.resizeCanvas() // Initial sizing

        window.addEventListener('mousemove', this.onMouseMove.bind(this))
        window.addEventListener('click', this.onMouseClick.bind(this))
        window.addEventListener('resize', this.resizeCanvas.bind(this))

    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    onMouseMove(event: MouseEvent) {

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera)

        const intersects = this.raycaster.intersectObjects(
            this.planets.map(planet => planet.hitbox)
        )

        if (intersects.length > 0) {
            const hoveredPlanet = intersects[0].object.userData.planet as Planet
            if (this.hoveredPlanet !== hoveredPlanet) {
                this.hoveredPlanet = hoveredPlanet
            }
        } else {
            this.hoveredPlanet = null
        }
    }

    private onMouseClick(event: MouseEvent) {
        if (this.hoveredPlanet) {
            this.showPlanetInfo(this.hoveredPlanet)
        }
    }

    private showPlanetInfo(planet: Planet) {
        console.log(`Clicked on ${planet.name}`)
        console.log(`Radius: ${planet.radius} km`)
        console.log(`Orbit Radius: ${planet.orbitRadius} million km`)
        console.log(`Orbital Period: ${planet.orbitalPeriod} Earth days`)
        console.log(`Rotation Period: ${planet.rotationPeriod} Earth days`)

        // TODO: Implement a proper UI for displaying this information
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (this.hoveredPlanet) {
            const screenPosition = this.getScreenPosition(this.hoveredPlanet.group.position)

            if (screenPosition) {
                this.ctx.font = '24px Arial'
                this.ctx.fillStyle = 'white'
                this.ctx.textAlign = 'center'
                this.ctx.fillText('[   ]', screenPosition.x, screenPosition.y + 5)
            }
        }
    }

    private getScreenPosition(position: THREE.Vector3): { x: number, y: number } | null {
        const vector = position.clone()
        vector.project(this.sceneManager.camera)

        const x = (vector.x * 0.5 + 0.5) * this.canvas.width
        const y = (-(vector.y - 1) * 0.5) * this.canvas.height

        if (vector.z > 1) {
            return null // Behind the camera
        }

        return { x, y }
    }
}