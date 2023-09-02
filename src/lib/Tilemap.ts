import { island as islandMapPreset } from "../modules/GameWorld/worldPresets"
import { tileTypes, type Tile, type TileType } from "./types"

export class Tilemap {
  tiles: Map<string, Tile>

  constructor(public width: number, public height: number) {
    this.tiles = new Map()
    this.loadDefaultMap()
  }

  private loadDefaultMap() {
    this.deserialise(JSON.stringify(islandMapPreset))
  }

  getTile(x: number, y: number): Tile | null {
    return this.tiles.get(`${x},${y}`) ?? null
  }

  setTile(x: number, y: number, type: TileType) {
    // Don't allow setting tiles outside the map
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return
    }

    this.tiles.set(`${x},${y}`, {
      type,
      x,
      y,
    })
  }

  getAdjacentTiles(x: number, y: number): Tile[] {
    const tiles: Tile[] = []

    const tile = this.getTile(x, y)
    if (tile) {
      const { x, y } = tile

      const adjacentCoords = [
        { x, y: y - 1 },
        { x, y: y + 1 },
        { x: x - 1, y },
        { x: x + 1, y },
      ]

      if (x % 2 === 1) {
        adjacentCoords.push({ x: x - 1, y: y - 1 }, { x: x + 1, y: y - 1 })
      } else {
        adjacentCoords.push({ x: x - 1, y: y + 1 }, { x: x + 1, y: y + 1 })
      }

      adjacentCoords.forEach((coord) => {
        const tile = this.getTile(coord.x, coord.y)
        if (tile) {
          tiles.push(tile)
        }
      })
    }

    return tiles
  }

  floodFill(x: number, y: number, newType: TileType) {
    const currTile = this.getTile(x, y)
    if (!currTile) {
      return
    }

    const toChange = new Set([`${x},${y}`])
    const stack = [{ x, y }]

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const neighbours = this.getAdjacentTiles(x, y)

      neighbours.forEach((neighbour) => {
        if (neighbour.type === currTile.type && !toChange.has(`${neighbour.x},${neighbour.y}`)) {
          toChange.add(`${neighbour.x},${neighbour.y}`)
          stack.push({ x: neighbour.x, y: neighbour.y })
        }
      })
    }

    toChange.forEach((coords) => {
      const [x, y] = coords.split(",").map((e) => parseInt(e))
      this.setTile(x, y, newType)
    })
  }

  serialise(): string {
    const tileIds: string[] = []
    tileTypes.forEach((type, index) => {
      tileIds[index] = type
    })

    const tilesInOrder: (Tile | null)[][] = []
    for (let y = 0; y < this.height; y++) {
      tilesInOrder.push([])
      for (let x = 0; x < this.width; x++) {
        tilesInOrder[y].push(this.getTile(x, y))
      }
    }

    const tileId2dArray: number[][] = tilesInOrder.map((row) =>
      row.map((tile) => tileTypes.findIndex((e) => e === tile?.type))
    )

    return JSON.stringify({
      width: this.width,
      height: this.height,
      tileIds,
      tiles: tileId2dArray, // Convert tile types to ids
    })
  }

  deserialise(serialised: string) {
    try {
      const { width, height, tileIds, tiles } = JSON.parse(serialised)

      this.width = width
      this.height = height

      this.tiles.clear()

      tiles.forEach((row: number[], y: number) => {
        row.forEach((tileId: number, index: number) => {
          const x = index
          this.setTile(x, y, tileIds[tileId])
        })
      })
    } catch (e) {
      throw new Error("Invalid tilemap.\n" + e)
    }
  }
}
