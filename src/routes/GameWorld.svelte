<script lang="ts">
  import { browser } from "$app/environment"
  import type { Tilemap } from "$lib/Tilemap"
  import type { Tile } from "$lib/types"
  import { onMount } from "svelte"

  export let tilemap: Tilemap

  const zoomStep = 1.125
  const maxZoom = zoomStep ** 8
  const minZoom = zoomStep ** -8

  let view = {
    x: 0,
    y: 0,
    zoom: 1,
  }
  let isPanning = false
  let lastMouseX = 0
  let lastMouseY = 0

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

    drawTilemap(ctx)
  }

  function drawTilemap(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        const tile = tilemap.getTile(x, y)
        if (tile) {
          const yOffset = x % 2 === 1 ? 0 : apothem / view.zoom

          // Calculate the center of the hexagon in world coordinates
          const worldX = x * ((sideLength / view.zoom) * 1.5) + sideLength
          const worldY = y * ((apothem / view.zoom) * 2) + apothem + yOffset

          // Apply zoom and view offset
          const screenX = (worldX - view.x) * view.zoom
          const screenY = (worldY - view.y) * view.zoom

          drawHex(ctx, screenX, screenY, tile)
        }
      }
    }
  }

  function drawHex(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, tile: Tile) {
    // Draw hexagon, starting from top left vertex, moving clockwise
    ctx.beginPath()
    ctx.moveTo(centerX - sideLength / 2, centerY - apothem)
    ctx.lineTo(centerX + sideLength / 2, centerY - apothem)
    ctx.lineTo(centerX + sideLength, centerY)
    ctx.lineTo(centerX + sideLength / 2, centerY + apothem)
    ctx.lineTo(centerX - sideLength / 2, centerY + apothem)
    ctx.lineTo(centerX - sideLength, centerY)
    ctx.closePath()

    // Fill hexagon
    ctx.fillStyle = "#07bb07"
    ctx.fill()

    // Draw outline
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw hex coordinates on hexagon center
    ctx.fillStyle = "#000000"
    ctx.font = `${24 * view.zoom}px Consolas`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY)
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
      isPanning = true
      lastMouseX = event.clientX
      lastMouseY = event.clientY
    }}
    on:mouseup={() => (isPanning = false)}
    on:mousemove={(event) => {
      if (!isPanning) {
        return
      }

      const deltaX = event.clientX - lastMouseX
      const deltaY = event.clientY - lastMouseY

      view.x -= deltaX / view.zoom
      view.y -= deltaY / view.zoom

      lastMouseX = event.clientX
      lastMouseY = event.clientY
    }}
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
  </aside>
</section>
