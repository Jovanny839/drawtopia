<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import FormatCard from "../../../components/FormatCard.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { storyCreation } from "../../../lib/stores/storyCreation";
  
  // Import icons for format features
  import targetIcon from "../../../assets/Inter-Target.svg";
  import magnifyingIcon from "../../../assets/Inter-Binoculars.svg";
  import personIcon from "../../../assets/Inter-User.svg";
  import playIcon from "../../../assets/Inter-PlayCircle.svg";
  import bookIcon from "../../../assets/Inter-BookOpenText.svg";
  import headphoneIcon from "../../../assets/Inter-Headphones.svg";
  import storyAdventure from "../../../assets/story_adventure.png";
  import storyAdventureEg from "../../../assets/inter_story_eg.png";
  import interactiveSearch from "../../../assets/interactive_search.png";
  import interactiveSearchEg from "../../../assets/inter_search_eg.png";
  import xIcon from "../../../assets/X.svg";
  import whiteCheck from "../../../assets/WhiteCheck.svg";

  let isMobile = false;
  let selectedFormat = ""; // "interactive" or "story"
  let characterName = "";
  let showPreviewModal = false;
  let selectedPreviewCard = ""; // "interactive" or "story" for preview modal

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }

  onMount(() => {
    if (browser) {
      // Get character name from sessionStorage
      characterName = sessionStorage.getItem('characterName') || "";
      // Get previously selected format if any
      selectedFormat = sessionStorage.getItem('selectedFormat') || "";
    }
  });

  function selectFormat(formatId: string) {
    selectedFormat = formatId;
    
    // Save selected format to sessionStorage
    if (browser) {
      sessionStorage.setItem('selectedFormat', formatId);
      storyCreation.setSelectedFormat(formatId as 'interactive' | 'story');
    }
  }

  const handleContinue = () => {
    if (!selectedFormat) {
      alert('Please select an adventure format');
      return;
    }
    
    // Navigate to the appropriate next step based on format
    if (selectedFormat === "interactive") {
      // For Interactive Search Adventure, go to intersearch flow
      goto("/intersearch");
    } else {
      // For Story Adventure, continue to story world selection
      goto("/create-character/5");
    }
  };

  const handleBack = () => {
    goto("/create-character/2");
  };

  const handlePreviewBoth = () => {
    showPreviewModal = true;
    // Initialize selected preview card based on current selected format
    selectedPreviewCard = selectedFormat || "";
  };

  const handleCloseModal = () => {
    showPreviewModal = false;
  };

  const handleModalBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleTryStoryAdventure = () => {
    selectFormat("story");
    handleCloseModal();
  };

  const handlePreviewCardClick = (formatId: string) => {
    selectedPreviewCard = formatId;
    selectFormat(formatId);
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/create-character/2" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span"
          >Choose Your Book Adventure Style</span
        >
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Two magical ways to bring {characterName || 'your character'} to life!</span
        >
      </div>
      <div class="tag">
        <div class="shieldstar">
          <img src={shieldStar} alt="star" />
        </div>
        <div>
          <span class="ffreepagepreview_span">2 Free Page Preview</span>
        </div>
      </div>
    </div>
    <MobileStepProgressBar currentStep={3} />
    <ProgressBar currentStep={3} />
    <div class="frame-1410104027">
      <div class="star-container">
        <StarEmoticon />
      </div>
      <div class="message-container">
        <div class="polygon-1"></div>
        <div class="message-content">
          <div
            class="lets-bring-your-character-to-life-upload-a-drawing-or-photo"
          >
            <span class="letsbringyourcharactertolifeuploadadrawingorphoto_span"
              >Where should {characterName || 'your character'} go on their adventure?</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="format-cards-container">
      <FormatCard
        formatId="interactive"
        title="Interactive Search Adventure"
        features={[
          { icon: targetIcon, text: "8 Details Scene" },
          { icon: magnifyingIcon, text: "Find the character" },
          { icon: personIcon, text: "Ages 3-12" },
          { icon: playIcon, text: "15-25 min play" }
        ]}
        imageSrc={interactiveSearch}
        imageAlt="Interactive Search Adventure"
        isSelected={selectedFormat === "interactive"}
        onSelect={selectFormat}
      />
      <FormatCard
        formatId="story"
        title="Story Adventure"
        features={[
          { icon: targetIcon, text: "5 Pages Story" },
          { icon: headphoneIcon, text: "Read & Listen" },
          { icon: personIcon, text: "Ages 3-12" },
          { icon: bookIcon, text: "5-10 min read" }
        ]}
        imageSrc={storyAdventure}
        imageAlt="Story Adventure"
        isSelected={selectedFormat === "story"}
        onSelect={selectFormat}
      />
    </div>

    <div
      style="display: flex; justify-content: {isMobile
        ? 'center'
        : 'space-between'}; width: 100%; align-items: center;"
    >
      {#if !isMobile}
        <button class="button_01" on:click={handleBack}>
          <div class="arrowleft">
            <img src={arrowLeft} alt="arrowLeft" />
          </div>
          <div class="back-to-step">
            <span class="backtostep_span">Back To Step</span>
          </div>
        </button>
      {:else}
        <div></div>
      {/if}
      
      {#if !isMobile}
        <button class="button-outline" on:click={handlePreviewBoth}>
          <div class="preview-both">
            <span class="previewboth_span">Preview Both Formats</span>
          </div>
        </button>
      {/if}
      
      <button
        class="button-fill"
        class:mobile-full-width={isMobile}
        class:disabled-button={!selectedFormat}
        disabled={!selectedFormat}
        on:click={handleContinue}
      >
        <div class="continue-to-configuration">
          <span class="continuetoconfiguration_span"
            >Continue to Configuration</span
          >
        </div>
      </button>
    </div>
  </div>
  <div class="frame-1410103821">
    <div class="contact-us-hellodrawtopiacom">
      <span class="contactushellodrawtopiacom_span"
        >Contact us: hello@drawtopia.com</span
      >
    </div>
    <div class="rectangle-34"></div>
    <div class="frame-1410103820">
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
</div>

<!-- Preview Formats Modal -->
{#if showPreviewModal}
  <div
    class="preview-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="preview-modal-title"
    on:click={handleModalBackdropClick}
    on:keydown={(e) => e.key === "Escape" && handleCloseModal()}
    tabindex="-1"
  >
    <div class="preview-modal-container" role="document">
      <div class="preview-modal-header">
        <div class="preview-modal-logo">
          <div class="preview-logo-img"></div>
        </div>
        <button
          class="preview-modal-close"
          on:click={handleCloseModal}
          aria-label="Close preview"
        >
          <img src={xIcon} alt="close" />
        </button>
      </div>
      
      <div class="preview-modal-content">
        <h2 id="preview-modal-title" class="preview-modal-title">Preview Book Formats</h2>
        
        <div class="preview-cards-container">
          <div 
            class="preview-card"
            class:preview-card-selected={selectedPreviewCard === "interactive"}
            on:click={() => handlePreviewCardClick("interactive")}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === "Enter" && handlePreviewCardClick("interactive")}
          >
            <div class="preview-card-image-container">
              <img
                src={interactiveSearchEg}
                alt="Interactive Search Example"
                class="preview-card-image"
              />
              {#if selectedPreviewCard === "interactive"}
                <div class="preview-card-checkmark">
                  <img src={whiteCheck} alt="selected" />
                </div>
              {/if}
            </div>
            <div class="preview-card-content">
              <h3 class="preview-card-title">Interactive Search Example</h3>
              <p class="preview-card-description">Try finding the sample characters.</p>
            </div>
          </div>
          
          <div 
            class="preview-card"
            class:preview-card-selected={selectedPreviewCard === "story"}
            on:click={() => handlePreviewCardClick("story")}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === "Enter" && handlePreviewCardClick("story")}
          >
            <div class="preview-card-image-container">
              <img
                src={storyAdventureEg}
                alt="Story Adventure Example"
                class="preview-card-image"
              />
              {#if selectedPreviewCard === "story"}
                <div class="preview-card-checkmark">
                  <img src={whiteCheck} alt="selected" />
                </div>
              {/if}
            </div>
            <div class="preview-card-content">
              <h3 class="preview-card-title">Story Adventure Example</h3>
              <p class="preview-card-description">Listen to sample Story.</p>
            </div>
          </div>
        </div>
        
        <button class="preview-modal-button" on:click={handleTryStoryAdventure}>
          <span class="preview-modal-button-text">Try Story Adventure</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .createyourcharacter_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-your-character {
    align-self: stretch;
    text-align: center;
  }

  .uploadyourdrawingordrawyourowncharacterrighthere_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .upload-your-drawing-or-draw-your-own-character-right-here {
    align-self: stretch;
    text-align: center;
  }

  .ffreepagepreview_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .polygon-1 {
    width: 0;
    height: 0;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 12px solid transparent;
    border-right: 18px solid #d9eaff;
  }

  .letsbringyourcharactertolifeuploadadrawingorphoto_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
    width: 417px;
  }

  .backtostep_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back-to-step {
    text-align: center;
  }

  .previewboth_span {
    color: #438bff;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .preview-both {
    text-align: center;
  }

  .continuetoconfiguration_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .continue-to-configuration {
    text-align: center;
  }

  .contactushellodrawtopiacom_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .contact-us-hellodrawtopiacom {
    text-align: center;
  }

  .rectangle-34 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .privacypolicy_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .privacy-policy {
    text-align: center;
  }

  .termsofservice_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .terms-of-service {
    text-align: center;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .shieldstar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    top: -2px;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star-container {
    flex-shrink: 0;
    width: 88px;
    height: 88px;
  }

  .message-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  .message-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #d9eaff;
    border-radius: 24px;
    margin-left: 22px;
    max-width: 446px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .frame-1410103821 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }

  .tag {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 12px;
    background: #eef6ff;
    border-radius: 99px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .button_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    background-color: white;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 200px;
  }

  .button-outline {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    background-color: white;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 250px;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410104027 {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .character-creation-default {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
  .logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .button-fill {
    width: 300px;
    height: 100%;
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

  .button-fill.disabled-button {
    background: #d3d3d3;
    cursor: not-allowed;
  }

  .format-cards-container {
    /* width: 100%; */
    width: 1240px;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .mobile-full-width {
    width: 100% !important;
  }

  @media (max-width: 800px) {
    .create-your-character {
      text-align: left;
    }
    .upload-your-drawing-or-draw-your-own-character-right-here {
      text-align: left;
    }
    .heading {
      align-items: flex-start;
    }
    .format-cards-container {
      flex-direction: column;
      gap: 24px;
    }

    .character-creation-default {
      padding-left: 20px;
      padding-right: 20px;
    }

    .createyourcharacter_span {
      font-size: 32px;
      line-height: 44.8px;
    }

    .uploadyourdrawingordrawyourowncharacterrighthere_span {
      font-size: 16px;
      line-height: 19.2px;
    }

    .star-container {
      width: 25%;
    }
    .message-container {
      max-width: 75%;
    }
    .message-content {
      width: 90%;
    }

    .button-fill,
    .button_01,
    .button-outline {
      width: 100%;
      margin-top: 8px;
    }
  }

  /* Preview Modal Styles */
  .preview-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }

  .preview-modal-container {
    background: white;
    border-radius: 24px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .preview-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px 24px;
  }

  .preview-modal-logo {
    width: 203.32px;
    height: 38px;
    display: flex;
    align-items: center;
  }

  .preview-logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .preview-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .preview-modal-close:hover {
    background-color: #f0f0f0;
  }

  .preview-modal-close img {
    width: 24px;
    height: 24px;
  }

  .preview-modal-content {
    padding: 0 32px 32px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .preview-modal-title {
    color: #121212;
    font-size: 36px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 50.4px;
    text-align: center;
    margin: 0;
  }

  .preview-cards-container {
    display: flex;
    gap: 24px;
    width: 100%;
    justify-content: center;
  }

  .preview-card {
    flex: 1;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #ededed;
    display: flex;
    flex-direction: column;
    max-width: 400px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preview-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .preview-card-selected {
    border: 3px solid #8B5CF6;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  .preview-card-checkmark {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    background: #8B5CF6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  }

  .preview-card-checkmark img {
    width: 18px;
    height: 18px;
  }

  .preview-card-image-container {
    width: 100%;
    aspect-ratio: 1 / 0.75;
    overflow: hidden;
    position: relative;
  }

  .preview-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-card-title {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    margin: 0;
  }

  .preview-card-description {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    margin: 0;
  }

  .preview-modal-button {
    width: 100%;
    max-width: 400px;
    padding: 16px 24px;
    background: #438bff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .preview-modal-button:hover {
    background: #3370cc;
  }

  .preview-modal-button-text {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
  }

  @media (max-width: 800px) {
    .preview-modal-container {
      max-width: 95vw;
      border-radius: 20px;
    }

    .preview-modal-header {
      padding: 16px;
    }

    .preview-modal-logo {
      width: 150px;
      height: 28px;
    }

    .preview-modal-content {
      padding: 0 16px 24px 16px;
      gap: 20px;
    }

    .preview-modal-title {
      font-size: 28px;
      line-height: 39.2px;
    }

    .preview-cards-container {
      flex-direction: column;
      gap: 16px;
    }

    .preview-card {
      max-width: 100%;
    }
  }
</style>

