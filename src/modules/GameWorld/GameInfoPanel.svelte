<script>
  import { currPlayerTurn, currTurnCycle, players } from "$lib/gameState"

  function endTurn() {
    $currPlayerTurn = ($currPlayerTurn + 1) % $players.length
    
    if ($currPlayerTurn === 0) {
      $currTurnCycle++
    }
  }
</script>

<div id="panel" class="absolute p-4 top-0 inset-x-0 flex justify-between bg-orange-800">
  <section id="info-displays">
    <div>
      {$players[$currPlayerTurn].name}
    </div>
    <div>
      Turn <span class="font-bold">{$currTurnCycle}</span>
    </div>
  </section>
  <section id="buttons">
    <button class="bg-blue-700 hover:bg-blue-800 text-white rounded py-1 px-3" on:click={endTurn}
      >End Turn</button
    >
  </section>
</div>

<style lang="postcss">
  #panel {
    box-shadow: 0 0 10px 0 #0008;
  }

  #buttons,
  #info-displays {
    @apply flex flex-row gap-4;
  }

  #info-displays > div {
    @apply py-1 px-3 bg-white text-black rounded;
  }
</style>
