<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "../lib/stores/auth";
  import BookCard from "./BookCard.svelte";
  import CharacterCard from "./CharacterCard.svelte";
  import ChildCard from "./ChildCard.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import whitePlus from "../assets/Plus.svg";
  import userCirclePlus from "../assets/UserCirclePlus.svg";
  import bookIcon from "../assets/Book.svg";
  import bookOpen from "../assets/BookOpen.svg";
  import headset from "../assets/OutlineHeadset.svg";
  import starIcon from "../assets/OutlineStar.svg";

  export let libraryView: "all" | "characters" | "children" = "all";
  export let setLibraryView: (v: "all" | "characters" | "children") => void;
  export let stories: any[] = [];
  export let characters: any[] = [];
  export let childProfiles: any[] = [];
  export let loading: boolean = false;
  export let loadingStories: boolean = false;
  export let error: string = "";
  export let storiesError: string = "";
  export let selectedFormat: string = "all";
  export let selectedChild: string = "all";
  export let selectedStatus: string = "all";
  export let formatOptions: any[] = [];
  export let childrenOptions: any[] = [];
  export let statusOptions: any[] = [];
  export let filteredStories: any[] = [];
  export let fetchStories: (userId: string) => Promise<void>;
  export let fetchChildProfiles: (userId: string) => Promise<void>;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // Handle character preview event
  function handleCharacterPreview(event: CustomEvent) {
    dispatch("characterPreview", event.detail);
  }
</script>

<div class="sidebar">
  <div class="frame-1410104150">
    <div class="frame-2147227615">
      <div class="frame-2147227616">
        <div class="frame-2147227614">
          <div class="your-library">
            <span class="yourlibrary_span">Your Library</span>
          </div>
          <div class="switch">
            <div 
              class="button" 
              class:active={libraryView === "all"} 
              on:click={() => setLibraryView("all")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("all")}
            >
              <div><span class="allbooks_span">All Books</span></div>
            </div>
            <div 
              class="button" 
              class:active={libraryView === "characters"} 
              on:click={() => setLibraryView("characters")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("characters")}
            >
              <div><span class="characters_span">Characters</span></div>
            </div>
            <div 
              class="button" 
              class:active={libraryView === "children"} 
              on:click={() => setLibraryView("children")}
              role="button"
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && setLibraryView("children")}
            >
              <div><span class="children_span">Children</span></div>
            </div>
          </div>
        </div>
        <div 
          class="frame-1410104245" 
          on:click={() => goto("/create-character/1")} 
          role="button" 
          tabindex="0" 
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/create-character/1")}
        >
          <div class="ellipse-1415"></div>
          <img src={whitePlus} alt="whitePlus" />
          <div class="new-book">
            <span class="newbook_span">New Book</span>
          </div>
        </div>
      </div>
      <div class="rectangle-263"></div>
      <div class="frame-1410103899">
        <div class="dropdown">
          <div class="filter-select-wrapper">
            <AdvancedSelect
              options={formatOptions}
              bind:selectedOption={selectedFormat}
              placeholder="All Formats"
              id="format-select"
            />
          </div>
          <div class="filter-select-wrapper">
            <AdvancedSelect
              options={childrenOptions}
              bind:selectedOption={selectedChild}
              placeholder="All Children"
              id="child-select"
            />
          </div>
          <div class="filter-select-wrapper">
            <AdvancedSelect
              options={statusOptions}
              bind:selectedOption={selectedStatus}
              placeholder="All Status"
              id="status-select"
            />
          </div>
        </div>
      </div>
      {#if libraryView === "children"}
        <div 
          class="frame-1410104245_01" 
          on:click={() => goto("/create-child-profile")} 
          role="button" 
          tabindex="0" 
          on:keydown={(e) => (e.key === "Enter" || e.key === " ") && goto("/child-profiles/create")}
        >
          <div class="ellipse-1415_01"></div>
          <img src={userCirclePlus} alt="userCirclePlus" class="usercircleplus" />
          <div class="add-children">
            <span class="addchildren_span">Add Children</span>
          </div>
        </div>
      {/if}
    </div>
    <div class="frame-1410104154">
      <div class="frame-1410103894">
        {#if libraryView === "all"}
          {#if loadingStories}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading books...</p>
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
          {:else if filteredStories.length === 0}
            <div class="empty-state">
              <p class="empty-text">No books found</p>
              <p class="empty-subtext">Create your first story to get started!</p>
            </div>
          {:else}
            {#each filteredStories as story (story.id)}
              <BookCard item={story} />
            {/each}
          {/if}
        {:else if libraryView === "characters"}
          {#if loadingStories}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading characters...</p>
            </div>
          {:else if characters.length === 0}
            <div class="empty-state">
              <p class="empty-text">No characters found</p>
              <p class="empty-subtext">Create your first story to see characters!</p>
            </div>
          {:else}
            {#each characters as character (character.id)}
              <CharacterCard 
                item={character} 
                booksCount={character.booksCount || 0}
                on:preview={handleCharacterPreview}
              />
            {/each}
          {/if}
        {:else if libraryView === "children"}
          {#if loading}
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p class="loading-text">Loading children...</p>
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
              <p class="empty-text">No children found</p>
              <p class="empty-subtext">Add your first child profile to get started!</p>
            </div>
          {:else}
            {#each childProfiles as child (child.id)}
              <ChildCard item={child} />
            {/each}
          {/if}
        {/if}
      </div>
    </div>
  </div>
  <div class="frame-1410104151">
    <div class="frame-2147227615_01">
      <div class="frame-2147227616_02">
        <div class="frame-2147227614_01">
          <div class="your-reading-stats">
            <span class="yourreadingstats_span">Your Reading Stats </span>
          </div>
        </div>
      </div>
      <div class="rectangle-263_05"></div>
    </div>
    <div class="frame-2147227617">
      <div class="frame-1410104092">
        <div class="frame-2147227618">
          <div class="check_01">
            <div class="book_03">
              <img src={bookIcon} alt="bookIcon">
            </div>
            <div class="ellipse-1415_05"></div>
          </div>
          <div class="frame-1410104098">
            <div class="story-adventure">
              <span class="storyadventure_span">Story Adventure</span>
            </div>
            <div class="text-8-books">
              <span class="fbooks_span">8 Books</span>
            </div>
          </div>
        </div>
        <div class="rectangle-263_06"></div>
        <div class="frame-2147227619">
          <div class="bookopen">
            <img src={bookOpen} alt="bookOpen">
          </div>
          <div class="total-reading-time-1h-23m">
            <span class="totalreadingtime1h23m_span_01"
            >Total reading time:
          </span><span class="totalreadingtime1h23m_span_02">1h 23m </span>
        </div>
      </div>
      <div class="frame-2147227620">
        <div class="headset">
          <img src={headset} alt="headset" class="headset-icon">
        </div>
        <div class="audio-listened-4-books">
          <span class="audiolistened4books_span_01"
          >Audio listened:
        </span><span class="audiolistened4books_span_02">4 Books</span>
      </div>
    </div>
  </div>
  <div class="frame-1410104095">
    <div class="frame-2147227618_01">
      <div class="check_02">
            <div class="book_04"> 
              <img src={bookIcon} alt="bookIcon">
            </div>
            <div class="ellipse-1415_06"></div>
          </div>
          <div class="frame-1410104098_01">
            <div class="interactive-search">
              <span class="interactivesearch_span">Interactive Search</span>
            </div>
            <div class="text-3-books">
              <span class="fbooks_span_01">3 Books</span>
            </div>
          </div>
        </div>
        <div class="rectangle-263_07"></div>
        <div class="frame-2147227619_01">
          <div class="bookopen">
            <img src={bookOpen} alt="bookOpen">
          </div>
          <div class="total-reading-time-2h-23m">
            <span class="totalreadingtime2h23m_span_01"
              >Total reading time:
            </span><span class="totalreadingtime2h23m_span_02">2h 23m </span>
          </div>
        </div>
        <div class="frame-2147227620_01">
          <div class="star">
            <img src={starIcon} alt="starIcon" class="star-icon">
          </div>
          <div class="average-stars-235">
            <span class="averagestars235_span_01">Average stars : </span><span
            class="averagestars235_span_02">2,3/5</span
            >
          </div>
        </div>
        <div class="frame-2147227621">
          <div class="star">
            <img src={starIcon} alt="starIcon" class="star-icon">
          </div>
          <div class="average-hints-12-per-scene">
            <span class="averagehints12perscene_span_01"
              >Average Hints :
            </span><span class="averagehints12perscene_span_02"
              >1.2 Per Scene</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="rectangle-42"></div>
</div>

<style>
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
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .characters_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .children_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 44px;
    top: 17px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
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
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .new-book {
    text-align: center;
  }

  .addchildren_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .usercircleplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .rectangle-263 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
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
    cursor: pointer;
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

  .frame-2147227614_01 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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

  .headset-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

  .star-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
    cursor: pointer;
  }

  .frame-1410104245_01 {
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
    cursor: pointer;
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

  .frame-2147227615_01 {
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

  .frame-2147227617 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
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
  .switch .button.active {
    background: white;
  }

  .switch .button.active .allbooks_span,
  .switch .button.active .characters_span,
  .switch .button.active .children_span {
    color: #141414;
    font-weight: 600;
  }
</style>

