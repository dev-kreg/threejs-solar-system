import * as THREE from 'three';
import { Planet } from '../components/Planet';

export class PlanetDetailScene {
    private container!: HTMLElement;
    private planetInfo!: HTMLElement;
    private closeButton!: HTMLElement;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private planet: Planet | null = null;
    private animationFrameId: number | null = null;
    private mainCamera: THREE.Camera;

    constructor(scene: THREE.Scene, mainCamera: THREE.Camera) {
        this.scene = scene;
        this.mainCamera = mainCamera;
        this.initializeElements();
        this.setupRenderer();
    }

    private initializeElements() {
        this.container = document.getElementById('planet-detail-view') as HTMLElement;
        this.planetInfo = document.getElementById('planet-info') as HTMLElement;
        this.closeButton = document.getElementById('close-detail-view') as HTMLElement;

        if (!this.container || !this.planetInfo || !this.closeButton) {
            throw new Error('Required elements not found in the DOM');
        }

        this.closeButton.addEventListener('click', () => this.hide());
    }

    private setupRenderer() {
        const canvas = this.container.querySelector('canvas');
        if (!canvas) throw new Error('Canvas not found in container');
        
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        this.renderer.setSize(300, 200);
        this.camera = new THREE.PerspectiveCamera(50, 300 / 200, 0.1, 2000);
    }

    show(planet: Planet) {
        this.planet = planet;
        this.container.style.display = 'flex';
        this.updatePlanetInfo();
        this.updateCameraPosition();
        this.startRendering();
    }

    hide() {
        this.container.style.display = 'none';
        this.planet = null;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private updatePlanetInfo() {
        if (!this.planet) return;
        this.planetInfo.innerHTML = `
            <h3>${this.planet.data.name}</h3>
            <p>Radius: ${this.planet.data.radius} km</p>
            <p>Orbit Radius: ${this.planet.data.orbitRadius} million km</p>
            <p>Orbital Period: ${this.planet.data.orbitalPeriod} Earth days</p>
        `;
    }

    private updateCameraPosition() {
        if (!this.planet) return;
        const planetPosition = this.planet.mesh.position.clone();
        const planetRadius = this.planet.data.radius;
        
        // Calculate camera position
        const cameraOffset = new THREE.Vector3(0, 0, planetRadius * 3);
        cameraOffset.applyQuaternion(this.scene.quaternion);
        this.camera.position.copy(planetPosition).add(cameraOffset);
        
        this.camera.lookAt(planetPosition);
    }

    private updateDetailViewPosition() {
        if (!this.planet) return;

        // Get the planet's position in world space
        const planetPosition = this.planet.mesh.position.clone();

        // Project the 3D position to 2D screen space
        const screenPosition = planetPosition.project(this.mainCamera);

        // Convert to pixel coordinates
        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

        // Adjust position to center the detail view on the planet
        const detailViewWidth = this.container.offsetWidth;
        const detailViewHeight = this.container.offsetHeight;
        
        let left = x - detailViewWidth / 2;
        let top = y - detailViewHeight / 2;

        // Ensure the detail view stays within the screen bounds
        left = Math.max(10, Math.min(left, window.innerWidth - detailViewWidth - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - detailViewHeight - 10));

        // Update the container's position
        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
    }

    private startRendering() {
        const animate = () => {
            if (this.planet) {
                this.animationFrameId = requestAnimationFrame(animate);
                this.updateCameraPosition();
                this.updateDetailViewPosition();
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }
}