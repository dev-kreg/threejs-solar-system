import * as THREE from 'three'
import { PlanetData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'

export class Planet {
    group: THREE.Group
    planet: THREE.Mesh
    hitbox: THREE.Mesh
    orbitRadius: number
    orbitalPeriod: number
    rotationPeriod: number
    radius: number
    initialAngle: number
    orbitLine: THREE.Line
    name: string

    constructor(
        data: PlanetData,
        initialDate: Date,
        loadingManager: THREE.LoadingManager,
        referenceDate: Date = new Date('2000-01-01T12:00:00Z') // J2000 epoch
    ) {
        this.name = data.name
        this.orbitRadius = data.orbitRadius
        this.orbitalPeriod = data.orbitalPeriod
        this.rotationPeriod = data.rotationPeriod
        this.radius = data.radius

        this.initialAngle = this.calculateInitialAngle(initialDate, referenceDate)

        // Create group
        this.group = new THREE.Group()

        // Create planet mesh
        const texture = new THREE.TextureLoader(loadingManager).load(data.texture)
        this.planet = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius),
            new THREE.MeshStandardMaterial({ map: texture })
        )
        this.group.add(this.planet)

        // Create hitbox
        const hitboxRadius = 10 // Uniform size for all planets
        const hitboxGeometry = new THREE.SphereGeometry(hitboxRadius)
        const hitboxMaterial = new THREE.MeshBasicMaterial({ 
            visible: false, // Make it invisible
            transparent: true,
            opacity: 0.5 // Set to a value > 0 if you want to see it for debugging
        })
        this.hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial)
        this.hitbox.userData.planet = this // Store a reference to the planet in the hitbox
        this.group.add(this.hitbox)

        // Add group to the scene
        SceneManager.getInstance().addObject(this.group)

        this.orbitLine = this.createOrbitLine(0xFFFF00)
        SceneManager.getInstance().addObject(this.orbitLine)
    }

    orbit(elapsedTime: number) {
        // Convert elapsed time to days
        const elapsedDays = elapsedTime / (24 * 60 * 60);

        // Orbital motion
        const orbitalAngle = this.initialAngle + (elapsedDays * 2 * Math.PI / this.orbitalPeriod);
        const x = Math.cos(orbitalAngle) * this.orbitRadius;
        const z = Math.sin(orbitalAngle) * this.orbitRadius;
        
        // Move the entire group
        this.group.position.set(x, 0, z);

        // Rotational motion
        const rotationAngle = (elapsedDays / this.rotationPeriod) * 2 * Math.PI;
        this.planet.rotation.y = -rotationAngle;
    }

    calculateInitialAngle(initialDate: Date, referenceDate: Date): number {
        // Calculate the time difference in days
        const timeDiff = (initialDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)

        // Calculate the angle based on the orbital period
        const angle = (timeDiff / this.orbitalPeriod) * 2 * Math.PI

        // Normalize the angle to be between 0 and 2π
        return angle % (2 * Math.PI)
    }

    createOrbitLine(color: number): THREE.Line {
        const segments = 128
        const points = []

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2
            const x = this.orbitRadius * Math.cos(theta)
            const z = this.orbitRadius * Math.sin(theta)
            points.push(new THREE.Vector3(x, 0, z))
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 1, opacity: 0.2, transparent: true })
        return new THREE.Line(orbitGeometry, orbitMaterial)
    }

    setOrbitLineVisibility(visible: boolean) {
        this.orbitLine.visible = visible
    }

    dispose() {
        SceneManager.getInstance().removeObject(this.group)
        SceneManager.getInstance().removeObject(this.orbitLine)
    }
}