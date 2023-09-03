import { derived, readable, writable } from "svelte/store"
import { tileTypes, type Player, type TileType } from "./types"
import { Tilemap } from "./Tilemap"
import type { View } from "../modules/GameWorld/canvasTypes"

export const players = writable<Player[]>([
  { name: "Player 1", colour: "#ff0000" },
  { name: "Player 2", colour: "#00ff00" },
  { name: "Player 3", colour: "#0000ff" },
  { name: "Player 4", colour: "#ffff00" },
  { name: "Player 5", colour: "#ff00ff" },
  { name: "Player 6", colour: "#00ffff" },
])
export const playingAs = writable<number>(0)

export const tilemap = readable<Tilemap>(new Tilemap())

export const selectedCoords = writable<{ x: number; y: number } | null>(null)
export const selectedTile = derived([selectedCoords, tilemap], ([$selectedCoords, $tilemap]) =>
  $tilemap.getTile($selectedCoords?.x ?? 0, $selectedCoords?.y ?? 0)
)
export const selectedCity = derived([selectedCoords, tilemap], ([$selectedCoords, $tilemap]) =>
  $tilemap.getCity($selectedCoords?.x ?? 0, $selectedCoords?.y ?? 0)
)

export const zoomStep = 1.125
export const maxZoom = zoomStep ** 8
export const minZoom = zoomStep ** -8
export const view = writable<View>({
  x: -128,
  y: -128,
  zoom: minZoom,
})

export const selectedTileType = writable<TileType>(tileTypes[0])
