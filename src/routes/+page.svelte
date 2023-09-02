<script lang="ts">
  import { Tilemap } from "$lib/Tilemap"
  import GameWorld from "./GameWorld.svelte"

  const tilemap = new Tilemap(10, 10)
</script>

<GameWorld {tilemap} />
