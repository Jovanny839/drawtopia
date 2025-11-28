<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { storyCreation } from "../lib/stores/storyCreation";
  import { createEventDispatcher } from "svelte";
  import UserCirclePlus from "../assets/UserCirclePlus.svg";
  import BlueEye from "../assets/BlueEye.svg";
  import Plus from "../assets/Plus.svg";

  export let childProfiles: any[] = [];
  export let fetchChildProfiles: (userId: string) => Promise<void>;

  const dispatch = createEventDispatcher();

  // Handle "Add Children" button click
  function handleAddChildren() {
    // TODO: Implement add children functionality
    console.log("Add children clicked");
    // You might want to navigate to a create child profile page
    // goto("/create-child-profile");
  }

  // Handle "Edit" button click for a specific child
  function handleEdit(child: any) {
    const childId = child.id?.toString();
    const childName = getChildName(child);

    if (!childId) {
      console.error("Child ID is missing");
      return;
    }

    // Navigate to edit page with child profile info as query parameters
    goto(`/create-child-profile/edit?id=${childId}&name=${encodeURIComponent(childName)}`);
  }

  // Handle "View Story" button click for a specific child
  function handleViewStory(child: any) {
    console.log("View story for child:", child);
    // TODO: Implement navigation to view stories for this child
    // You might want to filter stories by child and show them
    dispatch("viewStories", { childId: child.id, childName: child.name || child.first_name });
  }

  // Handle "New Story" button click for a specific child
  function handleNewStory(child: any) {
    const childId = child.id?.toString();
    const childName = child.name || child.first_name || "Unnamed Child";

    if (!childId) {
      console.error("Child ID is missing");
      return;
    }

    // Store child info in sessionStorage
    if (browser) {
      sessionStorage.setItem("selectedChildProfileId", childId);
      sessionStorage.setItem("selectedChildProfileName", childName);
    }

    // Update story creation store
    storyCreation.setSelectedChild(childId, childName);

    // Navigate to create-character/1
    goto("/create-character/1");
  }

  // Get child name
  const getChildName = (child: any) => {
    return child.first_name || child.name || "Unnamed Child";
  };

  // Get age label
  const getAgeLabel = (child: any) => {
    return child.ageLabel || `${child.age_group || "Unknown"} Years Old`;
  };

  // Get avatar URL
  const getAvatarUrl = (child: any) => {
    return child.avatarUrl || child.avatar_url || "https://placehold.co/48x48";
  };

  // Get stories created text
  const getStoriesCreatedText = (child: any) => {
    return child.storiesCreatedText || `${getChildName(child)} (Age ${child.age_group || "Unknown"})`;
  };

  // Get last story theme
  const getLastStory = (child: any) => {
    return child.lastStory || "Birthday";
  };
</script>

<div class="sidebar">
  <div class="frame-1410104150">
    <div class="frame-1410104155">
      <div class="frame-1410104151">
        <div class="child-profiles">
          <span class="childprofiles_span">Child Profiles</span>
        </div>
        <div class="select-a-character-to-use-in-your-new-book">
          <span class="selectacharactertouseinyournewbook_span">Select a character to use in your new book</span>
        </div>
      </div>
      <div 
        class="frame-1410104246" 
        on:click={handleAddChildren} 
        role="button" 
        tabindex="0"
        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleAddChildren()}
      >
        <div class="usercircleplus">
          <img src={UserCirclePlus} alt="Add" class="vector" />
        </div>
        <div class="add-children">
          <span class="addchildren_span">Add Children</span>
        </div>
        <div class="ellipse-1415"></div>
      </div>
    </div>
  </div>

  <div class="frame-1410104159">
    {#each childProfiles as child, index (child.id)}
      <div class="card">
        <div class="frame-2147227634">
          <div class="frame-1410104153">
            <div class="frame-1410104161">
              <img class="ellipse-16" src={getAvatarUrl(child)} alt={getChildName(child)} />
              <div class="frame-1410104152">
                <div class="emma">
                  <span class="emma_span">{getChildName(child)}</span>
                </div>
                <div class="text-6-years-old">
                  <span class="fyearsold_span">{getAgeLabel(child)}</span>
                </div>
              </div>
            </div>
            <div 
              class="tag" 
              on:click={() => handleEdit(child)} 
              role="button" 
              tabindex="0"
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleEdit(child)}
            >
              <div><span class="edit_span">Edit</span></div>
            </div>
          </div>
          <div class="rectangle-41"></div>
          <div class="frame-1410104158">
            <div class="frame-1410104124">
              <div><span class="storiescreated_span">Stories Created:</span></div>
              <div><span class="emmaage5-7_span">{getStoriesCreatedText(child)}</span></div>
            </div>
            <div class="frame-1410104125">
              <div><span class="laststory_span">Last Story:</span></div>
              <div><span class="birthday_span">{getLastStory(child)}</span></div>
            </div>
          </div>
        </div>
        <div class="frame-2147227579">
          <div 
            class="button" 
            on:click={() => handleViewStory(child)} 
            role="button" 
            tabindex="0"
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleViewStory(child)}
          >
            <div class="eye">
              <img src={BlueEye} alt="View" class="vector_01" />
            </div>
            <div class="view-story">
              <span class="viewstory_span">View Story</span>
            </div>
          </div>
          <div 
            class="frame-1410104245" 
            on:click={() => handleNewStory(child)} 
            role="button" 
            tabindex="0"
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleNewStory(child)}
          >
            <div class="plus">
              <img src={Plus} alt="Plus" class="vector_02" />
            </div>
            <div class="new-story">
              <span class="newstory_span">New Story</span>
            </div>
            <div class="ellipse-1415_01"></div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .childprofiles_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .child-profiles {
    align-self: stretch;
  }

  .selectacharactertouseinyournewbook_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .select-a-character-to-use-in-your-new-book {
    align-self: stretch;
  }

  .vector {
    width: 16.24px;
    height: 16.24px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .addchildren_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .add-children {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 52px;
    top: 17px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .ellipse-16 {
    width: 48px;
    height: 48px;
    background: #D9D9D9;
    border-radius: 9999px;
    object-fit: cover;
  }

  .emma_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emma {
    align-self: stretch;
  }

  .fyearsold_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .text-6-years-old {
    align-self: stretch;
  }

  .edit_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .rectangle-41 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .storiescreated_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .emmaage5-7_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .laststory_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .birthday_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .vector_01 {
    width: 15px;
    height: 10px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(101%) contrast(101%);
  }

  .viewstory_span {
    color: #438BFF;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .view-story {
    text-align: center;
  }

  .vector_02 {
    width: 12px;
    height: 12px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .newstory_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .new-story {
    text-align: center;
  }

  .ellipse-1415_01 {
    width: 248px;
    height: 114px;
    left: -48px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .frame-1410104151 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104152 {
    width: 84px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .tag {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: #F8FAFB;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .tag:hover {
    background: #F0F2F5;
  }

  .tag:active {
    background: #E8EAED;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .usercircleplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .eye {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .plus {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104161 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104158 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104246 {
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
    transition: opacity 0.2s;
  }

  .frame-1410104246:hover {
    opacity: 0.9;
  }

  .frame-1410104246:active {
    opacity: 0.8;
  }

  .button {
    flex: 1 1 0;
    height: 41px;
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
    display: flex;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0px 5px 0px #438BFF;
  }

  .button:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .frame-1410104245 {
    flex: 1 1 0;
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
    display: flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-1410104245:hover {
    opacity: 0.9;
  }

  .frame-1410104245:active {
    opacity: 0.8;
  }

  .frame-1410104153 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410104155 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-2147227579 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227634 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410104150 {
    align-self: stretch;
    border-radius: 8px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .card {
    align-self: stretch;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 40px;
    display: flex;
  }

  .frame-1410104159 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
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
</style>
