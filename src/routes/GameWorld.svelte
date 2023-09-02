<script lang="ts">
  import { browser } from "$app/environment"
  import type { Tilemap } from "$lib/Tilemap"
  import type { Tile } from "$lib/types"
  import { onMount } from "svelte"

  export let tilemap: Tilemap

  const hexSideLength = 50
  const apothem = (Math.sqrt(3) * hexSideLength) / 2
  // const hexWidth = 2 * apothem

  let canvas: HTMLCanvasElement

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
      const fps = 1000 / deltaTime

      redraw(ctx!)
      redrawDebug(ctx!, fps)

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

    drawTilemap(ctx!)

    // drawHex(ctx!, 50, 50)
  }

  function redrawDebug(ctx: CanvasRenderingContext2D, fps: number) {
    ctx.fillStyle = "#000000"
    ctx.font = "16px Consolas"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"

    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 10)
  }

  function drawTilemap(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        const tile = tilemap.getTile(x, y)
        if (tile) {
          const yOffset = x % 2 === 1 ? 0 : apothem

          const pixelX = x * (hexSideLength * 1.5) + hexSideLength
          const pixelY = y * (apothem * 2) + apothem + yOffset
          drawHex(ctx, pixelX, pixelY, tile)
        }
      }
    }
  }

  function drawHex(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, tile: Tile) {
    // Draw hexagon, starting from top left vertex, moving clockwise
    ctx.beginPath()
    ctx.moveTo(centerX - hexSideLength / 2, centerY - apothem)
    ctx.lineTo(centerX + hexSideLength / 2, centerY - apothem)
    ctx.lineTo(centerX + hexSideLength, centerY)
    ctx.lineTo(centerX + hexSideLength / 2, centerY + apothem)
    ctx.lineTo(centerX - hexSideLength / 2, centerY + apothem)
    ctx.lineTo(centerX - hexSideLength, centerY)
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
    ctx.font = "24px Consolas"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${tile.x},${tile.y}`, centerX, centerY)
  }
</script>

<canvas bind:this={canvas} />
