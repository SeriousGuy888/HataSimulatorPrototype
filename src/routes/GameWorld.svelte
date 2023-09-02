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
    drawHex(ctx!, 50, 50)
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

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.stroke()

    // Fill hexagon
    ctx.fillStyle = "#07bb07"
    ctx.fill()
  }
</script>

<canvas bind:this={canvas} width="1280" height="720" />
