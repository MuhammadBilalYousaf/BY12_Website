"use client"

import { useEffect, useRef } from "react"
import type { AnimationAction, AnimationMixer, Group, Material, Texture, WebGLRenderer } from "three"

interface ProductModelCanvasProps {
  modelUrl: string
  productName: string
  progress?: { current: number }
  preview?: boolean
  assembled?: boolean
  onReady?: (hasAssembly: boolean) => void
  onError?: () => void
}

/** Canvas only: the storefront gets no editor controls, sliders or replacement page UI. */
export default function ProductModelCanvas({ modelUrl, productName, progress, preview = false, assembled = false, onReady, onError }: ProductModelCanvasProps) {
  const host = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onReady, onError })
  callbacks.current = { onReady, onError }

  useEffect(() => {
    const container = host.current
    if (!container) return
    let cancelled = false, visible = true, dirty = true, lastProgress = -1
    let renderer: WebGLRenderer | undefined, model: Group | undefined, mixer: AnimationMixer | undefined
    let cleanup: (() => void) | undefined

    async function start() {
      const [THREE, { GLTFLoader }, { RoomEnvironment }, { DRACOLoader }, { KTX2Loader }, { MeshoptDecoder }, orbit] = await Promise.all([
        import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/environments/RoomEnvironment.js"),
        import("three/addons/loaders/DRACOLoader.js"), import("three/addons/loaders/KTX2Loader.js"), import("three/addons/libs/meshopt_decoder.module.js"),
        preview ? import("three/addons/controls/OrbitControls.js") : Promise.resolve(undefined),
      ])
      if (cancelled) return
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = .85
      const contextLost = () => { if (!cancelled) callbacks.current.onError?.() }
      renderer.domElement.addEventListener("webglcontextlost", contextLost)
      container!.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, 1, .01, 100)
      camera.position.set(1.2, preview ? .15 : .45, preview ? 6.4 : 8.3)
      camera.lookAt(0, preview ? 0 : .45, 0)
      const pmrem = new THREE.PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      const environment = pmrem.fromScene(room, .04).texture
      room.dispose(); pmrem.dispose()
      scene.environment = environment; scene.environmentIntensity = .8
      scene.add(new THREE.HemisphereLight("#ffeed2", "#49413a", .65))
      const key = new THREE.DirectionalLight("#fff0d8", 1.4); key.position.set(4, 6, 7); scene.add(key)
      const fill = new THREE.DirectionalLight("#e2ebff", .65); fill.position.set(-5, 3, 2); scene.add(fill)
      const rim = new THREE.DirectionalLight("#d9a759", 1.1); rim.position.set(1, 4, -5); scene.add(rim)
      const draco = new DRACOLoader().setDecoderPath("/three/draco/")
      const ktx = new KTX2Loader().setTranscoderPath("/three/basis/").detectSupport(renderer)
      const loader = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx).setMeshoptDecoder(MeshoptDecoder)
      const controls = orbit ? new orbit.OrbitControls(camera, renderer.domElement) : undefined
      if (controls) {
        controls.enablePan = false; controls.enableDamping = true
        controls.minDistance = 4.5; controls.maxDistance = 10
        controls.addEventListener("change", () => { dirty = true })
      }
      const resize = new ResizeObserver(() => {
        if (!renderer || cancelled) return
        const width = container!.clientWidth, height = container!.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height)
        camera.aspect = width / height; camera.updateProjectionMatrix(); dirty = true
      })
      resize.observe(container!)
      const intersection = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); dirty = true }, { rootMargin: "150px" })
      intersection.observe(container!)

      const disposeModel = (object: Group) => {
        const textures = new Set<Texture>(), materials = new Set<Material>()
        object.traverse(item => {
          if (!(item instanceof THREE.Mesh)) return
          item.geometry.dispose()
          for (const material of Array.isArray(item.material) ? item.material : [item.material]) {
            materials.add(material)
            for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
          }
        })
        textures.forEach(texture => { const image = texture.image; texture.dispose(); if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close() })
        materials.forEach(material => material.dispose())
      }
      cleanup = () => {
        renderer?.setAnimationLoop(null); resize.disconnect(); intersection.disconnect(); controls?.dispose()
        mixer?.stopAllAction(); if (model) { mixer?.uncacheRoot(model); disposeModel(model) }
        environment.dispose(); draco.dispose(); ktx.dispose()
        renderer?.domElement.removeEventListener("webglcontextlost", contextLost)
        renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove()
      }
      const gltf = await loader.loadAsync(modelUrl)
      if (cancelled) { disposeModel(gltf.scene); return }
      model = gltf.scene
      const bounds = new THREE.Box3().setFromObject(model)
      const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3())
      if (!Number.isFinite(size.y) || size.y <= 0) throw new Error("The GLB has no visible model geometry.")
      model.position.sub(center)
      const anchor = new THREE.Group(); anchor.scale.setScalar(2.8 / size.y); anchor.add(model); scene.add(anchor)
      const clip = gltf.animations.find(animation => /assembl/i.test(animation.name)) ?? (gltf.animations.length === 1 ? gltf.animations[0] : undefined)
      let action: AnimationAction | undefined
      if (clip) {
        mixer = new THREE.AnimationMixer(model)
        action = mixer.clipAction(clip); action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play()
      }
      const render = () => {
        if (!renderer || cancelled || !visible) return
        controls?.update()
        const value = assembled || preview ? 1 : THREE.MathUtils.clamp(progress?.current ?? 0, 0, 1)
        if (value !== lastProgress) {
          // LoopOnce clamps at the end; re-enable it so scrolling backwards also rewinds.
          if (action) { action.paused = false; action.enabled = true }
          mixer?.setTime(value * (clip?.duration ?? 0))
          if (!preview) {
            anchor.rotation.y = THREE.MathUtils.lerp(-.12, .12, value)
            camera.position.z = THREE.MathUtils.lerp(8.3, 6.6, value)
            camera.lookAt(0, THREE.MathUtils.lerp(.45, 0, value), 0)
          }
          lastProgress = value; dirty = true
        }
        if (dirty) { renderer.render(scene, camera); dirty = false }
      }
      renderer.setSize(container!.clientWidth || 1, container!.clientHeight || 1)
      camera.aspect = (container!.clientWidth || 1) / (container!.clientHeight || 1); camera.updateProjectionMatrix()
      renderer.setAnimationLoop(render)
      render()
      callbacks.current.onReady?.(Boolean(clip))
    }
    start().catch(error => {
      if (cancelled) return
      console.warn("Product 3D model could not be displayed", error)
      cleanup?.(); cleanup = undefined
      // A missing model or unavailable WebGL never leaves a blank pinned scroll section.
      callbacks.current.onError?.()
    })
    return () => { cancelled = true; cleanup?.() }
  }, [modelUrl, preview, assembled, progress])

  return <div ref={host} role="img" aria-label={`3D model of ${productName}`} className={`h-full w-full ${preview ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`} />
}
