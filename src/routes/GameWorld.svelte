<script lang="ts">
  import type { Tilemap } from "$lib/Tilemap"
  import { onMount } from "svelte"

  export let tilemap: Tilemap

  const hexSideLength = 50
  const apothem = (Math.sqrt(3) * hexSideLength) / 2
  // const hexWidth = 2 * apothem

  let canvas: HTMLCanvasElement

  onMount(() => {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    requestAnimationFrame(gameLoop)

    // let lastTime = 0
    function gameLoop(time: number) {
      // const deltaTime = time - lastTime
      // lastTime = time
      // const fps = 1000 / deltaTime
      // console.log("FPS: " + fps)

      update(ctx!)

      requestAnimationFrame(gameLoop)
    }
  })

  function update(ctx: CanvasRenderingContext2D) {
    // Redraw background
    ctx.fillStyle = "#eee"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawTilemap(ctx!)

    // drawHex(ctx!, 50, 50)
  }

  function drawTilemap(ctx: CanvasRenderingContext2D) {
    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        const tile = tilemap.getTile(x, y)
        if (tile) {
          let yOffset = 0
          if(x % 2 === 1) {
            yOffset = apothem
          }

          const pixelX = x * (hexSideLength * 1.5) + hexSideLength
          const pixelY = y * (apothem * 2) + apothem + yOffset
          drawHex(ctx, pixelX, pixelY)
        }
      }
    }
  }

  function drawHex(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
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
  }
</script>

<canvas bind:this={canvas} width="1280" height="720" />
