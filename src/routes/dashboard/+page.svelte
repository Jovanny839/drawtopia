<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { user } from "../../lib/stores/auth";
  import { getChildProfiles, type ChildProfile } from "../../lib/database/childProfiles";
  import { getAllStoriesForParent, type Story } from "../../lib/database/stories";
  import { getGiftsForUser, type Gift } from "../../lib/database/gifts";
  import ChildProfileComponent from "../../components/ChildProfileComponent.svelte";
  import StoryLibraryComponent from "../../components/StoryLibraryComponent.svelte";
  import usercircleplus from "../../assets/UserCirclePlus.svg";
  import magnifyingglass from "../../assets/MagnifyingGlass.svg";
  import caretdown from "../../assets/CaretDown.svg";
  import house from "../../assets/House.svg";
  import baby from "../../assets/Baby.svg";
  import bookopen from "../../assets/BookOpen.svg";
  import gift from "../../assets/Gift.svg";
  import list from "../../assets/List.svg";
  import x from "../../assets/X.svg";
  import GiftTrackingComponent from "../../components/GiftTrackingComponent.svelte";
  import GiftSelectModal from "../../components/GiftSelectModal.svelte";
  import { storyCreation } from "../../lib/stores/storyCreation";

  let showMobileMenu = false;
  let childProfiles: any[] = [];
  let stories: any[] = [];
  let gifts: any[] = [];
  let loading = true;
  let loadingStories = true;
  let loadingGifts = true;
  let error = "";
  let storiesError = "";
  let giftsError = "";
  let showGiftSelectModal = false;

  // Random story themes for lastStory
  const storyThemes = [
    "Birthday", "Bedtime", "Holiday", "Adventure", "Magic", "Friendship", 
    "Animals", "Space", "Ocean", "Forest", "Castle", "Dragon", "Princess", 
    "Superhero", "Pirate", "Fairy Tale", "Mystery", "Science", "Sports", "Music"
  ];

  const toggleMobileMenu = () => {
    showMobileMenu = !showMobileMenu;
  };

  // Function to get a random story theme
  const getRandomStoryTheme = () => {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
  };

  // Function to format age group for display
  const formatAgeLabel = (ageGroup: string) => {
    // Convert age group like "3-5" to "3-5 Years Old"
    return `${ageGroup} Years Old`;
  };

  // Function to format stories created text
  const formatStoriesCreatedText = (firstName: string, ageGroup: string) => {
    return `${firstName} (Age ${ageGroup})`;
  };

  // Fetch child profiles from Supabase
  const fetchChildProfiles = async (userId: string) => {
    try {
      loading = true;
      error = "";
      
      const result = await getChildProfiles(userId);
      
      if (result.success && result.data) {
        // Transform the data to match the component's expected format
        childProfiles = result.data.map((profile: ChildProfile) => ({
          id: profile.id,
          name: profile.first_name,
          ageLabel: formatAgeLabel(profile.age_group),
          avatarUrl: profile.avatar_url || "https://placehold.co/48x48",
          storiesCreatedText: formatStoriesCreatedText(profile.first_name, profile.age_group),
          lastStory: getRandomStoryTheme(),
          relationship: profile.relationship
        }));
      } else {
        error = result.error || "Failed to fetch child profiles";
        childProfiles = [];
      }
    } catch (err) {
      console.error("Error fetching child profiles:", err);
      error = "An unexpected error occurred while fetching child profiles";
      childProfiles = [];
    } finally {
      loading = false;
    }
  };

  // Fetch stories for the user
  const fetchStories = async (userId: string) => {
    try {
      loadingStories = true;
      storiesError = "";
      
      const result = await getAllStoriesForParent(userId);
      
      if (result.success && result.data) {
        // Transform the data to match the StoryLibraryComponent interface
        stories = result.data.map((story: Story & { child_profiles?: any }) => ({
          title: story.story_title || `${story.character_name}'s Adventure`,
          author: story.child_profiles?.first_name || "Unknown",
          status: story.status || "completed",
          createdDate: story.created_at ? new Date(story.created_at).toLocaleDateString('en-GB') : "Unknown",
          durationText: "8 min read", // Default duration - could be calculated based on story content
          occasion: determineOccasion(story.adventure_type, story.story_world),
          imageUrl: story.original_image_url || "https://placehold.co/332x225"
        }));
      } else {
        storiesError = result.error || "Failed to fetch stories";
        stories = [];
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
      storiesError = "An unexpected error occurred while fetching stories";
      stories = [];
    } finally {
      loadingStories = false;
    }
  };

  // Fetch gifts for the user
  const fetchGifts = async () => {
    try {
      loadingGifts = true;
      giftsError = "";
      
      const result = await getGiftsForUser();
      
      if (result.success && result.data) {
        // Transform the data to match the GiftTrackingComponent interface
        gifts = result.data.map((gift: Gift) => ({
          id: gift.id,
          childName: gift.child_name,
          ageGroup: gift.age_group,
          status: gift.status,
          giftFrom: gift.relationship,
          occasion: gift.occasion,
          expectedDelivery: gift.delivery_time ? new Date(gift.delivery_time).toLocaleDateString('en-GB') : "Unknown",
          createdAt: gift.created_at ? new Date(gift.created_at) : new Date()
        }));
      } else {
        giftsError = result.error || "Failed to fetch gifts";
        gifts = [];
      }
    } catch (err) {
      console.error("Error fetching gifts:", err);
      giftsError = "An unexpected error occurred while fetching gifts";
      gifts = [];
    } finally {
      loadingGifts = false;
    }
  };

  // Helper function to determine occasion based on story properties
  const determineOccasion = (adventureType: string, storyWorld: string): string => {
    // Map adventure types and worlds to occasions
    const occasionMap: { [key: string]: string } = {
      'treasure_hunt': 'Adventure',
      'helping_friend': 'Friendship',
      'forest': 'Nature',
      'space': 'Space Adventure',
      'underwater': 'Ocean Adventure'
    };
    
    return occasionMap[adventureType] || occasionMap[storyWorld] || 'Adventure';
  };

  // Show gift select modal only once per login session
  const checkAndShowGiftModal = () => {
    if (!browser) return;
    
    // Check if modal was already shown in this session
    const hasSeenModalThisSession = sessionStorage.getItem('giftModalShownThisSession');
    if (!hasSeenModalThisSession) {
      // Add a small delay to ensure the dashboard has loaded
      setTimeout(() => {
        showGiftSelectModal = true;
        // Mark as shown for this session
        sessionStorage.setItem('giftModalShownThisSession', 'true');
      }, 1000);
    }
  };

  // Handle gift modal close
  const handleGiftModalClose = () => {
    showGiftSelectModal = false;
  };

  // Handle gift modal actions
  const handleCreateStory = () => {
    handleGiftModalClose();
    // Navigate to create story flow
    goto('/create-child-profile');
  };

  const handleGiveAsGift = () => {
    handleGiftModalClose();
    // Navigate to gift flow
    goto('/gift/1');
  };

  // Fetch profiles, stories, and gifts when component mounts and user is available
  onMount(() => {
    const unsubscribe = user.subscribe(($user) => {
      if ($user?.id) {
        fetchChildProfiles($user.id);
        fetchStories($user.id);
        fetchGifts();
        // Show the gift select modal only once per login session
        checkAndShowGiftModal();
      } else {
        // Reset state if no user
        childProfiles = [];
        stories = [];
        gifts = [];
        loading = false;
        loadingStories = false;
        loadingGifts = false;
        error = "";
        storiesError = "";
        giftsError = "";
        showGiftSelectModal = false;
        // Clear session flag when user logs out
        if (browser) {
          sessionStorage.removeItem('giftModalShownThisSession');
        }
      }
    });

    return unsubscribe;
  });

  // Handle Add Children button click
  const handleAddChildren = () => {
    goto('/create-child-profile');
  };

  // Handle New Story button click from child profile component
  const handleNewStory = (event: CustomEvent) => {
    const childName = event.detail.name;
    
    // Find the selected child profile
    const selectedChild = childProfiles.find(child => child.name === childName);
    
    if (selectedChild && browser) {
      // Store only the child profile ID for the character creation flow
      sessionStorage.setItem('selectedChildProfileId', selectedChild.id.toString());
      sessionStorage.setItem('selectedChildProfileName', selectedChild.name); // For display purposes
    }
    storyCreation.setSelectedChild(selectedChild.id.toString(), selectedChild.name);
    goto('/gift/1');
  };

</script>

<div class="parent-dashboard">
  <div class="navigation">
    <div class="sidebarheader">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <div data-weight="Regular" class="icon-list" on:click={toggleMobileMenu} on:keydown={(e) => e.key === 'Enter' && toggleMobileMenu()} role="button" tabindex="0">
        <img src={showMobileMenu ? x : list} alt={showMobileMenu ? "close" : "menu"} class="list" />
      </div>
    </div>
    <div class="content">
      <div class="sidebargrouping-label">
        <div><span class="mainmenu_span">MENU</span></div>
      </div>
      <div class="menu">
        <div class="parent-menu-dropdown">
          <div class="sidebar-menu-parent">
            <div class="title-icon">
              <div class="house">
                <img src={house} alt="house" class="house" />
              </div>
              <div><span class="home_span">Home</span></div>
            </div>
          </div>
        </div>
        <div class="parent-menu-dropdown_01">
          <div class="sidebar-menu-parent_01">
            <div class="title-icon_01">
              <div class="baby">
                <img src={baby} alt="baby" class="baby" />
              </div>
              <div><span class="childprofiles_span">Child Profiles</span></div>
            </div>
          </div>
        </div>
        <div class="parent-menu-dropdown_02">
          <div class="sidebar-menu-parent_02">
            <div class="title-icon_02">
              <div class="bookopen">
                <img src={bookopen} alt="bookopen" class="bookopen" />
              </div>
              <div><span class="storylibrary_span">Story Library</span></div>
            </div>
          </div>
        </div>
        <div class="parent-menu-dropdown_03">
          <div class="sidebar-menu-parent_03">
            <div class="title-icon_03">
              <div class="gift">
                <img src={gift} alt="gift" class="gift" />
              </div>
              <div><span class="gifttracking_span">Gift Tracking</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile Menu Overlay -->
  {#if showMobileMenu}
    <div class="mobile-menu-overlay" on:click={toggleMobileMenu} on:keydown={(e) => e.key === 'Escape' && toggleMobileMenu()} role="dialog" tabindex="-1">
      <div class="mobile-menu" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="0">
        <div class="mobile-menu-header">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <div class="close-menu" on:click={toggleMobileMenu} on:keydown={(e) => e.key === 'Enter' && toggleMobileMenu()} role="button" tabindex="0">
            <img src={x} alt="close" class="list" />
          </div>
        </div>
        <div class="mobile-menu-content">
          <div class="mobile-menu-label">
            <span class="mainmenu_span">MENU</span>
          </div>
          <div class="mobile-menu-items">
            <div class="mobile-menu-item active">
              <div class="mobile-menu-icon">
                <img src={house} alt="house" class="house" />
              </div>
              <span class="home_span">Home</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={baby} alt="baby" class="baby" />
              </div>
              <span class="childprofiles_span">Child Profiles</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={bookopen} alt="bookopen" class="bookopen" />
              </div>
              <span class="storylibrary_span">Story Library</span>
            </div>
            <div class="mobile-menu-item">
              <div class="mobile-menu-icon">
                <img src={gift} alt="gift" class="gift" />
              </div>
              <span class="gifttracking_span">Gift Tracking</span>
            </div>
          </div>
        </div>
        <div class="mobile-menu-footer">
          <div class="mobile-profile-close">
            <img
              class="ellipse-7"
              src="https://placehold.co/40x40"
              alt="Alex Smith"
            />
            <div class="heading">
              <div class="alex-smith">
                <span class="alexsmith_span">Alex Smith</span>
              </div>
              <div class="premium-plan">
                <span class="premiumplan_span">Premium Plan</span>
              </div>
            </div>
            <img src={caretdown} alt="caretdown" class="caretdown" />
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="frame-1410104150">
    <div class="sidebarpenaksir-kasir">
      <div class="sidebarheader_01">
        <div class="title">
          <div class="welcome-back">
            <span class="welcomeback_span">Welcome back!</span>
          </div>
          <div class="manage-your-childrens-stories-and-gifts">
            <span class="manageyourchildrensstoriesandgifts_span"
              >Manage your children's stories and gifts</span
            >
          </div>
        </div>
        <div class="profile-close">
          <div class="frame-1410103913">
            <img
              class="ellipse-7"
              src="https://placehold.co/40x40"
              alt="Alex Smith"
            />
            <div class="heading">
              <div class="alex-smith">
                <span class="alexsmith_span">Alex Smith</span>
              </div>
              <div class="premium-plan">
                <span class="premiumplan_span">Premium Plan</span>
              </div>
            </div>
          </div>
          <img src={caretdown} alt="caretdown" class="caretdown" />
        </div>
      </div>
    </div>
    <div class="sidebar">
      <div class="frame-1410104149">
        <div class="frame-1410104154">
          <div class="frame-1410104155">
            <div class="frame-1410104151">
              <div class="child-profiles_01">
                <span class="childprofiles_01_span">Child Profiles</span>
              </div>
              <div class="manage-your-childrens-story-preferences-and-progress">
                <span
                  class="manageyourchildrensstorypreferencesandprogress_span"
                  >Manage your children's story preferences and progress</span
                >
              </div>
            </div>
            <div class="frame-1410103868" on:click={handleAddChildren} on:keydown={(e) => e.key === 'Enter' && handleAddChildren()} role="button" tabindex="0">
              <img src={usercircleplus} alt="plus" class="plus" />
              <div class="sub-menu">
                <div class="add-children">
                  <span class="addchildren_span">Add Children</span>
                </div>
              </div>
            </div>
          </div>
          <div class="child-profiles-grid">
            {#if loading}
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading child profiles...</p>
              </div>
            {:else if error}
              <div class="error-state">
                <p class="error-text">{error}</p>
                <button class="retry-button" on:click={() => $user?.id && fetchChildProfiles($user.id)}>
                  Try Again
                </button>
              </div>
            {:else if childProfiles.length === 0}
              <div class="empty-state">
                <p class="empty-text">No child profiles found.</p>
                <p class="empty-subtext">Add your first child profile to get started!</p>
              </div>
            {:else}
              {#each childProfiles as c}
                <ChildProfileComponent
                  name={c.name}
                  ageLabel={c.ageLabel}
                  avatarUrl={c.avatarUrl}
                  storiesCreatedText={c.storiesCreatedText}
                  lastStory={c.lastStory}
                  on:newStory={handleNewStory}
                  on:editChild={() => goto(`/create-child-profile/edit?id=${c.id || ''}&name=${encodeURIComponent(c.name)}`)}
                />
              {/each}
            {/if}
          </div>
        </div>
      </div>
      <div class="frame-1410104150_01">
        <div class="frame-1410104154_01">
          <div class="frame-1410104155_01">
            <div class="frame-1410104151_01">
              <div class="story-library_01">
                <span class="storylibrary_01_span">Story Library</span>
              </div>
              <div class="browse-and-manage-all-created-stories">
                <span class="browseandmanageallcreatedstories_span"
                  >Browse and manage all created stories</span
                >
              </div>
            </div>
            <div class="frame-1410103899">
              <div class="frame-1410103898">
                <img
                  src={magnifyingglass}
                  alt="magnifyingglass"
                  class="magnifyingglass"
                />
                <div class="search-stories">
                  <span class="searchstories_span">Search Stories</span>
                </div>
              </div>
              <div class="dropdown">
                <div class="dropdown_01">
                  <div class="all-stories">
                    <span class="allstories_span">All Stories</span>
                  </div>
                  <img src={caretdown} alt="caretdown" class="caretdown" />
                </div>
                <div class="dropdown_02">
                  <div class="newest-first">
                    <span class="newestfirst_span">Newest First</span>
                  </div>
                  <img src={caretdown} alt="caretdown" class="caretdown" />
                </div>
              </div>
            </div>
          </div>
          <div class="stories-grid">
            {#if loadingStories}
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading stories...</p>
              </div>
            {:else if storiesError}
              <div class="error-state">
                <p class="error-text">{storiesError}</p>
                <button class="retry-button" on:click={() => $user?.id && fetchStories($user.id)}>
                  Try Again
                </button>
              </div>
            {:else if stories.length === 0}
              <div class="empty-state">
                <p class="empty-text">No stories found.</p>
                <p class="empty-subtext">Create your first story to get started!</p>
              </div>
            {:else}
              {#each stories as s}
                <StoryLibraryComponent
                  title={s.title}
                  author={s.author}
                  status={s.status}
                  createdDate={s.createdDate}
                  durationText={s.durationText}
                  occasion={s.occasion}
                  imageUrl={s.imageUrl}
                />
              {/each}
            {/if}
          </div>
          <GiftTrackingComponent 
            gifts={gifts} 
            loadingGifts={loadingGifts} 
            giftsError={giftsError} 
          />
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Gift Select Modal -->
{#if showGiftSelectModal}
  <div 
    class="modal-overlay" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="gift-modal-title"
    on:keydown={(e) => e.key === 'Escape' && handleGiftModalClose()}
    tabindex="-1"
  >
    <section 
      class="modal-container" 
      role="document"
    >
      <GiftSelectModal 
        on:createStory={handleCreateStory}
        on:giveAsGift={handleGiveAsGift}
        on:close={handleGiftModalClose}
      />
    </section>
  </div>
{/if}

<style>
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
    max-width: min(95vw, 900px);
    max-height: min(95vh, 850px);
    width: auto;
    height: auto;
    overflow: visible;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  /* Ensure modal is centered on all screen sizes */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 10px;
    }
    
    .modal-container {
      max-width: 98vw;
      max-height: 98vh;
    }
  }

  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .mainmenu_span {
    color: var(--Gray-gray-400, #90a1b9);
    font-size: 12px;
    font-family: Open Sauce One;
    font-weight: 500;
    text-transform: uppercase;
    line-height: 16.8px;
    letter-spacing: 1.2px;
    word-wrap: break-word;
  }

  .home_span {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .childprofiles_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .storylibrary_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .gifttracking_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .welcomeback_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .welcome-back {
    align-self: stretch;
  }

  .manageyourchildrensstoriesandgifts_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .manage-your-childrens-stories-and-gifts {
    align-self: stretch;
  }

  .ellipse-7 {
    width: 40px;
    height: 40px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .alexsmith_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .alex-smith {
    align-self: stretch;
  }

  .premiumplan_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .premium-plan {
    align-self: stretch;
  }

  .childprofiles_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .child-profiles_01 {
    align-self: stretch;
  }

  .manageyourchildrensstorypreferencesandprogress_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .manage-your-childrens-story-preferences-and-progress {
    align-self: stretch;
    height: 100%;
  }


  .addchildren_span {
    color: white;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .storylibrary_01_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .story-library_01 {
    align-self: stretch;
  }

  .browseandmanageallcreatedstories_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .browse-and-manage-all-created-stories {
    align-self: stretch;
    height: 26px;
  }

  .searchstories_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .search-stories {
    text-align: center;
  }

  .allstories_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .all-stories {
    text-align: center;
  }

  .newestfirst_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .newest-first {
    text-align: center;
  }

  .sidebargrouping-label {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .title {
    width: 305px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .heading {
    width: 119px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104151 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104151_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 131px;
    height: 24.48px;
    position: relative;
  }

  .icon-list {
    width: 24px;
    height: 24px;
    position: relative;
  }

  .house {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .baby {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .gift {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .caretdown {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .magnifyingglass {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410103913 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .sidebarheader {
    width: 260px;
    height: 87px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--Color-Neutral-White, white);
    border-right: 1px var(--Color-Border-Default, #e2e8f0) solid;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .title-icon {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_01 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_02 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .title-icon_03 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103868 {
    height: 49px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #438bff;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .frame-1410103868:hover {
    background: #3b7ce6;
  }

  .frame-1410103898 {
    width: 347px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #f8fafb;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .dropdown_01 {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .dropdown_02 {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .profile-close {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #fcfcfc;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .sidebar-menu-parent {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_02 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .sidebar-menu-parent_03 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104155 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .dropdown {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .sidebarheader_01 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--Color-Neutral-White, white);
    border-right: 1px var(--Color-Border-Default, #e2e8f0) solid;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    justify-content: space-between;
    align-items: flex-end;
    display: inline-flex;
  }

  .parent-menu-dropdown {
    width: 236px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
  }

  .parent-menu-dropdown_01 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
  }

  .parent-menu-dropdown_02 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
  }

  .parent-menu-dropdown_03 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
  }

  .frame-1410103899 {
    width: 662px;
    justify-content: space-between;
    align-items: center;
    display: flex;
  }

  .sidebarpenaksir-kasir {
    width: 100%;
    height: 91px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    display: flex;
  }

  .menu {
    width: 260px;
    padding: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-1410104155_01 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .stories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 400px));
    gap: 16px;
    width: 100%;
    justify-content: start;
  }

  .content {
    width: 260px;
    height: 927px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--White-bg-white, white);
    overflow: hidden;
    border-right: 1px var(--Gray-stk-gray-200, #e2e8f0) solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .child-profiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    gap: 16px;
    width: 100%;
  }

  .frame-1410104154_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .navigation {
    height: 1024px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
  }

  .frame-1410104154 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104150_01 {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104149 {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .sidebar {
    width: 100%;
    padding: 24px;
    background: #f8fafb;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104150 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
    width: 100%;
  }

  .parent-dashboard {
    width: 100%;
    height: 100%;
    background: white;
    overflow: hidden;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .parent-dashboard {
      flex-direction: column;
    }

    .navigation {
      display: block;
      height: auto;
      width: 100%;
    }

    .sidebarheader {
      display: flex;
      width: 100%;
      height: auto;
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 24px;
      padding-bottom: 24px;
      border-right: none;
      border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    }

    .content {
      display: none;
    }

    .frame-1410104150 {
      width: 100%;
    }

    .sidebar {
      width: 100%;
      padding: 0px;
      gap: 16px;
    }

    .sidebarheader_01 {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
    }

    .title {
      width: 100%;
    }

    .welcomeback_span {
      font-size: 24px;
      line-height: 33.6px;
      text-align: center;
    }

    .manageyourchildrensstoriesandgifts_span {
      font-size: 16px;
      line-height: 22.4px;
      text-align: center;
    }

    .childprofiles_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .storylibrary_01_span {
      font-size: 20px;
      line-height: 28px;
    }

    .manageyourchildrensstorypreferencesandprogress_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .browseandmanageallcreatedstories_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .child-profiles-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      width: 100%;
    }

    .stories-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      width: 100%;
    }

    .frame-1410103868 {
      width: 100%;
      height: 49px;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    .frame-1410103899 {
      width: 100%;
      flex-direction: column;
      gap: 12px;
    }

    .frame-1410103898 {
      width: 100%;
    }

    .dropdown {
      width: 100%;
      flex-direction: column;
      gap: 8px;
    }

    .dropdown_01,
    .dropdown_02 {
      width: 100%;
      justify-content: center;
    }

    .frame-1410104149 {
      padding: 12px;
    }

    .frame-1410104150_01 {
      padding: 12px;
    }

    .frame-1410104154 {
      gap: 16px;
    }

    .frame-1410104154_01 {
      gap: 16px;
      width: 100%;
    }

    .frame-1410104155 {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .frame-1410104155_01 {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .profile-close {
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 4px;
      padding-bottom: 4px;
    }

    .heading {
      width: auto;
    }

    .alexsmith_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .premiumplan_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .ellipse-7 {
      width: 32px;
      height: 32px;
    }
    .profile-close {
      display: none;
    }

    .icon-list {
      cursor: pointer;
    }
  }

  /* Mobile Menu Styles */
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    z-index: 1000;
  }

  .mobile-menu {
    width: 100%;
    height: 100%;
    background: white;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .mobile-menu-header {
    padding: 24px 20px;
    border-bottom: 1px var(--Color-Border-Default, #e2e8f0) solid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .close-menu {
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu-content {
    padding: 24px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .mobile-menu-footer {
    padding: 20px;
    background: white;
  }

  .mobile-profile-close {
    width: 100%;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #fcfcfc;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .mobile-menu-label {
    padding-left: 4px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-menu-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .mobile-menu-item:hover {
    background-color: #f8fafb;
  }

  .mobile-menu-item.active {
    background-color: #eef6ff;
  }

  .mobile-menu-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 801px) {
    .mobile-menu-overlay {
      display: none;
    }
  }

  /* Loading, Error, and Empty States */
  .loading-state,
  .error-state,
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0;
  }

  .error-text {
    color: #dc2626;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    margin: 0 0 16px 0;
  }

  .retry-button {
    padding: 8px 16px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #3b7ce6;
  }

  .empty-text {
    color: #666d80;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .empty-subtext {
    color: #90a1b9;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    margin: 0;
  }

</style>
