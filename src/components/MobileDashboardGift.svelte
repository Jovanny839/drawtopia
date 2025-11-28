<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import userCirclePlus from "../assets/UserCirclePlus.svg";
  import GiftCard from "./GiftCard.svelte";

  const dispatch = createEventDispatcher();

  export let gifts: any[] = [];
  export let loading: boolean = false;
  export let error: string = "";

  // Sample data structure for gifts
  interface GiftItem {
    id: string;
    childName: string;
    age: number;
    sendTo: string;
    occasion: string;
    status: "pending" | "completed";
    sentDate: string;
    deliveryDate?: string;
  }

  // Handle button clicks
  function handleAddChildren() {
    dispatch("addChildren");
  }

  function handleResendLink(giftId: string) {
    dispatch("resendLink", { giftId });
  }

  function handleViewGift(giftId: string) {
    dispatch("viewGift", { giftId });
  }

  function handleViewBook(giftId: string) {
    dispatch("viewBook", { giftId });
  }

  function handleSendThankYou(giftId: string) {
    dispatch("sendThankYou", { giftId });
  }

  // Default sample data if no gifts provided
  $: sampleGifts =
    gifts.length > 0
      ? gifts
      : [
          {
            id: "1",
            childName: "Emma",
            age: 7,
            sendTo: "parent@email.com",
            occasion: "Birthday",
            status: "pending",
            sentDate: "Oct 15, 2024",
          },
          {
            id: "2",
            childName: "Liam",
            age: 5,
            sendTo: "sister@email.com",
            occasion: "First day at School",
            status: "completed",
            sentDate: "Oct 10, 2024",
            deliveryDate: "Oct 20",
          },
        ];
</script>

<div class="dashboard-story-library">
  <div class="sidebar">
    <div class="frame-1410104150">
      <div class="frame-1410104155">
        <div class="frame-1410104151">
          <div class="gift-status">
            <span class="giftstatus_span">Gift Status</span>
          </div>
          <div class="copy-and-send-the-link-to-your-recipient">
            <span class="copyandsendthelinktoyourrecipient_span">
              Copy and send the link to your recipient
            </span>
          </div>
        </div>

        <div
          class="frame-1410104246"
          on:click={handleAddChildren}
          on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleAddChildren()}
          role="button"
          tabindex="0"
        >
          <div class="usercircleplus">
            <img src={userCirclePlus} alt="Add user" class="user-circle-plus" />
          </div>
          <div class="add-children">
            <span class="addchildren_span">Add Children</span>
          </div>
          <div class="ellipse-1415"></div>
        </div>
      </div>
    </div>

    <div class="frame-1410104169">
      {#if loading}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading gifts...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <p class="error-text">{error}</p>
        </div>
      {:else}
        {#each sampleGifts as gift}
          <GiftCard
            {gift}
            on:resendLink={(e) => handleResendLink(e.detail.giftId)}
            on:viewGift={(e) => handleViewGift(e.detail.giftId)}
            on:viewBook={(e) => handleViewBook(e.detail.giftId)}
            on:sendThankYou={(e) => handleSendThankYou(e.detail.giftId)}
          />
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .giftstatus_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.8px;
    word-wrap: break-word;
  }

  .gift-status {
    align-self: stretch;
  }

  .copyandsendthelinktoyourrecipient_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .copy-and-send-the-link-to-your-recipient {
    align-self: stretch;
  }

  .vector_02 {
    width: 16.24px;
    height: 16.24px;
    left: 1.89px;
    top: 1.88px;
    position: absolute;
    background: white;
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

  .ellipse-1415 {
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

  .frame-1410104151 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104155 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104246 {
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
    transition: background-color 0.2s ease;
  }

  .frame-1410104246:hover {
    background: #3a7ae4;
  }

  .usercircleplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .user-circle-plus {
    width: 100%;
    position: absolute;
  }

  .frame-1410104169 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
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

  .dashboard-story-library {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 32px;
    padding-left: 16px;
    padding-right: 16px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: inline-flex;
  }

  /* Loading, Error, and Empty States */
  .loading-state,
  .error-state {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
    margin: 0;
  }

  .frame-1410104150 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }
</style>
