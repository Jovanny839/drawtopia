<script lang="ts">
  import pencilsimple from "../assets/PencilSimple.svg";
  import trashsimple from "../assets/TrashSimple.svg";
  export let name: string = "";
  export let avatarUrl: string = "https://placehold.co/40x40";
  export let onEdit: (() => void) | undefined = undefined;
  export let onDelete: (() => void) | undefined = undefined;
</script>

<div class="frame-1410103935">
  <div class="frame-1410103850">
    <img class="ellipse" src={avatarUrl} alt={`${name}'s avatar`} />
    <div class="form">
      <div><span class="name_span">{name}</span></div>
    </div>
    <div class="frame-1410103982">
      <div class="frame-1410103980">
        <button class="pencilsimple" on:click={onEdit} aria-label="Edit {name}'s profile">
          <img class="vector_01" src={pencilsimple} alt="Edit {name}'s profile" />
        </button>
      </div>
      <div class="frame-1410103981">
        <button class="trashsimple" on:click={onDelete} aria-label="Delete {name}'s profile">
          <img class="vector_02" src={trashsimple} alt="Delete {name}'s profile" />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .ellipse {
    width: 40px;
    height: 40px;
    background: #727272;
    border-radius: 9999px;
  }

  .name_span {
    color: #141414;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .vector_01 {
    width: 20px;
    height: 20px;
  }

  .vector_02 {
    width: 20px;
    height: 20px;
  }

  .form {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .pencilsimple {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .trashsimple {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .frame-1410103980 {
    width: 40px;
    height: 40px;
    padding: 6px;
    background: white;
    border-radius: 999999px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103981 {
    width: 40px;
    height: 40px;
    padding: 6px;
    background: white;
    border-radius: 999999px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103982 {
    justify-content: flex-start;
    align-items: center;
    gap: 6px;
    display: flex;
  }

  .frame-1410103850 {
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103935 {
    padding: 8px;
    background: #F8FAFB;
    border-radius: 999px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .pencilsimple:hover,
  .trashsimple:hover {
    opacity: 0.7;
  }

  .frame-1410103980:hover,
  .frame-1410103981:hover {
    background: #f0f0f0;
  }
</style>
