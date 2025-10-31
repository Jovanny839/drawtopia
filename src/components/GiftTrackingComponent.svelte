<script lang="ts">
  import check from "../assets/completed.svg";
  import generating from "../assets/generating.svg";
  import draft from "../assets/draft.svg";
  import failed from "../assets/failed.svg";
  import basket from "../assets/Basket.svg";
  import eye from "../assets/eye.svg";
  import PaperPlaneTilt from "../assets/PaperPlaneTilt.svg";
  import ArrowsClockwise from "../assets/ArrowsClockwise.svg";
  import ArrowsCounterClockwise from "../assets/ArrowsCounterClockwise.svg";
  import { goto } from "$app/navigation";

  interface GiftData {
    id: string;
    childName: string;
    ageGroup: string;
    status: 'completed' | 'generating' | 'failed' | 'waiting';
    giftFrom: string;
    occasion: string;
    expectedDelivery: string;
    createdAt: Date;
  }

  export let gifts: GiftData[] = [];
  export let loadingGifts: boolean = false;
  export let giftsError: string = "";

  const handlePurchaseGift = () => {
    // Navigate to the new gifts selection page
    goto("/gift/1");
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return check;
      case 'generating': return generating;
      case 'failed': return failed;
      default: return draft;
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'generating': return 'Generating';
      case 'failed': return 'Failed';
      default: return 'Waiting For Creation';
    }
  };

  // Helper function to get status class
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'completed': return 'frame_gift_1410103869';
      case 'generating': return 'frame_gift_1410104162';
      case 'failed': return 'frame_gift_1410104162_01';
      default: return 'frame_gift_1410103869_01';
    }
  };

  // Helper function to get status message
  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'completed': return 'Story ready and delivered';
      case 'generating': return 'Story is being created now!';
      case 'failed': return 'Creation link expired, needs resend';
      default: return 'Invitation sent, waiting for story creation';
    }
  };

  // Helper function to get status message class
  const getStatusMessageClass = (status: string): string => {
    switch (status) {
      case 'completed': return 'frame_gift_1410104167';
      case 'generating': return 'frame_gift_1410104166';
      case 'failed': return 'frame_gift_1410104166_02';
      default: return 'frame_gift_1410104166_01';
    }
  };
</script>

<div class="frame_gift_1410104151">
  <div class="frame_gift_1410104154">
    <div class="frame_gift_1410104155">
      <div class="frame_gift_1410104151_01">
        <div class="gift-tracking">
          <span class="gifttracking_span">Gift Tracking</span>
        </div>
        <div class="monitor-gift-story-creation-progress-and-delivery-status">
          <span class="monitorgiftstorycreationprogressanddeliverystatus_span"
            >Monitor gift story creation progress and delivery status</span
          >
        </div>
      </div>
      <div 
        class="frame_gift_1410103868"
        role="button"
        tabindex="0"
        on:click={handlePurchaseGift}
        on:keydown={(e) => e.key === "Enter" && handlePurchaseGift()}
      >
        <div class="basket">
          <img src={basket} alt="basket" />
        </div>
        <div class="sub-menu">
          <div class="purchase-gift">
            <span class="purchasegift_span">Purchase Gift</span>
          </div>
        </div>
      </div>
    </div>
    <div class="frame_gift_1410104170">
      {#if loadingGifts}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading gifts...</p>
        </div>
      {:else if giftsError}
        <div class="error-state">
          <p class="error-text">{giftsError}</p>
          <button class="retry-button" on:click={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      {:else if gifts.length === 0}
        <div class="empty-state">
          <p class="empty-text">No gifts found.</p>
          <p class="empty-subtext">Purchase your first gift to get started!</p>
        </div>
      {:else}
        <div class="gifts-grid">
          {#each gifts as gift}
            <div class="card">
              <div class="frame_gift_1410104153">
                <div class="frame_gift_1410104161">
                  <div class="frame_gift_1410104152">
                    <div class="emma"><span class="emma_span">{gift.childName}</span></div>
                    <div class="text-6-years-old">
                      <span class="fyearsold_span">{gift.ageGroup} Years Old</span>
                    </div>
                  </div>
                </div>
                <div class={getStatusClass(gift.status)}>
                  <div class="status-icon">
                    <img src={getStatusIcon(gift.status)} alt={gift.status} />
                  </div>
                  <div class="sub-menu_01">
                    <div class="status-text">
                      <span class="status_span">{getStatusText(gift.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="rectangle-41"></div>
              <div class="frame_gift_1410104158">
                <div class="frame_gift_1410104124">
                  <div><span class="giftfrom_span">Gift From:</span></div>
                  <div><span class="dad_span">{gift.giftFrom}</span></div>
                </div>
                <div class="frame_gift_1410104126">
                  <div><span class="occasion_span">Occasion:</span></div>
                  <div><span class="birthday_span">{gift.occasion}</span></div>
                </div>
                <div class="frame_gift_1410104125">
                  <div>
                    <span class="expecteddelivery_span">Expected Delivery</span>
                  </div>
                  <div><span class="f5012024_span">{gift.expectedDelivery}</span></div>
                </div>
              </div>
              <div class={getStatusMessageClass(gift.status)}>
                <div class="status-message">
                  <span class="statusmessage_span">{getStatusMessage(gift.status)}</span>
                </div>
              </div>
              <div class="frame_gift_1410104156">
                <div class="frame_gift_1410104157">
                  {#if gift.status === 'completed'}
                    <div class="button">
                      <img src={eye} alt="eye" />
                      <div class="view-story">
                        <span class="viewstory_span">View Story</span>
                      </div>
                    </div>
                    <div class="button_01">
                      <img src={PaperPlaneTilt} alt="PaperPlaneTilt" />
                      <div class="resend-link">
                        <span class="resendlink_span">Resend Link</span>
                      </div>
                    </div>
                  {:else if gift.status === 'generating'}
                    <div class="button_02">
                      <div class="arrowsclockwise">
                        <img src={ArrowsClockwise} alt="ArrowsClockwise" />
                      </div>
                      <div class="creating-story">
                        <span class="creatingstory_span">Creating Story</span>
                      </div>
                    </div>
                  {:else if gift.status === 'failed'}
                    <div class="button_04">
                      <div class="arrowscounterclockwise">
                        <img src={ArrowsCounterClockwise} alt="ArrowsCounterClockwise" />
                      </div>
                      <div class="resend-invitation">
                        <span class="resendinvitation_span">Resend Invitation</span>
                      </div>
                    </div>
                  {:else}
                    <div class="button_03">
                      <img src={PaperPlaneTilt} alt="PaperPlaneTilt" />
                      <div class="resend-link_01">
                        <span class="resendlink_01_span">Resend Link</span>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .gifttracking_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .gift-tracking {
    align-self: stretch;
  }

  .monitorgiftstorycreationprogressanddeliverystatus_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .monitor-gift-story-creation-progress-and-delivery-status {
    align-self: stretch;
    height: 26px;
  }


  .purchasegift_span {
    color: white;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .purchase-gift {
    text-align: center;
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
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .text-6-years-old {
    align-self: stretch;
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

  .rectangle-41 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .giftfrom_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .dad_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .birthday_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .expecteddelivery_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f5012024_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .storyreadyanddelivered_span {
    color: #03c9d7;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story-ready-and-delivered {
    text-align: center;
  }

  .viewstory_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .view-story {
    text-align: center;
  }

  .resendlink_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .resend-link {
    text-align: center;
  }

  .emma_01_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emma_01 {
    align-self: stretch;
  }

  .fyearsold_01_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .text-6-years-old_01 {
    align-self: stretch;
  }

  .generating_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .generating {
    text-align: center;
  }

  .rectangle-41_01 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .giftfrom_01_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .dad_01_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_01_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .birthday_01_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .expecteddelivery_01_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f5012024_01_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .storyisbeingcreatednow_span {
    color: #ffbe4c;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story-is-being-created-now {
    text-align: center;
  }

  .creatingstory_span {
    color: #a4acb9;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .creating-story {
    text-align: center;
  }

  .emma_02_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emma_02 {
    align-self: stretch;
  }

  .fyearsold_02_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .text-6-years-old_02 {
    align-self: stretch;
  }

  .waitingforcreation_span {
    color: #ffbe4c;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .waiting-for-creation {
    text-align: center;
  }

  .rectangle-41_02 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .giftfrom_02_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .dad_02_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_02_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .birthday_02_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .expecteddelivery_02_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f5012024_02_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .invitationsentwaitingforstorycreation_span {
    color: #964dff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .invitation-sent-waiting-for-story-creation {
    text-align: center;
  }

  .resendlink_01_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .resend-link_01 {
    text-align: center;
  }

  .emma_03_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emma_03 {
    align-self: stretch;
  }

  .fyearsold_03_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .text-6-years-old_03 {
    align-self: stretch;
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

  .rectangle-41_03 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .giftfrom_03_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .dad_03_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .occasion_03_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .birthday_03_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .expecteddelivery_03_span {
    color: #666d80;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f5012024_03_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .creationlinkexpiredneedsresend_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .creation-link-expired-needs-resend {
    text-align: center;
  }

  .resendinvitation_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .resend-invitation {
    text-align: center;
  }

  .frame_gift_1410104151_01 {
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

  .frame_gift_1410104152 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .sub-menu_01 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104126 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104167 {
    align-self: stretch;
    padding: 10px;
    background: #ecffff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104152_01 {
    width: 84px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .sub-menu_02 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104124_01 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104126_01 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104125_01 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104166 {
    align-self: stretch;
    padding: 10px;
    background: #fff6e0;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104152_02 {
    width: 84px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .sub-menu_03 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104124_02 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104126_02 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104125_02 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104166_01 {
    align-self: stretch;
    padding: 10px;
    background: #f5f2ff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104152_03 {
    width: 84px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .sub-menu_04 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104124_03 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104126_03 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104125_03 {
    align-self: stretch;
    height: 38px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104166_02 {
    align-self: stretch;
    padding: 10px;
    background: #f8fafb;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .basket {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .check {
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

  .arrowsclockwise {
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

  .warning {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .arrowscounterclockwise {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .frame_gift_1410104161 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame_gift_1410104158 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame_gift_1410104161_01 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame_gift_1410104158_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame_gift_1410104161_02 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame_gift_1410104158_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame_gift_1410104161_03 {
    width: 208.17px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame_gift_1410104158_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame_gift_1410103868 {
    height: 49px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #438bff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    position: relative;
    overflow: hidden;
  }

  .frame_gift_1410103868:hover {
    background: #3a7ae4;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(67, 139, 255, 0.3);
  }

  .frame_gift_1410103868:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(67, 139, 255, 0.2);
    background: #2e6bc7;
  }

  .frame_gift_1410103868:focus {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  /* Ripple effect */
  /* .frame_gift_1410103868::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
    z-index: 1;
  } */

  .frame_gift_1410103868:active::before {
    width: 100px;
    height: 100px;
  }

  .frame_gift_1410103868 .basket,
  .frame_gift_1410103868 .sub-menu {
    position: relative;
    z-index: 2;
  }

  .frame_gift_1410103869 {
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

  .button {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .button_01 {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #438bff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104162 {
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

  .button_02 {
    align-self: stretch;
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #f8fafb;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410103869_01 {
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

  .button_03 {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #438bff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104162_01 {
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

  .button_04 {
    flex: 1 1 0;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #438bff;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104155 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame_gift_1410104153 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104157 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104153_01 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104153_02 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104157_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104153_03 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame_gift_1410104157_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame_gift_1410104156 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .card_01 {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame_gift_1410104156_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame_gift_1410104156_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .card {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .card_02 {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .card_03 {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 16px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame_gift_1410104168 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .frame_gift_1410104169 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 24px;
    display: inline-flex;
  }

  .frame_gift_1410104170 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
    display: flex;
  }

  .frame_gift_1410104154 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame_gift_1410104151 {
    width: 100%;
    height: 100%;
    padding: 0px;
    background: white;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  /* Loading, Error, and Empty States */
  .loading-state,
  .error-state,
  .empty-state {
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

  /* Gifts Grid */
  .gifts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    width: 100%;
  }

  /* Status icon and text classes */
  .status-icon {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .status-text {
    text-align: center;
  }

  .status_span {
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status-message {
    text-align: center;
  }

  .statusmessage_span {
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  /* Status-specific colors */
  .frame_gift_1410103869 .status_span {
    color: #40c4aa;
  }

  .frame_gift_1410104162 .status_span {
    color: #438bff;
  }

  .frame_gift_1410103869_01 .status_span {
    color: #ffbe4c;
  }

  .frame_gift_1410104162_01 .status_span {
    color: #df1c41;
  }

  .frame_gift_1410104167 .statusmessage_span {
    color: #03c9d7;
  }

  .frame_gift_1410104166 .statusmessage_span {
    color: #ffbe4c;
  }

  .frame_gift_1410104166_01 .statusmessage_span {
    color: #964dff;
  }

  .frame_gift_1410104166_02 .statusmessage_span {
    color: #141414;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .frame_gift_1410104151 {
      width: 100%;
    }

    .frame_gift_1410104154 {
      width: 100%;
      padding: 0px;
      gap: 16px;
    }

    .frame_gift_1410104155 {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      width: 100%;
    }

    .frame_gift_1410104151_01 {
      width: 100%;
    }

    .gifttracking_span {
      font-size: 20px;
      line-height: 28px;
    }

    .monitorgiftstorycreationprogressanddeliverystatus_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .frame_gift_1410103868 {
      width: 100%;
      height: 49px;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 4px;
      padding-bottom: 4px;
      touch-action: manipulation;
    }

    /* Optimize button effects for mobile */
    .frame_gift_1410103868:hover {
      transform: translateY(-0.5px);
      box-shadow: 0 1px 4px rgba(67, 139, 255, 0.25);
    }

    .frame_gift_1410103868:active::before {
      width: 80px;
      height: 80px;
    }

    .purchasegift_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame_gift_1410104170 {
      gap: 24px;
      width: 100%;
    }

    .frame_gift_1410104168 {
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .frame_gift_1410104169 {
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .card,
    .card_01,
    .card_02,
    .card_03 {
      width: 100%;
      flex: none;
      padding: 16px;
    }

    .frame_gift_1410104153,
    .frame_gift_1410104153_01,
    .frame_gift_1410104153_02,
    .frame_gift_1410104153_03 {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .frame_gift_1410104161,
    .frame_gift_1410104161_01,
    .frame_gift_1410104161_02,
    .frame_gift_1410104161_03 {
      width: auto;
      flex: 1;
    }

    .frame_gift_1410104152,
    .frame_gift_1410104152_01,
    .frame_gift_1410104152_02,
    .frame_gift_1410104152_03 {
      width: auto;
    }

    .emma_span,
    .emma_01_span,
    .emma_02_span,
    .emma_03_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .fyearsold_span,
    .fyearsold_01_span,
    .fyearsold_02_span,
    .fyearsold_03_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .frame_gift_1410104158,
    .frame_gift_1410104158_01,
    .frame_gift_1410104158_02,
    .frame_gift_1410104158_03 {
      gap: 8px;
    }

    .frame_gift_1410104124,
    .frame_gift_1410104124_01,
    .frame_gift_1410104124_02,
    .frame_gift_1410104124_03,
    .frame_gift_1410104126,
    .frame_gift_1410104126_01,
    .frame_gift_1410104126_02,
    .frame_gift_1410104126_03,
    .frame_gift_1410104125,
    .frame_gift_1410104125_01,
    .frame_gift_1410104125_02,
    .frame_gift_1410104125_03 {
      height: 32px;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .giftfrom_span,
    .giftfrom_01_span,
    .giftfrom_02_span,
    .giftfrom_03_span,
    .occasion_span,
    .occasion_01_span,
    .occasion_02_span,
    .occasion_03_span,
    .expecteddelivery_span,
    .expecteddelivery_01_span,
    .expecteddelivery_02_span,
    .expecteddelivery_03_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .dad_span,
    .dad_01_span,
    .dad_02_span,
    .dad_03_span,
    .birthday_span,
    .birthday_01_span,
    .birthday_02_span,
    .birthday_03_span,
    .f5012024_span,
    .f5012024_01_span,
    .f5012024_02_span,
    .f5012024_03_span {
      font-size: 16px;
      line-height: 22.4px;
      font-weight: 600;
    }

    .frame_gift_1410104157,
    .frame_gift_1410104157_01,
    .frame_gift_1410104157_02 {
      flex-direction: row;
      gap: 8px;
    }

    .button_02,
    .button_03,
    .button_04 {
      width: 100%;
      flex: none;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
      min-height: 44px;
    }

    .button,
    .button_01{
      width: 50%;
      flex: none;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
      min-height: 44px;
    }

    .viewstory_span,
    .resendlink_span,
    .resendlink_01_span,
    .creatingstory_span,
    .resendinvitation_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .frame_gift_1410104156,
    .frame_gift_1410104156_01,
    .frame_gift_1410104156_02 {
      gap: 8px;
    }

    .storyreadyanddelivered_span,
    .storyisbeingcreatednow_span,
    .invitationsentwaitingforstorycreation_span,
    .creationlinkexpiredneedsresend_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .completed_span,
    .generating_span,
    .waitingforcreation_span,
    .failed_span {
      font-size: 12px;
      line-height: 16.8px;
    }

    .frame_gift_1410103869,
    .frame_gift_1410104162,
    .frame_gift_1410103869_01,
    .frame_gift_1410104162_01 {
      padding-top: 4px;
      padding-bottom: 4px;
      padding-left: 8px;
      padding-right: 10px;
    }

    .gifts-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      width: 100%;
    }
  }
</style>
