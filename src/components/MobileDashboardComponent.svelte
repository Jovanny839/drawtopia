<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fly } from "svelte/transition";
  import { browser } from "$app/environment";
  import { user } from "../lib/stores/auth";
  import {
    getChildProfiles,
    type ChildProfile,
  } from "../lib/database/childProfiles";
  import {
    getAllStoriesForParent,
    type Story,
  } from "../lib/database/stories";
  import { getGiftsForUser, type Gift } from "../lib/database/gifts";
  import drawtopialogo from "../assets/logo.png";
  import selectLayerIcon from "../assets/List.svg";
  import AccountDropdown from "./AccountDropdown.svelte";
  import MobileDashboardHomeComponent from "./MobileDashboardHomeComponent.svelte";
  import MobileStoryLibraryComponent from "./MobileStoryLibraryComponent.svelte";
  import MobileDashboardCharactersComponent from "./MobileDashboardCharactersComponent.svelte";
  import MobileDashboardChildProfile from "./MobileDashboardChildProfile.svelte";
  import MobileDashboardGift from "./MobileDashboardGift.svelte";
  import MobileBookPreview from "./MobileBookPreview.svelte";
  import house from "../assets/House.svg";
  import bookopen from "../assets/BookOpen.svg";
  import userSquare from "../assets/UserSquare.svg";
  import baby from "../assets/Baby.svg";
  import gift from "../assets/Gift.svg";
  import books from "../assets/Books.svg";

  let libraryView: "all" | "characters" | "children" = "all";
  let sidebarOpen = false;
  let activeMenu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking" = "home";
  let storyCredits: number = 3;
  
  // State for character preview
  let showCharacterPreview = false;
  let selectedCharacter: any = null;
  let characterBooks: any[] = [];

  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };

  const closeSidebar = () => {
    sidebarOpen = false;
  };
  const setLibraryView = (v: "all" | "characters" | "children") =>
    (libraryView = v);

  function handleMenuClick(menu: "home" | "story-library" | "characters" | "child-profiles" | "gift-tracking") {
    activeMenu = menu;
    // Close sidebar when menu item is selected
    sidebarOpen = false;
    // You can add navigation logic here if needed
    // Example: goto(`/${menu}`);
  }

  let childProfiles: any[] = [];
  let stories: any[] = [];
  let rawStories: any[] = [];
  let characters: any[] = [];
  let gifts: any[] = [];
  let loading = true;
  let loadingStories = true;
  let loadingGifts = true;
  let error = "";
  let storiesError = "";
  let giftsError = "";

  // Filter states for dashboard dropdowns
  let selectedFormat: string = "all";
  let selectedChild: string = "all";
  let selectedStatus: string = "all";

  // Format options
  $: formatOptions = [
    { value: "all", label: "All Formats" },
    { value: "story_adventure", label: "Story Adventure Mode" },
    { value: "interactive_search", label: "Interactive Search Mode" },
  ];

  // Children options - dynamically generated from childProfiles
  $: childrenOptions = [
    { value: "all", label: "All Children" },
    ...childProfiles.map((child) => ({
      value: child.id,
      label: child.name || child.first_name,
    })),
  ];

  // Status options
  $: statusOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "drafting", label: "Drafting" },
    { value: "generating", label: "Generating" },
    { value: "failed", label: "Failed" },
  ];

  // Filtered stories based on selected filters
  $: filteredStories = stories.filter((story) => {
    // Format filter
    if (selectedFormat !== "all") {
      const storyAdventureType = story.adventure_type as string;
      if (selectedFormat === "story_adventure" && storyAdventureType === 'interactive_search') return false;
      if (selectedFormat === "interactive_search" && storyAdventureType !== 'interactive_search') return false;
    }

    // Child filter
    if (selectedChild !== "all") {
      const storyChildId = story.child_profiles?.id || story.child_profile_id;
      if (storyChildId !== selectedChild) return false;
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (story.status !== selectedStatus) return false;
    }

    return true;
  });

  const storyThemes = [
    "Birthday", "Bedtime", "Holiday", "Adventure", "Magic", "Friendship",
    "Animals", "Space", "Ocean", "Forest", "Castle", "Dragon", "Princess",
    "Superhero", "Pirate", "Fairy Tale", "Mystery", "Science", "Sports", "Music",
  ];

  const getRandomStoryTheme = () => {
    return storyThemes[Math.floor(Math.random() * storyThemes.length)];
  };

  const formatAgeLabel = (ageGroup: string) => {
    return `${ageGroup} Years Old`;
  };

  const formatStoriesCreatedText = (firstName: string, ageGroup: string) => {
    return `${firstName} (Age ${ageGroup})`;
  };

  const fetchChildProfiles = async (userId: string) => {
    try {
      loading = true;
      error = "";
      const result = await getChildProfiles(userId);
      if (result.success && result.data) {
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
          .filter((profile: any) => profile.id);
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

  const fetchStories = async (userId: string) => {
    try {
      loadingStories = true;
      storiesError = "";
      stories = [];
      rawStories = [];
      characters = [];

      const result = await getAllStoriesForParent(userId);

      if (result.success && result.data) {
        const storiesData = Array.isArray(result.data) ? result.data : [];
        rawStories = storiesData;
        stories = storiesData
          .map(
            (story: Story & { child_profiles?: any, user_name?: string }, index: number) => ({
              id: story.id || `temp_story_${index}_${Date.now()}`,
              title: story.story_title || `${story.character_name}'s Adventure`,
              author: story.child_profiles?.first_name || "Unknown",
              status: story.status || "completed",
              story_cover: story.story_cover,
              createdDate: story.created_at
                ? new Date(story.created_at).toLocaleDateString("en-GB")
                : "Unknown",
              created_at: story.created_at,
              durationText: "8 min read",
              occasion: determineOccasion(
                story.adventure_type,
                story.story_world,
              ),
              imageUrl:
                story.original_image_url || "https://placehold.co/332x225",
              story_title: story.story_title,
              user_name: story.user_name,
              child_profiles: story.child_profiles,
              format: (story.adventure_type as string) === 'interactive_search' ? 'interactive' : 'story',
              adventure_type: story.adventure_type,
              child_profile_id: story.child_profile_id,
            }),
          )
          .filter((story) => story.id);

        extractCharacters(storiesData as any[]);
      } else {
        storiesError = result.error || "Failed to fetch stories";
        stories = [];
        rawStories = [];
        characters = [];
      }
    } catch (err) {
      console.error("[MobileDashboard] Error fetching stories:", err);
      storiesError = "An unexpected error occurred while fetching stories";
      stories = [];
      rawStories = [];
      characters = [];
    } finally {
      loadingStories = false;
    }
  };

  const extractCharacters = (storiesData: any[]) => {
    const characterMap = new Map();
    const characterBookCounts = new Map();
    let characterIdCounter = 1;

    storiesData.forEach((story: any) => {
      if (story.character_name) {
        const key = story.character_name.toLowerCase();
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
            booksCount: 0,
          });
        }
      }
    });

    characters = Array.from(characterMap.values())
      .map((char) => ({
        ...char,
        booksCount: characterBookCounts.get(char.character_name.toLowerCase()) || 0,
      }))
      .filter((char) => char.id);
  };

  const fetchGifts = async () => {
    try {
      loadingGifts = true;
      giftsError = "";
      const result = await getGiftsForUser();
      if (result.success && result.data) {
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

  const determineOccasion = (
    adventureType: string,
    storyWorld: string,
  ): string => {
    const occasionMap: { [key: string]: string } = {
      treasure_hunt: "Adventure",
      helping_friend: "Friendship",
      forest: "Nature",
      space: "Space Adventure",
      underwater: "Ocean Adventure",
    };
    return occasionMap[adventureType] || occasionMap[storyWorld] || "Adventure";
  };

  // Handle character preview
  const handleCharacterPreview = (event: CustomEvent) => {
    const character = event.detail;
    selectedCharacter = character;
    
    // Find all books featuring this character
    const characterName = character.character_name?.toLowerCase();
    if (characterName && rawStories) {
      characterBooks = rawStories.filter((story: any) => 
        story.character_name?.toLowerCase() === characterName
      );
    } else {
      characterBooks = [];
    }
    
    showCharacterPreview = true;
  };

  // Handle back from character preview
  const handleBackFromPreview = () => {
    showCharacterPreview = false;
    selectedCharacter = null;
    characterBooks = [];
  };

  // Handle book click from preview
  const handleBookClick = (event: CustomEvent) => {
    const book = event.detail;
    // TODO: Navigate to book view or handle book click
    console.log("Book clicked:", book);
  };

  // Handle view stories from child profile
  const handleViewStoriesFromChild = (event: CustomEvent) => {
    const { childId, childName } = event.detail;
    // Switch to story library and filter by the selected child
    activeMenu = "story-library";
    selectedChild = childId;
    console.log(`Viewing stories for child: ${childName} (ID: ${childId})`);
  };

  // Gift tracking event handlers
  const handleAddChildren = () => {
    // Navigate to add children page or open modal
    goto("/create-child-profile");
  };

  const handleResendLink = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Implement resend gift link functionality
    console.log(`Resending link for gift: ${giftId}`);
  };

  const handleViewGift = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Navigate to gift view page
    console.log(`Viewing gift: ${giftId}`);
  };

  const handleViewBook = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Navigate to book view page for completed gift
    console.log(`Viewing book for gift: ${giftId}`);
  };

  const handleSendThankYou = (event: CustomEvent) => {
    const { giftId } = event.detail;
    // TODO: Implement send thank you functionality
    console.log(`Sending thank you for gift: ${giftId}`);
  };

  onMount(() => {
    const unsubscribe = user.subscribe(($user: any) => {
      if ($user?.id) {
        fetchChildProfiles($user.id);
        fetchStories($user.id);
        fetchGifts();
      } else {
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
      }
    });
    return unsubscribe;
  });
</script>

<div class="dashboard-home">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="drawtopia">
        <img src={drawtopialogo} alt="drawtopialogo" class="drawtopia-logo" />
      </div>
    </div>
    <div class="frame-2147227655">
      <AccountDropdown />
      <div class="icon-list" on:click={toggleSidebar} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && toggleSidebar()}>
        <img src={selectLayerIcon} alt="selectLayerIcon" />
      </div>
    </div>
  </div>
  {#if showCharacterPreview && selectedCharacter}
    <MobileBookPreview
      characterName={selectedCharacter.character_name}
      characterData={selectedCharacter}
      books={characterBooks}
      on:bookClick={handleBookClick}
      on:back={handleBackFromPreview}
    />
  {:else if activeMenu === "story-library"}
    <MobileStoryLibraryComponent
      bind:libraryView
      {setLibraryView}
      {stories}
      {characters}
      {childProfiles}
      {loading}
      {loadingStories}
      {error}
      {storiesError}
      bind:selectedFormat
      bind:selectedChild
      bind:selectedStatus
      {formatOptions}
      {childrenOptions}
      {statusOptions}
      {filteredStories}
      {fetchStories}
      {fetchChildProfiles}
    />
  {:else if activeMenu === "characters"}
    <MobileDashboardCharactersComponent
      {characters}
      {loading}
      {error}
      on:characterPreview={handleCharacterPreview}
    />
  {:else if activeMenu === "child-profiles"}
    <MobileDashboardChildProfile
      {childProfiles}
      {fetchChildProfiles}
      on:viewStories={handleViewStoriesFromChild}
    />
  {:else if activeMenu === "gift-tracking"}
    <MobileDashboardGift
      {gifts}
      loading={loadingGifts}
      error={giftsError}
      on:addChildren={handleAddChildren}
      on:resendLink={handleResendLink}
      on:viewGift={handleViewGift}
      on:viewBook={handleViewBook}
      on:sendThankYou={handleSendThankYou}
    />
  {:else}
    <MobileDashboardHomeComponent
      bind:libraryView
      {setLibraryView}
      {stories}
      {characters}
      {childProfiles}
      {loading}
      {loadingStories}
      {error}
      {storiesError}
      bind:selectedFormat
      bind:selectedChild
      bind:selectedStatus
      {formatOptions}
      {childrenOptions}
      {statusOptions}
      {filteredStories}
      {fetchStories}
      {fetchChildProfiles}
      on:characterPreview={handleCharacterPreview}
    />
  {/if}

  <!-- Mobile Slide Sidebar -->
  {#if sidebarOpen}
    <div 
      class="sidebar-overlay" 
      on:click={closeSidebar} 
      role="button" 
      tabindex="0" 
      on:keydown={(e) => (e.key === "Enter" || e.key === " ") && closeSidebar()}
      transition:fly={{ x: 0, duration: 300 }}
    ></div>
    <div 
      class="mobile-sidebar-container"
      transition:fly={{ x: -280, duration: 300 }}
    >
      <!-- Integrated Mobile Sidebar Content -->
      <div class="frame-2147227656">
        <div class="content">
          <div class="sidebargrouping-label">
            <div><span class="menu_span">MENU</span></div>
          </div>
          <div class="menu_01">
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
                    <img src={house} alt="house" />
                  </div>
                  <div><span class="home_span">Home</span></div>
                </div>
              </div>
              {#if activeMenu === "home"}
                <div class="ellipse-1415_sidebar"></div>
              {/if}
            </div>
            <div 
              class="parent-menu-dropdown_01" 
              class:active={activeMenu === "story-library"}
              on:click={() => handleMenuClick("story-library")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("story-library")}
            >
              <div class="sidebar-menu-parent_01">
                <div class="title-icon_01">
                  <div class="bookopen_sidebar">
                    <img src={bookopen} alt="bookopen" />
                  </div>
                  <div><span class="storylibrary_span">Story Library</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_02" 
              class:active={activeMenu === "characters"}
              on:click={() => handleMenuClick("characters")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("characters")}
            >
              <div class="sidebar-menu-parent_02">
                <div class="title-icon_02">
                  <div class="usersquare">
                    <img src={userSquare} alt="characters" />
                  </div>
                  <div><span class="characters_span_sidebar">Characters</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_03" 
              class:active={activeMenu === "child-profiles"}
              on:click={() => handleMenuClick("child-profiles")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("child-profiles")}
            >
              <div class="sidebar-menu-parent_03">
                <div class="title-icon_03">
                  <div class="baby_sidebar">
                    <img src={baby} alt="baby" />
                  </div>
                  <div><span class="childprofiles_span">Child Profiles</span></div>
                </div>
              </div>
            </div>
            <div 
              class="parent-menu-dropdown_04" 
              class:active={activeMenu === "gift-tracking"}
              on:click={() => handleMenuClick("gift-tracking")}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && handleMenuClick("gift-tracking")}
            >
              <div class="sidebar-menu-parent_04">
                <div class="title-icon_04">
                  <div class="gift_sidebar">
                    <img src={gift} alt="gift" />
                  </div>
                  <div><span class="gifttracking_span">Gift Tracking</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chips">
          <div class="frame-2147227644">
            <div class="books_sidebar">
              <img src={books} alt="books" />
            </div>
          </div>
          <div><span class="fstorycreditsleft_span">{storyCredits} story credits left</span></div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .drawtopia {
    width: 170.15px;
    height: 31.8px;
    left: 0px;
    top: 0px;
    position: absolute;
  }

  .drawtopia-logo {
    width: 100%;
  }

  

  .vector_23 {
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

  .vector_24 {
    width: 13.5px;
    height: 13.5px;
    left: 2.25px;
    top: 1.69px;
    position: absolute;
    background: black;
  }

  .vector_25 {
    width: 13.5px;
    height: 15.75px;
    left: 1.68px;
    top: 1.12px;
    position: absolute;
    background: black;
  }

  .yourreadingstats_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .your-reading-stats {
    text-align: center;
  }

  .rectangle-263_05 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .vector_26 {
    width: 16.5px;
    height: 19.5px;
    left: 3.75px;
    top: 2.25px;
    position: absolute;
    background: white;
  }

  .ellipse-1415_05 {
    width: 248px;
    height: 114px;
    left: -102px;
    top: 3px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .storyadventure_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story-adventure {
    align-self: stretch;
  }

  .fbooks_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .text-8-books {
    align-self: stretch;
  }

  .rectangle-263_06 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .vector_27 {
    width: 21px;
    height: 18px;
    left: 1.5px;
    top: 4.5px;
    position: absolute;
    background: #727272;
  }

  .totalreadingtime1h23m_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .totalreadingtime1h23m_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .total-reading-time-1h-23m {
    text-align: center;
  }

  .vector_28 {
    width: 19.5px;
    height: 21px;
    left: 2.25px;
    top: 2.25px;
    position: absolute;
    background: #727272;
  }

  .audiolistened4books_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .audiolistened4books_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .audio-listened-4-books {
    text-align: center;
  }

  .vector_29 {
    width: 16.5px;
    height: 19.5px;
    left: 3.75px;
    top: 2.25px;
    position: absolute;
    background: white;
  }

  .ellipse-1415_06 {
    width: 248px;
    height: 114px;
    left: -102px;
    top: 3px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .interactivesearch_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .interactive-search {
    align-self: stretch;
  }

  .fbooks_span_01 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .text-3-books {
    align-self: stretch;
  }

  .rectangle-263_07 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .vector_30 {
    width: 21px;
    height: 18px;
    left: 1.5px;
    top: 4.5px;
    position: absolute;
    background: #727272;
  }

  .totalreadingtime2h23m_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .totalreadingtime2h23m_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .total-reading-time-2h-23m {
    text-align: center;
  }

  .vector_31 {
    width: 21px;
    height: 20.25px;
    left: 1.5px;
    top: 1.5px;
    position: absolute;
    background: #727272;
  }

  .averagestars235_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .averagestars235_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .average-stars-235 {
    text-align: center;
  }

  .vector_32 {
    width: 21px;
    height: 20.25px;
    left: 1.5px;
    top: 1.5px;
    position: absolute;
    background: #727272;
  }

  .averagehints12perscene_span_01 {
    color: #727272;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .averagehints12perscene_span_02 {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .average-hints-12-per-scene {
    text-align: center;
  }

  .rectangle-42 {
    align-self: stretch;
    height: 1px;
    border: 1px #dfe1e7 solid;
    margin-bottom: 24px;
  }

  .rectangle-43 {
    align-self: stretch;
    height: 1px;
    border: 2px #dfe1e7 solid;
  }

  .button {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: transparent;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_01 {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: transparent;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button_02 {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: transparent;
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

  .frame-2147227614_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104098 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104098_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
  }

  .logo-text-full {
    width: 170.15px;
    height: 31.8px;
    position: relative;
  }


  .icon-list {
    width: 32px;
    height: 32px;
    position: relative;
  }

  .plus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .caretdown_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .caretdown_02 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .caretdown_03 {
    width: 20px;
    height: 20px;
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

  .book_03 {
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

  .headset {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .book_04 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .switch {
    padding: 4px;
    background: #eceff3;
    border-radius: 8px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    display: inline-flex;
    width: 100%;
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

  .frame-2147227616_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }


  .frame-1410104245 {
    align-self: stretch;
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
    display: inline-flex;
  }

  .dropdown_01 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .dropdown_02 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .dropdown_03 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
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

  .check_01 {
    padding: 10px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-2147227619 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227620 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .check_02 {
    padding: 10px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-2147227619_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227620_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227621 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227614 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
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

  .frame-2147227615_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-2147227655 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .dropdown {
    width: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .filter-select-wrapper {
    width: 100%;
  }

  .image {
    align-self: stretch;
    height: 350px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/337x350);
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
    height: 350px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/337x350);
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
    height: 350px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-image: url(https://placehold.co/337x350);
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
    background-image: url(https://placehold.co/337x400);
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

  .frame-2147227618 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227618_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227616 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .navbar {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103899 {
    width: 100%;
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

  .frame-1410104092 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104095 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 12px;
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
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .cardd_01 {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .cardd_02 {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .cardd_03 {
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

  .frame-2147227617 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .frame-1410103894 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410103894_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }

  .frame-1410104151 {
    align-self: stretch;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
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
    align-self: stretch;
    background: white;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .sidebar {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .dashboard-home {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-left: 16px;
    padding-right: 16px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
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
    width: 100%;
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

  /* Active state for library view buttons */
  .switch .button.active,
  .switch .button_01.active,
  .switch .button_02.active {
    background: white;
  }

  .switch .button.active .allbooks_span,
  .switch .button_01.active .characters_span,
  .switch .button_02.active .children_span {
    color: #141414;
    font-weight: 600;
  }

  /* Mobile Sidebar Styles */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.3s ease-out;
  }

  .mobile-sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    max-width: 85vw;
    background: white;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .icon-list {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .icon-list:hover {
    opacity: 0.7;
  }

  .icon-list:active {
    opacity: 0.5;
  }

  /* Integrated Mobile Sidebar Styles */
  .menu_span {
    color: var(--Gray-gray-400, #90A1B9);
    font-size: 12px;
    font-family: DM Sans;
    font-weight: 500;
    text-transform: uppercase;
    line-height: 16.80px;
    letter-spacing: 1.20px;
    word-wrap: break-word;
  }

  .home_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .ellipse-1415_sidebar {
    width: 248px;
    height: 114px;
    left: 89px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .storylibrary_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .characters_span_sidebar {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .childprofiles_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .gifttracking_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .fstorycreditsleft_span {
    color: #438BFF;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    word-wrap: break-word;
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

  .house {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .house img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .bookopen_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bookopen_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .usersquare {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .usersquare img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .baby_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .baby_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .gift_sidebar {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .gift_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .books_sidebar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .books_sidebar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

  .title-icon_04 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-2147227644 {
    padding: 8px;
    background: white;
    border-radius: 4px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
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

  .sidebar-menu-parent_04 {
    align-self: stretch;
    padding: 12px;
    border-radius: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .chips {
    align-self: stretch;
    padding-top: 4px;
    padding-bottom: 4px;
    padding-left: 4px;
    padding-right: 10px;
    background: #EEF6FF;
    border-radius: 8px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .parent-menu-dropdown {
    align-self: stretch;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown:not(.active) {
    background: transparent;
  }

  .parent-menu-dropdown:not(.active) .home_span {
    color: #727272;
  }

  .parent-menu-dropdown_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_01.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown.active .house img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_01.active .storylibrary_span {
    color: white;
  }

  .parent-menu-dropdown_01.active .bookopen_sidebar img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_02.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_02.active .characters_span_sidebar {
    color: white;
  }

  .parent-menu-dropdown_02.active .usersquare img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_03.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_03.active .childprofiles_span {
    color: white;
  }

  .parent-menu-dropdown_03.active .baby_sidebar img {
    filter: brightness(0) invert(1);
  }

  .parent-menu-dropdown_04 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .parent-menu-dropdown_04.active {
    background: #438BFF;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .parent-menu-dropdown_04.active .gifttracking_span {
    color: white;
  }

  .parent-menu-dropdown_04.active .gift_sidebar img {
    filter: brightness(0) invert(1);
  }

  .menu_01 {
    align-self: stretch;
    padding: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .content {
    align-self: stretch;
    padding-top: 16px;
    padding-bottom: 16px;
    background: var(--White-bg-white, white);
    overflow: hidden;
    border-right: 1px var(--Gray-stk-gray-200, #E2E8F0) solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-2147227656 {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    display: inline-flex;
  }
</style>
