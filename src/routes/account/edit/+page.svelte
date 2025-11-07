<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import drawtopialogo from "../../../assets/logo.png";
    import arrowLeft from "../../../assets/ArrowLeft.svg";
    import caretdown from "../../../assets/CaretDown.svg";
    import { goto } from "$app/navigation";
    import { auth } from "../../../lib/stores/auth";
    import { getUserProfile } from "../../../lib/auth";
    import { supabase } from "../../../lib/supabase";
    import AccountDropdown from "../../../components/AccountDropdown.svelte";

    // User data state
    let userName = "Alex Smith";
    let userEmail = "drawtopia@gmail.com";
    let userLanguage = "English";
    let userAvatarUrl = "https://placehold.co/40x40";
    let userProfilePicture = "https://placehold.co/120x120";
    let subscriptionPlan = "Family Subscription";
    let lastFetchedUserId: string | null = null;
    
    // Form state
    let firstName = "Drawtopia";
    let lastName = "Kids";
    let email = "Drawtopia@gmail.com";
    let accountLanguage = "English";
    let isSaving = false;

    // Load user info from localStorage
    function loadUserInfoFromStorage() {
        if (!browser) return;
        
        try {
            const savedUserInfo = localStorage.getItem('userInfo');
            if (savedUserInfo) {
                const userInfo = JSON.parse(savedUserInfo);
                if (userInfo.user_name) {
                    userName = userInfo.user_name;
                    // Try to split name into first and last
                    const nameParts = userInfo.user_name.split(' ');
                    if (nameParts.length > 0) {
                        firstName = nameParts[0];
                        lastName = nameParts.slice(1).join(' ') || '';
                    }
                }
                if (userInfo.email) {
                    userEmail = userInfo.email;
                    email = userInfo.email;
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
                    const profile = Array.isArray(result.profile) 
                        ? result.profile[0] 
                        : result.profile;
                    
                    if (profile) {
                        // Set first and last name
                        if (profile.first_name) {
                            firstName = profile.first_name;
                        }
                        if (profile.last_name) {
                            lastName = profile.last_name;
                        }
                        if (profile.full_name) {
                            userName = profile.full_name;
                            const nameParts = profile.full_name.split(' ');
                            if (nameParts.length > 0 && !profile.first_name) {
                                firstName = nameParts[0];
                                lastName = nameParts.slice(1).join(' ') || '';
                            }
                        }
                        
                        // Get email
                        if (authState.user.email) {
                            userEmail = authState.user.email;
                            email = authState.user.email;
                        } else if (profile.email) {
                            userEmail = profile.email;
                            email = profile.email;
                        }

                        // Get avatar URL
                        if (authState.user.user_metadata?.avatar_url) {
                            userAvatarUrl = authState.user.user_metadata.avatar_url;
                            userProfilePicture = authState.user.user_metadata.avatar_url;
                        } else if (authState.user.user_metadata?.picture) {
                            userAvatarUrl = authState.user.user_metadata.picture;
                            userProfilePicture = authState.user.user_metadata.picture;
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
        goto("/account");
    }

    async function handleSave() {
        if (isSaving) return;
        isSaving = true;

        try {
            const authState = get(auth);
            if (!authState.user) {
                console.error("User not authenticated");
                return;
            }

            // Update user profile in database
            const { error } = await supabase
                .from('users')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', authState.user.id);

            if (error) {
                console.error("Error updating profile:", error);
                alert("Failed to save changes. Please try again.");
            } else {
                // Update localStorage
                const userInfo = {
                    user_id: authState.user.id,
                    avatar_url: userAvatarUrl,
                    user_name: `${firstName} ${lastName}`.trim(),
                    email: email
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                // Navigate back to account page
                goto("/account");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            isSaving = false;
        }
    }

    function handleCancel() {
        goto("/account");
    }

    function handleEditProfilePicture() {
        // TODO: Implement profile picture editing
        console.log("Edit profile picture clicked");
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
                <div class="profile"><span class="profile_span">Profile Settings</span></div>
            </div>
            
            <!-- Profile Picture Section -->
            <div class="frame-1410103917">
                <div class="frame-1410103916_01">
                    <div class="frame-1410103915_01">
                        <div><span class="profilepicture_span">Profile Picture</span></div>
                    </div>
                    <div class="edit-profile-picture-link">
                        <button class="edit-link" on:click={handleEditProfilePicture}>
                            <span class="editprofilepicture_span">Edit Profile Picture</span>
                        </button>
                    </div>
                    <div class="profile-picture-wrapper">
                        <img class="ellipse-10" src={userProfilePicture} alt="User profile" />
                    </div>
                </div>
            </div>
            
            <div class="rectangle-39"></div>
            
            <!-- Name Section -->
            <div class="form">
                <div class="frame-1410103918">
                    <div class="form-label-wrapper">
                        <div><span class="name_span">Name</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Edit your First Name and Last Name</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="firstName">First Name</label>
                            <input 
                                id="firstName"
                                type="text" 
                                class="input-field" 
                                bind:value={firstName}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="lastName">Last Name</label>
                            <input 
                                id="lastName"
                                type="text" 
                                class="input-field" 
                                bind:value={lastName}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rectangle-38"></div>
            
            <!-- Email Section -->
            <div class="form_01">
                <div class="frame-1410103918_01">
                    <div class="form-label-wrapper">
                        <div><span class="email_span">Email</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Edit your new email</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="email">Enter your email</label>
                            <input 
                                id="email"
                                type="email" 
                                class="input-field" 
                                bind:value={email}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="emailConfirm">Confirm email</label>
                            <input 
                                id="emailConfirm"
                                type="email" 
                                class="input-field" 
                                value={email}
                                placeholder="Confirm email"
                                readonly
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rectangle-37"></div>
            
            <!-- Language Section -->
            <div class="form_02">
                <div class="frame-1410103918_02">
                    <div class="form-label-wrapper">
                        <div><span class="language_span">Language</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Select your Language</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="accountLanguage">Account Language</label>
                            <div class="select-wrapper">
                                <select id="accountLanguage" class="select-field" bind:value={accountLanguage}>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Portuguese">Portuguese</option>
                                </select>
                                <img src={caretdown} alt="dropdown" class="select-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="cancel-button" on:click={handleCancel} disabled={isSaving}>
                    <span>Cancel</span>
                </button>
                <button class="save-button" on:click={handleSave} disabled={isSaving}>
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </div>
    </div>
</div>

<style>
.arrowleft-icon {
    width: 24px;
    height: 24px;
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

.profilepicture_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.editprofilepicture_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
    text-decoration: underline;
    cursor: pointer;
}

.edit-profile-picture-link {
    margin-top: 4px;
}

.edit-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.edit-link:hover .editprofilepicture_span {
    color: #438BFF;
}

.ellipse-10 {
    width: 120px;
    height: 120px;
    background: #D9D9D9;
    border-radius: 9999px;
    object-fit: cover;
    margin-top: 16px;
}

.rectangle-39,
.rectangle-38,
.rectangle-37 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
    margin: 24px 0;
}

.name_span,
.email_span,
.language_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.formsubtitle_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.form-subtitle {
    margin-top: 4px;
    margin-bottom: 16px;
}

.form-inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-label {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
}

.input-field {
    padding: 12px 16px;
    border: 1px solid #DCDCDC;
    border-radius: 12px;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    color: #121212;
    background: white;
    outline: none;
    transition: border-color 0.2s ease;
}

.input-field:focus {
    border-color: #438BFF;
    outline: 2px solid rgba(67, 139, 255, 0.1);
    outline-offset: 2px;
}

.input-field:read-only {
    background: #F5F5F5;
    color: #727272;
    cursor: not-allowed;
}

.select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.select-field {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 1px solid #DCDCDC;
    border-radius: 12px;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    color: #121212;
    background: white;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.select-field:focus {
    border-color: #438BFF;
    outline: 2px solid rgba(67, 139, 255, 0.1);
    outline-offset: 2px;
}

.select-icon {
    position: absolute;
    right: 16px;
    width: 20px;
    height: 20px;
    pointer-events: none;
}

.frame-1410103915_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0;
    display: flex;
    flex-direction: column;
}

.frame-1410103918,
.frame-1410103918_01,
.frame-1410103918_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
    width: 100%;
}

.frame-1410103916_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
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
    height: auto;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
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

.arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
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

.form,
.form_01,
.form_02 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103869 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 53px;
    display: inline-flex;
    min-height: 100vh;
}

.profile-picture-wrapper {
    position: relative;
    display: inline-block;
}

.form-label-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-buttons {
    align-self: stretch;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
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

.save-button:hover:not(:disabled) {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.cancel-button:hover:not(:disabled) {
    background: #F5F5F5;
    border-color: #B0B0B0;
}

.cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>

