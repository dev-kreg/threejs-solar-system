import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

export class SceneManager {
    private static instance: SceneManager
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    orbitControls: OrbitControls
    effectComposer: EffectComposer

    private constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            50000
        )
        this.camera.position.set(0, 50, 200)
        this.scene.add(this.camera)

        this.renderer = new THREE.WebGLRenderer({ canvas })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace

        this.orbitControls = new OrbitControls(this.camera, canvas)
        this.orbitControls.enableDamping = true

        const renderScene = new RenderPass(this.scene, this.camera)
        this.effectComposer = new EffectComposer(this.renderer)
        this.effectComposer.addPass(renderScene)

        window.addEventListener('resize', this.handleResize.bind(this))
    }

    static initialize(canvas: HTMLCanvasElement) {
        if (!SceneManager.instance) {
            SceneManager.instance = new SceneManager(canvas)
        }
        return SceneManager.instance
    }

    static getInstance(): SceneManager {
        if (!SceneManager.instance) {
            throw new Error("SceneManager not initialized. Call initialize() first.")
        }
        return SceneManager.instance
    }

    addObject(object: THREE.Object3D) {
        this.scene.add(object)
    }

    removeObject(object: THREE.Object3D) {
        this.scene.remove(object)
    }

    private handleResize() {
        const width = window.innerWidth
        const height = window.innerHeight

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(width, height)
        this.effectComposer.setSize(width, height)
    }

    update() {
        this.orbitControls.update()
        this.effectComposer.render()
    }
}