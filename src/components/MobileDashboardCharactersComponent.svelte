<script lang="ts">
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import whitePlus from "../assets/Plus.svg";
  import UserCircle from "../assets/UserCircle.svg";
  import Sparkle from "../assets/Sparkle.svg";
  import BookBookmark from "../assets/BookBookmark.svg";
  import eye from "../assets/BlueEye.svg";

  export let characters: any[] = [];
  export let loading: boolean = false;
  export let error: string = "";

  const dispatch = createEventDispatcher();

  // Sample character data for demo - this would come from props in real implementation
  let sampleCharacters = [
    {
      id: "char_1",
      character_name: "Luna",
      character_type: "person",
      special_ability: "Can Fly",
      booksCount: 2,
      original_image_url: "https://placehold.co/345x310"
    },
    {
      id: "char_2", 
      character_name: "Sparkle",
      character_type: "magical_creature",
      special_ability: "Can Heal",
      booksCount: 1,
      original_image_url: "https://placehold.co/345x310"
    },
    {
      id: "char_3",
      character_name: "Captain Zoom", 
      character_type: "animal",
      special_ability: "Super Strength",
      booksCount: 2,
      original_image_url: "https://placehold.co/345x310"
    }
  ];

  // Use sample data if no characters provided
  $: displayCharacters = characters.length > 0 ? characters : sampleCharacters;

  // Filter states
  let selectedFilter = "all";
  let searchQuery = "";

  // Filter options
  const filterOptions = [
    { value: "all", label: "All" },
    { value: "person", label: "Person" },
    { value: "animal", label: "Animal" },
    { value: "magical_creature", label: "Magical" }
  ];

  // Filtered characters based on search and filter
  $: filteredCharacters = displayCharacters.filter(character => {
    const matchesSearch = character.character_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesFilter = selectedFilter === "all" || character.character_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Get character type display text
  function getCharacterTypeText(type: string): string {
    switch(type) {
      case "person": return "Person";
      case "animal": return "Animal"; 
      case "magical_creature": return "Magical Creature";
      default: return "Person";
    }
  }

  // Get books count text
  function getBooksCountText(count: number): string {
    if (count === 0) return "Used in 0 Books";
    if (count === 1) return "Used in 1 Books";
    return `Used in ${count} Books`;
  }

  // Handle character preview
  function handleCharacterPreview(character: any) {
    dispatch("characterPreview", character);
  }

  // Handle use in new book
  function handleUseInNewBook(character: any) {
    // Navigate to create story with character
    goto(`/create-character/1?character=${character.id}`);
  }

  // Handle view books
  function handleViewBooks(character: any) {
    handleCharacterPreview(character);
  }
</script>

<div class="sidebar">
  <div class="frame-1410104150_01">
    <div class="frame-1410104155_01">
      <div class="frame-1410104151_01">
        <div class="your-character-library_01">
          <span class="yourcharacterlibrary_01_span">Your Character Library</span>
        </div>
        <div class="select-a-character-to-use-in-your-new-book_01">
          <span class="selectacharactertouseinyournewbook_01_span">Select a character to use in your new book</span>
        </div>
      </div>

      <div 
        class="frame-1410104245_01" 
        on:click={() => goto("/create-character/1")}
        role="button"
        tabindex="0"
        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}
      >
        <div class="ellipse-1415_01"></div>
        <div class="plus_01">
          <img src={whitePlus} alt="plus" />
        </div>
        <div class="create-new_01">
          <span class="createnew_01_span">Create New</span>
        </div>
      </div>

      <div class="dropdown_01">
        {#each filterOptions as option}
          <div 
            class="dropdown_item" 
            class:active={selectedFilter === option.value}
            on:click={() => selectedFilter = option.value}
            role="button"
            tabindex="0"
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && (selectedFilter = option.value)}
          >
            <div class="filter-text">
              <span class="filter_span">{option.label}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="frame-1410103898_01">
      <div class="magnifyingglass_01">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <input 
        type="text" 
        placeholder="Search Character" 
        bind:value={searchQuery}
        class="search-input"
      />
    </div>
  </div>

  <div class="frame-1410103852">
    {#if loading}
      <div class="loading-message">Loading characters...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if filteredCharacters.length === 0}
      <div class="empty-message">No characters found</div>
    {:else}
      {#each filteredCharacters as character}
        <div class="card">
          <div class="frame-2147227584_01">
            <div class="frame-2147227588_01" style="background-image: url({character.original_image_url || 'https://placehold.co/345x310'})">
              <div class="frame-2147227590_01">
                <div class="book_01">
                  <img src={BookBookmark} alt="book" />
                </div>
                <div>
                  <span class="usedinbooks_span">{getBooksCountText(character.booksCount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="frame-10">
            <div class="frame-2147227582">
              <div class="heading">
                <div class="character-name">
                  <span class="charactername_span">{character.character_name || "Unnamed Character"}</span>
                </div>
                <div class="frame-2147227591">
                  <div class="icons">
                    <div class="usercircle">
                      <img src={UserCircle} alt="user" />
                    </div>
                    <div>
                      <span class="charactertype_span">{getCharacterTypeText(character.character_type || "person")}</span>
                    </div>
                  </div>
                  <div class="rectangle-261"></div>
                  <div class="icons_01">
                    <div class="sparkle">
                      <img src={Sparkle} alt="sparkle" />
                    </div>
                    <div>
                      <span class="ability_span">{character.special_ability || "No special ability"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rectangle-261_01"></div>
            </div>

            <div class="frame-2147227589">
              <div 
                class="frame-1410104245_02"
                on:click={() => handleUseInNewBook(character)}
                role="button"
                tabindex="0"
                on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleUseInNewBook(character)}
              >
                <div class="ellipse-1415_02"></div>
                <div class="use-in-new-book">
                  <span class="useinnewbook_span">Use in New Book</span>
                </div>
              </div>
              <div 
                class="button"
                on:click={() => handleViewBooks(character)}
                role="button"
                tabindex="0"
                on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleViewBooks(character)}
              >
                <div class="eye">
                  <img src={eye} alt="eye" />
                </div>
                <div class="view-books">
                  <span class="viewbooks_span">View Books</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .yourcharacterlibrary_01_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .your-character-library_01 {
    align-self: stretch;
  }

  .selectacharactertouseinyournewbook_01_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select-a-character-to-use-in-your-new-book_01 {
    align-self: stretch;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .plus_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .createnew_01_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .create-new_01 {
    text-align: center;
  }

  .filter_span {
    color: black;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .filter-text {
    text-align: center;
  }

  .dropdown_item {
    flex: 1 1 0;
    padding: 12px;
    border-radius: 9999px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dropdown_item.active {
    background: white;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
  }

  .dropdown_item:hover {
    background: #f5f5f5;
  }

  .dropdown_item.active:hover {
    background: white;
  }

  .magnifyingglass_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.40px;
  }

  .search-input::placeholder {
    color: #727272;
  }

  .usedinbooks_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .charactername_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .character-name {
    align-self: stretch;
  }

  .charactertype_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .rectangle-261 {
    width: 1px;
    align-self: stretch;
    background: #EDEDED;
  }

  .ability_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .rectangle-261_01 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .ellipse-1415_02 {
    width: 248px;
    height: 114px;
    left: 40px;
    top: 17px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .useinnewbook_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .use-in-new-book {
    text-align: center;
  }

  .viewbooks_span {
    color: #438BFF;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .view-books {
    text-align: center;
  }

  .frame-1410104151_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .dropdown_01 {
    align-self: stretch;
    padding: 4px;
    background: #F8FAFB;
    border-radius: 99px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104245_01 {
    align-self: stretch;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .frame-1410104245_01:hover {
    background: #3a7ae4;
  }

  .frame-1410103898_01 {
    align-self: stretch;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #F8FAFB;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-2147227590_01 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 10px;
    padding-right: 12px;
    left: 178px;
    top: 8px;
    position: absolute;
    background: white;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .book_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .icons {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .usercircle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .icons_01 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .sparkle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104245_02 {
    align-self: stretch;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .frame-1410104245_02:hover {
    background: #3a7ae4;
  }

  .eye {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .button {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button:hover {
    background: #d1f9fa;
    transform: translateY(1px);
    box-shadow: 0px 3px 0px #438BFF;
  }

  .frame-1410104155_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-2147227588_01 {
    flex: 1 1 0;
    height: 310px;
    position: relative;
    background: #F6F6F6;
    overflow: hidden;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
  }

  .frame-2147227591 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-2147227589 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410104150_01 {
    align-self: stretch;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .frame-2147227584_01 {
    align-self: stretch;
    padding: 8px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .heading {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-2147227582 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
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
    gap: 24px;
    display: flex;
  }

  .card {
    align-self: stretch;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
    transition: all 0.2s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .frame-1410103852 {
    width: 100%;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .sidebar {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .loading-message,
  .error-message,
  .empty-message {
    width: 100%;
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
</style>
