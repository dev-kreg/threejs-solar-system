import * as THREE from 'three'

export class Planet {
    planet = new THREE.Group()
    orbitRadius: number
    orbitSpeed: number
    radius: number

    constructor(
        scene: THREE.Scene,
        texture: THREE.MeshStandardMaterial,
        radius: number,
        orbitRadius: number,
        orbitSpeed: number
    ) {
        const planetMesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius),
            texture
        )

        this.planet.add(planetMesh)
        this.planet.position.set(orbitRadius, 0, 0)
        this.orbitRadius = orbitRadius
        this.orbitSpeed = orbitSpeed
        this.radius = radius
        scene.add(this.planet)

        const orbitLine = this.createOrbitLine(0xFFF00)
        scene.add(orbitLine)
    }

    orbit(elapsedTime: number) {
        this.planet.position.set(
            Math.cos(elapsedTime * (Math.PI * this.orbitSpeed) / 10) * this.orbitRadius,
            0,
            Math.sin(elapsedTime * (Math.PI * this.orbitSpeed) / 10) * this.orbitRadius,
        );

        // planet spin (objects in group such as ship or moons will then "orbit")
        this.planet.rotation.y = -(elapsedTime * Math.PI)
    }

    createOrbitLine(color: number): THREE.Line {
        const segments = 128
        const points = []

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2
            const x = this.planet.position.x * Math.cos(theta)
            const z = this.planet.position.x * Math.sin(theta)
            points.push(new THREE.Vector3(x, 0, z))
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 1, opacity: 0.2, transparent: true })
        return new THREE.Line(orbitGeometry, orbitMaterial)
    }
}