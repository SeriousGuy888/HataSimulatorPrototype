<script lang="ts">
  import { Tilemap } from "$lib/Tilemap"
  import GameWorld from "../modules/GameWorld/GameWorld.svelte"

  const tilemap = new Tilemap(100, 75)
</script>

<GameWorld {tilemap} />
