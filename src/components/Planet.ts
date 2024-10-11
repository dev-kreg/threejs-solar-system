import * as THREE from 'three'
import { planetaryData, PlanetData } from '../constants/PlanetaryData'
import { SceneManager } from '../utils/SceneManager'

export class Planet {
    mesh: THREE.Mesh
    initialAngle: number
    orbitLine: THREE.Line
    orbitHitbox: THREE.Mesh
    data: PlanetData

    private semiMajorAxis: number
    private eccentricity: number

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

        // Calculate semi-major axis and eccentricity
        this.semiMajorAxis = (this.data.perihelion + this.data.aphelion) / 2;
        this.eccentricity = (this.data.aphelion - this.data.perihelion) / (this.data.aphelion + this.data.perihelion);

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

        // Calculate the planet's position on its elliptical orbit
        const angle = this.initialAngle + (elapsedDays * 2 * Math.PI / this.data.orbitalPeriod);
        const r = this.semiMajorAxis * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * Math.cos(angle));

        // Apply inclination
        const inclination = this.data.orbitalInclination * Math.PI / 180; // Convert to radians
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) * Math.sin(inclination);
        const z = r * Math.sin(angle) * Math.cos(inclination);

        this.mesh.position.set(x, y, z);

        // Rotational motion
        const rotationAngle = (elapsedDays / this.data.rotationPeriod) * 2 * Math.PI;
        this.mesh.rotation.y = -rotationAngle;
    }

    createOrbitLine(color: number): THREE.Line {
        const segments = 360
        const points = []

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const r = this.semiMajorAxis * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * Math.cos(angle));
            
            // Apply inclination
            const inclination = this.data.orbitalInclination * Math.PI / 180; // Convert to radians
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle) * Math.sin(inclination);
            const z = r * Math.sin(angle) * Math.cos(inclination);

            points.push(new THREE.Vector3(x, y, z))
        }

        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 1, opacity: 0.2, transparent: true })
        return new THREE.Line(orbitGeometry, orbitMaterial)
    }

    createOrbitHitbox(): THREE.Mesh {
        const baseRadius = 0.5; // Base radius for inner planets
        const scaleFactor = 0.025; // Adjust this to control how much the hitbox grows with distance
        const tubeRadius = baseRadius + (this.semiMajorAxis * scaleFactor);
        
        const tubeSegments = 360
        const tubeRadialSegments = 8
        const curvePoints = []

        for (let i = 0; i <= tubeSegments; i++) {
            const angle = (i / tubeSegments) * Math.PI * 2
            const r = this.semiMajorAxis * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * Math.cos(angle));
            
            // Apply inclination
            const inclination = this.data.orbitalInclination * Math.PI / 180; // Convert to radians
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle) * Math.sin(inclination);
            const z = r * Math.sin(angle) * Math.cos(inclination);

            curvePoints.push(new THREE.Vector3(x, y, z))
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints)
        const geometry = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, true)
        const material = new THREE.MeshBasicMaterial({
            visible: false,
            // color: 'red'
        })
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.hoverCursor = 'pointer';
        return mesh;
    }

    calculateInitialAngle(initialDate: Date, referenceDate: Date): number {
        // Calculate the time difference in days
        const timeDiff = (initialDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)

        // Calculate the angle based on the orbital period
        const angle = (timeDiff / this.data.orbitalPeriod) * 2 * Math.PI

        // Normalize the angle to be between 0 and 2π
        return angle % (2 * Math.PI)
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