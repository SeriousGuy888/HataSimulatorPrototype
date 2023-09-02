import type { View } from "./canvasTypes"

export function screenToWorld(view: View, screenX: number, screenY: number) {
  const worldX = screenX / view.zoom + view.x
  const worldY = screenY / view.zoom + view.y
  return { worldX, worldY }
}

export function worldToScreen(view: View, worldX: number, worldY: number) {
  const screenX = (worldX - view.x) * view.zoom
  const screenY = (worldY - view.y) * view.zoom
  return { screenX, screenY }
}

export function tileToWorld(
  view: View,
  tileX: number,
  tileY: number,
  sideLength: number,
  apothem: number
) {
  const xGap = (sideLength / view.zoom) * 1.5
  const yGap = (apothem / view.zoom) * 2

  const yOffset = tileX % 2 === 1 ? 0 : apothem / view.zoom

  // Calculate the center of the hexagon in world coordinates
  const worldX = tileX * xGap + sideLength
  const worldY = tileY * yGap + apothem + yOffset

  return { worldX, worldY }
}

export function worldToTile(
  view: View,
  worldX: number,
  worldY: number,
  sideLength: number,
  apothem: number
) {
  const xGap = (sideLength / view.zoom) * 1.5
  const yGap = (apothem / view.zoom) * 2

  const tileX = Math.round((worldX - sideLength) / xGap)
  const yOffset = tileX % 2 === 1 ? 0 : apothem / view.zoom

  const tileY = Math.round((worldY - apothem - yOffset) / yGap)

  return { tileX, tileY }
}

