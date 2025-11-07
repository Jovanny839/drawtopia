<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { user } from "../../lib/stores/auth";
  import {
    getChildProfiles,
    type ChildProfile,
  } from "../../lib/database/childProfiles";
  import {
    getAllStoriesForParent,
    type Story,
  } from "../../lib/database/stories";
  import { supabase } from "../../lib/supabase";
  import { getGiftsForUser, type Gift } from "../../lib/database/gifts";
  import ChildProfileComponent from "../../components/ChildProfileComponent.svelte";
  import StoryLibraryComponent from "../../components/StoryLibraryComponent.svelte";
  import usercircleplus from "../../assets/UserCirclePlus.svg";
  import magnifyingglass from "../../assets/MagnifyingGlass.svg";
  import caretdown from "../../assets/CaretDown.svg";
  import house from "../../assets/House.svg";
  import baby from "../../assets/Baby.svg";
  import userSquare from "../../assets/UserSquare.svg";
  import bookopen from "../../assets/BookOpen.svg";
  import gift from "../../assets/Gift.svg";
  import list from "../../assets/Sidebar.svg";
  import plus from "../../assets/Plus.svg";
  import x from "../../assets/X.svg";
  import GiftTrackingComponent from "../../components/GiftTrackingComponent.svelte";
  import GiftSelectModal from "../../components/GiftSelectModal.svelte";
  import NotificationComponent from "../../components/NotificationComponent.svelte";
import AccountDropdown from "../../components/AccountDropdown.svelte";
  import { storyCreation } from "../../lib/stores/storyCreation";
  import books from "../../assets/Books.svg";
  import starIcon from "../../assets/OutlineStar.svg";
  import speakerIcon from "../../assets/OutlineHeadset.svg";
  import BookIcon from "../../assets/Book.svg";
  import BookCard from "../../components/BookCard.svelte";
  import CharacterCard from "../../components/CharacterCard.svelte";
  import ChildCard from "../../components/ChildCard.svelte";

  // Sidebar library switch state
  let libraryView: "all" | "characters" | "children" = "all";
  const setLibraryView = (v: "all" | "characters" | "children") =>
    (libraryView = v);

  // Active menu item state
  let activeMenu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking" = "home";

  // Function to handle menu item clicks
  function handleMenuClick(menu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking") {
    activeMenu = menu;
    // You can add navigation logic here if needed
  }

  let showMobileMenu = false;
  let childProfiles: any[] = [];
  let stories: any[] = [];
  let rawStories: any[] = []; // Store raw story data for character extraction
  let characters: any[] = []; // Extracted unique characters
  let gifts: any[] = [];
  let loading = true;
  let loadingStories = true;
  let loadingGifts = true;
  let error = "";
  let storiesError = "";
  let giftsError = "";
  let showGiftSelectModal = false;
  let homeCategory: string | null = "AllBooks";

  // Random story themes for lastStory
  const storyThemes = [
    "Birthday",
    "Bedtime",
    "Holiday",
    "Adventure",
    "Magic",
    "Friendship",
    "Animals",
    "Space",
    "Ocean",
    "Forest",
    "Castle",
    "Dragon",
    "Princess",
    "Superhero",
    "Pirate",
    "Fairy Tale",
    "Mystery",
    "Science",
    "Sports",
    "Music",
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
        childProfiles = result.data
          .map((profile: ChildProfile, index: number) => ({
            id: profile.id || `temp_child_${index}_${Date.now()}`,
            name: profile.first_name,
            first_name: profile.first_name,
            ageLabel: formatAgeLabel(profile.age_group),
            avatarUrl: profile.avatar_url || "https://placehold.co/48x48",
            storiesCreatedText: formatStoriesCreatedText(
              profile.first_name,
              profile.age_group,
            ),
            lastStory: getRandomStoryTheme(),
            relationship: profile.relationship,
            created_at: profile.created_at,
          }))
          .filter((profile: any) => profile.id); // Ensure all profiles have valid ids
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

  // Direct query to Supabase stories table (for debugging/verification)
  const fetchStoriesDirectly = async (userId: string) => {
    try {
      // First get child profiles for this user
      const { data: childProfiles, error: childError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', userId);

      if (childError) {
        console.error('[Dashboard] Error fetching child profiles:', childError);
        return [];
      }

      if (!childProfiles || childProfiles.length === 0) {
        console.log('[Dashboard] No child profiles found for user');
        return [];
      }

      const childProfileIds = childProfiles.map(cp => cp.parent_id);
      
      // Direct query to stories table
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .in('child_profile_id', childProfileIds)
        .order('created_at', { ascending: false });

      if (storiesError) {
        console.error('[Dashboard] Error fetching stories directly:', storiesError);
        return [];
      }

      console.log('[Dashboard] Direct query result:', storiesData?.length || 0, 'stories');
      return storiesData || [];
    } catch (err) {
      console.error('[Dashboard] Error in direct query:', err);
      return [];
    }
  };

  // Fetch stories for the user
  const fetchStories = async (userId: string) => {
    try {
      loadingStories = true;
      storiesError = "";
      
      // Clear existing data first
      stories = [];
      rawStories = [];
      characters = [];

      console.log('[Dashboard] Fetching stories from Supabase for user:', userId);
      
      // First, try direct query to verify what's in the database
      const directStories = await fetchStoriesDirectly(userId);
      console.log('[Dashboard] Direct query returned:', directStories.length, 'stories');
      
      // Then use the standard function
      const result = await getAllStoriesForParent(userId);
      
      console.log('[Dashboard] getAllStoriesForParent response:', {
        success: result.success,
        dataCount: result.data,
        error: result.error
      });

      if (result.success && result.data) {
        // Ensure we have an array
        const storiesData = Array.isArray(result.data) ? result.data : [];
        
        console.log('[Dashboard] Stories from Supabase:', storiesData.length, 'stories');
        console.log('[Dashboard] Stories data:', storiesData);
        
        // Store raw story data from Supabase
        rawStories = storiesData;
        
        // Transform the data to match the StoryLibraryComponent interface
        stories = storiesData
          .map(
            (story: Story & { child_profiles?: any }, index: number) => ({
              id: story.id || `temp_story_${index}_${Date.now()}`,
              title: story.story_title || `${story.character_name}'s Adventure`,
              author: story.child_profiles?.first_name || "Unknown",
              status: story.status || "completed",
              story_cover: story.story_cover,
              createdDate: story.created_at
                ? new Date(story.created_at).toLocaleDateString("en-GB")
                : "Unknown",
              created_at: story.created_at,
              durationText: "8 min read", // Default duration - could be calculated based on story content
              occasion: determineOccasion(
                story.adventure_type,
                story.story_world,
              ),
              imageUrl:
                story.original_image_url || "https://placehold.co/332x225",
              story_title: story.story_title,
              child_profiles: story.child_profiles
            }),
          )
          .filter((story) => story.id); // Ensure all stories have valid ids

        console.log('[Dashboard] Transformed stories for display:', stories.length, 'stories');

        // Extract unique characters from stories
        extractCharacters(storiesData);
        
        console.log('[Dashboard] Extracted characters:', characters.length, 'characters');
      } else {
        console.warn('[Dashboard] Failed to fetch stories:', result.error);
        storiesError = result.error || "Failed to fetch stories";
        stories = [];
        rawStories = [];
        characters = [];
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching stories:", err);
      storiesError = "An unexpected error occurred while fetching stories";
      stories = [];
      rawStories = [];
      characters = [];
    } finally {
      loadingStories = false;
      console.log('[Dashboard] Stories loading complete. Final stories count:', stories.length);
    }
  };

  // Extract unique characters from stories
  const extractCharacters = (storiesData: any[]) => {
    const characterMap = new Map();
    const characterBookCounts = new Map();
    let characterIdCounter = 1;
    
    storiesData.forEach((story: Story & { child_profiles?: any }) => {
      if (story.character_name) {
        const key = story.character_name.toLowerCase();
        
        // Count books for this character
        characterBookCounts.set(key, (characterBookCounts.get(key) || 0) + 1);
        
        if (!characterMap.has(key)) {
          characterMap.set(key, {
            id: `char_${characterIdCounter++}`,
            character_name: story.character_name,
            character_type: story.character_type,
            character_style: story.character_style,
            special_ability: story.special_ability,
            original_image_url: story.original_image_url || "https://placehold.co/332x225",
            created_at: story.created_at,
            child_profiles: story.child_profiles,
            booksCount: 0, // Will be set below
          });
        }
      }
    });

    // Set book counts for each character
    characters = Array.from(characterMap.values())
      .map((char) => ({
        ...char,
        booksCount: characterBookCounts.get(char.character_name.toLowerCase()) || 0,
      }))
      .filter((char) => char.id); // Ensure all characters have valid ids
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
          expectedDelivery: gift.delivery_time
            ? new Date(gift.delivery_time).toLocaleDateString("en-GB")
            : "Unknown",
          createdAt: gift.created_at ? new Date(gift.created_at) : new Date(),
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
  const determineOccasion = (
    adventureType: string,
    storyWorld: string,
  ): string => {
    // Map adventure types and worlds to occasions
    const occasionMap: { [key: string]: string } = {
      treasure_hunt: "Adventure",
      helping_friend: "Friendship",
      forest: "Nature",
      space: "Space Adventure",
      underwater: "Ocean Adventure",
    };

    return occasionMap[adventureType] || occasionMap[storyWorld] || "Adventure";
  };

  // Show gift select modal only once per login session
  const checkAndShowGiftModal = () => {
    if (!browser) return;

    // Check if modal was already shown in this session
    const hasSeenModalThisSession = sessionStorage.getItem(
      "giftModalShownThisSession",
    );
    if (!hasSeenModalThisSession) {
      // Add a small delay to ensure the dashboard has loaded
      setTimeout(() => {
        showGiftSelectModal = true;
        // Mark as shown for this session
        sessionStorage.setItem("giftModalShownThisSession", "true");
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
    goto("/create-child-profile");
  };

  const handleGiveAsGift = () => {
    handleGiftModalClose();
    // Navigate to gift flow
    goto("/gift/1");
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
        rawStories = [];
        characters = [];
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
          sessionStorage.removeItem("giftModalShownThisSession");
        }
      }
    });

    return unsubscribe;
  });

  // Handle Add Children button click
  const handleAddChildren = () => {
    goto("/create-child-profile");
  };

  // Handle New Story button click from child profile component
  const handleNewStory = (event: CustomEvent) => {
    const childName = event.detail.name;

    // Find the selected child profile
    const selectedChild = childProfiles.find(
      (child) => child.name === childName,
    );

    if (selectedChild && browser) {
      // Store only the child profile ID for the character creation flow
      sessionStorage.setItem(
        "selectedChildProfileId",
        selectedChild.id.toString(),
      );
      sessionStorage.setItem("selectedChildProfileName", selectedChild.name); // For display purposes
    }
    storyCreation.setSelectedChild(
      selectedChild.id.toString(),
      selectedChild.name,
    );
    goto("/gift/1");
  };
</script>

<div class="parent-dashboard">
  <div class="navigation">
    <div class="sidebarheader">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <div
        data-weight="Regular"
        class="icon-list"
        on:click={toggleMobileMenu}
        on:keydown={(e) => e.key === "Enter" && toggleMobileMenu()}
        role="button"
        tabindex="0"
      >
        <img
          src={showMobileMenu ? x : list}
          alt={showMobileMenu ? "close" : "menu"}
          class="list"
        />
      </div>
    </div>
    <div class="content">
      <div class="sidebargrouping-label">
        <div><span class="mainmenu_span">MENU</span></div>
      </div>
      <div class="menu">
        <div 
          class="parent-menu-dropdown" 
          class:active={activeMenu === "home"}
          on:click={() => handleMenuClick("home")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("home")}
        >
          <div class="sidebar-menu-parent">
            <div class="title-icon">
              <div class="house">
                <img src={house} alt="house" class="house" />
              </div>
              <div><span class="home_span">Home</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_02" 
          class:active={activeMenu === "story-library"}
          on:click={() => handleMenuClick("story-library")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("story-library")}
        >
          <div class="sidebar-menu-parent_02">
            <div class="title-icon_02">
              <div class="bookopen">
                <img src={bookopen} alt="bookopen" class="bookopen" />
              </div>
              <div><span class="storylibrary_span">Story Library</span></div>
            </div>
          </div>
          {#if activeMenu === "story-library"}
            <div class="ellipse-1415"></div>
          {/if}
        </div>

        <div 
          class="parent-menu-dropdown_01" 
          class:active={activeMenu === "child-profiles"}
          on:click={() => handleMenuClick("child-profiles")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("child-profiles")}
        >
          <div class="sidebar-menu-parent_01">
            <div class="title-icon_01">
              <div class="baby">
                <img src={baby} alt="baby" class="baby" />
              </div>
              <div><span class="childprofiles_span">Child Profiles</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_01" 
          class:active={activeMenu === "characters"}
          on:click={() => handleMenuClick("characters")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("characters")}
        >
          <div class="sidebar-menu-parent_01">
            <div class="title-icon_01">
              <div class="baby">
                <img src={userSquare} alt="characters" class="baby" />
              </div>
              <div><span class="childprofiles_span">Characters</span></div>
            </div>
          </div>
        </div>
        <div 
          class="parent-menu-dropdown_03" 
          class:active={activeMenu === "gift-tracking"}
          on:click={() => handleMenuClick("gift-tracking")}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === "Enter" && handleMenuClick("gift-tracking")}
        >
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
    <div
      class="mobile-menu-overlay"
      on:click={toggleMobileMenu}
      on:keydown={(e) => e.key === "Escape" && toggleMobileMenu()}
      role="dialog"
      tabindex="-1"
    >
      <div
        class="mobile-menu"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="dialog"
        tabindex="0"
      >
        <div class="mobile-menu-header">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <div class="mobile-header-actions">
            <NotificationComponent />
            <div
              class="close-menu"
              on:click={toggleMobileMenu}
              on:keydown={(e) => e.key === "Enter" && toggleMobileMenu()}
              role="button"
              tabindex="0"
            >
              <img src={x} alt="close" class="list" />
            </div>
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
        <div class="header-actions">
          <NotificationComponent />
          <div class="chips">
            <div class="frame-2147227644">
              <div class="books">
                <img src={books} alt="books" />
              </div>
            </div>
            <div>
              <span class="fstorycreditsleft_span">3 story credits left</span>
            </div>
          </div>
          <AccountDropdown />
        </div>
      </div>
    </div>
    <div class="sidebar">
      {#if activeMenu === "home"}
        <div class="frame-1410104150">
          <div class="frame-2147227615">
            <div class="frame-2147227616">
              <div class="frame-2147227614">
                <div class="your-library">
                  <span class="yourlibrary_span">Your Library</span>
                </div>
                <div class="switch" role="tablist" aria-label="Your Library view">
                  <div
                    class="button"
                    class:active={libraryView === "all"}
                    role="tab"
                    aria-selected={libraryView === "all"}
                    tabindex="0"
                    on:click={() => setLibraryView("all")}
                    on:keydown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setLibraryView("all")}
                  >
                    <div><span class="allbooks_span">All Books</span></div>
                  </div>
                  <div
                    class="button_01"
                    class:active={libraryView === "characters"}
                    role="tab"
                    aria-selected={libraryView === "characters"}
                    tabindex="0"
                    on:click={() => setLibraryView("characters")}
                    on:keydown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setLibraryView("characters")}
                  >
                    <div><span class="characters_span">Characters</span></div>
                  </div>
                  <div
                    class="button_02"
                    class:active={libraryView === "children"}
                    role="tab"
                    aria-selected={libraryView === "children"}
                    tabindex="0"
                    on:click={() => setLibraryView("children")}
                    on:keydown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setLibraryView("children")}
                  >
                    <div><span class="children_span">Children</span></div>
                  </div>
                </div>
              </div>
              <div class="frame-1410104245" on:click={() => goto("/create-character/1")} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}>
                <div class="ellipse-1415"></div>
                <div class="plus">
                  <img src={plus} alt="plus" />
                </div>
                <div class="new-book">
                  <span class="newbook_span">New Book</span>
                </div>
              </div>
            </div>
            <div class="rectangle-263"></div>
            <div class="frame-1410103899">
              <div class="dropdown">
                <div class="dropdown_01">
                  <div class="all-formats">
                    <span class="allformats_span">All Formats</span>
                  </div>
                  <div class="caretdown">
                    <img src={caretdown} alt="caretdown" />
                  </div>
                </div>
                <div class="dropdown_02">
                  <div class="all-children">
                    <span class="allchildren_span">All Children</span>
                  </div>
                  <div class="caretdown_01">
                    <img src={caretdown} alt="caretdown" />
                  </div>
                </div>
                <div class="dropdown_03">
                  <div class="all-status">
                    <span class="allstatus_span">All Status</span>
                  </div>
                  <div class="caretdown_02">
                    <img src={caretdown} alt="caretdown" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="frame-1410104154">
            <div class="frame-1410103894">
              {#if libraryView === "all"}
                {#if loadingStories}
                  <div class="loading-message">Loading books...</div>
                {:else if storiesError}
                  <div class="error-message">{storiesError}</div>
                {:else if stories.length === 0}
                  <div class="empty-message">No books found</div>
                {:else}
                  {#if browser}
                    <div class="debug-info" style="grid-column: 1 / -1; padding: 8px; background: #e3f2fd; border-radius: 4px; margin-bottom: 8px; font-size: 12px; color: #1976d2; border: 1px solid #90caf9;">
                      📊 Showing {stories.length} {stories.length === 1 ? 'story' : 'stories'} from Supabase database
                    </div>
                  {/if}
                  {#each stories as story (story.id)}
                    <BookCard item={story} />
                  {/each}
                {/if}
              {:else if libraryView === "characters"}
                {#if loadingStories}
                  <div class="loading-message">Loading characters...</div>
                {:else if characters.length === 0}
                  <div class="empty-message">No characters found</div>
                {:else}
                  {#each characters as character (character.id)}
                    <CharacterCard item={character} booksCount={character.booksCount || 0} />
                  {/each}
                {/if}
              {:else if libraryView === "children"}
                {#if loading}
                  <div class="loading-message">Loading children...</div>
                {:else if error}
                  <div class="error-message">{error}</div>
                {:else if childProfiles.length === 0}
                  <div class="empty-message">No children found</div>
                {:else}
                  {#each childProfiles as child (child.id)}
                    <ChildCard item={child} />
                  {/each}
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
        
        <!-- Reading Stats Component -->
        {#if activeMenu === "home" && libraryView === "all"}
        <div class="reading-stats-container">
          <div class="reading-stats-header-section">
            <div class="reading-stats-header-wrapper">
              <div class="reading-stats-title-section">
                <div class="reading-stats-title">
                  <span class="reading-stats-title-text">Your Reading Stats </span>
                </div>
              </div>
            </div>
            <div class="reading-stats-divider"></div>
          </div>
          <div class="reading-stats-cards">
            <div class="reading-stats-card-story">
              <div class="reading-stats-card-header">
                <div class="reading-stats-icon-wrapper">
                  <div class="reading-stats-icon-bg">
                    <div class="reading-stats-book-icon">
                      <img src={BookIcon} alt="Book" class="book-icon" />
                    </div>
                    <div class="reading-stats-icon-glow"></div>
                  </div>
                  <div class="reading-stats-card-title-group">
                    <div class="reading-stats-card-label">
                      <span class="reading-stats-card-label-text">Story Adventure</span>
                    </div>
                    <div class="reading-stats-card-value">
                      <span class="reading-stats-card-value-text">8 Books</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="reading-stats-card-divider"></div>
              <div class="reading-stats-stat-item">
                <div class="reading-stats-stat-icon">
                  <img src={bookopen} alt="Book Open" />
                </div>
                <div class="reading-stats-stat-text">
                  <span class="reading-stats-stat-label">Total reading time: </span>
                  <span class="reading-stats-stat-value">1h 23m </span>
                </div>
              </div>
              <div class="reading-stats-stat-item">
                <div class="reading-stats-stat-icon">
                  <img src={speakerIcon} alt="Audio" />
                </div>
                <div class="reading-stats-stat-text">
                  <span class="reading-stats-stat-label">Audio listened: </span>
                  <span class="reading-stats-stat-value">4 Books</span>
                </div>
              </div>
            </div>
            <div class="reading-stats-card-search">
              <div class="reading-stats-card-header">
                <div class="reading-stats-icon-wrapper">
                  <div class="reading-stats-icon-bg">
                    <div class="reading-stats-book-icon">
                      <img src={BookIcon} alt="Book" />
                    </div>
                    <div class="reading-stats-icon-glow"></div>
                  </div>
                  <div class="reading-stats-card-title-group">
                    <div class="reading-stats-card-label">
                      <span class="reading-stats-card-label-text">Interactive Search</span>
                    </div>
                    <div class="reading-stats-card-value">
                      <span class="reading-stats-card-value-text">3 Books</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="reading-stats-card-divider"></div>
              <div class="reading-stats-stat-item">
                <div class="reading-stats-stat-icon">
                  <img src={bookopen} alt="Book Open" />
                </div>
                <div class="reading-stats-stat-text">
                  <span class="reading-stats-stat-label">Total reading time: </span>
                  <span class="reading-stats-stat-value">2h 23m </span>
                </div>
              </div>
              <div class="reading-stats-stat-item">
                <div class="reading-stats-stat-icon">
                  <img src={starIcon} alt="Star" />
                </div>
                <div class="reading-stats-stat-text">
                  <span class="reading-stats-stat-label">Average stars : </span>
                  <span class="reading-stats-stat-value">2,3/5</span>
                </div>
              </div>
              <div class="reading-stats-stat-item">
                <div class="reading-stats-stat-icon">
                  <img src={starIcon} alt="Star" />
                </div>
                <div class="reading-stats-stat-text">
                  <span class="reading-stats-stat-label">Average Hints : </span>
                  <span class="reading-stats-stat-value">1.2 Per Scene</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/if}
      {#if activeMenu === "child-profiles"}
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
              <div
                class="frame-1410103868"
                on:click={handleAddChildren}
                on:keydown={(e) => e.key === "Enter" && handleAddChildren()}
                role="button"
                tabindex="0"
              >
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
                  <button
                    class="retry-button"
                    on:click={() => $user?.id && fetchChildProfiles($user.id)}
                  >
                    Try Again
                  </button>
                </div>
              {:else if childProfiles.length === 0}
                <div class="empty-state">
                  <p class="empty-text">No child profiles found.</p>
                  <p class="empty-subtext">
                    Add your first child profile to get started!
                  </p>
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
                    on:editChild={() =>
                      goto(
                        `/create-child-profile/edit?id=${c.id || ""}&name=${encodeURIComponent(c.name)}`,
                      )}
                  />
                {/each}
              {/if}
            </div>
          </div>
        </div>
      {/if}
      
      {#if activeMenu === "story-library"}
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
                  <button
                    class="retry-button"
                    on:click={() => $user?.id && fetchStories($user.id)}
                  >
                    Try Again
                  </button>
                </div>
              {:else if stories.length === 0}
                <div class="empty-state">
                  <p class="empty-text">No stories found.</p>
                  <p class="empty-subtext">
                    Create your first story to get started!
                  </p>
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
          </div>
        </div>
      {/if}
      
      {#if activeMenu === "gift-tracking"}
        <GiftTrackingComponent {gifts} {loadingGifts} {giftsError} />
      {/if}
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
    on:keydown={(e) => e.key === "Escape" && handleGiftModalClose()}
    tabindex="-1"
  >
    <section class="modal-container" role="document">
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
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown.active .home_span {
    color: white;
    font-weight: 600;
  }

  .childprofiles_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_01.active .childprofiles_span,
  .parent-menu-dropdown_02.active .childprofiles_span,
  .parent-menu-dropdown_03.active .childprofiles_span {
    color: white;
    font-weight: 600;
  }

  .storylibrary_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_02.active .storylibrary_span {
    color: white;
    font-weight: 600;
  }

  .gifttracking_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    transition: color 0.2s ease;
  }

  .parent-menu-dropdown_03.active .gifttracking_span {
    color: white;
    font-weight: 600;
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
    width: max-content;
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
    width: max-content;
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

  .house img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown.active .house img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .baby {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .baby img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_01.active .baby img,
  .parent-menu-dropdown_02.active .baby img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .bookopen {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_02.active .bookopen img {
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .gift {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .gift img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .parent-menu-dropdown_03.active .gift img {
    opacity: 1;
    filter: brightness(0) invert(1);
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .parent-menu-dropdown {
    width: 236px;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .parent-menu-dropdown.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_01 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_01.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_02 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_02.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_03 {
    width: 236px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .parent-menu-dropdown_03.active {
    position: relative;
    background: #438BFF;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -6px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
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

  .mobile-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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

  .yourlibrary_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.8px;
    word-wrap: break-word;
  }

  .your-library {
    text-align: center;
  }

  .allbooks_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .characters_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .children_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -49px;
    top: 20px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .newbook_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .new-book {
    text-align: center;
  }

  .rectangle-263 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .allformats_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .all-formats {
    text-align: center;
  }

  .vector_01 {
    width: 16.5px;
    height: 9px;
    left: 3.75px;
    top: 8.25px;
    position: absolute;
    background: black;
  }

  .allchildren_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .all-children {
    text-align: center;
  }

  .vector_02 {
    width: 16.5px;
    height: 9px;
    left: 3.75px;
    top: 8.25px;
    position: absolute;
    background: black;
  }

  .allstatus_span {
    color: black;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .all-status {
    text-align: center;
  }

  .vector_03 {
    width: 16.5px;
    height: 9px;
    left: 3.75px;
    top: 8.25px;
    position: absolute;
    background: black;
  }

  .vector_04 {
    width: 11px;
    height: 13px;
    left: 2.5px;
    top: 1.5px;
    position: absolute;
    background: #438bff;
  }

  .story_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story {
    text-align: center;
  }

  .emmasmagicalforestadventure_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure {
    align-self: stretch;
  }

  .createddate_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f1302024_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .createby_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse {
    width: 20px;
    height: 20px;
    background: #727272;
    border-radius: 9999px;
  }

  .mazda_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .vector_05 {
    width: 13px;
    height: 9.5px;
    left: 1.75px;
    top: 3.75px;
    position: absolute;
    background: #40c4aa;
  }

  .completed_span {
    color: #40c4aa;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .completed {
    text-align: center;
  }

  .rectangle-263_01 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: -18px;
    top: 15px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .vector_06 {
    width: 15px;
    height: 10px;
    left: 0.5px;
    top: 3px;
    position: absolute;
    background: white;
  }

  .viewbook_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .view-book {
    text-align: center;
  }

  .vector_07 {
    width: 13.5px;
    height: 13.5px;
    left: 2.25px;
    top: 1.69px;
    position: absolute;
    background: black;
  }

  .vector_08 {
    width: 13.5px;
    height: 15.75px;
    left: 1.68px;
    top: 1.12px;
    position: absolute;
    background: black;
  }

  .vector_09 {
    width: 11px;
    height: 13px;
    left: 2.5px;
    top: 1.5px;
    position: absolute;
    background: #438bff;
  }

  .story_01_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story_01 {
    text-align: center;
  }

  .thegreatadventuremarkie_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .the-great-adventure-markie {
    align-self: stretch;
  }

  .createddate_01_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f1302024_01_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .createby_01_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse_01 {
    width: 20px;
    height: 20px;
    background: #727272;
    border-radius: 9999px;
  }

  .mazda_01_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status_01_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .vector_10 {
    width: 14.5px;
    height: 13px;
    left: 0.75px;
    top: 1.25px;
    position: absolute;
    background: #df1c41;
  }

  .failed_span {
    color: #df1c41;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .failed {
    text-align: center;
  }

  .rectangle-263_02 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415_02 {
    width: 248px;
    height: 114px;
    left: -18px;
    top: 15px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .vector_11 {
    width: 12px;
    height: 11.76px;
    left: 2px;
    top: 2.12px;
    position: absolute;
    background: white;
  }

  .re-generatebook_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .re-generate-book {
    text-align: center;
  }

  .vector_12 {
    width: 13.5px;
    height: 13.5px;
    left: 2.25px;
    top: 1.69px;
    position: absolute;
    background: black;
  }

  .vector_13 {
    width: 13.5px;
    height: 15.75px;
    left: 1.68px;
    top: 1.12px;
    position: absolute;
    background: black;
  }

  .vector_14 {
    width: 13.01px;
    height: 13.01px;
    left: 1.48px;
    top: 1.48px;
    position: absolute;
    background: #438bff;
  }

  .search_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .search {
    text-align: center;
  }

  .whereisluna_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .where-is-luna {
    align-self: stretch;
  }

  .createddate_02_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f1302024_02_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .createby_02_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse_02 {
    width: 20px;
    height: 20px;
    background: #727272;
    border-radius: 9999px;
  }

  .mazda_02_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status_02_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .vector_15 {
    width: 13.5px;
    height: 13.5px;
    left: 1.25px;
    top: 1.25px;
    position: absolute;
    background: #438bff;
  }

  .generating45_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .generating-45 {
    text-align: center;
  }

  .rectangle-263_03 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415_03 {
    width: 248px;
    height: 114px;
    left: -18px;
    top: 15px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .vector_16 {
    width: 15px;
    height: 10px;
    left: 0.5px;
    top: 3px;
    position: absolute;
    background: #818898;
  }

  .viewbook_01_span {
    color: #818898;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .view-book_01 {
    text-align: center;
  }

  .vector_17 {
    width: 13.5px;
    height: 13.5px;
    left: 2.25px;
    top: 1.69px;
    position: absolute;
    background: black;
  }

  .vector_18 {
    width: 13.5px;
    height: 15.75px;
    left: 1.68px;
    top: 1.12px;
    position: absolute;
    background: black;
  }

  .vector_19 {
    width: 11px;
    height: 13px;
    left: 2.5px;
    top: 1.5px;
    position: absolute;
    background: #438bff;
  }

  .story_02_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story_02 {
    text-align: center;
  }

  .emmasmagicalforestadventure_01_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure_01 {
    align-self: stretch;
  }

  .createddate_03_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f1302024_03_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .createby_03_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse_03 {
    width: 20px;
    height: 20px;
    background: #727272;
    border-radius: 9999px;
  }

  .mazda_03_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status_03_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .vector_20 {
    width: 14.5px;
    height: 10.5px;
    left: 0.75px;
    top: 2.75px;
    position: absolute;
    background: #ffbe4c;
  }

  .draft_span {
    color: #ffbe4c;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .draft {
    text-align: center;
  }

  .rectangle-263_04 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415_04 {
    width: 248px;
    height: 114px;
    left: -18px;
    top: 15px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .vector_21 {
    width: 12.5px;
    height: 12.5px;
    left: 2px;
    top: 1.5px;
    position: absolute;
    background: white;
  }

  .editbook_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .edit-book {
    text-align: center;
  }

  .vector_22 {
    width: 13.5px;
    height: 13.5px;
    left: 2.25px;
    top: 1.69px;
    position: absolute;
    background: black;
  }

  .vector_23 {
    width: 13.5px;
    height: 15.75px;
    left: 1.68px;
    top: 1.12px;
    position: absolute;
    background: black;
  }

  .button {
    padding-left: 22px;
    padding-right: 22px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  /* Library switch active/idle styles */
  .switch .button,
  .switch .button_01,
  .switch .button_02 {
    border-radius: 12px;
    cursor: pointer;
  }
  .switch .button.active,
  .switch .button_01.active,
  .switch .button_02.active {
    background: white;
  }
  /* Make only the active tab text dark */
  .switch .button .allbooks_span,
  .switch .button_01 .characters_span,
  .switch .button_02 .children_span {
    color: #727272;
  }
  .switch .button.active .allbooks_span,
  .switch .button_01.active .characters_span,
  .switch .button_02.active .children_span {
    color: #141414;
  }

  .button_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .sub-menu {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .form {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu_01 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .sub-menu_02 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124_01 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .form_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu_03 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .sub-menu_04 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124_02 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .form_02 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu_05 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .sub-menu_06 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124_03 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .form_03 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu_07 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .plus {
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

  .caretdown_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .caretdown_02 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .book {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .check {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .downloadsimple {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .book_01 {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .warning {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .arrowsclockwise {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .downloadsimple_01 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork_01 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .magnifyingglass {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .spinner {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .eye_01 {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    /* margin: auto; */
  }

  .downloadsimple_02 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork_02 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .book_02 {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .archive {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .pencilsimple {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .downloadsimple_03 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .sharenetwork_03 {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
  }

  .switch {
    width: 371px;
    padding: 4px;
    background: #eceff3;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410103850 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103850_01 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103850_02 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103850_03 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410104245 {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    cursor: pointer;
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
    gap: 8px;
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
    gap: 8px;
    display: flex;
  }

  .dropdown_03 {
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
    gap: 8px;
    display: flex;
  }

  .frame-1410103869 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410103869_01 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #effefa;
    border-radius: 12px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104245_01 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_03 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_04 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103870 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410103870_01 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #fff0f3;
    border-radius: 12px;
    outline: 1px #df1c41 solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104245_02 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_05 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_06 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103870_02 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104162 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #eef6ff;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104245_03 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #dfe1e7;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_07 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_08 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103869_02 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410103870_03 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #fff6e0;
    border-radius: 12px;
    outline: 1px #ffbe4c solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104245_04 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_09 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_10 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-2147227614 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104125_01 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104125_02 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104125_03 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .dropdown {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .image {
    align-self: stretch;
    height: 400px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/321x400);
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104126 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104166 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .image_01 {
    align-self: stretch;
    height: 400px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/321x400);
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104126_01 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104166_01 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .image_02 {
    align-self: stretch;
    height: 400px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/321x400);
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104126_02 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104165 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .image_03 {
    align-self: stretch;
    height: 400px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/321x400);
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104126_03 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104166_03 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .frame-2147227616 {
    align-self: stretch;
    justify-content: space-between;
    align-items: flex-end;
    display: inline-flex;
  }

  .frame-1410103899 {
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
  }

  .frame-1410104158 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104158_01 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104166_02 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104158_02 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-2147227615 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .cardd {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .cardd_01 {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .cardd_02 {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .cardd_03 {
    width: 345.33px;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103894 {
    align-self: stretch;
    gap: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .loading-message,
  .error-message,
  .empty-message {
    grid-column: 1 / -1;
    padding: 32px;
    text-align: center;
    color: #666;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
  }

  .error-message {
    color: #d32f2f;
  }

  .empty-message {
    color: #999;
  }

  .frame-1410103894_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410104154 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-2147227616_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410104150 {
    width: 100%;
    height: 100%;
    padding: 32px;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .vector {
    width: 15px;
    height: 15.62px;
    left: 3.12px;
    top: 1.88px;
    position: absolute;
    background: #438bff;
  }

  .fstorycreditsleft_span {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    word-wrap: break-word;
  }

  .books {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .frame-2147227644 {
    padding: 8px;
    background: white;
    border-radius: 4px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .chips {
    width: 100%;
    height: 100%;
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 4px;
    padding-right: 10px;
    background: #eef6ff;
    border-radius: 8px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  /* Reading Stats Component Styles */
  .reading-stats-title-text {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-title {
    text-align: center;
  }

  .reading-stats-divider {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .reading-stats-book-icon {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reading-stats-book-icon img {
    width: 100%;
    filter: brightness(0) invert(1);
  }

  .reading-stats-icon-glow {
    width: 248px;
    height: 114px;
    left: -96px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
    pointer-events: none;
  }

  .reading-stats-card-label-text {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .reading-stats-card-label {
    align-self: stretch;
  }

  .reading-stats-card-value-text {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-card-value {
    align-self: stretch;
  }

  .reading-stats-card-divider {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .reading-stats-stat-icon {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reading-stats-stat-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* BookOpen icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Book Open"] {
    width: 28px;
    height: 24px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  /* Speaker icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Audio"] {
    width: 26px;
    height: 28px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  /* Star icon should be gray */
  .reading-stats-stat-item .reading-stats-stat-icon img[alt="Star"] {
    width: 28px;
    height: 27px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .reading-stats-stat-label {
    color: #727272;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-stat-value {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .reading-stats-stat-text {
    text-align: center;
  }

  .reading-stats-card-title-group {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .reading-stats-icon-wrapper {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-icon-bg {
    width: 56px;
    height: 56px;
    padding: 7px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .reading-stats-stat-item {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-title-section {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-header-wrapper {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-header-section {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .reading-stats-card-header {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-card-story {
    flex: 1 1 0;
    height: 231px;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-card-search {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .reading-stats-cards {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .reading-stats-container {
    width: 100%;
    height: 100%;
    padding: 32px;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }
</style>
