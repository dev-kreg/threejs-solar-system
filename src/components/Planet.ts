import * as THREE from 'three'
import { PlanetData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'

export class Planet {
    planet: THREE.Mesh
    orbitRadius: number
    orbitalPeriod: number
    rotationPeriod: number
    radius: number
    initialAngle: number
    orbitLine: THREE.Line

    constructor(
        data: PlanetData,
        initialDate: Date,
        loadingManager: THREE.LoadingManager,
        referenceDate: Date = new Date('2000-01-01T12:00:00Z') // J2000 epoch
    ) {
        const texture = new THREE.TextureLoader(loadingManager).load(data.texture)
        this.planet = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius),
            new THREE.MeshStandardMaterial({ map: texture })
        )
        this.orbitRadius = data.orbitRadius
        this.orbitalPeriod = data.orbitalPeriod
        this.rotationPeriod = data.rotationPeriod
        this.radius = data.radius

        this.initialAngle = this.calculateInitialAngle(initialDate, referenceDate)

        SceneManager.getInstance().addObject(this.planet)
        this.orbitLine = this.createOrbitLine(0xFFF00)
        SceneManager.getInstance().addObject(this.orbitLine)
    }


    orbit(elapsedTime: number) {
        // Convert elapsed time to days
        const elapsedDays = elapsedTime / (24 * 60 * 60);

        // Orbital motion
        const orbitalAngle = this.initialAngle + (elapsedDays * 2 * Math.PI / this.orbitalPeriod);
        this.planet.position.x = Math.cos(orbitalAngle) * this.orbitRadius;
        this.planet.position.z = Math.sin(orbitalAngle) * this.orbitRadius;

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
        SceneManager.getInstance().removeObject(this.planet)
        SceneManager.getInstance().removeObject(this.orbitLine)
    }
}