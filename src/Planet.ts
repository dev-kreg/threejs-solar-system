import * as THREE from 'three'

export class Planet {
    planet = new THREE.Mesh
    orbitRadius: number
    orbitalPeriod: number
    rotationPeriod: number
    radius: number
    initialAngle: number
    orbitLine: THREE.Line

    constructor(
        scene: THREE.Scene,
        texture: THREE.Texture,
        radius: number, // 1000 == 1 AU
        orbitRadius: number,
        orbitalPeriod: number, // 1 == 1 earth year for 1 orbit
        rotationPeriod: number, // 1 == 1 earth year for 1 rotation
        initialDate: Date,
        referenceDate: Date = new Date('2000-01-01T12:00:00Z') // J2000 epoch
    ) {
        this.planet = new THREE.Mesh(
            new THREE.SphereGeometry(radius),
            new THREE.MeshStandardMaterial({ map: texture })
        )
        this.orbitRadius = orbitRadius
        this.orbitalPeriod = orbitalPeriod
        this.rotationPeriod = rotationPeriod
        this.radius = radius

        this.initialAngle = this.calculateInitialAngle(initialDate, referenceDate)

        scene.add(this.planet)
        this.orbitLine = this.createOrbitLine(0xFFF00)
        scene.add(this.orbitLine)
    }

    orbit(elapsedTime: number) {
        // Convert elapsed time to years
        const elapsedYears = elapsedTime / 100;

        // Orbital motion
        const orbitalAngle = this.initialAngle + (elapsedYears * 2 * Math.PI / this.orbitalPeriod);
        this.planet.position.x = Math.cos(orbitalAngle) * this.orbitRadius;
        this.planet.position.z = Math.sin(orbitalAngle) * this.orbitRadius;

        // Rotational motion
        const rotationsPerYear = 365.25 / this.rotationPeriod;
        const rotationAngle = elapsedYears * rotationsPerYear * 2 * Math.PI;
        this.planet.rotation.y = -rotationAngle;
    }

    calculateInitialAngle(initialDate: Date, referenceDate: Date): number {
        // Calculate the time difference in years
        const timeDiff = (initialDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

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
}