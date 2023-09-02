<script lang="ts">
  import { Tilemap } from "$lib/Tilemap"
  import GameWorld from "./GameWorld.svelte"

  const tilemap = new Tilemap(50, 20)
</script>

<GameWorld {tilemap} />
