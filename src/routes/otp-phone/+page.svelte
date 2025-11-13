<script lang="ts">
  import { TelInput, normalizedCountries } from "svelte-tel-input";
  import type {
    DetailedValue,
    CountryCode,
    E164Number,
  } from "svelte-tel-input/types";
  import { addNotification } from "$lib/stores/notification";
  import { verifyPhone, resendPhoneOTP } from "../../lib/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  // Any Country Code Alpha-2 (ISO 3166)
  let selectedCountry: CountryCode | null = "HU";

  // You must use E164 number format. It's guarantee the parsing and storing consistency.
  let value: E164Number | null = "+36301234567";

  // Validity
  let valid = true;

  // Optional - Extended details about the parsed phone number
  let detailedValue: DetailedValue | null = null;
  let email = "";
  let phoneNumber = "";
  let password = "";
  let rememberMe = false;
  let isLoading = false;
  let errors: { [key: string]: string } = {};
  let loginMethod: "phone" | "email" = "phone";

  // OTP related variables
  let otpValues: string[] = ["", "", "", "", "", ""];
  let otpInputs: HTMLInputElement[] = [];
  let isResendingOTP = false;
  let phoneFromStorage = "";

  // Get phone number from localStorage or URL params
  onMount(() => {
    // Try to get phone from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const phoneParam = urlParams.get('phone');
    
    if (phoneParam) {
      phoneFromStorage = phoneParam;
      value = phoneParam as E164Number;
    } else {
      // Fallback to localStorage if available
      const storedPhone = localStorage.getItem('pendingPhoneVerification');
      if (storedPhone) {
        phoneFromStorage = storedPhone;
        value = storedPhone as E164Number;
      }
    }
  });
  // let selectedCountry = { name: 'United States', code: '+1', flag: '🇺🇸' };
  let showCountryDropdown = false;

  const countries = [
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "China", code: "+86", flag: "🇨🇳" },
    { name: "Brazil", code: "+55", flag: "🇧🇷" },
    { name: "Mexico", code: "+52", flag: "🇲🇽" },
  ];

  const switchLoginMethod = (method: "phone" | "email") => {
    loginMethod = method;
    errors = {}; // Clear errors when switching
  };

  const selectCountry = (country: (typeof countries)[0]) => {
    // selectedCountry = country;
    // showCountryDropdown = false;
  };

  const validateForm = () => {
    errors = {};

    if (loginMethod === "email") {
      if (!email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = "Please enter a valid email";
      }
    } else {
      if (!phoneNumber) {
        errors.phone = "Phone number is required";
      } else if (!/^\d{10,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
        errors.phone = "Please enter a valid phone number";
      }
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return Object.keys(errors).length === 0;
  };

  // Handle OTP input changes
  const handleOTPInput = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Only allow single digit
    if (value.length > 1) {
      target.value = value.slice(-1);
    }
    
    otpValues[index] = target.value;
    
    // Move to next input if current is filled
    if (target.value && index < 5) {
      otpInputs[index + 1]?.focus();
    }
    
    // Clear errors when user types
    if (errors.otp) {
      errors.otp = "";
    }
  };

  // Handle paste event for automatic OTP filling
  const handleOTPPaste = (index: number, event: ClipboardEvent) => {
    event.preventDefault();
    
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanedData = pastedData.replace(/\D/g, ''); // Remove non-digits
    
    if (cleanedData.length === 6) {
      // Fill all 6 inputs with the pasted digits
      for (let i = 0; i < 6; i++) {
        otpValues[i] = cleanedData[i];
        if (otpInputs[i]) {
          otpInputs[i].value = cleanedData[i];
        }
      }
      
      // Focus the last input
      otpInputs[5]?.focus();
      
      // Clear any existing errors
      if (errors.otp) {
        errors.otp = "";
      }
    } else if (cleanedData.length > 0) {
      // If partial digits, fill from current position
      const remainingSlots = 6 - index;
      const digitsToFill = Math.min(cleanedData.length, remainingSlots);
      
      for (let i = 0; i < digitsToFill; i++) {
        if (index + i < 6) {
          otpValues[index + i] = cleanedData[i];
          if (otpInputs[index + i]) {
            otpInputs[index + i].value = cleanedData[i];
          }
        }
      }
      
      // Focus the next empty input or last filled input
      const nextIndex = Math.min(index + digitsToFill, 5);
      otpInputs[nextIndex]?.focus();
    }
  };

  // Handle backspace in OTP inputs
  const handleOTPKeydown = (index: number, event: KeyboardEvent) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputs[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    
    // Validate OTP
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      errors.otp = "Please enter the complete 6-digit code";
      return;
    }
    
    if (!/^\d{6}$/.test(otpCode)) {
      errors.otp = "OTP must contain only numbers";
      return;
    }
    
    isLoading = true;
    errors = {};
    
    try {
      const phoneToUse = phoneFromStorage || value || phoneNumber;
      
      if (!phoneToUse) {
        errors.general = "Phone number is required for verification";
        isLoading = false;
        return;
      }
      
      console.log('Verifying OTP:', otpCode, 'for phone:', phoneToUse);
      
      const result = await verifyPhone(phoneToUse, otpCode);
      
      if (result.success) {
        console.log('Phone verification successful');
        
        // Clear any stored pending verification data
        localStorage.removeItem('pendingPhoneVerification');
        
        addNotification({
          type: 'success',
          message: 'Phone verified successfully! Redirecting to dashboard...'
        });
        
        // Redirect to dashboard or main page
        goto('/dashboard');
      } else {
        console.error('Phone verification failed:', result.error);
        errors.general = result.error || 'Invalid verification code. Please try again.';
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      errors.general = 'An unexpected error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  };

  // Function to get country flag emoji from ISO code
  const getCountryFlag = (iso2: string): string => {
    const flagEmojis: { [key: string]: string } = {
      US: "🇺🇸",
      GB: "🇬🇧",
      CA: "🇨🇦",
      AU: "🇦🇺",
      DE: "🇩🇪",
      FR: "🇫🇷",
      JP: "🇯🇵",
      IN: "🇮🇳",
      CN: "🇨🇳",
      BR: "🇧🇷",
      MX: "🇲🇽",
      HU: "🇭🇺",
      IT: "🇮🇹",
      ES: "🇪🇸",
      NL: "🇳🇱",
      SE: "🇸🇪",
      NO: "🇳🇴",
      DK: "🇩🇰",
      FI: "🇫🇮",
      PL: "🇵🇱",
      CZ: "🇨🇿",
      AT: "🇦🇹",
      CH: "🇨🇭",
      BE: "🇧🇪",
      IE: "🇮🇪",
      PT: "🇵🇹",
      GR: "🇬🇷",
      TR: "🇹🇷",
      RU: "🇷🇺",
      UA: "🇺🇦",
      RO: "🇷🇴",
      BG: "🇧🇬",
      HR: "🇭🇷",
      SI: "🇸🇮",
      SK: "🇸🇰",
      LT: "🇱🇹",
      LV: "🇱🇻",
      EE: "🇪🇪",
      MT: "🇲🇹",
      CY: "🇨🇾",
      LU: "🇱🇺",
      IS: "🇮🇸",
      NZ: "🇳🇿",
      SG: "🇸🇬",
      MY: "🇲🇾",
      TH: "🇹🇭",
      VN: "🇻🇳",
      PH: "🇵🇭",
      ID: "🇮🇩",
      KR: "🇰🇷",
      TW: "🇹🇼",
      HK: "🇭🇰",
      IL: "🇮🇱",
      AE: "🇦🇪",
      SA: "🇸🇦",
      EG: "🇪🇬",
      ZA: "🇿🇦",
      NG: "🇳🇬",
      KE: "🇰🇪",
      GH: "🇬🇭",
      AR: "🇦🇷",
      CL: "🇨🇱",
      CO: "🇨🇴",
      VE: "🇻🇪",
      EC: "🇪🇨",
      UY: "🇺🇾",
      PY: "🇵🇾",
      BO: "🇧🇴",
      CR: "🇨🇷",
      PA: "🇵🇦",
      GT: "🇬🇹",
      SV: "🇸🇻",
      HN: "🇭🇳",
      NI: "🇳🇮",
      BZ: "🇧🇿",
      JM: "🇯🇲",
      TT: "🇹🇹",
      BB: "🇧🇧",
      GD: "🇬🇩",
      LC: "🇱🇨",
      VC: "🇻🇨",
      AG: "🇦🇬",
      KN: "🇰🇳",
      DM: "🇩🇲",
      DO: "🇩🇴",
      HT: "🇭🇹",
      CU: "🇨🇺",
      PR: "🇵🇷",
    };
    return flagEmojis[iso2] || "🏳️";
  };

  // Handle back button
  const handleBack = () => {
    goto('/signup');
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    const phoneToUse = phoneFromStorage || value || phoneNumber;
    
    if (!phoneToUse) {
      errors.general = "Phone number is required to resend code";
      return;
    }
    
    isResendingOTP = true;
    errors = {};
    
    try {
      const result = await resendPhoneOTP(phoneToUse);
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: 'A new verification code has been sent to your phone.'
        });
      } else {
        errors.general = result.error || 'Failed to resend verification code. Please try again.';
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      errors.general = 'Failed to resend verification code. Please try again.';
    } finally {
      isResendingOTP = false;
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest(".country-selector")) {
      showCountryDropdown = false;
    }
  };
</script>

<svelte:head>
  <title>OTP-Verify your phone</title>
  <meta name="description" content="Verify your phone" />
</svelte:head>

<svelte:window on:click={handleClickOutside} />

<div class="login-with-phone-number">
  <div class="form">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
    <div class="container">
      <div class="form_01">
        <div class="heading">
          <div class="welcome-to-drawtopia">
            <span class="welcometodrawtopia_span">Check Your Messages!</span>
          </div>
          <div>
            <span class="logintocontinuewithyourdrawtopiajourney_span"
              >We've sent a 6-digit code to your phone Number</span
            >
            <span class="donthaveaccountsignup_span_02"
              >{phoneFromStorage || value || '+36301234567'}</span
            >
          </div>
        </div>
      </div>
      <div class="frame-1410103856">
        {#each otpValues as value, index}
          <input 
            bind:this={otpInputs[index]}
            class="input-placeholder f_span" 
            type="text" 
            maxlength="1"
            bind:value={otpValues[index]}
            on:input={(e) => handleOTPInput(index, e)}
            on:keydown={(e) => handleOTPKeydown(index, e)}
            on:paste={(e) => handleOTPPaste(index, e)}
            disabled={isLoading}
          />
        {/each}
      </div>
      
      {#if errors.otp}
        <div class="error-text-center">{errors.otp}</div>
      {/if}
      <form on:submit={handleSubmit} style="width: 100%;">
        <div class="frame-1410104077">
          {#if errors.general}
            <div class="error-banner">{errors.general}</div>
          {/if}
          <button type="submit" class="continue_btn" disabled={isLoading}>
            {#if isLoading}
              <div class="spinner"></div>
              <span class="login_span">Logging in...</span>
            {:else}
              <div class="login"><span class="login_span">Continue</span></div>
            {/if}
          </button>
          <button type="button" class="back_btn" disabled={isLoading} on:click={handleBack}>
            {#if isLoading}
              <div class="spinner"></div>
              <span class="login_span">Processing...</span>
            {:else}
              <div class=""><span class="">Back</span></div>
            {/if}
          </button>
          
          <!-- Resend OTP option -->
          <div class="resend-section">
            <span class="resend-text">Didn't receive the code?</span>
            <button 
              type="button" 
              class="resend-btn" 
              on:click={handleResendOTP}
              disabled={isResendingOTP}
            >
              {isResendingOTP ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="background-image"></div>
</div>

<style>
  .welcometodrawtopia_span {
    color: #141414;
    font-size: 40px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 56px;
    word-wrap: break-word;
  }

  .welcome-to-drawtopia {
    align-self: stretch;
  }
  .logo-img {
    background-image: url("../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .logintocontinuewithyourdrawtopiajourney_span {
    color: #666d80;
    font-size: 20px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 28px;
    word-wrap: break-word;
  }















  .login_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .login {
    text-align: center;
  }

  .donthaveaccountsignup_span_02 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }


  .background-image {
    width: 48%;
    height: 98vh;
    position: relative;
    background-image: url("../../assets/victorycele.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    border: 1px #ededed solid;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heading {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .continue_btn {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 100%;
    margin-bottom: 10px;
  }

  .back_btn {
    align-self: stretch;
    border: 2px solid #438bff;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    color: #438bff;
    background-color: white;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    width: 100%;
    font-size: 16px;
    font-weight: bold;
  }

  .logo-text-full {
    width: 290px;
    min-height: 54.2px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104077 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 40px;
    display: flex;
  }

  .form {
    width: 50%;
    height: 100vh;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
    display: inline-flex;
    padding: 48px;
  }

  .login-with-phone-number {
    width: 100%;
    height: 100vh;
    background: white;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    gap: 0;
    display: flex;
    flex-wrap: nowrap;
  }

  .error-banner {
    background-color: #fee2e2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
  }

  .error-text-center {
    color: #dc2626;
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .f_span {
    color: #141414;
    font-size: 32px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 44.8px;
    word-wrap: break-word;
  }

  .input-placeholder {
    flex: 1 1 0;
    text-align: center;
    height: 75px;
    width: 100%;
    min-width: 30px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #bbb;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103856 {
    width: 100%;
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .continue_btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .continue_btn {
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .continue_btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(67, 139, 255, 0.3);
  }

  .back_btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back_btn {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back_btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(67, 139, 255, 0.3);
  }

  .resend-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }

  .resend-text {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
  }

  .resend-btn {
    background: none;
    border: none;
    color: #438bff;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    transition: all 0.2s ease;
  }

  .resend-btn:hover:not(:disabled) {
    color: #2563eb;
  }

  .resend-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .login-with-phone-number {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }

    .form {
      width: 100%;
      height: auto;
      min-height: 100vh;
    }

    .background-image {
      display: none;
    }
    .frame-1410103856 {
      gap: 12px;
    }
  }
</style>
