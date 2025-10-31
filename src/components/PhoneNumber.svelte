<script lang="ts">
  // export let phoneNumber: string;
  export let valid: boolean;
  export let detailedValue: DetailedValue | null;
  export let selectedCountry: CountryCode | null;
  export let value: E164Number | null;
  import { TelInput, normalizedCountries } from "svelte-tel-input";
  import type {
    DetailedValue,
    CountryCode,
    E164Number,
  } from "svelte-tel-input/types";

  // You must use E164 number format. It's guarantee the parsing and storing consistency.
  // let value: E164Number | null = "+36301234567";

  // Validity
  // let valid = true;

  // Optional - Extended details about the parsed phone number
  // let detailedValue: DetailedValue | null = null;
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
</script>

<div class="wrapper" style="display: flex; width: 100%;">
  <select
    class="country-select {!valid ? 'invalid' : ''}"
    aria-label="Default select example"
    name="Country"
    bind:value={selectedCountry}
  >
    <option value={null} hidden={selectedCountry !== null}>Please select</option
    >
    {#each normalizedCountries.filter((country) => getCountryFlag(country.iso2) !== "🏳️") as currentCountry (currentCountry.id)}
      <option
        value={currentCountry.iso2}
        selected={currentCountry.iso2 === selectedCountry}
        aria-selected={currentCountry.iso2 === selectedCountry}
      >
        {getCountryFlag(currentCountry.iso2)}
        (+{currentCountry.dialCode})
      </option>
    {/each}
  </select>
  <TelInput
    bind:country={selectedCountry}
    bind:value
    bind:valid
    bind:detailedValue
    class="basic-tel-input {!valid ? 'invalid' : ''}"

  />
</div>

<style>
    .wrapper :global(.basic-tel-input) {
    height: 50px;
    width: 80%;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 0px 10px 10px 0px;
    border: 1px solid;
    outline: none;
    border-color: #bbb;
    font-size: 16px;
  }

  .wrapper :global(.country-select) {
    height: 50px;
    width: 20%;
    min-width: 120px;
    align-items: center;
    justify-content: center;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 10px 0px 0px 10px;
    border: 1px solid;
    outline: none;
    background-color: white;
    border-color: #bbb;
    font-size: 16px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    text-align: center;
    background-image: url("../assets/CaretDown.svg");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 20px;
  }

  .wrapper :global(.invalid) {
    border-color: red;
  }
</style>
