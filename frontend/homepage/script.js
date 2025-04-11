// DOM Elements
const sidebar = document.getElementById("sidebar")
const sidebarTrigger = document.getElementById("sidebarTrigger")
const sidebarClose = document.getElementById("sidebarClose")
const sidebarOverlay = document.getElementById("sidebarOverlay")
const tabTriggers = document.querySelectorAll(".tab-trigger")
const tabPanels = document.querySelectorAll(".tab-panel")
const startSigningBtn = document.getElementById("startSigningBtn")
const conversionStatus = document.getElementById("conversionStatus")
const conversionResult = document.getElementById("conversionResult")
const conversionPlaceholder = document.getElementById("conversionPlaceholder")
const currentYearElement = document.getElementById("currentYear")

// Set current year in footer
currentYearElement.textContent = new Date().getFullYear()

// Sidebar functionality
function toggleSidebar() {
  sidebar.classList.toggle("active")
  document.body.classList.toggle("sidebar-open")
}

sidebarTrigger.addEventListener("click", toggleSidebar)
sidebarClose.addEventListener("click", toggleSidebar)
sidebarOverlay.addEventListener("click", toggleSidebar)

// Tabs functionality
tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const tabId = trigger.getAttribute("data-tab")

    // Remove active class from all triggers and panels
    tabTriggers.forEach((t) => t.classList.remove("active"))
    tabPanels.forEach((p) => p.classList.remove("active"))

    // Add active class to clicked trigger and corresponding panel
    trigger.classList.add("active")
    document.getElementById(`${tabId}-panel`).classList.add("active")
  })
})

// Conversion demo functionality is now handled by sign-recognition.js

// Animation on scroll
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll("[data-aos]")

  const checkIfInView = () => {
    animatedElements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (elementPosition.top < windowHeight * 0.8) {
        element.classList.add("aos-animate")
      }
    })
  }

  // Check on load
  checkIfInView()

  // Check on scroll
  window.addEventListener("scroll", checkIfInView)
})

// Import Three.js library
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

// 3D Hand Model with Three.js
function init3DScene() {
  // Create scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf3f4f6)

  // Create camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(
    document.getElementById("hero3DCanvas").clientWidth,
    document.getElementById("hero3DCanvas").clientHeight,
  )
  document.getElementById("hero3DCanvas").appendChild(renderer.domElement)

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // Create a placeholder hand model (cube for now)
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.7,
    metalness: 0.2,
  })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = false

  // Handle window resize
  window.addEventListener("resize", () => {
    const width = document.getElementById("hero3DCanvas").clientWidth
    const height = document.getElementById("hero3DCanvas").clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)

    // Rotate the cube
    cube.rotation.x += 0.005
    cube.rotation.y += 0.01

    controls.update()
    renderer.render(scene, camera)
  }

  animate()

  // Try to load a GLTF model if available
  try {
    const loader = new GLTFLoader()
    loader.load(
      // URL of the model
      "https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf",
      // Called when the resource is loaded
      (gltf) => {
        scene.remove(cube) // Remove placeholder cube

        const model = gltf.scene
        model.scale.set(0.5, 0.5, 0.5)
        model.position.set(0, -1, 0)
        model.rotation.y = Math.PI / 4

        scene.add(model)
      },
      // Called while loading is progressing
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
      },
      // Called when loading has errors
      (error) => {
        console.error("An error happened while loading the 3D model:", error)
      },
    )
  } catch (error) {
    console.warn("GLTFLoader not available, using placeholder cube instead")
  }
}

// Initialize 3D scene when the page is loaded
window.addEventListener("load", init3DScene)
