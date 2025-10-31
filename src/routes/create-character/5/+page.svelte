<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import { goto } from "$app/navigation";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  import WorldCard from "../../../components/WorldCard.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import forest from "../../../assets/big.png";
  import outspace from "../../../assets/outspace.png";
  import underwater from "../../../assets/underwater.png";
  import { 
    generateStyledImage, 
    loadGeneratedImages,
    saveSelectedImageUrl,
    hasSelectedImageChanged,
    getSelectedImageUrl
  } from "../../../lib/imageGeneration";
  import { storyCreation } from "../../../lib/stores/storyCreation";

  let isMobile = false;
  let selectedWorld = "underwater"; // Default selection: "forest", "outspace", or "underwater"
  let characterName = "";
  let selectedStyle = "";
  let selectedEnhancement = "";
  let enhancedCharacterImage = "";
  let originalImageUrl = "";
  let environmentImages: { [key: string]: string } = {};
  let generatingStates: { [key: string]: boolean } = {};


  // Style name mapping
  const styleNames = {
    "3d": "3D Realistic",
    "cartoon": "Cartoon",
    "anime": "Anime"
  };

  $: if (browser) {
    isMobile = window.innerWidth < 800;
  }

  // Retrieve character data from sessionStorage on component mount
  onMount(() => {
    if (browser) {
      const storedCharacterName = sessionStorage.getItem('characterName');
      const storedSelectedStyle = sessionStorage.getItem('selectedStyle');
      const storedSelectedEnhancement = sessionStorage.getItem('selectedEnhancement');
      const storedOriginalImageUrl = sessionStorage.getItem('characterImageUrl');
      
      if (storedCharacterName) characterName = storedCharacterName;
      if (storedSelectedStyle) selectedStyle = storedSelectedStyle;
      if (storedSelectedEnhancement) selectedEnhancement = storedSelectedEnhancement;
      if (storedOriginalImageUrl) originalImageUrl = storedOriginalImageUrl;
      
      // Get the enhanced character image from step 4
      const enhancementKey = `enhancementImage_${selectedStyle}_${selectedEnhancement}`;
      const storedEnhancedImage = sessionStorage.getItem(enhancementKey);
      if (storedEnhancedImage) {
        enhancedCharacterImage = storedEnhancedImage.split('?')[0];
      }
      
      // Check if the selected image from step 4 has changed
      const step4SelectedImage = getSelectedImageUrl('4');
      if (step4SelectedImage && hasSelectedImageChanged('4', step4SelectedImage)) {
        // Clear environment cache if the source image changed
        ['forest', 'underwater', 'outerspace'].forEach(env => {
          ['3d', 'cartoon', 'anime'].forEach(style => {
            ['minimal', 'normal', 'high'].forEach(enhancement => {
              sessionStorage.removeItem(`environmentImage_${style}_${enhancement}_${env}`);
            });
          });
        });
      }
      
      // Load any previously generated environment images
      loadEnvironmentImages();
      
      // Generate environment images for all worlds
      generateAllEnvironmentImages();
    }
  });

  function selectWorld(world: string) {
    selectedWorld = world;
    
    // Save the selected world image URL
    if (browser && environmentImages[world]) {
      saveSelectedImageUrl('5', environmentImages[world]);
    }
  }

  // Load previously generated environment images
  const loadEnvironmentImages = () => {
    const environments = ['forest', 'underwater', 'outerspace'];
    environments.forEach(env => {
      const cachedImage = sessionStorage.getItem(`environmentImage_${selectedStyle}_${selectedEnhancement}_${env}`);
      if (cachedImage) {
        environmentImages[env] = cachedImage.split('?')[0];
      }
    });
    environmentImages = { ...environmentImages };
  };

  // Generate environment images for all worlds
  const generateAllEnvironmentImages = async () => {
    if (!enhancedCharacterImage && !originalImageUrl) return;
    
    const environments = ['forest', 'underwater', 'outerspace'];
    const baseImage = enhancedCharacterImage || originalImageUrl;
    
    // Generate all environment images in parallel
    const promises = environments.map(env => generateEnvironmentImage(env, baseImage));
    await Promise.allSettled(promises);
  };

  // Generate environment image for a specific world
  const generateEnvironmentImage = async (environment: string, baseImage: string) => {
    if (!baseImage || generatingStates[environment]) return;
    
    // Check if already cached
    const cacheKey = `environmentImage_${selectedStyle}_${selectedEnhancement}_${environment}`;
    const cachedImage = sessionStorage.getItem(cacheKey);
    if (cachedImage) {
      environmentImages[environment] = cachedImage.split('?')[0];
      environmentImages = { ...environmentImages };
      return;
    }
    
    generatingStates[environment] = true;
    generatingStates = { ...generatingStates };
    
    try {
      const result = await generateStyledImage({
        imageUrl: baseImage,
        style: 'environment',
        quality: environment as 'forest' | 'underwater' | 'outerspace',
        saveToStorage: true,
        storageKey: cacheKey
      });

      if (result.success && result.url) {
        environmentImages[environment] = result.url;
        environmentImages = { ...environmentImages };
        
        // If this is the currently selected world, save it
        if (environment === selectedWorld) {
          saveSelectedImageUrl('5', result.url);
        }
      }
    } catch (error) {
      console.error(`Error generating ${environment} image:`, error);
    } finally {
      generatingStates[environment] = false;
      generatingStates = { ...generatingStates };
    }
  };

  // Handle continue to next step
  const handleContinue = () => {
    // Update story creation store with selected world
    storyCreation.setStoryWorld(selectedWorld as any);
    
    goto("/create-character/6");
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn backRoute="/create-character/3" />
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span">Choose Your Story World</span>
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Where will your character's adventure take place?</span
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
    <MobileStepProgressBar currentStep={4} />
    <ProgressBar currentStep={4} />
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
              >Where should hisyam go on their adventure?</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410103852">
      <WorldCard
        worldId="forest"
        title="Enchanted Forest"
        description="A magical forest filled with talking animals and hidden treasures"
        previewText={`See how ${characterName || '[Character Name]'} looks in the ${styleNames[selectedStyle as keyof typeof styleNames] || '[Selected Style]'} style in the Enchanted Forest`}
        imageSrc={environmentImages["forest"] || forest}
        imageAlt="image_card_1"
        isSelected={selectedWorld === "forest"}
        onSelect={selectWorld}
        isGenerating={generatingStates["forest"] || false}
      />
      <WorldCard
        worldId="outerspace"
        title="Outer Space"
        description="Explore distant planets and meet friendly alien creatures"
        previewText={`See how ${characterName || '[Character Name]'} looks in the ${styleNames[selectedStyle as keyof typeof styleNames] || '[Selected Style]'} style in Outer Space`}
        imageSrc={environmentImages["outerspace"] || outspace}
        imageAlt="image_card_2"
        isSelected={selectedWorld === "outerspace"}
        onSelect={selectWorld}
        isGenerating={generatingStates["outerspace"] || false}
      />
      <WorldCard
        worldId="underwater"
        title="Underwater Kingdom"
        description="Dive deep into an underwater world full of mysteries!"
        previewText={`See how ${characterName || '[Character Name]'} looks in the ${styleNames[selectedStyle as keyof typeof styleNames] || '[Selected Style]'} style in the Underwater Kingdom`}
        imageSrc={environmentImages["underwater"] || underwater}
        imageAlt="image_card_3"
        isSelected={selectedWorld === "underwater"}
        onSelect={selectWorld}
        isGenerating={generatingStates["underwater"] || false}
      />
    </div>

    <div
      style="display: flex; justify-content: {isMobile
        ? 'center'
        : 'space-between'}; width: 100%;"
    >
      {#if !isMobile}
        <button class="button_01" on:click={() => goto("/create-character/3")}>
          <div class="arrowleft">
            <img src={arrowLeft} alt="arrowLeft" />
          </div>
          <div class="back-to-step">
            <span class="backtostep_span">Back To Step</span>
          </div>
        </button>
      {/if}
      <button
        class="button-fill"
        class:mobile-full-width={isMobile}
        on:click={handleContinue}
      >
        <div class="continue-to-style-selection">
          <span class="continuetostyleselection_span"
            >Continue to Adventure Type</span
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
    /* border-bottom: 12px solid transparent; */
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

  .continuetostyleselection_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .continue-to-style-selection {
    text-align: center;
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



  .frame-1410103852 {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410103852 {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
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
    .frame-1410103852 {
      flex-direction: column;
      gap: 12px;
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

    .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
      width: auto;
      max-width: 300px;
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
  }
</style>
