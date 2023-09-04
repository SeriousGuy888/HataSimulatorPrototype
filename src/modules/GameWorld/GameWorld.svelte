<script lang="ts">
  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import { drawTilemap } from "./tilemapDrawing"
  import { screenToWorld, worldToTile } from "./cameraUtils"
  import {
  debugEnabled,
    maxZoom,
    minZoom,
    selectedCoords,
    selectedTileType,
    tilemap,
    view,
    zoomStep,
  } from "$lib/gameState"
  import DebugInfoPanel from "./DebugInfoPanel.svelte"
  import SelectedTilePanel from "./SelectedTilePanel.svelte"

  let isPanning = false
  let panningPrevX = 0
  let panningPrevY = 0

  let isPlacing = false

  let sideLength: number
  let apothem: number

  $: {
    sideLength = 50 * $view.zoom
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
    window.addEventListener("keydown", (event) => {
      switch(event.key) {
        case "Escape":
          selectedCoords.set(null)
          break
        case "F3":
          debugEnabled.set(!$debugEnabled)
          event.preventDefault()
          break
      }
    })
  }

  function resizeCanvasToFullScreen() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  function redraw(ctx: CanvasRenderingContext2D) {
    // Redraw background
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTilemap(ctx, canvas, $view, $selectedCoords, $tilemap, sideLength, apothem)
  }

  function mouseEventToTileCoords(event: MouseEvent) {
    const screenX = event.clientX - canvas.getBoundingClientRect().left
    const screenY = event.clientY - canvas.getBoundingClientRect().top

    const { worldX, worldY } = screenToWorld($view, screenX, screenY)
    const { tileX, tileY } = worldToTile($view, worldX, worldY, sideLength, apothem)

    return { tileX, tileY }
  }
</script>

<section class="w-full h-screen relative overflow-clip">
  <canvas
    class="absolute inset-0"
    bind:this={canvas}
    on:contextmenu|preventDefault
    on:wheel|preventDefault={(event) => {
      // Calculate cursor position in screen coordinates
      const screenX = event.clientX - canvas.getBoundingClientRect().left
      const screenY = event.clientY - canvas.getBoundingClientRect().top

      // Calculate cursor position in world coordinates
      const worldX = screenX / $view.zoom + $view.x
      const worldY = screenY / $view.zoom + $view.y

      if (event.deltaY > 0) {
        $view.zoom /= zoomStep // Zoom out
      } else {
        $view.zoom *= zoomStep // Zoom in
      }

      // Clamp zoom
      $view.zoom = Math.max(minZoom, Math.min(maxZoom, $view.zoom))

      // Calculate new view offset so that the cursor position in world coordinates
      $view.x = worldX - screenX / $view.zoom
      $view.y = worldY - screenY / $view.zoom
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
        const { tileX, tileY } = mouseEventToTileCoords(event)
        if (!$tilemap.getTile(tileX, tileY)) {
          return
        }
        
        selectedCoords.set({ x: tileX, y: tileY })
      }

      if (event.button === 2 && event.shiftKey) {
        const { tileX, tileY } = mouseEventToTileCoords(event)
        $tilemap.floodFill(tileX, tileY, $selectedTileType)
      }
    }}
    on:mousemove={(event) => {
      if (isPanning) {
        const deltaX = event.clientX - panningPrevX
        const deltaY = event.clientY - panningPrevY

        $view.x -= deltaX / $view.zoom
        $view.y -= deltaY / $view.zoom

        panningPrevX = event.clientX
        panningPrevY = event.clientY
      }

      // If the user is right-clicking, place a tile
      if (isPlacing) {
        const { tileX, tileY } = mouseEventToTileCoords(event)
        $tilemap.setTile(tileX, tileY, $selectedTileType)
      }
    }}
    on:mouseleave={() => (isPanning = false)}
  />
  {#if $debugEnabled}
     <DebugInfoPanel {fps} />
  {/if}
  <SelectedTilePanel />
</section>
