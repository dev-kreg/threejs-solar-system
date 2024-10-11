import * as THREE from 'three'
import { planetaryData, PlanetData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'

export class Planet {
    mesh: THREE.Mesh
    initialAngle: number
    orbitLine: THREE.Line
    orbitHitbox: THREE.Mesh
    data: PlanetData

    constructor(
        data: PlanetData,
        initialDate: Date,
        loadingManager: THREE.LoadingManager,
        referenceDate: Date = new Date('2000-01-01T12:00:00Z') // J2000 epoch
    ) {
        const texture = new THREE.TextureLoader(loadingManager).load(data.texture)
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius),
            new THREE.MeshStandardMaterial({ map: texture })
        )
        this.data = data;

        this.initialAngle = this.calculateInitialAngle(initialDate, referenceDate)

        SceneManager.getInstance().addObject(this.mesh)
        this.orbitLine = this.createOrbitLine(0xFFFFFF)
        this.orbitHitbox = this.createOrbitHitbox()
        SceneManager.getInstance().addObject(this.orbitLine)
        SceneManager.getInstance().addObject(this.orbitHitbox)
        
        // Add cursor styles
        this.mesh.userData.hoverCursor = 'pointer';
        this.orbitHitbox.userData.hoverCursor = 'pointer';
    }


    orbit(elapsedTime: number) {
        // Convert elapsed time to days
        const elapsedDays = elapsedTime / (24 * 60 * 60);

        // Orbital motion
        const orbitalAngle = this.initialAngle + (elapsedDays * 2 * Math.PI / this.data.orbitalPeriod);
        this.mesh.position.x = Math.cos(orbitalAngle) * this.data.orbitRadius;
        this.mesh.position.z = Math.sin(orbitalAngle) * this.data.orbitRadius;

        // Rotational motion
        const rotationAngle = (elapsedDays / this.data.rotationPeriod) * 2 * Math.PI;
        this.mesh.rotation.y = -rotationAngle;
    }

    calculateInitialAngle(initialDate: Date, referenceDate: Date): number {
        // Calculate the time difference in days
        const timeDiff = (initialDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)

        // Calculate the angle based on the orbital period
        const angle = (timeDiff / this.data.orbitalPeriod) * 2 * Math.PI

        // Normalize the angle to be between 0 and 2π
        return angle % (2 * Math.PI)
    }

    createOrbitLine(color: number): THREE.Line {
        const segments = 128
        const points = []

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2
            const x = this.data.orbitRadius * Math.cos(theta)
            const z = this.data.orbitRadius * Math.sin(theta)
            points.push(new THREE.Vector3(x, 0, z))
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 1, opacity: 0.2, transparent: true })
        return new THREE.Line(orbitGeometry, orbitMaterial)
    }

    createOrbitHitbox(): THREE.Mesh {
        const tubeRadius = 8 // Adjust this value to change the hitbox size
        const tubeSegments = 128
        const tubeRadialSegments = 8
        const geometry = new THREE.TorusGeometry(this.data.orbitRadius, tubeRadius, tubeRadialSegments, tubeSegments)
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({
            visible: false,
        })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.hoverCursor = 'pointer'; // Add cursor style to the orbit hitbox
        return mesh;
    }

    highlightOrbit(highlight: boolean) {
        const highlightColor = 0x20C20E;
        const normalColor = 0xFFFFFF;
        const highlightOpacity = 0.8;
        const normalOpacity = 0.2;

        (this.orbitLine.material as THREE.LineBasicMaterial).color.set(highlight ? highlightColor : normalColor);
        (this.orbitLine.material as THREE.LineBasicMaterial).opacity = highlight ? highlightOpacity : normalOpacity;
    }

    setOrbitLineVisibility(visible: boolean) {
        this.orbitLine.visible = visible
    }

    dispose() {
        SceneManager.getInstance().removeObject(this.mesh)
        SceneManager.getInstance().removeObject(this.orbitLine)
        SceneManager.getInstance().removeObject(this.orbitHitbox)
    }

}