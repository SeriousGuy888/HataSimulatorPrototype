export interface Tile {
  type: TileType
  x: number
  y: number
  controlledBy: Player | null
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

export interface City {
  x: number
  y: number
  controlledBy: Player | null
  population: number
}

export interface Player {
  name: string
  colour: string
}