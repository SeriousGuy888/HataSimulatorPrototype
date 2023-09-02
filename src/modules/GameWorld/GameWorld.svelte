<script lang="ts">
  import { browser } from "$app/environment"
  import type { Tilemap } from "$lib/Tilemap"
  import { onMount } from "svelte"
  import type { View } from "./canvasTypes"
  import { drawTilemap } from "./tilemapDrawing"
  import { screenToWorld, worldToTile } from "./cameraUtils"
  import { tileTypes, type TileType } from "$lib/types"

  export let tilemap: Tilemap

  const zoomStep = 1.125
  const maxZoom = zoomStep ** 8
  const minZoom = zoomStep ** -8

  let view: View = {
    x: -128,
    y: -128,
    zoom: minZoom,
  }

  let selectedCoords: { x: number; y: number } | null = null
  let selectedTileType: TileType = tileTypes[0]

  let isPanning = false
  let panningPrevX = 0
  let panningPrevY = 0

  let isPlacing = false

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

    // window.tilemap = tilemap.serialise()

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

    drawTilemap(ctx, canvas, view, selectedCoords, tilemap, sideLength, apothem)
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
      // If the user is middle-clicking, start panning
      if (event.button === 1) {
        isPanning = true
        panningPrevX = event.clientX
        panningPrevY = event.clientY
      }

      if (event.button === 2) {
        isPlacing = true
      }
    }}
    on:mouseup={(event) => {
      if (isPanning) {
        isPanning = false
      }

      if (isPlacing) {
        isPlacing = false
      }

      // If the user is left-clicking, select the tile under the cursor
      if (event.button === 0) {
        // Calculate cursor position in screen coordinates
        const screenX = event.clientX - canvas.getBoundingClientRect().left
        const screenY = event.clientY - canvas.getBoundingClientRect().top

        // Calculate cursor position in world coordinates
        const { worldX, worldY } = screenToWorld(view, screenX, screenY)
        const { tileX, tileY } = worldToTile(view, worldX, worldY, sideLength, apothem)

        selectedCoords = { x: tileX, y: tileY }
      }

      if (event.button === 2 && event.shiftKey) {
        // Calculate cursor position in screen coordinates
        const screenX = event.clientX - canvas.getBoundingClientRect().left
        const screenY = event.clientY - canvas.getBoundingClientRect().top

        // Calculate cursor position in world coordinates
        const { worldX, worldY } = screenToWorld(view, screenX, screenY)
        const { tileX, tileY } = worldToTile(view, worldX, worldY, sideLength, apothem)

        tilemap.floodFill(tileX, tileY, selectedTileType)
      }
    }}
    on:mousemove={(event) => {
      if (isPanning) {
        const deltaX = event.clientX - panningPrevX
        const deltaY = event.clientY - panningPrevY

        view.x -= deltaX / view.zoom
        view.y -= deltaY / view.zoom

        panningPrevX = event.clientX
        panningPrevY = event.clientY
      }

      // If the user is right-clicking, place a tile
      if (isPlacing) {
        // Calculate cursor position in screen coordinates
        const screenX = event.clientX - canvas.getBoundingClientRect().left
        const screenY = event.clientY - canvas.getBoundingClientRect().top

        // Calculate cursor position in world coordinates
        const { worldX, worldY } = screenToWorld(view, screenX, screenY)
        const { tileX, tileY } = worldToTile(view, worldX, worldY, sideLength, apothem)

        tilemap.setTile(tileX, tileY, selectedTileType)
      }
    }}
    on:mouseleave={() => (isPanning = false)}
  />

  <aside
    id="debug-info-panel"
    class="absolute left-4 top-4 p-2 rounded bg-black text-white bg-opacity-50 hover:bg-opacity-90 transition-colors font-mono grid gap-2"
  >
    <p>FPS: {Math.round(fps)}</p>
    <section>
      <p>Zoom: {view.zoom.toFixed(4)}</p>
      <p>X: {view.x.toFixed(2)}</p>
      <p>Y: {view.y.toFixed(2)}</p>
    </section>
    <p>
      Selected tile: {selectedCoords?.x ?? "_"},{selectedCoords?.y ?? "_"}
    </p>
    <hr class="my-4" />
    <section class="grid gap-2">
      <div class="flex flex-row gap-2">
        <button
          on:click={() => {
            const ser = tilemap.serialise()
            navigator.clipboard.writeText(ser)
            alert("Copied to clipboard")
          }}
          class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
        >
          Serialise
        </button>
        <button
          on:click={() => {
            const ser = prompt("Paste serialised tilemap", "")
            if (ser) {
              try {
                tilemap.deserialise(ser)
              } catch (e) {
                alert("Invalid serialised tilemap: " + e)
              }
            }
          }}
          class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1">Load</button
        >
      </div>
      <ul class="columns-2">
        {#each tileTypes as type}
          <li>
            <button
              class={selectedTileType === type ? "underline" : ""}
              on:click={() => (selectedTileType = type)}
            >
              {type}
            </button>
          </li>
        {/each}
      </ul>
    </section>
  </aside>
</section>
