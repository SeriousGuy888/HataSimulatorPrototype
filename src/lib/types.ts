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

export const tileTypes = ["grass", "water", "sand", "rock"] as const
export type TileType = typeof tileTypes[number]

export interface Character {
  name: string
  avatar: string
}
