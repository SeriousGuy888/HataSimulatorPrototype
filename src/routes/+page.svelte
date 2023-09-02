<script lang="ts">
  import { Tilemap } from "$lib/Tilemap"
  import GameWorld from "./GameWorld.svelte"

  const tilemap = new Tilemap(100, 75)
</script>

<GameWorld {tilemap} />
