<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import drawtopialogo from "../../assets/logo.png";
    import arrowLeft from "../../assets/ArrowLeft.svg";
    import pencilSimple from "../../assets/WhitePencilSimple.svg";
    import check from "../../assets/Check.svg";
    import x from "../../assets/X.svg";
    import camera from "../../assets/Camera.svg";
    import globe from "../../assets/GlobeHemisphereWest.svg";
    import envelope from "../../assets/Envelope.svg";
    import userSquare from "../../assets/UserSquare.svg";
    import { goto } from "$app/navigation";
    import { user, auth } from "../../lib/stores/auth";
    import { getUserProfile } from "../../lib/auth";
    import AccountDropdown from "../../components/AccountDropdown.svelte";

    let isEditing = false;
    let showEditProfileModal = false;
    
    // User data state
    let userName = "Alex Smith";
    let userEmail = "drawtopia@gmail.com";
    let userLanguage = "English";
    let userAvatarUrl = "https://placehold.co/40x40";
    let userProfilePicture = "https://placehold.co/120x120";
    let subscriptionPlan = "Family Subscription";
    let lastFetchedUserId: string | null = null;
    
    // Email preferences state
    let onboardingEmailsEnabled = true;
    let productUpdatesEnabled = false;

    // Load user info from localStorage
    function loadUserInfoFromStorage() {
        if (!browser) return;
        
        try {
            const savedUserInfo = localStorage.getItem('userInfo');
            if (savedUserInfo) {
                const userInfo = JSON.parse(savedUserInfo);
                if (userInfo.user_name) {
                    userName = userInfo.user_name;
                }
                if (userInfo.email) {
                    userEmail = userInfo.email;
                }
                if (userInfo.avatar_url) {
                    userAvatarUrl = userInfo.avatar_url;
                    userProfilePicture = userInfo.avatar_url;
                }
                if (userInfo.user_id) {
                    lastFetchedUserId = userInfo.user_id;
                }
            }
        } catch (error) {
            console.error("Error loading user info from localStorage:", error);
        }
    }

    // Fetch user profile data
    async function fetchUserData() {
        if (!browser) return;

        const authState = get(auth);
        if (authState.user && authState.user.id !== lastFetchedUserId) {
            lastFetchedUserId = authState.user.id;
            try {
                const result = await getUserProfile(authState.user.id);
                if (result.success && result.profile) {
                    // Handle both array and single object responses
                    const profile = Array.isArray(result.profile) 
                        ? result.profile[0] 
                        : result.profile;
                    
                    if (profile) {
                        // Use full_name if available, otherwise combine first_name and last_name
                        if (profile.full_name) {
                            userName = profile.full_name;
                        } else if (profile.first_name || profile.last_name) {
                            userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                        }
                        
                        // Get email
                        if (authState.user.email) {
                            userEmail = authState.user.email;
                        } else if (profile.email) {
                            userEmail = profile.email;
                        }

                        // Get avatar URL from user metadata or profile
                        if (authState.user.user_metadata?.avatar_url) {
                            userAvatarUrl = authState.user.user_metadata.avatar_url;
                            userProfilePicture = authState.user.user_metadata.avatar_url;
                        } else if (authState.user.user_metadata?.picture) {
                            userAvatarUrl = authState.user.user_metadata.picture;
                            userProfilePicture = authState.user.user_metadata.picture;
                        }
                        
                        // Save user info to localStorage
                        const userInfo = {
                            user_id: authState.user.id,
                            avatar_url: userAvatarUrl,
                            user_name: userName,
                            email: userEmail
                        };
                        
                        try {
                            localStorage.setItem('userInfo', JSON.stringify(userInfo));
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

    // Reactive statement to update user data when auth state changes
    $: if (browser && $auth.user && !$auth.loading && $auth.user.id !== lastFetchedUserId) {
        fetchUserData();
    }

    onMount(() => {
        if (!browser) return;
        
        // Load saved user info from localStorage first
        loadUserInfoFromStorage();
        
        // Fetch user data if authenticated
        if ($auth.user && !$auth.loading) {
            fetchUserData();
        }
    });

    function handleBack() {
        goto("/dashboard");
    }

    function handleEditProfile() {
        isEditing = true;
        showEditProfileModal = true;

        goto("/account/edit");
    }

    function handleSave() {
        isEditing = false;
        showEditProfileModal = false;
        // Add save logic here
    }

    function handleCancel() {
        isEditing = false;
        showEditProfileModal = false;
    }

    function toggleOnboardingEmails() {
        onboardingEmailsEnabled = !onboardingEmailsEnabled;
        // Add save logic here if needed
    }

    function toggleProductUpdates() {
        productUpdatesEnabled = !productUpdatesEnabled;
        // Add save logic here if needed
    }
</script>

<div class="account-settings">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopialogo} alt="drawtopialogo" class="drawtopialogo">
        </div>
        <AccountDropdown 
            avatarUrl={userAvatarUrl}
            userName={userName}
            userPlan={subscriptionPlan}
        />
    </div>
    <div class="frame-1410103919">
        <div class="frame-1410103869">
            <div class="frame-1410103870">
                <button class="button" on:click={handleBack}>
                    <div class="arrowleft">
                        <img src={arrowLeft} alt="back" class="arrowleft-icon" />
                    </div>
                    <div class="account-settings_01"><span class="accountsettings_01_span">Account Settings</span></div>
                </button>
            </div>
        </div>
        <div class="frame-1410103888">
            <div class="frame-1410103916">
                <div class="frame-1410103915">
                    <div class="profile"><span class="profile_span">Profile</span></div>
                    <button class="button_01" on:click={handleEditProfile}>
                        <img src={pencilSimple} alt="edit" class="edit-icon" />
                        <div class="edit-profile"><span class="editprofile_span">Edit Profile</span></div>
                        <div class="ellipse-1415"></div>
                    </button>
                </div>
            </div>
            <div class="frame-1410103917">
                <div class="frame-1410103916_01">
                    <div class="frame-1410103915_01">
                        <div><span class="profilepicture_span">Profile Picture</span></div>
                    </div>
                    <div class="profile-picture-wrapper">
                        <img class="ellipse-10" src={userProfilePicture} alt="User profile" />
                        <button class="camera-button" title="Change profile picture">
                            <img src={camera} alt="camera" class="camera-icon" />
                        </button>
                    </div>
                </div>
                <div class="rectangle-39"></div>
                <div class="form">
                    <div class="frame-1410103918">
                        <div class="form-label-wrapper">
                            <div><span class="name_span">Name</span></div>
                        </div>
                        <div class="drawtopia-kids"><span class="drawtopiakids_span">{userName}</span></div>
                    </div>
                </div>
                <div class="rectangle-38"></div>
                <div class="form_01">
                    <div class="frame-1410103918_01">
                        <div class="form-label-wrapper">
                            <div><span class="email_span">Email</span></div>
                        </div>
                        <div class="drawtopiagmailcom"><span class="drawtopiagmailcom_span">{userEmail}</span></div>
                    </div>
                </div>
                <div class="rectangle-37"></div>
                <div class="form_02">
                    <div class="frame-1410103918_02">
                        <div class="form-label-wrapper">
                            <div><span class="languagebooks_span">Language Books</span></div>
                        </div>
                        <div class="english"><span class="english_span">English</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103889">
            <div class="frame-1410103917_01">
                <div class="frame-1410103916_02">
                    <div class="frame-1410103915_02">
                        <div><span class="emailpreferences_span">Email Preferences</span></div>
                    </div>
                </div>
                <div class="form_03">
                    <div class="frame-1410103918_03">
                        <div><span class="onboardingemails_span">Onboarding emails</span></div>
                        <div class="guides-and-tips-to-help-you-get-started"><span class="guidesandtipstohelpyougetstarted_span">Guides and tips to help you get started</span></div>
                    </div>
                    <button 
                        class={onboardingEmailsEnabled ? "switch-button" : "switch-button_01"}
                        on:click={toggleOnboardingEmails}
                        type="button"
                        aria-label="Toggle onboarding emails"
                        role="switch"
                        aria-checked={onboardingEmailsEnabled}
                    >
                        <div class="ellipse-11"></div>
                    </button>
                </div>
                <div class="rectangle-38_01"></div>
                <div class="form_04">
                    <div class="frame-1410103918_04">
                        <div><span class="productupdatesannouncements_span">Product updates & announcements</span></div>
                        <div class="new-features-improvements-and-news"><span class="newfeaturesimprovementsandnews_span">New features, improvements, and news</span></div>
                    </div>
                    <button 
                        class={productUpdatesEnabled ? "switch-button" : "switch-button_01"}
                        on:click={toggleProductUpdates}
                        type="button"
                        aria-label="Toggle product updates"
                        role="switch"
                        aria-checked={productUpdatesEnabled}
                    >
                        <div class="ellipse-11_01"></div>
                    </button>
                </div>
            </div>
        </div>
        {#if isEditing}
        <div class="action-buttons">
            <button class="save-button" on:click={handleSave}>
                <img src={check} alt="save" class="action-icon" />
                <span>Save Changes</span>
            </button>
            <button class="cancel-button" on:click={handleCancel}>
                <img src={x} alt="cancel" class="action-icon" />
                <span>Cancel</span>
            </button>
        </div>
        {/if}
    </div>
</div>

<style>
.ellipse-7 {
    width: 40px;
    height: 40px;
    background: #D9D9D9;
    border-radius: 9999px;
}

.alexsmith_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.alex-smith {
    align-self: stretch;
}

.familysubscription_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
}

.family-subscription {
    align-self: stretch;
}

.caretdown-icon {
    width: 24px;
    height: 24px;
}

.arrowleft-icon {
    width: 24px;
    height: 24px;
}

.edit-icon {
    width: 20px;
    height: 20px;
}

.camera-icon {
    width: 20px;
    height: 20px;
}

.form-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

.action-icon {
    width: 20px;
    height: 20px;
}

.accountsettings_01_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.account-settings_01 {
    text-align: center;
}

.profile_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
}

.profile {
    flex: 1 1 0;
}

.editprofile_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.edit-profile {
    text-align: center;
}

.ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -46px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
}

.profilepicture_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.ellipse-10 {
    width: 120px;
    height: 120px;
    background: #D9D9D9;
    border-radius: 9999px;
}

.rectangle-39 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.name_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.drawtopiakids_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.drawtopia-kids {
    align-self: stretch;
}

.rectangle-38 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.email_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.drawtopiagmailcom_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.drawtopiagmailcom {
    align-self: stretch;
}

.rectangle-37 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.languagebooks_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.english_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.english {
    align-self: stretch;
}

.emailpreferences_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
}

.onboardingemails_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.guidesandtipstohelpyougetstarted_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.guides-and-tips-to-help-you-get-started {
    align-self: stretch;
}

.ellipse-11 {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 9999px;
}

.rectangle-38_01 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.productupdatesannouncements_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.newfeaturesimprovementsandnews_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.new-features-improvements-and-news {
    align-self: stretch;
}

.ellipse-11_01 {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 9999px;
}

.heading {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
}

.frame-1410103915_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
}

.frame-1410103918 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103915_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
}

.frame-1410103918_03 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_04 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
}

.drawtopialogo {
    width: 100%;
}

.caretdown {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
}

.arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
}

.button_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    box-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.button_01:hover {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.switch-button {
    width: 53px;
    padding: 6px;
    background: #438BFF;
    border-radius: 24px;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.switch-button:hover {
    opacity: 0.9;
}

.switch-button:focus {
    outline: 2px solid #438BFF;
    outline-offset: 2px;
}

.switch-button_01 {
    width: 53px;
    padding: 6px;
    background: #A4ACB9;
    border-radius: 24px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.switch-button_01:hover {
    opacity: 0.9;
}

.switch-button_01:focus {
    outline: 2px solid #A4ACB9;
    outline-offset: 2px;
}

.frame-1410103913 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-1410103916_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.form {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.form_01 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.form_02 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103916_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.button:hover {
    background: #F5F5F5;
}

.frame-1410103915 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
}

.form_03 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
}

.form_04 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
}

.profile-close {
    width: 247px;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #FCFCFC;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-1410103917 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
}

.frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-1410103916 {
    align-self: stretch;
    height: 57px;
    justify-content: center;
    align-items: center;
    gap: 24px;
    display: inline-flex;
}

.frame-1410103917_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
}

.navbar {
    width: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
}

.frame-1410103869 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
}

.frame-1410103888 {
    align-self: stretch;
    padding: 24px;
    background: white;
    overflow: hidden;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-1410103889 {
    align-self: stretch;
    padding: 24px;
    overflow: hidden;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-1410103919 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.account-settings {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 48px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 53px;
    display: inline-flex;
}

.profile-picture-wrapper {
    position: relative;
    display: inline-block;
}

.camera-button {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    background: #438BFF;
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.3);
    transition: all 0.2s ease;
}

.camera-button:hover {
    background: #3570E0;
    transform: scale(1.1);
    box-shadow: 0px 4px 12px rgba(67, 139, 255, 0.4);
}

.form-label-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-buttons {
    align-self: stretch;
    padding: 24px;
    background: white;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
}

.save-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438BFF;
    color: white;
    border: none;
    border-radius: 20px;
    box-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    transition: all 0.2s ease;
}

.save-button:hover {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.cancel-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    color: #727272;
    border: 1px #DCDCDC solid;
    border-radius: 20px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    transition: all 0.2s ease;
}

.cancel-button:hover {
    background: #F5F5F5;
    border-color: #B0B0B0;
}
</style>