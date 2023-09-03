import { readable, writable } from "svelte/store"
import type { Player } from "./types"
import { Tilemap } from "./Tilemap"
import type { View } from "../modules/GameWorld/canvasTypes"

export const players = writable<Player[]>([
  { name: "Player 1", color: "#ff0000" },
  { name: "Player 2", color: "#00ff00" },
  { name: "Player 3", color: "#0000ff" },
  { name: "Player 4", color: "#ffff00" },
  { name: "Player 5", color: "#ff00ff" },
  { name: "Player 6", color: "#00ffff" },
])
export const playingAs = writable<number>(0)

export const selectedCoords = writable<{ x: number; y: number } | null>(null)

export const tilemap = readable<Tilemap>(new Tilemap())

export const zoomStep = 1.125
export const maxZoom = zoomStep ** 8
export const minZoom = zoomStep ** -8
export const view = writable<View>({
  x: -128,
  y: -128,
  zoom: minZoom,
})
