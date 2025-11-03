<script lang="ts">
  import BackBtn from "../../components/BackBtn.svelte";
  import ChildProfile from "../../components/ChildProfile.svelte";
  import PhotoGuideModal from "../../components/PhotoGuideModal.svelte";
  import PersonInfo from "../../components/PersonInfo.svelte";
  // import StoryPreview from "../../components/StoryPreview.svelte";
  import { user, authLoading, isAuthenticated } from "../../lib/stores/auth";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { addNotification } from "$lib/stores/notification";
  import MobileBackBtn from "../../components/MobileBackBtn.svelte";

  let showPhotoGuideModal = false;
  let selectedAgeGroup = "";
  
  // Reactive statements for auth state
  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: userId = currentUser?.id;
  
  // Additional safety check for SSR
  $: safeToRedirect = browser && !loading && currentUser !== undefined;

  // Children data - starts empty, populated when user adds children
  let children: Array<{
    id: number;
    name: string;
    avatarUrl: string;
    ageGroup?: string;
    relationship?: string;
    createdAt?: string;
  }> = [];

  // Check authentication on mount (client-side only)
  onMount(() => {
    // Only run on client side
    if (browser) {
      // Add a small delay to ensure auth state is fully loaded
      setTimeout(() => {
        if (safeToRedirect && !authenticated) {
          goto('/login');
        }
      }, 100);
    }
  });

  // Reactive redirect when auth state changes (client-side only)
  $: if (safeToRedirect && !authenticated) {
    // Only redirect if we're sure about the auth state
    goto('/login');
  }

  const closePhotoGuideModal = () => {
    showPhotoGuideModal = false;
  };

  const handleEditChild = (childId: number) => {
    console.log("Edit child:", childId);
    // Add edit logic here
  };

  const handleDeleteChild = (childId: number) => {
    console.log("Delete child:", childId);
    children = children.filter(child => child.id !== childId);
  };

  const handleAvatarUploaded = (avatarUrl: string) => {
    console.log("Avatar uploaded successfully:", avatarUrl);
    // Here you can save the avatar URL to your form state or database
    // For example, you might want to associate it with the current child profile being created
  };

  const handleAddChild = (childData: any) => {
    console.log("Adding new child:", childData);
    
    // Add the new child to the children array
    children = [...children, {
      id: childData.id,
      name: childData.name,
      avatarUrl: childData.avatarUrl,
      ageGroup: childData.ageGroup,
      relationship: childData.relationship,
      createdAt: childData.createdAt
    }];
    
    console.log("Updated children list:", children);
  };

  const handleContinueToStoryCreation = () => {
    console.log("Continuing to story creation with saved profiles");
    // Here you can navigate to the story creation page
    // goto('/story-creation') or similar
    // addNotification({
    //   type: 'success',
    //   message: 'Child profiles saved successfully! Redirecting to dashboard...'
    // });
    goto('/dashboard');
  };

</script>

{#if loading || !browser}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else if !authenticated || !userId}
  <div class="auth-error-container">
    <p>Please log in to access this page.</p>
  </div>
{:else}
  <div class="profile-creation-default">
    <div class="main-pane">
      <div class="navbar" style="justify-content: center;">
        <div class="logo-text-full">
          <div class="logo-img"></div>
        </div>
      </div>
      <MobileBackBtn backText="Back"/>
      <div class="back-btn-container">
        <BackBtn />
      </div>
    <div class="frame-5">
      <div class="frame-1">
        <div class="heading">
          <div class="create-child-profile">
            <span class="createchildprofile_span">Create Child Profile</span>
          </div>
          <div
            class="tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience"
          >
            <span
              class="tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span"
              >Tell us about your child so we can personalize their Drawtopia
              experience</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="frame-1410103829">
        <div class="frame-1410103997">
          <div class="step-1"><span class="step1_span">Step 1</span></div>
          <div><span class="f2_span">1/2</span></div>
        </div>
        <div class="bar">
          <div class="bar_01"></div>
        </div>
        <div class="setting-up-profile">
          <span class="settingupprofile_span">Setting Up Profile</span>
        </div>
      </div>
    </div>
    <div class="frame-1410104010">
      <div class="list-of-children">
        <span class="listofchildren_span">List of Children</span>
      </div>
      <div class="frame-1410104011">
        {#if children.length === 0}
          <div class="no-children-message">
            <p>No children added yet. Fill out the form below and click "Add Another Child" to add them to the list.</p>
          </div>
        {:else}
          {#each children as child (child.id)}
            <ChildProfile
              name={child.name}
              avatarUrl={child.avatarUrl}
              onEdit={() => handleEditChild(child.id)}
              onDelete={() => handleDeleteChild(child.id)}
            />
          {/each}
        {/if}
      </div>
    </div>
    <div class="frame-1410103818">
      <PersonInfo 
        bind:showPhotoGuideModal 
        bind:selectedAgeGroup 
        onAvatarUploaded={handleAvatarUploaded}
        onAddChild={handleAddChild}
        onContinueToStoryCreation={handleContinueToStoryCreation}
        children={children}
        userId={userId}
      />
      <!-- <StoryPreview {selectedAgeGroup} /> -->
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
</div>
{/if}

{#if showPhotoGuideModal}
  <div
    class="modal-overlay"
    on:keydown={(e) => e.key === "Escape" && closePhotoGuideModal()}
    role="dialog"
    tabindex="-1"
  >
    <div class="modal-container">
      <PhotoGuideModal onClose={closePhotoGuideModal} />
    </div>
  </div>
{/if}

<style>
  .main-pane {
    width: 700px;
    gap: 24px;
    display: inline-flex;
    flex-direction: column;
  }
  .listofchildren_span {
  color: black;
  font-size: 24px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 33.60px;
  word-wrap: break-word;
}

.list-of-children {
  align-self: stretch;
}

.frame-1410104011 {
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  display: inline-flex;
}

.frame-1410104010 {
  align-self: stretch;
  padding: 8px;
  background: white;
  border-radius: 12px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  display: flex;
}
  .createchildprofile_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-child-profile {
    align-self: stretch;
  }

  .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience {
    align-self: stretch;
  }

  .step1_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .step-1 {
    width: 63px;
  }

  .f2_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .bar_01 {
    width: 50%;
    height: 8px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #438bff;
    border-radius: 12px;
  }

  .settingupprofile_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .setting-up-profile {
    align-self: stretch;
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

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103997 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
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
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    overflow: hidden;
    border-radius: 12px;
  }

  .frame-1 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
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
  }

  .frame-1410103829 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-5 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: flex;
  }

  .progress-bar {
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .profile-creation-default {
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

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .profile-creation-default {
      padding-left: 16px;
      padding-right: 16px;
      gap: 24px;
      padding-top: 16px;
      padding-bottom: 40px;
    }

    .frame-1410103818 {
      flex-direction: column-reverse;
      gap: 32px;
    }

    .createchildprofile_span {
      font-size: 48px;
      line-height: 67.2px;
      text-align: center;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 18px;
      line-height: 21.6px;
      text-align: center;
    }

    .navbar {
      padding-left: 16px;
      padding-right: 16px;
      height: 64px;
    }

    .logo-text-full {
      width: 160px;
      height: 32px;
    }

    .progress-bar {
      padding: 12px;
    }

    .step1_span,
    .f2_span,
    .settingupprofile_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .frame-5 {
      gap: 24px;
    }

    .heading {
      gap: 12px;
    }

    .back-btn-container {
      padding: 0 8px;
    }

    .modal-container {
      min-width: 90vw;
      min-height: 300px;
      margin: 16px;
    }
  }

  /* Extra small mobile devices */
  @media (max-width: 480px) {
    .profile-creation-default {
      padding-left: 12px;
      padding-right: 12px;
      gap: 16px;
    }

    .createchildprofile_span {
      font-size: 48px;
      line-height: 67.2px;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 18px;
      line-height: 21.6px;
    }

    .navbar {
      padding-left: 12px;
      padding-right: 12px;
      height: 56px;
    }

    .logo-text-full {
      width: 140px;
      height: 28px;
    }

    .progress-bar {
      padding: 8px;
    }

    .frame-1410103818 {
      gap: 24px;
    }

    .modal-container {
      min-width: 95vw;
      margin: 8px;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    position: absolute;
    min-width: 600px;
    min-height: 440px;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
  }
  .back-btn-container {
    width: 100%;
    display: inline-flex;
    justify-content: flex-start;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .auth-error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    flex-direction: column;
    gap: 16px;
    color: #ef4444;
    font-family: Nunito;
    font-size: 18px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .no-children-message {
    text-align: center;
    padding: 24px;
    color: #666d80;
    font-family: Nunito;
    font-size: 16px;
    line-height: 1.5;
    background: #f8fafb;
    border-radius: 8px;
    border: 1px dashed #dcdcdc;
  }
  @media (max-width: 800px) {
    .main-pane {
      width: 100%;
    }
    .createchildprofile_span {
      font-size: 32px;
    }
    .back-btn-container {
      display: none;
    }
  }
</style>
