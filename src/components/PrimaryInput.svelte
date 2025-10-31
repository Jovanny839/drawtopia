<script>
  export let type;
  export let value = "";
  export let placeholder;
  export let errors;
  export let disabled;
</script>

<input
  {type}
  bind:value
  {placeholder}
  class="primary-input"
  class:error={errors[type]}
  {disabled}
/>

<style>
  .primary-input {
    width: 100%;
    height: 50px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 10px;
    border: 1px solid #bbb;
    font-size: 16px;
    outline: none;
  }
</style>
