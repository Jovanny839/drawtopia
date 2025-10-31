<script lang="ts">
  import PrimaryBtn from "../../components/PrimaryBtn.svelte";
  import OutlineBtn from "../../components/OutlineBtn.svelte";
  import { verifyEmail, resendEmailOTP } from "../../lib/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { addNotification } from "$lib/stores/notification";

  // OTP related variables
  let otpValues: string[] = ["", "", "", "", "", ""];
  let otpInputs: HTMLInputElement[] = [];
  let email = "";
  let isLoading = false;
  let errors: { [key: string]: string } = {};
  let isResendingOTP = false;

  // Get email from URL params or localStorage
  onMount(() => {
    // Try to get email from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");

    if (emailParam) {
      email = emailParam;
    } else {
      // Fallback to localStorage if available
      const storedEmail = localStorage.getItem("pendingEmailVerification");
      if (storedEmail) {
        email = storedEmail;
      }
    }
  });

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

    const pastedData = event.clipboardData?.getData("text") || "";
    const cleanedData = pastedData.replace(/\D/g, ""); // Remove non-digits

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
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputs[index - 1]?.focus();
    }
  };

  // Validate OTP
  const validateOTP = () => {
    const otpCode = otpValues.join("");

    if (otpCode.length !== 6) {
      errors.otp = "Please enter the complete 6-digit code";
      return false;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      errors.otp = "OTP must contain only numbers";
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!validateOTP()) return;

    if (!email) {
      errors.general = "Email address is required";
      return;
    }

    isLoading = true;
    errors = {};

    try {
      const otpCode = otpValues.join("");
      console.log("Verifying OTP:", otpCode, "for email:", email);

      const result = await verifyEmail(email, otpCode);

      if (result.success) {
        console.log("Email verification successful");

        // Clear any stored pending verification data
        localStorage.removeItem("pendingEmailVerification");

        // Show success message
        addNotification({
          type: "success",
          message: "Email verified successfully! Redirecting to dashboard...",
        });

        // Redirect to dashboard or main page
        goto("/");
      } else {
        console.error("Email verification failed:", result.error);
        errors.general =
          result.error || "Invalid verification code. Please try again.";
      }
    } catch (error) {
      console.error("Email verification error:", error);
      errors.general = "An unexpected error occurred. Please try again.";
    } finally {
      isLoading = false;
    }
  };

  // Handle back button
  const handleBack = () => {
    goto("/signup");
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    if (!email) {
      errors.general = "Email address is required to resend code";
      return;
    }

    isResendingOTP = true;
    errors = {};

    try {
      const result = await resendEmailOTP(email);

      if (result.success) {
        addNotification({
          type: "success",
          message:
            "A new verification code has been sent to your email address.",
        });
      } else {
        errors.general =
          result.error ||
          "Failed to resend verification code. Please try again.";
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      errors.general = "Failed to resend verification code. Please try again.";
    } finally {
      isResendingOTP = false;
    }
  };
</script>

<svelte:head>
  <title>OTP-Verify your email</title>
  <meta name="description" content="Verify your email" />
</svelte:head>

<div class="login-with-phone-number">
  <div class="form">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
    <div class="container">
      <div class="form_01">
        <div class="heading">
          <div class="welcome-to-drawtopia">
            <span class="welcometodrawtopia_span">Check Your Email</span>
          </div>
          <div>
            <span class="logintocontinuewithyourdrawtopiajourney_span"
              >We've sent a 6-digit code to your email address</span
            >
            <span class="donthaveaccountsignup_span_02"
              >{email || "your email"}</span
            >
            <span class="logintocontinuewithyourdrawtopiajourney_span">
              If you haven’t received it within 15 minutes, please click <span class="resend-btn" on:click={handleResendOTP}>Resend Code</span>
            </span>
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
          <PrimaryBtn
            text="Continue"
            {isLoading}
            spinner_name="Verifying..."
            onClick={handleSubmit}
          />
          <OutlineBtn
            text="Back"
            isLoading={false}
            spinner_name=""
            onClick={handleBack}
          />
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

  .donthaveaccountsignup_span_02 {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .resend-btn {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
    text-decoration: none;
  }

  .background-image {
    width: 48%;
    height: 98vh;
    position: relative;
    background: #eef6ff;
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

  .resend-section {
    width: 100%;
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
  }

  .resend-btn:hover:not(:disabled) {
    color: #0066cc;
    cursor: pointer;
  }

  .resend-btn:disabled {
    color: #999;
    cursor: not-allowed;
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
