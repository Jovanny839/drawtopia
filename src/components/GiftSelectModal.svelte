<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import purple_check from "../assets/purple-check.svg";
  import x from "../assets/x.svg";
  import child from "../assets/child.jpg";
  import togift from "../assets/togift.jpg";
  const dispatch = createEventDispatcher();

  let agreedToTerms = false;
  let selectedCard = ''; // 'story' or 'gift'

  const handleSelectStory = () => {
    selectedCard = 'story';
  };

  const handleSelectGift = () => {
    selectedCard = 'gift';
  };

  const handleChooseGiveAsGift = () => {
    if (!selectedCard) {
      alert('Please select an option first');
      return;
    }
    
    if (selectedCard === 'story') {
      dispatch('createStory');
    } else if (selectedCard === 'gift') {
      if (!agreedToTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
      dispatch('giveAsGift');
    }
  };

  const handleClose = () => {
    dispatch("close");
  };

  const toggleAgreement = () => {
    agreedToTerms = !agreedToTerms;
  };
</script>

<div class="information-helper-text">
  <div class="frame-1410103849">
    <div class="frame-1410103838">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <button class="x" on:click={handleClose} aria-label="Close modal">
        <img src={x} alt="x" class="x" />
      </button>
    </div>
    <div class="stroke"></div>
  </div>
  <div class="frame-1410103944">
    <div>
      <span id="gift-modal-title" class="whatwouldyouliketodo_span"
        >What would you like to do?</span
      >
    </div>
  </div>
  <div class="frame-1410104111">
    <div class="frame-1410104037">
      <div class="creating-a-gift-story-for-someone-special">
        <span class="creatingagiftstoryforsomeonespecial_span"
          >Creating a gift story for someone special?</span
        >
      </div>
      <div
        class="youll-set-the-occasion-and-pay-theyll-create-the-story-clear-explanation-of-two-phase-process"
      >
        <span
          class="youllsettheoccasionandpaytheyllcreatethestoryclearexplanationoftwo-phaseprocess_span"
          >You'll set the occasion and pay, they'll create the story. Clear
          explanation of two-phase process.</span
        >
      </div>
    </div>
    <div class="frame-1410104110">
      <button
        class="card"
        class:selected={selectedCard === 'story'}
        on:click={handleSelectStory}
        aria-label="Select Create a Story"
      >
        <img class="image" src={child} alt="" />
        <div class="frame-10">
          <div class="heading">
            <div class="create-a-story">
              <span class="createastory_span">Create a Story</span>
            </div>
            <div
              class="a-magical-forest-filled-with-talking-animals-and-hidden-treasures"
            >
              <span
                class="amagicalforestfilledwithtalkinganimalsandhiddentreasures_span"
                >A magical forest filled with talking animals and hidden
                treasures</span
              >
            </div>
          </div>
        </div>
        {#if selectedCard === 'story'}
          <img src={purple_check} alt="selected" class="selection-check" />
        {/if}
      </button>
      <button
        class="card_01"
        class:selected={selectedCard === 'gift'}
        on:click={handleSelectGift}
        aria-label="Select Give As Gift"
      >
        <div class="image_01">
          <img src={togift} alt="togift" />
        </div>
        <div class="frame-10_01">
          <div class="heading_01">
            <div class="give-as-gift">
              <span class="giveasgift_span">Give As Gift</span>
            </div>
            <div
              class="explore-distant-planets-and-meet-friendly-alien-creatures"
            >
              <span
                class="exploredistantplanetsandmeetfriendlyaliencreatures_span"
                >Explore distant planets and meet friendly alien creatures</span
              >
            </div>
          </div>
        </div>
        {#if selectedCard === 'gift'}
          <img src={purple_check} alt="selected" class="selection-check" />
        {/if}
      </button>
    </div>
    <button
      class="checkbox-label"
      on:click={toggleAgreement}
      aria-label="Toggle agreement to terms"
    >
      <div class="checkbox">
        <div class="square" class:checked={agreedToTerms}>
          {#if agreedToTerms}
            <div class="checkmark">✓</div>
          {/if}
        </div>
      </div>
      <div>
        <span class="iagreetermsofserviceandprivacypolicy_span_01"
          >I Agree
        </span><span class="iagreetermsofserviceandprivacypolicy_span_02"
          >Terms of Service</span
        ><span class="iagreetermsofserviceandprivacypolicy_span_03">
          and
        </span><span class="iagreetermsofserviceandprivacypolicy_span_04"
          >Privacy Policy</span
        >
      </div>
    </button>
  </div>
  <button class="button" on:click={handleChooseGiveAsGift} disabled={!selectedCard}>
    <div class="choose-give-as-gift">
      <span class="choosegiveasgift_span">
        {#if selectedCard === 'story'}
          Create Story
        {:else if selectedCard === 'gift'}
          Choose Give As Gift
        {:else}
          Please Select an Option
        {/if}
      </span>
    </div>
  </button>
</div>

<style>
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .whatwouldyouliketodo_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .creatingagiftstoryforsomeonespecial_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .creating-a-gift-story-for-someone-special {
    align-self: stretch;
  }

  .youllsettheoccasionandpaytheyllcreatethestoryclearexplanationoftwo-phaseprocess_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .youll-set-the-occasion-and-pay-theyll-create-the-story-clear-explanation-of-two-phase-process {
    align-self: stretch;
  }

.image {
  align-self: stretch;
  height: 280px;
  position: relative;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border: 1px #d3d3d3 solid;
  object-fit: cover;
  object-position: center;
}

  .createastory_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .create-a-story {
    align-self: stretch;
  }

  .amagicalforestfilledwithtalkinganimalsandhiddentreasures_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .a-magical-forest-filled-with-talking-animals-and-hidden-treasures {
    align-self: stretch;
  }

  .giveasgift_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .give-as-gift {
    align-self: stretch;
  }

  .exploredistantplanetsandmeetfriendlyaliencreatures_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .explore-distant-planets-and-meet-friendly-alien-creatures {
    align-self: stretch;
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

  .iagreetermsofserviceandprivacypolicy_span_01 {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .iagreetermsofserviceandprivacypolicy_span_02 {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    text-decoration: underline;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .iagreetermsofserviceandprivacypolicy_span_03 {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .iagreetermsofserviceandprivacypolicy_span_04 {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    text-decoration: underline;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .choosegiveasgift_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .choose-give-as-gift {
    text-align: center;
  }

  .frame-1410103944 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410104037 {
    align-self: stretch;
    padding: 12px;
    background: #f5f2ff;
    border-radius: 10px;
    outline: 1px #964dff solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .heading {
    align-self: stretch;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .heading_01 {
    align-self: stretch;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .button {
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
  }

  .selection-check {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
  }

  .checkbox {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-10_01 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103838 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

.image_01 {
  align-self: stretch;
  height: 280px;
  position: relative;
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border: 1px #d3d3d3 solid;
}

.image_01 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

  .checkbox-label {
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .card {
    width: 402px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410103849 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .card_01 {
    width: 402px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410104110 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104111 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    max-width: 870px;
    height: auto;
    min-height: 600px;
    padding: 24px;
    position: relative;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
    box-sizing: border-box;
  }

  .x {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.2s ease;
  }

  .x:hover {
    opacity: 0.7;
  }

  .card,
  .card_01 {
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .card:hover {
    outline: 1px #6912c5 solid;
    box-shadow: 0px 2px 8px rgba(105, 18, 197, 0.1);
    transform: translateY(-1px);
  }

  .card_01:hover {
    outline: 1px #6912c5 solid;
    box-shadow: 0px 2px 8px rgba(105, 18, 197, 0.1);
    transform: translateY(-1px);
  }

  .card.selected {
    outline: 2px #6912c5 solid;
    outline-offset: -2px;
    box-shadow: 0px 1px 8px rgba(105, 18, 197, 0.4);
    transform: translateY(-1px);
  }

  .card_01.selected {
    outline: 2px #6912c5 solid;
    outline-offset: -2px;
    box-shadow: 0px 1px 8px rgba(105, 18, 197, 0.4);
    transform: translateY(-1px);
  }

  .checkbox-label {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .square.checked {
    background: #438bff;
    border-color: #438bff;
  }

  .checkmark {
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button:not(:disabled) {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .button:not(:disabled):hover {
    background: #3a7ae4;
  }

   /* Responsive design for mobile */
   @media (max-width: 768px) {
     .information-helper-text {
       max-width: 95vw;
       min-height: auto;
       padding: 16px;
       gap: 16px;
       margin: 8px;
     }

     .frame-1410103838 {
       padding-left: 8px;
       padding-right: 8px;
     }

     .logo-text-full {
       width: 180px;
       height: 34px;
     }

     .whatwouldyouliketodo_span {
       font-size: 20px;
       line-height: 28px;
       text-align: center;
     }

     .frame-1410104037 {
       padding: 8px;
       gap: 2px;
     }

     .creatingagiftstoryforsomeonespecial_span {
       font-size: 14px;
       line-height: 19.6px;
       text-align: center;
     }

     .youllsettheoccasionandpaytheyllcreatethestoryclearexplanationoftwo-phaseprocess_span {
       font-size: 14px;
       line-height: 19.6px;
       text-align: center;
     }

     .frame-1410104110 {
       flex-direction: column;
       gap: 12px;
       width: 100%;
       align-items: center;
     }

     .card,
     .card_01 {
       width: 100%;
       max-width: 320px;
       padding-bottom: 8px;
     }
     
     .image,
     .image_01 {
       height: 160px;
     }
     
     .image_01 img {
       height: 160px;
     }

     .frame-10,
     .frame-10_01 {
       padding: 6px 8px 8px 8px;
       gap: 8px;
     }

     .heading,
     .heading_01 {
       padding: 4px 6px;
       gap: 4px;
     }

     .createastory_span,
     .giveasgift_span {
       font-size: 18px;
       line-height: 25.2px;
     }

     .amagicalforestfilledwithtalkinganimalsandhiddentreasures_span,
     .exploredistantplanetsandmeetfriendlyaliencreatures_span {
       font-size: 14px;
       line-height: 19.6px;
     }

     .selection-check {
       width: 28px;
       height: 28px;
       top: 8px;
       right: 8px;
     }

     .checkbox-label {
       gap: 6px;
       flex-wrap: wrap;
       justify-content: flex-start;
     }

     .iagreetermsofserviceandprivacypolicy_span_01,
     .iagreetermsofserviceandprivacypolicy_span_02,
     .iagreetermsofserviceandprivacypolicy_span_03,
     .iagreetermsofserviceandprivacypolicy_span_04 {
       font-size: 14px;
       line-height: 19.6px;
     }

     .button {
       width: 100%;
       max-width: 320px;
       padding: 14px 20px;
     }

     .choosegiveasgift_span {
       font-size: 16px;
       line-height: 22.4px;
     }

     /* Reduce hover effects on mobile for better touch experience */
     .card:hover,
     .card_01:hover {
       transform: none;
       box-shadow: none;
       outline: 1px #ededed solid;
     }

     /* Keep selection effects on mobile */
     .card.selected,
     .card_01.selected {
       transform: none;
       box-shadow: 0px 1px 6px rgba(105, 18, 197, 0.3);
     }
   }

   /* Extra small mobile devices */
   @media (max-width: 480px) {
     .information-helper-text {
       max-width: 98vw;
       padding: 12px;
       gap: 12px;
       margin: 4px;
     }

     .whatwouldyouliketodo_span {
       font-size: 18px;
       line-height: 25.2px;
     }

     .card,
     .card_01 {
       max-width: 280px;
     }

     .image,
     .image_01 {
       height: 140px;
     }
     
     .image_01 img {
       height: 140px;
     }

     .createastory_span,
     .giveasgift_span {
       font-size: 16px;
       line-height: 22.4px;
     }

     .amagicalforestfilledwithtalkinganimalsandhiddentreasures_span,
     .exploredistantplanetsandmeetfriendlyaliencreatures_span {
       font-size: 13px;
       line-height: 18.2px;
     }

     .selection-check {
       width: 24px;
       height: 24px;
       top: 6px;
       right: 6px;
     }

     .button {
       max-width: 280px;
       padding: 12px 16px;
     }

     .choosegiveasgift_span {
       font-size: 15px;
       line-height: 21px;
     }
   }
</style>
