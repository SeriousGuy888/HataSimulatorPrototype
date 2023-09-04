<script>

  import { currPlayerTurn, currTurnCycle, players } from "$lib/gameState"

</script>
<div id="panel" class="absolute p-4 top-0 inset-x-0  flex flex-row gap-4 bg-orange-800 text-white">
  <section>
    {$players[$currPlayerTurn].name}
  </section>
  <section>
    Turn <span class="font-bold">{$currTurnCycle}</span>
  </section>
</div>

<style lang="postcss">
  #panel {
    box-shadow: 0 0 10px 0 #0008;
  }

  #panel > section {
    @apply py-1 px-3 bg-white text-black rounded
  }
</style>