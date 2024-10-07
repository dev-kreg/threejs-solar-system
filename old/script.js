import * as THREE from 'three'


const GM = 1000;
const dt = 0.01;


class Planet {
    constructor(pos, color, radius) {
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshBasicMaterial({ color: color });
        this.obj = new THREE.Mesh(geometry, material);
        this.obj.position.copy(pos);
        scene.add(this.obj); // Add planet to the scene

        // Torus to represent orbit
        const torusGeometry = new THREE.RingGeometry(radius * 1.1, radius, 32);
        const torusMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.rotation.x = Math.PI / 2;
        this.torus.position.copy(this.obj.position);
        scene.add(this.torus); // Add orbit to the scene

        this.circular();
    }

    circular() {
        this.dist = this.obj.position.length();
        const tangent = new THREE.Vector3(-this.obj.position.y, this.obj.position.x, 0).normalize();
        const speed = Math.sqrt(GM / this.dist);
        this.vel = tangent.multiplyScalar(speed);
    }

    move() {
        const acc = this.obj.position.clone().multiplyScalar(-GM / Math.pow(this.dist, 3));
        this.vel.add(acc.multiplyScalar(dt));
        this.obj.position.add(this.vel.clone().multiplyScalar(dt));
        this.torus.position.copy(this.obj.position); // Move the torus along
    }
}

class Spaceship {

    dist = 0;

    constructor(pos) {
        const geometry = new THREE.BoxGeometry(8, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.obj = new THREE.Mesh(geometry, material);
        this.obj.position.set(pos);
        scene.add(this.obj);

        this.prepareLaunch = false;
        this.inFlight = false;

        this.circular();
    }

    circular() {
        this.dist = this.obj.position.length();
        const tangent = new THREE.Vector3(-this.obj.position.y, this.obj.position.x, 0).normalize();
        const speed = Math.sqrt(GM / this.dist);
        this.vel = tangent.multiplyScalar(speed);
    }

    setLaunchWindow(planet) {
        if (this.inFlight == false) {
            console.log("Setting launch window for", planet.obj.position);
            this.dest = planet;
            const a = (this.dist + this.dest.obj.position.length()) / 2;
            const r = this.dest.obj.position.length();
            this.phi = ((180.0 * Math.pow(a / r, 1.5)) % 360.0);
            this.theta = this.phi < 180.0 ? 180.0 - this.phi : 540.0 - this.phi;
            this.prepareLaunch = true;
            this.inFlight = false;
            console.log('Launch window set: phi =', this.phi, ', theta =', this.theta);
        }
    }

    move() {
        const acc = this.obj.position.clone().multiplyScalar(-GM / Math.pow(this.dist, 3));
        this.vel.add(acc.multiplyScalar(dt));
        this.obj.position.add(this.vel.clone().multiplyScalar(dt));

        if (this.prepareLaunch) {
            console.log("Launching to", this.dest.obj.position);
            this.launch();
            this.prepareLaunch = false;
            this.inFlight = true;
        }
    }

    launch() {
        console.log("Launched!");
        this.vel = new THREE.Vector3(-this.obj.position.y, this.obj.position.x, 0).normalize().multiplyScalar(5);
    }
}

function angleBetween(a, b) {
    const theta = Math.acos(a.dot(b) / (a.length() * b.length())) * 180.0 / Math.PI;
    const crossProduct = new THREE.Vector3().crossVectors(a, b);
    if (crossProduct.z < 0) {
        return 360.0 - theta;
    }
    return theta;
}

// Initial setup for THREE.js scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun); // Add the Sun to the scene

// Create Planets
const p1 = new Planet(new THREE.Vector3(20, 0, 0), 0x320014, 5); // Color: dark red
const p2 = new Planet(new THREE.Vector3(50, 0, 0), 0x323232, 5); // Color: gray
const p3 = new Planet(new THREE.Vector3(100, 0, 0), 0x000064, 8); // Color: dark blue
const p4 = new Planet(new THREE.Vector3(200, 0, 0), 0x640000, 6); // Color: dark red
const p5 = new Planet(new THREE.Vector3(300, 0, 0), 0x640064, 6); // Color: dark purple

// Create Spaceship
const spaceship = new Spaceship(new THREE.Vector3(75, 0, 0));

// Add event listeners to buttons to launch to planets
document.getElementById('btn1').addEventListener('click', () => spaceship.setLaunchWindow(p1));
document.getElementById('btn2').addEventListener('click', () => spaceship.setLaunchWindow(p2));
document.getElementById('btn3').addEventListener('click', () => spaceship.setLaunchWindow(p3));
document.getElementById('btn4').addEventListener('click', () => spaceship.setLaunchWindow(p4));
document.getElementById('btn5').addEventListener('click', () => spaceship.setLaunchWindow(p5));

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move the planets
    p1.move();
    p2.move();
    p3.move();
    p4.move();
    p5.move();
    spaceship.move()

    renderer.render(scene, camera);
}

camera.position.z = 200;
animate();