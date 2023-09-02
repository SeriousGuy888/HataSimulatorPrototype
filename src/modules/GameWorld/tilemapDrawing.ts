import type { Tilemap } from "$lib/Tilemap"
import type { Tile } from "$lib/types"
import type { View } from "./canvasTypes"

export function drawTilemap(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  view: View,
  tilemap: Tilemap,
  sideLength: number,
  apothem: number
) {
  const xGap = (sideLength / view.zoom) * 1.5
  const yGap = (apothem / view.zoom) * 2

  // Optimisation: get the range of tiles that are visible on screen
  // (Not perfect due to yOffset for even columns, but good enough for now)
  const leftmostX = Math.floor((view.x - sideLength) / xGap)
  const rightmostX = Math.ceil((view.x + sideLength + canvas.width / view.zoom) / xGap)
  const topmostY = Math.floor((view.y - apothem) / yGap)
  const bottommostY = Math.ceil((view.y + apothem + canvas.height / view.zoom) / yGap)

  // Optimisation: create the hexagon path only once
  const hexPath = getHexPath(sideLength, apothem)

  // Loop through only the coords of tiles that are visible and draw the tiles
  for (let x = leftmostX; x < rightmostX; x++) {
    for (let y = topmostY; y < bottommostY; y++) {
      const tile = tilemap.getTile(x, y)
      if (tile) {
        const yOffset = x % 2 === 1 ? 0 : apothem / view.zoom

        // Calculate the center of the hexagon in world coordinates
        const worldX = x * xGap + sideLength
        const worldY = y * yGap + apothem + yOffset

        // Apply zoom and view offset
        const screenX = (worldX - view.x) * view.zoom
        const screenY = (worldY - view.y) * view.zoom

        drawHex(ctx, view, hexPath, screenX, screenY, tile)
      }
    }
  }
}

function getHexPath(sideLength: number, apothem: number) {
  const hexPath = new Path2D()

  // Draw hexagon, starting from top left vertex, moving clockwise
  hexPath.moveTo(-sideLength / 2, -apothem)
  hexPath.lineTo(+sideLength / 2, -apothem)
  hexPath.lineTo(+sideLength, 0)
  hexPath.lineTo(+sideLength / 2, +apothem)
  hexPath.lineTo(-sideLength / 2, +apothem)
  hexPath.lineTo(-sideLength, 0)
  hexPath.closePath()

  return hexPath
}

function drawHex(
  ctx: CanvasRenderingContext2D,
  view: View,
  hexPath: Path2D,
  centerX: number,
  centerY: number,
  tile: Tile
) {
  // Save current context state to restore later
  ctx.save()

  // Translate to hexagon center
  ctx.translate(centerX, centerY)

  // Fill hexagon
  ctx.fillStyle = "#07bb07"
  ctx.fill(hexPath)

  // Outline hexagon
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1
  ctx.stroke(hexPath)

  // Draw hex coordinates on hexagon center
  ctx.fillStyle = "#000000"
  ctx.font = `${24 * view.zoom}px Consolas`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(`${tile.x},${tile.y}`, 0, 0)

  // Restore context state
  ctx.restore()
}
