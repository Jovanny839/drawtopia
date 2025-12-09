<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import share from "../../../assets/Share.svg";
  import DotsThreeOutline from "../../../assets/DotsThreeOutline.svg";
  import CornersOut from "../../../assets/CornersOut.svg";
  import Book from "../../../assets/Book.svg";
  import EnvelopeSimple from "../../../assets/EnvelopeSimple.svg";
  import LockKey from "../../../assets/LockKey.svg";
  import ArrowLeft from "../../../assets/ArrowLeft.svg";
  import ArrowRight from "../../../assets/ArrowRight-white.svg";
  import SpeakerSimpleHigh from "../../../assets/SpeakerSimpleHigh.svg";
  import Play from "../../../assets/Play.svg";
  import CaretDown from "../../../assets/CaretDown.svg";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import ShareStoryModal from "../../../components/ShareStoryModal.svelte";
  import StoryInfoModal from "../../../components/StoryInfoModal.svelte";
  import StoryPreviewEnd from "../../../components/StoryPreviewEnd.svelte";
  import PreviewLockModal from "../../../components/PreviewLockModal.svelte";
  import { user } from "../../../lib/stores/auth";
  import { getUserProfile } from "../../../lib/auth";

  let showStoryInfoModal = false;
  let showShareStoryModal = false;
  let showStoryPreviewEndModal = false;
  let showPreviewLockModal = false;
  
  let storyScenes: string | any[] = [];
  let storyPages: Array<{ pageNumber: number; text: string }> = [];
  let currentSceneIndex = 0;
  const totalScenes = 5;
  
  let storyTitle = "Luna's Adventure";
  let pagesRead = 0;
  let readingTime = "0:00";
  let audioListened = "0 min";
  let isFreePlan = true; // Default to free plan for safety

  // Reactive statement to check subscription status when user changes
  $: if (browser && $user) {
    checkSubscriptionStatus();
  }

  // Function to check if user is on free plan
  const checkSubscriptionStatus = async () => {
    if (!browser) return;
    
    const currentUser = $user;
    if (!currentUser) {
      // If no user, default to free plan (show lock modal)
      isFreePlan = true;
      return;
    }

    try {
      const result = await getUserProfile(currentUser.id);
      if (result.success && result.profile) {
        const profile = Array.isArray(result.profile) ? result.profile[0] : result.profile;
        const subscriptionStatus = profile?.subscription_status;
        
        // Normalize subscription status to check if it's free plan
        if (!subscriptionStatus) {
          isFreePlan = true;
        } else {
          const normalizedStatus = subscriptionStatus.toLowerCase().trim();
          // Check if it's free plan (could be 'free', 'free plan', null, etc.)
          isFreePlan = normalizedStatus === 'free' || normalizedStatus === 'free plan' || normalizedStatus === '';
        }
      } else {
        // If we can't fetch profile, default to free plan
        isFreePlan = true;
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      // On error, default to free plan (safer to show lock modal)
      isFreePlan = true;
    }
  };

  // Load story scenes and text from session storage
  onMount(() => {
    if (browser) {
      // Check subscription status first
      checkSubscriptionStatus();
      
      // Load story title
      const storedTitle = sessionStorage.getItem('storyTitle') || 
                         sessionStorage.getItem('adventureTitle') ||
                         sessionStorage.getItem('story_title');
      if (storedTitle) {
        storyTitle = storedTitle;
      }
      
      // First, try to load story pages (which may contain scenes)
      const storedStoryPages = sessionStorage.getItem('storyPages');
      if (storedStoryPages) {
        try {
          const parsedPages = JSON.parse(storedStoryPages);
          storyPages = parsedPages;
          
          // Extract scenes from storyPages if they have scene property
          const scenesFromPages = parsedPages
            .map((page: any) => page.scene || page.imageUrl || page.image)
            .filter((url: string | undefined): url is string => !!url);
          
          if (scenesFromPages.length > 0) {
            storyScenes = scenesFromPages.map((url: string) => url.split("?")[0]);
            currentSceneIndex = 0;
            pagesRead = storyScenes.length;
          }
        } catch (error) {
          console.error('Error parsing story pages from session storage:', error);
        }
      }
      
      // If scenes weren't found in storyPages, try individual scene keys
      if (storyScenes.length === 0) {
        const loadedScenes: string[] = [];
        // Try multiple possible key patterns for story scenes
        for (let i = 1; i <= totalScenes; i++) {
          // Try different possible key patterns
          const sceneUrl = 
            sessionStorage.getItem(`storyScene_${i}`) ||
            sessionStorage.getItem(`adventureScene_${i}`) ||
            sessionStorage.getItem(`story_scene_${i}`) ||
            sessionStorage.getItem(`adventure_scene_${i}`);
          
          if (sceneUrl) {
            // Clean URL by removing query parameters (matching intersearch/1 behavior)
            loadedScenes.push(sceneUrl.split("?")[0]);
          }
        }
        
        if (loadedScenes.length > 0) {
          storyScenes = loadedScenes;
          currentSceneIndex = 0;
          pagesRead = storyScenes.length;
        }
      }
      
      // Fallback: if storyPages weren't loaded, try loading individual pages
      if (storyPages.length === 0) {
        const pages: Array<{ pageNumber: number; text: string }> = [];
        for (let i = 1; i <= totalScenes; i++) {
          const pageText = sessionStorage.getItem(`storyPage${i}`);
          if (pageText) {
            pages.push({ pageNumber: i, text: pageText });
          }
        }
        if (pages.length > 0) {
          storyPages = pages;
          pagesRead = pages.length;
        }
      }
    }
  });

  function previousScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex--;
    }
  }

  function nextScene() {
    // Check if trying to go beyond page 2 (index 1)
    // If on page 2 (index 1) and trying to go to page 3 (index 2), show lock modal
    // But only if user is on free plan
    if (currentSceneIndex >= 1 && isFreePlan) {
      // Show the preview lock modal for free plan users
      showPreviewLockModal = true;
      return;
    }
    
    // Allow navigation from page 1 (index 0) to page 2 (index 1)
    // Or allow all navigation for paid users
    if (currentSceneIndex < storyScenes.length - 1) {
      currentSceneIndex++;
    }
    
    // Note: StoryPreviewEnd modal logic removed since we lock after page 2
  }
  
  function handleCloseStoryPreviewEnd() {
    showStoryPreviewEndModal = false;
  }
  
  function handleReadAgain() {
    showStoryPreviewEndModal = false;
    currentSceneIndex = 0;
  }
  
  function handleDownloadPDF() {
    // TODO: Implement PDF download functionality
    console.log('Download PDF clicked');
  }
  
  function handleCreateNewBook() {
    showStoryPreviewEndModal = false;
    goto('/create-character/1');
  }

  function goToScene(index: number) {
    // Prevent navigation to pages beyond page 2 (index 1) for free plan users
    if (index > 1 && isFreePlan) {
      showPreviewLockModal = true;
      return;
    }
    
    // Allow navigation for paid users or to pages 1-2 for free users
    if (index >= 0 && index < storyScenes.length) {
      currentSceneIndex = index;
    }
  }
  
  function handleClosePreviewLockModal() {
    showPreviewLockModal = false;
  }
  
  function handleUnlockPreview() {
    // Navigate to pricing page when unlock button is clicked
    showPreviewLockModal = false;
    goto('/pricing');
  }

  // Update page counter text
  $: pageCounterText = storyScenes.length > 0
    ? `Page ${currentSceneIndex + 1} of ${storyScenes.length} (FREE PREVIEW)`
    : "Page 1 of 2 (FREE PREVIEW) • Pages 3-5 available after purchase";
  
  // Get current page text
  $: currentPageText = storyPages.length > 0 && currentSceneIndex < storyPages.length
    ? storyPages[currentSceneIndex].text
    : '';
</script>

<svelte:window on:keydown={(e) => {
  if (e.key === 'Escape') {
    showStoryInfoModal = false;
    showShareStoryModal = false;
  }
}} />

<div class="preview-story-cover">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <MobileBackBtn />
  {#if !showStoryPreviewEndModal}
  <div class="frame-1410103818">
    <div class="frame-13">
      <div class="frame-1410103946">
        <div class="frame-8">
          <div class="frame-1410104191">
            <div class="frame-1410104190">
              <div class="emmas-magical-forest-adventure">
                <span class="emmasmagicalforestadventure_span"
                  >Emma's Magical Forest Adventure</span
                >
              </div>
              <div
                class="page-1-of-2-free-preview-pages-3-5-available-after-purchase"
              >
                <span
                  class="page1of2freepreviewpages3-5availableafterpurchase_span"
                  >{pageCounterText}</span
                >
              </div>
              <div class="share-dots-button-group">
                <div
                  class="button"
                  role="button"
                  tabindex="0"
                  on:click={() => (showStoryInfoModal = true)}
                  on:keydown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    (showStoryInfoModal = true)}
                >
                  <img src={DotsThreeOutline} alt="dots" />
                </div>
                <div
                  class="button_01"
                  role="button"
                  tabindex="0"
                  on:click={() => (showShareStoryModal = true)}
                  on:keydown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    (showShareStoryModal = true)}
                >
                  <img src={share} alt="share" />
                </div>
              </div>
            </div>
          </div>
          <div class="mobile-share-dots-button-group">
            <div
              class="button"
              role="button"
              tabindex="0"
              on:click={() => (showStoryInfoModal = true)}
              on:keydown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                (showStoryInfoModal = true)}
            >
              <img src={DotsThreeOutline} alt="dots" />
            </div>
            <div
              class="button_01"
              role="button"
              tabindex="0"
              on:click={() => (showShareStoryModal = true)}
              on:keydown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                (showShareStoryModal = true)}
            >
              <img src={share} alt="share" />
            </div>
          </div>
          <div class="rectangle-35"></div>
          <div class="frame-1410104054">
            <div class="view-option">
              <div class="button_view">
                <div class="one-page-view">
                  <span class="one-pageview_span">One-page view</span>
                </div>
              </div>
              <div class="button_view_01">
                <div class="two-page-view">
                  <span class="two-pageview_span">Two-page view</span>
                </div>
              </div>
            </div>
            <div class="frame-1410104106">
              <div class="book-container">
                {#if storyScenes.length > 0}
                  <!-- Mobile: Split into left and right halves -->
                  <div class="mobile-image-split">
                    <div class="mobile-image-half mobile-image-left">
                      <div class="image">
                        <img
                          src={storyScenes[currentSceneIndex]}
                          alt={`Scene ${currentSceneIndex + 1} - Left`}
                          class="scene-main-image scene-image-left"
                          draggable="false"
                        />
                        <div class="frame-1410104055">
                          <div class="tag">
                            <div>
                              <span class="freepreviewpages_span"
                                >Free preview Pages</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="inner-shadow"></div>
                      </div>
                    </div>
                    <div class="mobile-image-half mobile-image-right">
                      <div class="image_01">
                        <img
                          src={storyScenes[currentSceneIndex]}
                          alt={`Scene ${currentSceneIndex + 1} - Right`}
                          class="scene-main-image scene-image-right"
                          draggable="false"
                        />
                        <div class="frame-1410104055_01">
                          <div class="tag_01">
                            <div>
                              <span class="freepreviewpages_01_span"
                                >Free preview Pages</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="inner-shadow"></div>
                      </div>
                    </div>
                  </div>
                {:else}
                  <!-- Default placeholder when no scenes are loaded -->
                  <div class="mobile-image-split">
                    <div class="mobile-image-half mobile-image-left">
                      <div class="image">
                        <div class="frame-1410104055">
                          <div class="tag">
                            <div>
                              <span class="freepreviewpages_span"
                                >Free preview Pages</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mobile-image-half mobile-image-right">
                      <div class="image_01">
                        <div class="frame-1410104055_01">
                          <div class="tag_01">
                            <div>
                              <span class="freepreviewpages_01_span"
                                >Free preview Pages</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
            <div class="notification">
              <img src={CornersOut} alt="corners" />
              <div>
                <span class="fullscreenpreview_span">Full Screen Preview</span>
              </div>
            </div>
            <div class="frame-1410104061">
              <div class="frame-1410104060">
                <div>
                  <span class="audionaration_span">Audio Naration</span>
                </div>
                <div><span class="pages1-2_span">Pages 1 -2</span></div>
              </div>
              <div class="frame-1410104059">
                <div class="frame-1410104056">
                  <img src={Play} alt="play" />
                </div>
                <div class="audio">
                  <img src={SpeakerSimpleHigh} alt="speaker" />

                  <div class="frame-1410104058">
                    <div class="rectangle-36"></div>
                  </div>
                </div>
                <div class="frame-1410104063">
                  <div><span class="speed_span">Speed</span></div>
                  <div class="frame-1410104062">
                    <div><span class="fx_span">1x</span></div>
                    <img src={CaretDown} alt="caret" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="frame-1410103860">
            <div class="button_02" on:click={previousScene} class:disabled={currentSceneIndex === 0 || storyScenes.length === 0}>
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="frame-1410104065">
              {#if storyScenes.length > 0}
                {#each storyScenes as _, idx}
                  {#if idx === 0}
                    <div class="number" class:active={currentSceneIndex === idx} on:click={() => goToScene(idx)}>
                      <img src={Book} alt="book" />
                    </div>
                  {:else if idx === 1}
                    <div class="number_01" class:active={currentSceneIndex === idx} on:click={() => goToScene(idx)}>
                      <img src={EnvelopeSimple} alt="envelope" />
                    </div>
                  {:else}
                    <div 
                      class="number_02" 
                      class:active={currentSceneIndex === idx}
                      on:click={() => goToScene(idx)}
                      class:locked={idx > 1}
                    >
                      <div class="text-1"><span class="f_span">{idx + 1}</span></div>
                    </div>
                  {/if}
                {/each}
              {:else}
                <!-- Default static display when no scenes -->
                <div class="number">
                  <img src={Book} alt="book" />
                </div>
                <div class="number_01">
                  <img src={EnvelopeSimple} alt="envelope" />
                </div>
                <div class="number_02">
                  <div class="text-1"><span class="f_span">1</span></div>
                </div>
                <div class="number_03">
                  <div class="text-2"><span class="f_span_01">2</span></div>
                </div>
                <div class="number_04">
                  <img src={LockKey} alt="lock" />
                </div>
                <div class="number_05">
                  <img src={LockKey} alt="lock" />
                </div>
              {/if}
            </div>
            <div class="button_03" on:click={nextScene} class:disabled={storyScenes.length === 0}>
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
          <div class="mobile-button-container">
            <div class="mobile-button_02" on:click={previousScene} class:disabled={currentSceneIndex === 0 || storyScenes.length === 0}>
              <div class="arrowleft">
                <img src={ArrowLeft} alt="arrow" />
              </div>
              <div class="previous">
                <span class="previous_span">Previous</span>
              </div>
            </div>
            <div class="mobile-button_03" on:click={nextScene} class:disabled={storyScenes.length === 0}>
              <div class="next"><span class="next_span">Next</span></div>
              <div class="arrowleft_01">
                <img src={ArrowRight} alt="arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="frame-1410103860_01">
    <div class="frame-1410103870">
      <div class="button_04">
        <img src={ArrowLeft} alt="arrow" />
        <div class="back"><span class="back_span">Back</span></div>
      </div>
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
  {/if}
  {#if showStoryInfoModal}
    <StoryInfoModal />
  {/if}
  {#if showShareStoryModal}
    <ShareStoryModal />
  {/if}
  {#if showStoryPreviewEndModal}
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      on:click|self={handleCloseStoryPreviewEnd}
      on:keydown={(e) => e.key === "Escape" && handleCloseStoryPreviewEnd()}
      tabindex="-1"
    >
      <div class="modal-container" on:click|stopPropagation>
        <StoryPreviewEnd
          {storyTitle}
          {pagesRead}
          {readingTime}
          {audioListened}
          on:close={handleCloseStoryPreviewEnd}
          on:readAgain={handleReadAgain}
          on:downloadPDF={handleDownloadPDF}
          on:createNewBook={handleCreateNewBook}
        />
      </div>
    </div>
  {/if}
  {#if showPreviewLockModal}
    <PreviewLockModal
      characterName={storyTitle.split("'")[0] || "Emma"}
      on:close={handleClosePreviewLockModal}
      on:unlock={handleUnlockPreview}
    />
  {/if}
</div>

<style>
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

  .emmasmagicalforestadventure_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 44.8px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure {
    text-align: center;
  }

  .page1of2freepreviewpages3-5availableafterpurchase_span {
    color: #666d80;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .page-1-of-2-free-preview-pages-3-5-available-after-purchase {
    text-align: center;
  }

  .rectangle-35 {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    align-self: stretch;
    padding: 24px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    border-radius: 8px;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .previous_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .previous {
    text-align: center;
  }

  .f_span {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-1 {
    align-self: stretch;
    text-align: center;
  }

  .f_span_01 {
    color: white;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .text-2 {
    align-self: stretch;
    text-align: center;
  }

  .next_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .next {
    text-align: center;
  }

  .back_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back {
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

  .frame-1410104190 {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .number_02 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_03 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft_01 {
    width: 24px;
    height: 24px;
    position: relative;
    transform-origin: top left;
    overflow: hidden;
  }

  .frame-1410103821 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .button {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1163px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_01 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    left: 1107px;
    top: 16px;
    position: absolute;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: flex;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .number {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #144be1;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_01 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_04 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .number_05 {
    width: 40px;
    height: 40px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  /* Scene image styles */
  .scene-main-image {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  /* Active state for navigation dots */
  .number.active,
  .number_01.active,
  .number_02.active {
    background: #144be1 !important;
  }

  /* Disabled state for buttons */
  .button_02.disabled,
  .button_03.disabled,
  .mobile-button_02.disabled,
  .mobile-button_03.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Make navigation dots clickable */
  .number,
  .number_01,
  .number_02 {
    cursor: pointer;
    transition: background 0.2s;
  }

  .number:hover:not(.active),
  .number_01:hover:not(.active),
  .number_02:hover:not(.active):not(.locked) {
    background: #a8b5d0;
  }
  
  /* Locked pages should show cursor not-allowed */
  .number_02.locked {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button_03 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .mobile-button_03 {
    display: none;
  }

  .button_04 {
    width: 200px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104191 {
    align-self: stretch;
    position: relative;
    justify-content: center;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410104065 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103860_01 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104054 {
    align-self: stretch;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-8 {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103946 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-13 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-1410103818 {
    width: 1240px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .preview-story-cover {
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
  .one-pageview_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .one-page-view {
    text-align: center;
  }

  .two-pageview_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .two-page-view {
    text-align: center;
  }

  .freepreviewpages_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .freepreviewpages_01_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .audionaration_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .pages1-2_span {
    color: #438bff;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .rectangle-36 {
    width: 73px;
    height: 3px;
    left: 0px;
    top: -0.5px;
    position: absolute;
    background: #438bff;
  }

  .speed_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .fx_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .button_view {
    width: 177px;
    height: 57px;
    padding: 2px;
    background: #c1c7d0;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_view_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .tag {
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .tag_01 {
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104060 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104058 {
    flex: 1 1 0;
    height: 3px;
    position: relative;
    background: white;
    border-radius: 12px;
  }

  .view-option {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104055 {
    flex: 1 1 0;
    height: 668px;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    overflow: hidden;
    border-radius: 8px;
    background-image: url(https://placehold.co/558x668);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
    display: inline-flex;
    position: relative;
  }

  .frame-1410104055_01 {
    flex: 1 1 0;
    height: 668px;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 100%
    );
    overflow: hidden;
    border-radius: 8px;
    background-image: url(https://placehold.co/558x668);
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
    display: inline-flex;
    position: relative;
  }

  .notification {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #f8fafb;
    box-shadow: 0px 1px 4px rgba(141.8, 141.8, 141.8, 0.25) inset;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 18px;
    display: inline-flex;
  }

  .frame-1410104056 {
    padding: 12px;
    background: #438bff;
    border-radius: 9999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .audio {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 9px;
    display: flex;
  }

  .frame-1410104062 {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .image,
  .image_01 {
    flex: 1 1 0;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
    width: 100%;
    position: relative;
  }
  
  /* Ensure images inside the wrapper divs respect the split view */
  .mobile-image-half .image,
  .mobile-image-half .image_01 {
    padding: 0;
    overflow: hidden;
    border-radius: 0;
    position: relative;
    width: 100%;
    display: block;
  }
  
  /* Make images 200% width to enable split view */
  .mobile-image-half .image .scene-main-image,
  .mobile-image-half .image_01 .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto; 
    object-fit: cover;
    display: block;
    position: relative;
    z-index: 1;
  }
  
  /* Left half: show left 50% of the image */
  .mobile-image-left .image .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }
  
  /* Right half: show right 50% of the image */
  .mobile-image-right .image_01 .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }
  
  /* Ensure overlays are positioned correctly above the image */
  .mobile-image-half .frame-1410104055,
  .mobile-image-half .frame-1410104055_01 {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    height: auto;
    background-image: none;
  }

  .frame-1410104063 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410104059 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104106 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .book-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  /* Mobile image split container - book style */
  .mobile-image-split {
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
  }

  .mobile-image-half {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 24px;
    background: white;
    box-shadow: -2px 10px 0px black;
    display: flex;
    align-items: stretch;
  }


  /* Base styles for split view images - must be applied to all halves */
  .mobile-image-half .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto;
    object-fit: cover;
  }

  /* Split view image positioning - left half shows left 50% */
  .mobile-image-left .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }

  /* Split view image positioning - right half shows right 50% */
  .mobile-image-right .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }

  .frame-1410104061 {
    align-self: stretch;
    padding: 16px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104054 {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: #f8fafb;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }
  .mobile-share-dots-button-group {
    display: none;
  }
  .mobile-button-container {
    display: none;
  }

  .inner-shadow{
    width: 100%;
    height: 100%;
    box-shadow: inset 0 -20px 10px 0 rgba(255, 255, 255);
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  }

  .modal-container {
    max-width: min(95vw, 800px);
    max-height: min(95vh, 900px);
    width: 100%;
    overflow: auto;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    background: white;
  }

  @media (max-width: 800px) {
    .modal-overlay {
      padding: 10px;
    }

    .modal-container {
      min-width: 100vw;
      min-height: 100vh;
      border-radius: 0;
    }

    .mobile-share-dots-button-group {
      display: flex;
      width: 100%;
      justify-content: center;
    }
    .preview-story-cover {
      padding-left: 20px;
      padding-right: 20px;
    }
    .frame-1410103818 {
      width: 100%;
    }
    .notification {
      width: 100%;
      justify-content: center;
    }
    .mobile-button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 10px;
    }
    .frame-8 {
      outline: none;
    }
    .mobile-button_03 {
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      background: #438bff;
      border-radius: 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
      width: 50%;
    }
    .mobile-button_02 {
      width: 50%;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
      border-radius: 20px;
      outline: 1px #ededed solid;
      outline-offset: -1px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: flex;
    }
    .button_03 {
      display: none;
    }
    .button_02 {
      display: none;
    }
    .frame-1410103860 {
      justify-content: center;
    }
    .frame-1410103860_01 {
      display: none;
    }
    .button {
      position: inherit;
    }
    .button_01 {
      position: inherit;
    }
    .frame-1410104060 {
      display: none;
    }
    .frame-1410104106 {
      flex-direction: column;
    }
    
    .mobile-image-split {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .mobile-image-half {
      width: 100%;
    }
    .two-pageview_span {
      font-size: 14px;
    }
    .one-pageview_span {
      font-size: 14px;
    }
    .button_view_01 {
      width: 50%;
    }
    .button_view {
      width: 50%;
    }
    .view-option {
      width: 100%;
    }
    .share-dots-button-group {
      display: none;
    }
  }
</style>
