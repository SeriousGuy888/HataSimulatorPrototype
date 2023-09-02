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
}
