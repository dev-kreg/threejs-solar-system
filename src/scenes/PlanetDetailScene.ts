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
    
    private activeTab: string = 'physical';

    constructor(scene: THREE.Scene, mainCamera: THREE.Camera) {
        this.scene = scene;
        this.mainCamera = mainCamera;
        this.initializeElements();
        this.setupRenderer();
        this.setupTabListeners();
    }

    private setupTabListeners() {
        const tabIds = ['physical', 'orbital', 'rotational', 'other'];
        tabIds.forEach(tabId => {
            const tab = document.getElementById(`tab-${tabId}`);
            if (tab) {
                tab.addEventListener('click', () => this.switchTab(tabId));
            }
        });
    }

    private switchTab(tabId: string) {
        this.activeTab = tabId;
        this.updatePlanetInfo();
    }

    private initializeElements() {
        this.container = document.getElementById('planet-detail-view') as HTMLElement;
        this.planetInfo = document.getElementById('planet-info') as HTMLElement;
        this.closeButton = this.container.querySelector('.close-button') as HTMLElement;

        if (!this.container || !this.planetInfo || !this.closeButton) {
            throw new Error('Required elements not found in the DOM');
        }

        this.closeButton.addEventListener('click', () => this.hide());

        // Create connection line element
        this.connectionLine = document.createElement('div');
        this.connectionLine.id = 'connection-line';
        document.body.appendChild(this.connectionLine);
    }

    private setupRenderer() {
        const canvas = this.container.querySelector('canvas');
        if (!canvas) throw new Error('Canvas not found in container');

        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        this.renderer.setSize(320, 200);
        this.camera = new THREE.PerspectiveCamera(50, 320 / 200, 0.1, 2000);
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
        
        const formatNumber = (num: number) => num.toLocaleString(undefined, {maximumFractionDigits: 2});
        
        const tabContent = {
            physical: `
                <h3>Physical Characteristics</h3>
                <p><strong>Mass:</strong> ${formatNumber(this.planet.data.mass)} × 10²⁴ kg</p>
                <p><strong>Diameter:</strong> ${formatNumber(this.planet.data.diameter)} km</p>
                <p><strong>Density:</strong> ${formatNumber(this.planet.data.density)} kg/m³</p>
                <p><strong>Gravity:</strong> ${formatNumber(this.planet.data.gravity)} m/s²</p>
                <p><strong>Escape Velocity:</strong> ${formatNumber(this.planet.data.escapeVelocity)} km/s</p>
            `,
            orbital: `
                <h3>Orbital Characteristics</h3>
                <p><strong>Distance from Sun:</strong> ${formatNumber(this.planet.data.distanceFromSun)} × 10⁶ km</p>
                <p><strong>Orbital Period:</strong> ${formatNumber(this.planet.data.orbitalPeriod)} Earth days</p>
                <p><strong>Orbital Velocity:</strong> ${formatNumber(this.planet.data.orbitalVelocity)} km/s</p>
                <p><strong>Orbital Inclination:</strong> ${formatNumber(this.planet.data.orbitalInclination)}°</p>
                <p><strong>Orbital Eccentricity:</strong> ${formatNumber(this.planet.data.orbitalEccentricity)}</p>
                <p><strong>Perihelion:</strong> ${formatNumber(this.planet.data.perihelion)} × 10⁶ km</p>
                <p><strong>Aphelion:</strong> ${formatNumber(this.planet.data.aphelion)} × 10⁶ km</p>
            `,
            rotational: `
                <h3>Rotational Characteristics</h3>
                <p><strong>Rotation Period:</strong> ${formatNumber(Math.abs(this.planet.data.rotationPeriod))} hours</p>
                <p><strong>Length of Day:</strong> ${formatNumber(this.planet.data.lengthOfDay)} hours</p>
                <p><strong>Obliquity to Orbit:</strong> ${formatNumber(this.planet.data.obliquityToOrbit)}°</p>
            `,
            other: `
                <h3>Other Information</h3>
                <p><strong>Mean Temperature:</strong> ${formatNumber(this.planet.data.meanTemperature)}°C</p>
                <p><strong>Surface Pressure:</strong> ${this.planet.data.surfacePressure} bars</p>
                <p><strong>Number of Moons:</strong> ${this.planet.data.numberOfMoons}</p>
                <p><strong>Ring System:</strong> ${this.planet.data.hasRingSystem ? 'Yes' : 'No'}</p>
                <p><strong>Global Magnetic Field:</strong> ${this.planet.data.hasGlobalMagneticField}</p>
            `
        };
        
        this.planetInfo.innerHTML = `
            <h2>${this.planet.data.name}</h2>
            <div class="tabs">
                <button id="tab-physical" class="${this.activeTab === 'physical' ? 'active' : ''}">Physical</button>
                <button id="tab-orbital" class="${this.activeTab === 'orbital' ? 'active' : ''}">Orbital</button>
                <button id="tab-rotational" class="${this.activeTab === 'rotational' ? 'active' : ''}">Rotational</button>
                <button id="tab-other" class="${this.activeTab === 'other' ? 'active' : ''}">Other</button>
            </div>
            <div class="tab-content">
                ${tabContent[this.activeTab as keyof typeof tabContent]}
            </div>
        `;
        
        this.setupTabListeners();
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
        const margin = 50; // Margin from screen edges

        let left = x + margin;
        let top = y - detailViewHeight / 2 + 100;

        // Ensure the view stays within the screen bounds with the specified margin
        if (left + detailViewWidth > window.innerWidth - margin) {
            left = x - margin - detailViewWidth;
        }

        left = Math.max(margin, Math.min(left, window.innerWidth - detailViewWidth - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - detailViewHeight - margin));

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
        this.connectionLine.style.borderTop = '2px dashed #20C20E';
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