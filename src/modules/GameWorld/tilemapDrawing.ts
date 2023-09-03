import type { Tilemap } from "$lib/Tilemap"
import type { Tile, TileType } from "$lib/types"
import { tileToWorld, worldToScreen } from "./cameraUtils"
import type { View } from "./canvasTypes"

let cityImage: CanvasImageSource | null = null

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

  // Optimisation: create the paths only once
  const hexPath = getHexPath(sideLength, apothem)
  const circlePath = getCirclePath(apothem * 0.75)

  // Loop through only the coords of tiles that are visible and draw the tiles
  for (let x = leftmostX; x < rightmostX; x++) {
    for (let y = topmostY; y < bottommostY; y++) {
      const tile = tilemap.getTile(x, y)
      if (tile) {
        const { worldX, worldY } = tileToWorld(view, x, y, sideLength, apothem)
        const { screenX, screenY } = worldToScreen(view, worldX, worldY)

        drawHex(ctx, view, hexPath, circlePath, screenX, screenY, tile)
      }
    }
  }

  if (selectedCoords) {
    const { x, y } = selectedCoords
    outlineHex(ctx, view, hexPath, sideLength, apothem, x, y)
  }

  if (!cityImage) {
    cityImage = new Image()
    cityImage.src = "/structures/city.png"
  }

  tilemap.cities.forEach((city) => {
    const { worldX, worldY } = tileToWorld(view, city.x, city.y, sideLength, apothem)
    const { screenX, screenY } = worldToScreen(view, worldX, worldY)

    drawCity(ctx, view, screenX, screenY, cityImage!)
  })
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

function getCirclePath(radius: number) {
  const circlePath = new Path2D()
  circlePath.arc(0, 0, radius, 0, 2 * Math.PI)
  return circlePath
}

const tileTypeColors: { [key in TileType]: string } = {
  deep_water: "#02f",
  shallow_water: "#05f",
  grass: "#0b0",
  forest: "#080",
  sand: "#ee8",
  mountain: "#666",
  snow: "#eee",
  ice: "#2ef",
}

function drawHex(
  ctx: CanvasRenderingContext2D,
  view: View,
  hexPath: Path2D,
  circlePath: Path2D,
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


  if (tile.controlledBy) {
    const colour = tile.controlledBy.colour
    ctx.fillStyle = colour
    ctx.fill(circlePath)
  }


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

function drawCity(
  ctx: CanvasRenderingContext2D,
  view: View,
  centerX: number,
  centerY: number,
  cityImage: CanvasImageSource
) {
  // Save current context state to restore later
  ctx.save()

  // Translate to hexagon center
  ctx.translate(centerX, centerY)

  // Load and draw city image
  ctx.drawImage(cityImage, -32 * view.zoom, -32 * view.zoom, 64 * view.zoom, 64 * view.zoom)

  // Restore context state
  ctx.restore()
}
