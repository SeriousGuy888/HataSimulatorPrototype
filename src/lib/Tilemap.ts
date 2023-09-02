import { tileTypes, type Tile } from "./types"

export class Tilemap {
  tiles: Map<string, Tile>

  constructor(public width: number, public height: number) {
    this.tiles = new Map()
    this.populateTiles()
  }

  private populateTiles() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.tiles.set(`${x},${y}`, {
          type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
          x,
          y,
        })
      }
    }
  }

  getTile(x: number, y: number): Tile | null {
    return this.tiles.get(`${x},${y}`) ?? null
  }

  setTile(x: number, y: number, tile: Tile) {
    // Don't allow setting tiles outside the map
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return
    }

    this.tiles.set(`${x},${y}`, tile)
  }

  serialise(): string {
    const tileIds: string[] = []
    tileTypes.forEach((type, index) => {
      tileIds[index] = type
    })

    const tilesInOrder: (Tile | null)[] = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        tilesInOrder.push(this.getTile(x, y))
      }
    }

    return JSON.stringify({
      width: this.width,
      height: this.height,
      tileIds,
      tiles: tilesInOrder.map((tile) => tileTypes.findIndex((e) => e === tile?.type)), // Convert tile types to ids
    })
  }

  static deserialise(serialised: string): Tilemap {
    try {
      const { width, height, tileIds, tiles } = JSON.parse(serialised)

      const tilemap = new Tilemap(width, height)

      tiles.forEach((tileId: number, index: number) => {
        const x = index % width
        const y = Math.floor(index / width)

        tilemap.setTile(x, y, {
          type: tileIds[tileId],
          x,
          y,
        })
      })

      return tilemap
    } catch (e) {
      throw new Error("Invalid tilemap.\n" + e)
    }
  }
}
