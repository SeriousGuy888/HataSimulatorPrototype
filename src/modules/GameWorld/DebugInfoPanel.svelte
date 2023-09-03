<script lang="ts">
  import { players, selectedCoords, selectedTileType, tilemap, view } from "$lib/gameState"
  import { tileTypes } from "$lib/types"

  export let fps: number
</script>

<aside
  class="absolute left-4 top-4 p-2 rounded bg-black text-white bg-opacity-50 hover:bg-opacity-90 transition-colors font-mono grid gap-2"
>
  <p>FPS: {Math.round(fps)}</p>
  <section>
    <p>Zoom: {$view.zoom.toFixed(4)}</p>
    <p>X: {$view.x.toFixed(2)}</p>
    <p>Y: {$view.y.toFixed(2)}</p>
  </section>
  <section>
    <p>
      Selected tile: {$selectedCoords?.x ?? "_"},{$selectedCoords?.y ?? "_"}
    </p>
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
      on:click={() => {
        if ($selectedCoords) {
          $tilemap.placeCity(
            $selectedCoords.x,
            $selectedCoords.y,
            $players[Math.round(Math.random() * ($players.length - 1))]
          )
        }
      }}>Place City</button
    >
  </section>
  <hr class="my-4" />
  <section class="grid gap-2">
    <div class="flex flex-row gap-2">
      <button
        on:click={() => {
          const ser = $tilemap.serialise()
          navigator.clipboard.writeText(ser)
          alert("Copied to clipboard")
        }}
        class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
      >
        Serialise
      </button>
      <button
        on:click={() => {
          const ser = prompt("Paste serialised tilemap", "")
          if (ser) {
            try {
              $tilemap.deserialise(ser)
            } catch (e) {
              alert("Invalid serialised tilemap: " + e)
            }
          }
        }}
        class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1">Load</button
      >
    </div>
    <ul class="columns-2">
      {#each tileTypes as type}
        <li>
          <button
            class={$selectedTileType === type ? "underline" : ""}
            on:click={() => selectedTileType.set(type)}
          >
            {type}
          </button>
        </li>
      {/each}
    </ul>
  </section>
</aside>
