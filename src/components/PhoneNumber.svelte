<script lang="ts">
  import { onMount } from "svelte";
  import { TelInput, normalizedCountries } from "svelte-tel-input";
  import type {
    DetailedValue,
    CountryCode,
    E164Number,
  } from "svelte-tel-input/types";
  import { hasFlag } from "country-flag-icons";
  import caret from "../assets/CaretDown.svg";
  export let valid: boolean;
  export let detailedValue: DetailedValue | null;
  export let selectedCountry: CountryCode | null;
  export let value: E164Number | null;

  let showDropdown = false;
  let dropdownElement: HTMLDivElement;
  let searchQuery = "";

  // Get flag URL for a country code
  const getFlagUrl = (iso2: string): string | null => {
    if (!iso2 || !hasFlag(iso2)) return null;
    // Use CDN for flag icons - this is the official CDN for country-flag-icons
    // Alternative: You can copy flags to public folder and use: `/flags/3x2/${iso2}.svg`
    return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${iso2}.svg`;
  };

  // Get country name from normalized countries (English only, no language suffix)
  const getCountryName = (iso2: string): string => {
    const country = normalizedCountries.find((c) => c.iso2 === iso2);
    if (!country?.name) return iso2;
    // Remove any language suffix in parentheses or brackets (e.g., "Country (English)" -> "Country")
    return country.name.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*\[[^\]]*\]\s*$/, '').trim();
  };

  // Get selected country details
  $: selectedCountryData = selectedCountry
    ? normalizedCountries.find((c) => c.iso2 === selectedCountry)
    : null;

  // Helper function to get English-only country name
  const getEnglishCountryName = (name: string): string => {
    // Remove any language suffix in parentheses or brackets (e.g., "Country (English)" -> "Country")
    return name.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*\[[^\]]*\]\s*$/, '').trim();
  };

  // Filter countries that have flags and apply search filter
  $: filteredCountries = normalizedCountries.filter((country) => {
    if (!hasFlag(country.iso2)) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const englishName = getEnglishCountryName(country.name);
    return (
      englishName.toLowerCase().includes(query) ||
      country.iso2.toLowerCase().includes(query) ||
      String(country.dialCode).includes(query)
    );
  });

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      showDropdown = false;
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const selectCountry = (countryCode: CountryCode) => {
    selectedCountry = countryCode;
    showDropdown = false;
  };
</script>

<div class="wrapper" style="display: flex; width: 100%;">
  <div class="country-select-wrapper" bind:this={dropdownElement}>
    <button
      type="button"
      class="country-select-button {!valid ? 'invalid' : ''}"
      on:click={() => (showDropdown = !showDropdown)}
      aria-label="Select country"
    >
      {#if selectedCountry && getFlagUrl(selectedCountry)}
        <img
          src={getFlagUrl(selectedCountry)}
          alt={selectedCountry}
          class="flag-icon"
        />
      {:else}
        <span class="flag-placeholder">🏳️</span>
      {/if}
      {#if selectedCountryData}
        <span class="dial-code">+{selectedCountryData.dialCode}</span>
      {:else}
        <span class="dial-code">Select</span>
      {/if}
      <img src={caret} alt="caret" class="dropdown-arrow" />
    </button>
    {#if showDropdown}
      <div class="country-dropdown">
        <div class="dropdown-search">
          <input
            type="text"
            placeholder="Search country..."
            class="search-input"
            bind:value={searchQuery}
          />
        </div>
        <div class="dropdown-list">
          {#if filteredCountries.length === 0}
            <div class="no-results">No countries found</div>
          {:else}
            {#each filteredCountries as country (country.id)}
              <button
                type="button"
                class="country-option {selectedCountry === country.iso2 ? 'selected' : ''}"
                on:click={() => selectCountry(country.iso2)}
              >
                {#if getFlagUrl(country.iso2)}
                  <img
                    src={getFlagUrl(country.iso2)}
                    alt={country.iso2}
                    class="flag-icon-small"
                  />
                {/if}
                <span class="country-name">{getEnglishCountryName(country.name)}</span>
                <span class="country-dial-code">+{country.dialCode}</span>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <TelInput
    bind:country={selectedCountry}
    bind:value
    bind:valid
    bind:detailedValue
    class="basic-tel-input {!valid ? 'invalid' : ''}"
  />
</div>

<style>
  .wrapper {
    position: relative;
  }

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

  .country-select-wrapper {
    position: relative;
    width: 20%;
    min-width: 120px;
  }

  .country-select-button {
    height: 50px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 10px 0px 0px 10px;
    border: 1px solid #bbb;
    border-right: none;
    outline: none;
    background-color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .country-select-button:hover {
    background-color: #f8f9fa;
  }

  .country-select-button.invalid {
    border-color: red;
  }

  .flag-icon {
    width: 24px;
    height: 18px;
    object-fit: cover;
    border-radius: 2px;
  }

  .flag-placeholder {
    font-size: 20px;
  }

  .dial-code {
    font-size: 16px;
    color: #141414;
    font-weight: 500;
  }

  .dropdown-arrow {
    margin-left: auto;
    color: #666;
    transition: transform 0.2s ease;
  }

  .country-select-button:hover .dropdown-arrow {
    color: #141414;
  }

  .country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #bbb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    margin-top: 4px;
    max-height: 230px;
    width: max-content;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dropdown-search {
    padding: 8px;
    border-bottom: 1px solid #ededed;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
  }

  .search-input:focus {
    border-color: #bbb;
  }

  .dropdown-list {
    overflow-y: auto;
    max-height: 250px;
  }

  .country-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: none;
    background: white;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .country-option:hover {
    background-color: #f8f9fa;
  }

  .country-option.selected {
    background-color: #e3f2fd;
  }

  .flag-icon-small {
    width: 20px;
    height: 15px;
    object-fit: cover;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .country-name {
    flex: 1;
    color: #141414;
  }

  .country-dial-code {
    color: #666;
    font-weight: 500;
  }

  .no-results {
    padding: 16px;
    text-align: center;
    color: #666;
    font-size: 14px;
  }

  .wrapper :global(.invalid) {
    border-color: red;
  }
</style>
