<script lang="ts">
  import { browser } from "$app/environment"
  import type { Tilemap } from "$lib/Tilemap"
  import type { Tile } from "$lib/types"
  import { onMount } from "svelte"
  import type { View } from "./canvasTypes"
  import { drawTilemap } from "./tilemapDrawing"
  import { screenToWorld, worldToTile } from "./cameraUtils"

  export let tilemap: Tilemap

  const zoomStep = 1.125
  const maxZoom = zoomStep ** 8
  const minZoom = zoomStep ** -8

  let view: View = {
    x: 0,
    y: 0,
    zoom: 1,
  }

  let selectedTile: Tile | null = null

  let isPanning = false
  let panningPrevX = 0
  let panningPrevY = 0

  let sideLength: number
  let apothem: number

  $: {
    sideLength = 50 * view.zoom
    apothem = (Math.sqrt(3) * sideLength) / 2
  }

  let canvas: HTMLCanvasElement

  let fps = 0

  onMount(() => {
    resizeCanvasToFullScreen()

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    requestAnimationFrame(gameLoop)

    let lastTime = 0
    function gameLoop(time: number) {
      const deltaTime = time - lastTime
      fps = 1000 / deltaTime

      redraw(ctx!)

      lastTime = time
      requestAnimationFrame(gameLoop)
    }
  })

  if (browser) {
    window.addEventListener("resize", resizeCanvasToFullScreen)
  }

  function resizeCanvasToFullScreen() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  function redraw(ctx: CanvasRenderingContext2D) {
    // Redraw background
    ctx.fillStyle = "#eee"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTilemap(ctx, canvas, view, tilemap, sideLength, apothem)
  }
</script>

<section class="w-full h-full relative">
  <canvas
    class="absolute inset-0"
    bind:this={canvas}
    on:contextmenu|preventDefault
    on:wheel|preventDefault={(event) => {
      // Calculate cursor position in screen coordinates
      const screenX = event.clientX - canvas.getBoundingClientRect().left
      const screenY = event.clientY - canvas.getBoundingClientRect().top

      // Calculate cursor position in world coordinates
      const worldX = screenX / view.zoom + view.x
      const worldY = screenY / view.zoom + view.y

      if (event.deltaY > 0) {
        view.zoom /= zoomStep // Zoom out
      } else {
        view.zoom *= zoomStep // Zoom in
      }

      // Clamp zoom
      view.zoom = Math.max(minZoom, Math.min(maxZoom, view.zoom))

      // Calculate new view offset so that the cursor position in world coordinates
      view.x = worldX - screenX / view.zoom
      view.y = worldY - screenY / view.zoom
    }}
    on:mousedown={(event) => {
      // If the user is right-clicking or middle-clicking, start panning
      if (event.button === 1 || event.button === 2) {
        isPanning = true
        panningPrevX = event.clientX
        panningPrevY = event.clientY
      }
    }}
    on:mouseup={(event) => {
      if (isPanning) {
        isPanning = false
      }

      // If the user is left-clicking, select the tile under the cursor
      if (event.button === 0) {
        // Calculate cursor position in screen coordinates
        const screenX = event.clientX - canvas.getBoundingClientRect().left
        const screenY = event.clientY - canvas.getBoundingClientRect().top

        // Calculate cursor position in world coordinates
        const { worldX, worldY } = screenToWorld(view, screenX, screenY)
        const { tileX, tileY } = worldToTile(view, worldX, worldY, sideLength, apothem)

        selectedTile = tilemap.getTile(tileX, tileY)
      }
    }}
    on:mousemove={(event) => {
      if (!isPanning) {
        return
      }

      const deltaX = event.clientX - panningPrevX
      const deltaY = event.clientY - panningPrevY

      view.x -= deltaX / view.zoom
      view.y -= deltaY / view.zoom

      panningPrevX = event.clientX
      panningPrevY = event.clientY
    }}
    on:mouseleave={() => (isPanning = false)}
  />

  <aside
    id="debug-info-panel"
    class="absolute left-4 top-4 p-2 rounded bg-black text-white bg-opacity-50 font-mono grid gap-2"
  >
    <p>FPS: {Math.round(fps)}</p>
    <section>
      <p>Zoom: {view.zoom.toFixed(4)}</p>
      <p>X: {view.x.toFixed(2)}</p>
      <p>Y: {view.y.toFixed(2)}</p>
    </section>
    <p>
      Selected tile: {selectedTile?.x ?? "_"},{selectedTile?.y ?? "_"}
    </p>
  </aside>
</section>
