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

export type TileType = "grass" | "water" | "sand" | "rock"

export interface Character {
  name: string
  avatar: string
}
