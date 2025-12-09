<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { get } from "svelte/store";
  import { goto } from "$app/navigation";
  import caretdown from "../assets/CaretDown.svg";
  import { auth, user } from "../lib/stores/auth";
  import { getUserProfile, signOut } from "../lib/auth";
  import type { UserProfile } from "../lib/supabase";
  import { addNotification } from "../lib/stores/notification";

  import gear from "../assets/Gear.svg";
  import globe from "../assets/Globe.svg";
  import headset from "../assets/Headset.svg";
  import signout from "../assets/SignOut.svg";

  export let avatarUrl = "https://placehold.co/40x40";
  export let userName = "Alex Smith";
  export let userPlan = "Free Plan"; // Default to Free Plan instead of Premium

  let isOpen = false;
  let dropdownRef: HTMLElement | null = null;
  let realUserName = userName;
  let realAvatarUrl = avatarUrl;
  let realUserPlan = "Free Plan"; // Initialize with Free Plan
  let lastFetchedUserId: string | null = null;
  
  // Format subscription status for display
  function formatSubscriptionStatus(status: string | null | undefined): string {
    if (!status) return "Free Plan";
    
    // Convert status to display format
    const statusMap: { [key: string]: string } = {
      'premium': 'Premium Plan',
      'free plan': 'Free Plan',
      'trial': 'Trial Plan',
      'basic': 'Basic Plan'
    };
    
    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1) + ' Plan';
  }

  // Load user info from localStorage
  function loadUserInfoFromStorage() {
    if (!browser) return;
    
    try {
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        if (userInfo.user_id) {
          lastFetchedUserId = userInfo.user_id;
        }
        if (userInfo.avatar_url) {
          realAvatarUrl = userInfo.avatar_url;
        }
        if (userInfo.user_name) {
          realUserName = userInfo.user_name;
        }
        // Always format subscription status, even if null/undefined (will default to "Free Plan")
        realUserPlan = formatSubscriptionStatus(userInfo.subscription_status);
      }
    } catch (error) {
      console.error("Error loading user info from localStorage:", error);
    }
  }
  
  // Reactive statement to update user data when auth state changes
  $: if (browser && $auth.user && !$auth.loading && $auth.user.id !== lastFetchedUserId) {
    lastFetchedUserId = $auth.user.id;
    fetchUserData();
  }
  
  // Clear localStorage when user logs out
  $: if (browser && !$auth.loading && !$auth.user && lastFetchedUserId) {
    try {
      localStorage.removeItem('userInfo');
      lastFetchedUserId = null;
      realUserName = userName;
      realAvatarUrl = avatarUrl;
      realUserPlan = userPlan;
      console.log('User info cleared from localStorage (user logged out)');
    } catch (error) {
      console.error('Error clearing user info from localStorage:', error);
    }
  }

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const closeDropdown = () => {
    isOpen = false;
  };

  const handleButtonKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  };

  // Fetch real user data
  async function fetchUserData() {
    if (!browser) return;

    const authState = get(auth);
    if (authState.user) {
      try {
        const result = await getUserProfile(authState.user.id);
        if (result.success && result.profile) {
          // Handle both array and single object responses
          const profile: UserProfile = Array.isArray(result.profile) 
            ? result.profile[0] 
            : result.profile;
          
          if (profile) {
            // Use full_name if available, otherwise combine first_name and last_name
            if (profile.full_name) {
              realUserName = profile.full_name;
            } else if (profile.first_name || profile.last_name) {
              realUserName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            }
            
            // Get subscription status from profile (always update, even if null/undefined)
            realUserPlan = formatSubscriptionStatus(profile.subscription_status);
            
            // Get avatar URL from user metadata or profile
            let avatarUrlToSave = avatarUrl; // Default
            if (authState.user.user_metadata?.avatar_url) {
              avatarUrlToSave = authState.user.user_metadata.avatar_url;
              realAvatarUrl = avatarUrlToSave;
            } else if (authState.user.user_metadata?.picture) {
              avatarUrlToSave = authState.user.user_metadata.picture;
              realAvatarUrl = avatarUrlToSave;
            }
            
            // Save user info to localStorage
            const userInfo = {
              user_id: authState.user.id,
              avatar_url: avatarUrlToSave,
              user_name: realUserName,
              email: authState.user.email || profile.email || '',
              subscription_status: profile.subscription_status || null
            };
            
            try {
              localStorage.setItem('userInfo', JSON.stringify(userInfo));
              console.log('User info saved to localStorage:', userInfo);
            } catch (storageError) {
              console.error('Error saving user info to localStorage:', storageError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      closeDropdown(); // Close the dropdown first
      
      const result = await signOut();
      if (result.success) {
        console.log('User signed out successfully');
        // Show success message and redirect to login
        addNotification({
          type: 'success',
          message: 'Signed out successfully!'
        });
        goto('/login');
      } else {
        console.error('Sign out failed:', result.error);
        addNotification({
          type: 'error',
          message: 'Error signing out: ' + result.error
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      addNotification({
        type: 'error',
        message: 'An unexpected error occurred during sign out'
      });
    }
  }

  onMount(() => {
    if (!browser) return;

    // Load saved user info from localStorage first
    loadUserInfoFromStorage();

    // Fetch user data (will update localStorage if user is authenticated)
    fetchUserData();

    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen || !dropdownRef) return;

      const target = event.target as Node | null;
      if (target && !dropdownRef.contains(target)) {
        closeDropdown();
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<div
  class="dropdown"
  data-state={isOpen ? "open" : "closed"}
  bind:this={dropdownRef}
>
  <button
    class="profile-close"
    type="button"
    aria-haspopup="true"
    aria-expanded={isOpen}
    on:click|stopPropagation={toggleDropdown}
    on:keydown={handleButtonKeydown}
  >
    <div class="frame-1410103913">
      <img class="ellipse-7" src={realAvatarUrl} alt={realUserName} />
      <div class="heading">
        <div class="alex-smith">
          <span class="alexsmith_span">{realUserName}</span>
        </div>
        <div class="premium-plan">
          <span class="premiumplan_span">{realUserPlan}</span>
        </div>
      </div>
    </div>
    <img src={caretdown} alt="" class="caretdown" />
  </button>

  {#if isOpen}
    <div class="profile-open" role="menu">
      <div class="frame-1410103914">
        <button class="menu" type="button" role="menuitem" on:click={() => { closeDropdown(); goto('/account'); }}>
          <div class="gear">
            <img src={gear} alt="gear" />
          </div>
          <div class="account-settings">
            <span class="accountsettings_span">Account Settings</span>
          </div>
        </button>
        <button class="menu_01" type="button" role="menuitem">
          <div class="globe">
            <img src={globe} alt="globe">
          </div>
          <div class="my-plan">
            <span class="myplan_span">My Plan</span>
          </div>
        </button>
        <button class="menu_02" type="button" role="menuitem">
          <div class="headset">
            <img src={headset} alt="headset">
          </div>
          <div class="help-support">
            <span class="helpsupport_span">Help &amp; Support</span>
          </div>
        </button>
      </div>
      <div class="rectangle-37" aria-hidden="true"></div>
      <button class="menu_03" type="button" role="menuitem" on:click={handleLogout}>
        <div class="signout">
          <img src={signout} alt="signout">
        </div>
        <div class="log-out">
          <span class="logout_span">Log Out</span>
        </div>
      </button>
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .profile-close {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 4px 12px;
    background: #fcfcfc;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .profile-close:focus-visible {
    outline: 2px solid #438bff;
    outline-offset: 2px;
  }

  .profile-close:hover {
    background: #f4f4f4;
  }

  .frame-1410103913 {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ellipse-7 {
    width: 40px;
    height: 40px;
    background: #d9d9d9;
    border-radius: 9999px;
    object-fit: cover;
  }

  .heading {
    width:max-content;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .alex-smith,
  .premium-plan {
    align-self: stretch;
  }

  .alexsmith_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
  }

  .premiumplan_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
  }

  .caretdown {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-open {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 232px;
    padding: 4px;
    background: white;
    box-shadow: 0px 12px 40px rgba(0, 0, 0, 0.07);
    border-radius: 12px;
    outline: 1px rgba(0, 0, 0, 0.1) solid;
    outline-offset: -1px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;
  }

  .frame-1410103914 {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu,
  .menu_01,
  .menu_02,
  .menu_03 {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 4px;
    border: none;
    background: white;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
  }

  .menu {
    background: #eef6ff;
  }

  .menu_02,
  .menu_03 {
    border-radius: 8px;
  }

  .menu:hover,
  .menu_01:hover,
  .menu_02:hover,
  .menu_03:hover {
    background: #f5f5f5;
  }

  .gear,
  .globe,
  .headset,
  .signout {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .account-settings,
  .my-plan,
  .help-support,
  .log-out {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .accountsettings_span,
  .myplan_span,
  .helpsupport_span,
  .logout_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
  }

  .rectangle-37 {
    height: 1px;
    background: #d9d9d9;
  }

  @media (max-width: 960px) {
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
  }

  @media (max-width: 800px) {
    .profile-close {
      width: 100%;
      height: 100%;
      padding-top: 3px;
      padding-bottom: 3px;
      padding-left: 3px;
      padding-right: 4px;
      background: #fcfcfc;
      border-radius: 20px;
      outline: 1px #dcdcdc solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 2px;
      display: inline-flex;
    }

    .frame-1410103913 {
      width: 26px;
      height: 26px;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
    }

    .ellipse-7 {
      width: 26px;
      height: 26px;
      background: #d9d9d9;
      border-radius: 9999px;
    }

    .heading {
      display: none;
    }

    .caretdown {
      width: 12px;
      height: 12px;
      position: relative;
      overflow: hidden;
    }

    .caretdown img {
      width: 12px;
      height: 12px;
      position: absolute;
      left: 1.88px;
      top: 4.13px;
    }
  }
</style>

