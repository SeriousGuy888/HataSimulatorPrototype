<script>
  import { currPlayerTurn, players, selectedCity, selectedCoords, selectedTile, tilemap } from "$lib/gameState"
</script>

<div
  id="panel"
  class="absolute inset-x-4 bottom-0 max-w-lg p-4 rounded-t-lg bg-black text-white transition-colors grid gap-4"
  class:active={$selectedCoords !== null}
>
  <h2 class="text-lg font-bold font-mono">
    {$selectedCoords?.x ?? "_"},{$selectedCoords?.y ?? "_"}
  </h2>
  <p>
    Type: <strong>{$selectedTile?.type?.toUpperCase() ?? "_"}</strong>
  </p>
  {#if $selectedCity}
    <section class="grid">
      <p>Controlled by: <strong>{$selectedCity.controlledBy?.name}</strong></p>
      <p>Population: <strong>{$selectedCity.population}</strong></p>
    </section>
  {:else}
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
      on:click={() => {
        if ($selectedCoords) {
          $tilemap.placeCity(
            $selectedCoords.x,
            $selectedCoords.y,
            $players[$currPlayerTurn]
          )

          // Update selectedCoords to trigger a re-render (to update the panel)
          selectedCoords.set($selectedCoords)
        }
      }}>Place City</button
    >
  {/if}
</div>

<style>
  #panel {
    transform: translateY(100%);
    transition: transform 0.2s ease-in-out;

    border: 2px solid white;
    border-bottom: none;
  }

  #panel.active {
    transform: translateY(0);
  }
</style>
