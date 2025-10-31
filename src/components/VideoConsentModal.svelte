<script>
  import shieldwarning from "../assets/ShieldWarning.svg";
  import x from "../assets/X.svg";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleSubmit() {
    dispatch('submit');
  }
</script>
<div class="information-helper-text">
  <div class="frame-1410103845">
    <div class="frame-1410103839">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <button class="x" aria-label="Close" on:click={handleClose}>
        <img src={x} alt="" />
      </button>
    </div>
    <div class="stroke"></div>
  </div>
  <div class="frame-1410103944">
      <img src={shieldwarning} alt="shieldwarning" />
    <div class="frame-1410104192">
      <div>
        <span class="videoconsentagreement_span">Video Consent Agreement</span>
      </div>
      <div
        class="by-submitting-your-reaction-video-you-agree-that-your-video-may-be-used-publicly-within-the-drawtopia-app-and-may-appear-in-promotional-materials-highlight-reels-or-future-media-releases"
      >
        <span
          class="bysubmittingyourreactionvideoyouagreethatyourvideomaybeusedpubliclywithinthedrawtopiaappandmayappearinpromotionalmaterialshighlightreelsorfuturemediareleases_span"
          >By submitting your reaction video, you agree that your video may be
          used publicly within the Drawtopia app, and may appear in promotional
          materials, highlight reels, or future media releases.</span
        >
      </div>
    </div>
    <div class="checkbox-label">
      <div class="checkbox">
        <div class="square"></div>
      </div>
      <div>
        <span class="iagreetothetermsabove_span">
          I agree to the terms above</span
        >
      </div>
    </div>
  </div>
  <button class="button" on:click={handleSubmit}>
    <div class="submit-reaction">
      <span class="submitreaction_span">Submit Reaction</span>
    </div>
  </button>
</div>

<style>
  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .videoconsentagreement_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .bysubmittingyourreactionvideoyouagreethatyourvideomaybeusedpubliclywithinthedrawtopiaappandmayappearinpromotionalmaterialshighlightreelsorfuturemediareleases_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .by-submitting-your-reaction-video-you-agree-that-your-video-may-be-used-publicly-within-the-drawtopia-app-and-may-appear-in-promotional-materials-highlight-reels-or-future-media-releases {
    align-self: stretch;
    text-align: center;
  }

  .square {
    width: 20px;
    height: 20px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 6px;
    border: 1px #dfe1e7 solid;
  }

  .iagreetothetermsabove_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .submitreaction_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .submit-reaction {
    text-align: center;
  }

  .frame-1410104192 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .button {
    align-self: stretch;
    height: 57px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .x {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .checkbox {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .checkbox-label {
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103944 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    height: 100%;
    padding: 16px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #fdfdfd;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
</style>
