<script lang="ts">
  import type { Character } from "$lib/types"

  export let character: Character
  const { name, avatar } = character
</script>

<article id="card-border" class="rounded-lg max-w-sm">
  <div id="card-inner">
    <figure>
      <figcaption>
        <h2 class="text-xl tracking-wide">
          {name}
        </h2>
      </figcaption>
      <img src={`/characters/${avatar}.png`} alt="" />
    </figure>
  </div>
</article>

<style>
  #card-border {
    background-color: #6ad2ad;
    box-sizing: border-box;
    aspect-ratio: 5 / 7;
    padding: 1rem;
  }

  #card-inner {
    background-color: #fff;
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    border-radius: 1rem;
    overflow: clip;
  }

  figure {
    display: grid;
    place-items: center;
    position: relative;

    background-color: #0001;

    padding: 1rem;
    min-height: 50%;
    flex: 0 0 auto;
  }

  figure img {
    height: 100%;
    width: auto;
    /* margin-top: 2rem; */
  }

  figure figcaption {
    --nameplate-bg: #88f8;

    position: absolute;
    top: 0;
    left: 0;
    padding: 0.5rem;
    padding-left: 1rem;
    background-color: var(--nameplate-bg);

    font-weight: bold;
  }

  figure figcaption::after {
    content: "";

    position: absolute;
    top: 0;
    left: 100%;
    height: 100%;

    aspect-ratio: 1;
    padding: 0;

    height: 100%;
    aspect-ratio: square;

    border-bottom: 1.4rem solid transparent;
    border-right: 1.4rem solid transparent;
    border-left: 1.4rem solid var(--nameplate-bg);
    border-top: 1.4rem solid var(--nameplate-bg);
  }
</style>
