import * as THREE from 'three';
import { Planet } from '../components/Planet';
import { SolarSystemScene } from './SolarSystemScene';

export class PlanetDetailScene {
    private container!: HTMLElement;
    private planetInfo!: HTMLElement;
    private closeButton!: HTMLElement;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private animationFrameId: number | null = null;
    private mainCamera: THREE.Camera;
    private connectionLine!: HTMLElement;

    public planet: Planet | null = null;

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

        // Create connection line element
        this.connectionLine = document.createElement('div');
        this.connectionLine.style.position = 'absolute';
        this.connectionLine.style.pointerEvents = 'none';
        this.connectionLine.style.zIndex = '999';
        document.body.appendChild(this.connectionLine);
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
        this.connectionLine.style.display = 'block';
        this.updatePlanetInfo();
        this.updateCameraPosition();
        this.startRendering();
    }

    hide() {
        this.container.style.display = 'none';
        this.connectionLine.style.display = 'none';
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

        const planetPosition = this.planet.mesh.position.clone();
        const screenPosition = planetPosition.project(this.mainCamera);

        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

        const detailViewWidth = this.container.offsetWidth;
        const detailViewHeight = this.container.offsetHeight;
        const offset = 50;

        let left = x + offset;
        let top = (y + detailViewHeight / 2) - 100;

        if (left + detailViewWidth > window.innerWidth) {
            left = x - offset - detailViewWidth;
        }

        left = Math.max(10, Math.min(left, window.innerWidth - detailViewWidth - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - detailViewHeight - 10));

        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;

        // Update the connection line to the top corner
        this.updateConnectionLine(x, y, left, top);
    }

    private updateConnectionLine(planetX: number, planetY: number, viewLeft: number, viewTop: number) {
        const viewWidth = this.container.offsetWidth;

        // Calculate the top corner of the view nearest to the planet
        const cornerX = (planetX < viewLeft) ? viewLeft : (viewLeft + viewWidth);
        const cornerY = viewTop; // This is now the top of the view, not the center

        // Calculate the angle and length of the line
        const dx = cornerX - planetX;
        const dy = cornerY - planetY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Update the line style
        this.connectionLine.style.width = `${length}px`;
        this.connectionLine.style.transform = `translate(${planetX}px, ${planetY}px) rotate(${angle}deg)`;
        this.connectionLine.style.transformOrigin = '0 0'; // Changed to top-left corner
        this.connectionLine.style.borderTop = '2px dashed green';
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