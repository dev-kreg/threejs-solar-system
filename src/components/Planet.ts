import * as THREE from 'three'
import { PlanetData } from '../constants/PlanetaryData'

export class Planet {
    mesh: THREE.Mesh
    initialAngle: number
    orbitLine: THREE.Line
    orbitHitbox: THREE.Mesh
    data: PlanetData
    ring?: THREE.Mesh

    private semiMajorAxis: number
    private eccentricity: number

    constructor(
        data: PlanetData,
        initialDate: Date,
        loadingManager: THREE.LoadingManager,
        scene: THREE.Scene,
        referenceDate: Date = new Date('2000-01-01T12:00:00Z') // J2000 epoch
    ) {
        const textureLoader = new THREE.TextureLoader(loadingManager)
        const texture = textureLoader.load(data.texture)
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius),
            new THREE.MeshStandardMaterial({ map: texture })
        )
        this.data = data;

        // Calculate semi-major axis and eccentricity
        this.semiMajorAxis = (this.data.perihelion + this.data.aphelion) / 2;
        this.eccentricity = (this.data.aphelion - this.data.perihelion) / (this.data.aphelion + this.data.perihelion);

        this.initialAngle = this.calculateInitialAngle(initialDate, referenceDate)

        scene.add(this.mesh)
        this.orbitLine = this.createOrbitLine(0xFFFFFF)
        this.orbitHitbox = this.createOrbitHitbox()
        scene.add(this.orbitLine)
        scene.add(this.orbitHitbox)

        // Create ring if the planet has one
        if (data.ring) {
            this.createRing(data.ring, textureLoader);
        }
    }

    // Position on the inclined elliptical orbit at a given true anomaly
    private orbitPointAt(angle: number): THREE.Vector3 {
        const r = this.semiMajorAxis * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * Math.cos(angle));
        const inclination = this.data.orbitalInclination * Math.PI / 180;
        return new THREE.Vector3(
            r * Math.cos(angle),
            r * Math.sin(angle) * Math.sin(inclination),
            r * Math.sin(angle) * Math.cos(inclination)
        );
    }

    orbit(elapsedTime: number) {
        // Convert elapsed time to days
        const elapsedDays = elapsedTime / (24 * 60 * 60);

        const angle = this.initialAngle + (elapsedDays * 2 * Math.PI / this.data.orbitalPeriod);
        this.mesh.position.copy(this.orbitPointAt(angle));

        // Rotational motion
        const rotationAngle = (elapsedDays / this.data.rotationPeriod) * 2 * Math.PI;
        this.mesh.rotation.y = -rotationAngle;
    }

    private createRing(ringData: { innerRadius: number, outerRadius: number, texture: string, alphaMap: string }, textureLoader: THREE.TextureLoader) {
        const ringTexture = textureLoader.load(ringData.texture);
        const ringAlpha = textureLoader.load(ringData.alphaMap);
        ringTexture.wrapS = THREE.RepeatWrapping;

        const geometry = new THREE.RingGeometry(
            ringData.innerRadius,
            ringData.outerRadius,
            64 // thetaSegments
        );

        // Custom UV mapping
        const pos = geometry.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            const u = (Math.atan2(v3.y, v3.x) + Math.PI) / (2 * Math.PI);
            const v = (v3.length() - ringData.innerRadius) / (ringData.outerRadius - ringData.innerRadius);
            uvs[i * 2] = u;
            uvs[i * 2 + 1] = v;
        }
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        const material = new THREE.MeshStandardMaterial({
            map: ringTexture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            alphaMap: ringAlpha
        });

        this.ring = new THREE.Mesh(geometry, material);
        this.ring.rotation.x = Math.PI / 2;
        this.mesh.add(this.ring);
    }

    createOrbitLine(color: number): THREE.Line {
        const segments = 360
        const points = []

        for (let i = 0; i <= segments; i++) {
            points.push(this.orbitPointAt((i / segments) * Math.PI * 2))
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
            curvePoints.push(this.orbitPointAt((i / tubeSegments) * Math.PI * 2))
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints)
        const geometry = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, true)
        const material = new THREE.MeshBasicMaterial({
            visible: false,
            // color: 'red'
        })
        return new THREE.Mesh(geometry, material);
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
}