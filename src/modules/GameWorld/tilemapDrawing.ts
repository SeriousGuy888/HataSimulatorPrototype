import type { Tilemap } from "$lib/Tilemap"
import type { Tile } from "$lib/types"
import { tileToWorld, worldToScreen } from "./cameraUtils"
import type { View } from "./canvasTypes"

export function drawTilemap(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  view: View,
  selectedCoords: { x: number; y: number } | null,
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
        const { worldX, worldY } = tileToWorld(view, x, y, sideLength, apothem)
        const { screenX, screenY } = worldToScreen(view, worldX, worldY)

        drawHex(ctx, view, hexPath, screenX, screenY, tile)
      }
    }
  }

  if (selectedCoords) {
    const { x, y } = selectedCoords
    outlineHex(ctx, view, hexPath, sideLength, apothem, x, y)
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

const tileTypeColors = {
  grass: "#1b1",
  water: "#02f",
  sand: "#ee8",
  rock: "#666",
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
  ctx.fillStyle = tileTypeColors[tile.type]
  ctx.fill(hexPath)

  // Draw hex coordinates on hexagon center
  // ctx.fillStyle = "#000000"
  // ctx.font = `${24 * view.zoom}px Consolas`
  // ctx.textAlign = "center"
  // ctx.textBaseline = "middle"
  // ctx.fillText(`${tile.x},${tile.y}`, 0, 0)

  // Restore context state
  ctx.restore()
}

function outlineHex(
  ctx: CanvasRenderingContext2D,
  view: View,
  hexPath: Path2D,
  sideLength: number,
  apothem: number,
  tileX: number,
  tileY: number
) {
  const { worldX, worldY } = tileToWorld(view, tileX, tileY, sideLength, apothem)
  const { screenX, screenY } = worldToScreen(view, worldX, worldY)

  // Save current context state to restore later
  ctx.save()
  // Translate to hexagon center
  ctx.translate(screenX, screenY)

  // Outline hexagon
  ctx.strokeStyle = "#fff"
  ctx.lineWidth = 5 * view.zoom
  ctx.stroke(hexPath)

  // Restore context state
  ctx.restore()
}
