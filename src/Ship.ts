import * as THREE from 'three';
import { Planet } from './Planet';

export class Ship {
    ship: THREE.Mesh
    currentPlanet: Planet | null = null
    inFlight = false
    scene: THREE.Scene

    constructor(scene: THREE.Scene, planets: Planet[], currentPlanet: Planet,) {
        this.scene = scene
        this.ship = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xc0c0c0 })
        )
        this.currentPlanet = currentPlanet

        this.ship.position.x = this.currentPlanet.radius + 3

        this.currentPlanet.planet.add(this.ship)
    }

    travelTo(planet: Planet) {
        if (!this.inFlight) {
            const curve = new THREE.CubicBezierCurve3(
                this.currentPlanet!.planet.position,
                new THREE.Vector3(this.currentPlanet!.planet.position.x, this.currentPlanet!.planet.position.y, 60),
                new THREE.Vector3(planet.planet.position.x, planet.planet.position.y, 60),
                planet.planet.position
            )

            const points = curve.getPoints(50)
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
            // Create the final object to add to the scene 
            const curveObject = new THREE.Line(geometry, material);
            this.scene.add(curveObject)

            this.inFlight = true
            this.currentPlanet = null
        }
    }
}