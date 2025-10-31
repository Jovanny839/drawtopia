<!-- Root layout for all pages -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { initAuth } from '$lib/stores/auth';
  import NotificationContainer from '../components/NotificationContainer.svelte';
  import '../app.css';

  // Initialize authentication on app startup
  onMount(() => {
    const unsubscribe = initAuth();
    
    // Cleanup on component destroy
    return unsubscribe;
  });
</script>

<main>
  <slot />
</main>

<!-- Global notification container -->
<NotificationContainer />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    width: 100%;
    min-height: 100vh;
  }
</style>