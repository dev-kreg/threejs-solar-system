import * as THREE from 'three';
import { Planet } from '../components/Planet';

export class PlanetDetailScene {
    private container!: HTMLElement;
    private planetInfo!: HTMLElement;
    private closeButton!: HTMLElement;
    private animationFrameId: number | null = null;
    private mainCamera: THREE.Camera;
    private connectionLine!: HTMLElement;

    public planet: Planet | null = null;

    private activeTab: string = 'physical';
    private dragged: boolean = false; // user moved the panel; stop auto-positioning it

    constructor(mainCamera: THREE.Camera) {
        this.mainCamera = mainCamera;
        this.initializeElements();
        this.makeDraggable();
    }

    private makeDraggable() {
        this.container.addEventListener('pointerdown', (e: PointerEvent) => {
            if (window.innerWidth <= 768) return; // bottom sheet on phones, not draggable
            if ((e.target as HTMLElement).closest('button, .tab-content')) return;
            e.preventDefault();
            this.container.style.cursor = 'grabbing';
            const grabX = e.clientX - this.container.offsetLeft;
            const grabY = e.clientY - this.container.offsetTop;
            const move = (ev: PointerEvent) => {
                this.dragged = true;
                this.container.style.left = `${ev.clientX - grabX}px`;
                this.container.style.top = `${ev.clientY - grabY}px`;
            };
            const up = () => {
                this.container.style.cursor = '';
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
        });
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

    // Selects the planet but keeps the panel hidden; reveal() shows it once the
    // camera fly-in finishes (SolarSystemScene calls it)
    show(planet: Planet) {
        this.planet = planet;
        this.dragged = false;
        this.container.style.display = 'none';
        this.connectionLine.style.display = 'none';
        this.updatePlanetInfo();
        this.startTracking();
    }

    reveal() {
        if (!this.planet) return;
        this.container.style.display = 'flex';
        this.connectionLine.style.display = 'block';
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

    private updateDetailViewPosition() {
        if (!this.planet) return;
        if (window.innerWidth <= 768) return; // CSS pins it as a bottom sheet on phones

        const planetPosition = this.planet.mesh.position.clone();
        const screenPosition = planetPosition.project(this.mainCamera);

        const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

        const detailViewWidth = this.container.offsetWidth;
        const detailViewHeight = this.container.offsetHeight;
        const margin = 50; // Margin from screen edges

        if (!this.dragged) {
            // The followed planet sits centered and large on screen, so push the
            // panel out proportionally to viewport width instead of a fixed 50px
            const offsetX = Math.max(margin, window.innerWidth * 0.2);
            let left = x + offsetX;
            let top = y - detailViewHeight / 2 + 100;

            // Ensure the view stays within the screen bounds with the specified margin
            if (left + detailViewWidth > window.innerWidth - margin) {
                left = x - offsetX - detailViewWidth;
            }

            left = Math.max(margin, Math.min(left, window.innerWidth - detailViewWidth - margin));
            top = Math.max(margin, Math.min(top, window.innerHeight - detailViewHeight - margin));

            this.container.style.left = `${left}px`;
            this.container.style.top = `${top}px`;
        }

        // Line keeps connecting planet → panel even after a manual drag
        this.updateConnectionLine(x, y, this.container.offsetLeft, this.container.offsetTop);
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

    // Keeps the panel anchored to the planet's screen position (desktop only)
    private startTracking() {
        const animate = () => {
            if (this.planet) {
                this.animationFrameId = requestAnimationFrame(animate);
                this.updateDetailViewPosition();
            }
        };
        animate();
    }
}