<script lang="ts">
  import purple_check from "../assets/purple-check.svg";
  import arrowUpDown from "../assets/CaretUpDown.svg";
  import check from "../assets/Check.svg";
  import star from "../assets/Star.svg";
  import { onMount } from 'svelte';
  import { generateStyledImage } from "../lib/imageGeneration";

  export let enhancementId: string;
  export let title: string;
  export let subtitle: string;
  export let features: string[];
  export let isSelected: boolean = false;
  export let onSelect: (enhancementId: string) => void;
  export let showMostPopular: boolean = false;
  export let beforeImage: string = "";
  export let afterImage: string = "";
  export let originalImageUrl: string = "";
  export let selectedStyle: string = "";

  let containerRef: HTMLDivElement;
  let sliderPosition = 50; // Percentage from left
  let isDragging = false;
  let generatedEnhancementImage: string = "";
  let isGeneratingEnhancement = false;
  let lastProcessedStyle = "";
  let lastProcessedImageUrl = "";

  // Sample images for testing
  const sampleImages = {
    minimal: {
      before: "",
      after: ""
    },
    normal: {
      before: "",
      after: ""
    },
    high: {
      before: "",
      after: ""
    }
  };

  // Use the selected image from step 3 as before, and generated enhancement as after
  $: currentBeforeImage = afterImage || sampleImages[enhancementId as keyof typeof sampleImages]?.before || sampleImages.normal.before;
  $: currentAfterImage = generatedEnhancementImage || beforeImage || sampleImages[enhancementId as keyof typeof sampleImages]?.after || sampleImages.normal.after;

  // Generate enhancement image when component mounts or when originalImageUrl/selectedStyle changes
  $: if (originalImageUrl && selectedStyle) {
    const styleChanged = lastProcessedStyle && lastProcessedStyle !== selectedStyle;
    const imageChanged = lastProcessedImageUrl && lastProcessedImageUrl !== originalImageUrl;
    
    if (styleChanged || imageChanged || !generatedEnhancementImage) {
      // Clear the old image if style or original image changed
      if (styleChanged || imageChanged) {
        generatedEnhancementImage = "";
        // Clear cached images for this enhancement level
        if (typeof window !== 'undefined') {
          if (styleChanged) {
            // Clear all enhancement images for the old style
            sessionStorage.removeItem(`enhancementImage_${lastProcessedStyle}_minimal`);
            sessionStorage.removeItem(`enhancementImage_${lastProcessedStyle}_normal`);
            sessionStorage.removeItem(`enhancementImage_${lastProcessedStyle}_high`);
          }
          // Clear the specific cached image
          sessionStorage.removeItem(`enhancementImage_${selectedStyle}_${enhancementId}`);
        }
      }
      loadOrGenerateEnhancementImage();
      lastProcessedStyle = selectedStyle;
      lastProcessedImageUrl = originalImageUrl;
    }
  }

  // Load cached enhancement image or generate new one
  const loadOrGenerateEnhancementImage = async () => {
    if (typeof window !== 'undefined') {
      const cachedImage = sessionStorage.getItem(`enhancementImage_${selectedStyle}_${enhancementId}`);
      if (cachedImage) {
        generatedEnhancementImage = cachedImage.split('?')[0];
        return;
      }
    }
    generateEnhancementImage();
  };

  onMount(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef) return;
      
      const rect = containerRef.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      sliderPosition = percentage;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef) return;
      
      const rect = containerRef.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      sliderPosition = percentage;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  });

  function handleClick(event: Event) {
    // Only handle card selection if not clicking on the slider area
    if (!isDragging) {
      onSelect(enhancementId);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleClick(event);
    }
  }

  const handleSliderMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
  };

  const handleSliderTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
  };

  // Generate enhancement image based on the enhancement level
  const generateEnhancementImage = async () => {
    if (!originalImageUrl || isGeneratingEnhancement) return;
    
    isGeneratingEnhancement = true;
    
    try {
      const result = await generateStyledImage({
        imageUrl: originalImageUrl,
        style: selectedStyle,
        quality: enhancementId as 'minimal' | 'normal' | 'high',
        saveToStorage: true,
        storageKey: `enhancementImage_${selectedStyle}_${enhancementId}`
      });

      if (result.success && result.url) {
        generatedEnhancementImage = result.url;
      } else {
        console.error('Failed to generate enhancement image:', result.error);
      }
    } catch (error) {
      console.error('Error generating enhancement image:', error);
    } finally {
      isGeneratingEnhancement = false;
    }
  };
</script>

<div 
  class={`enhancement-card ${isSelected ? 'selected_card' : ''} ${showMostPopular ? 'popular-card' : ''}`}
  style="position: relative;"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={handleKeydown}
>
  {#if showMostPopular}
    <div class="tag_card">
      <img src={star} alt="star" />
      <div class="most-popular">
        <span class="mostpopular_span">Most Popular</span>
      </div>
    </div>
  {/if}
  
  <div class="card-content">
    <div class="frame-16" bind:this={containerRef}>
      <!-- Before Image (Right side) -->
      <div class="before-image">
        <img src={currentAfterImage} alt="Before" />
      </div>
      
      <!-- After Image (Left side, clipped) -->
      <div 
        class="after-image" 
        style="clip-path: inset(0 {100 - sliderPosition}% 0 0);"
      >
        {#if isGeneratingEnhancement}
          <div class="generating-overlay">
            <div class="spinner"></div>
            <div class="generating-text">Generating...</div>
          </div>
        {:else}
          <img src={currentBeforeImage} alt="After" />
        {/if}
      </div>
      
      <!-- Slider Line -->
      <div 
        class="rectangle-33" 
        style="left: {sliderPosition}%"
      ></div>
      
      <!-- Draggable Slider Handle -->
      <div 
        class="frame-1410103721"
        style="left: {sliderPosition}%"
        on:mousedown={handleSliderMouseDown}
        on:touchstart={handleSliderTouchStart}
        role="slider"
        tabindex="0"
        aria-label="Comparison slider"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={sliderPosition}
      >
        <img src={arrowUpDown} alt="Drag to compare" />
      </div>
      
      <!-- Labels -->
      <div class="frame-1410103722">
        <div class="before"><span class="before_span">Before</span></div>
      </div>
      <div class="frame-1410103723">
        <div class="after"><span class="after_span">After</span></div>
      </div>
    </div>
    <div class="card_heading">
      <div class="frame-1410104074">
        <div class="enhancement-title">
          <span class="enhancement-title_span">{title}</span>
        </div>
        <div class="enhancement-subtitle">
          <span class="enhancement-subtitle_span">{subtitle}</span>
        </div>
      </div>
      <div class="frame-1410104075">
        {#each features as feature, index}
          <div class="checklist">
            <div class="check">
              <img src={check} alt="check" />
            </div>
            <div class="feature-text">
              <span class="feature-text_span">{feature}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  {#if isSelected}
    <img src={purple_check} alt="purple_check" class="purple_check" />
  {/if}
</div>

<style>
  .enhancement-card {
    flex: 1 1 0;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .enhancement-card:hover {
    outline: 1px #438bff solid;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.1);
  }

  .enhancement-card.selected_card {
    outline: 2px #6912c5 solid;
    box-shadow: 0px 1px 8px #871fff;
  }

  .popular-card {
    padding-top: 4px;
    padding-bottom: 2px;
    padding-left: 2px;
    padding-right: 2px;
    background: #eef6ff;
    border-radius: 20px;
  }

  .card-content {
    width: 100%;
    background: white;
    border-radius: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 20px;
    display: flex;
  }

  .before-image,
  .after-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .before-image img,
  .after-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .generating-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .generating-text {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .rectangle-33 {
    width: 2px;
    height: 346px;
    top: 0px;
    position: absolute;
    background: #438bff;
    transform: translateX(-1px);
    pointer-events: none;
    z-index: 3;
  }

  .frame-1410103721 {
    padding: 4px;
    top: calc(50% - 20px);
    position: absolute;
    background: #438bff;
    border-radius: 24px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: grab;
    transform: translateX(-50%);
    z-index: 4;
    box-shadow: 0 2px 8px rgba(67, 139, 255, 0.3);
    transition: box-shadow 0.2s ease;
    width: 40px;
    height: 40px;
  }

  .frame-1410103721:hover {
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.4);
  }

  .frame-1410103721:active {
    cursor: grabbing;
  }

  .frame-1410103721 img {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
  }

  .frame-1410103722 {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    left: calc(25% - 42px);
    bottom: 30px;
    position: absolute;
    background: white;
    border-radius: 20px;
    outline: 1px #cacaca solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103723 {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    left: calc(75% - 35px);
    bottom: 30px;
    position: absolute;
    background: white;
    border-radius: 20px;
    outline: 1px #cacaca solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .before_span, .after_span {
    color: black;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .before, .after {
    text-align: center;
  }

  .frame-16 {
    align-self: stretch;
    height: 346px;
    position: relative;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    cursor: ew-resize;
    user-select: none;
  }

  .card_heading {
    align-self: stretch;
    padding: 16px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104074 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .enhancement-title {
    align-self: stretch;
  }

  .enhancement-title_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .enhancement-subtitle {
    align-self: stretch;
  }

  .enhancement-subtitle_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .frame-1410104075 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .checklist {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .check {
    width: 18px;
    height: 18px;
    position: relative;
    background: #141414;
    overflow: hidden;
    border-radius: 99999px;
  }

  .feature-text {
    flex: 1 1 0;
  }

  .feature-text_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .tag_card {
    width: 100%;
    padding: 4px;
    border-radius: 99px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .most-popular {
    text-align: center;
  }

  .mostpopular_span {
    color: #438bff;
    font-size: 15px;
    font-family: Quicksand;
    font-weight: 700;
    word-wrap: break-word;
  }

  .purple_check {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  @media (max-width: 800px) {
    .enhancement-card {
      width: 100%;
      flex: none;
    }
  }
</style>
