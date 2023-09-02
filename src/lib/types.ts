import type { Tilemap } from "./Tilemap"

export interface World {
  name: string
  tilemap: Tilemap
}

export interface Tile {
  type: TileType
  x: number
  y: number
}

export const tileTypes = [
  "deep_water",
  "shallow_water",
  "sand",
  "grass",
  "forest",
  "mountain",
  "snow",
  "ice",
] as const
export type TileType = (typeof tileTypes)[number]

export interface Character {
  name: string
  avatar: string
}
