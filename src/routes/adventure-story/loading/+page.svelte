<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { storyCreation } from '../../../lib/stores/storyCreation';
    import { env } from '../../../lib/env';
    import { supabase } from '../../../lib/supabase';
    import type { ChildProfile } from '../../../lib/database/childProfiles';
    import { createStory } from '../../../lib/database/stories';
    import drawtopia from "../../../assets/logo.png";
    import shieldstar from "../../../assets/ShieldStar.svg";
    import arrowleft from "../../../assets/ArrowLeft.svg";
    import magicalwand from "../../../assets/magic-wand.gif"; 
    import magicalwand1 from "../../../assets/magic-wand1.gif"; 
    import magicalwand2 from "../../../assets/magic-wand2.gif"; 
    import shootingstar from "../../../assets/ShootingStar.svg"
    import ProgressBar from "../../../components/ProgressBar.svelte";
    import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";

    const TOTAL_TIME = 60; // 60 seconds (fallback timer)
    let timeRemaining = TOTAL_TIME;
    let completionPercent = 0;
    let intervalId: number | null = null;
    let hasNavigated = false;
    let storyGenerated = false;
    let storyTextProgress = 0; // 0-50% for story text
    let sceneImageProgress = 0; // 0-50% for scene images (50-100% total)
    let totalSceneImages = 5; // Expected number of scene images

    // Determine which magical wand GIF to show based on completion percentage
    $: currentMagicalWand = completionPercent < 25 
        ? magicalwand 
        : completionPercent < 50 
        ? magicalwand1 
        : magicalwand2;

    // Calculate total completion percent from story and image progress
    $: completionPercent = Math.min(100, storyTextProgress + sceneImageProgress);

    // Navigate to final page when completion reaches 100%
    $: if (completionPercent >= 100 && !hasNavigated && storyGenerated) {
        hasNavigated = true;
        // Small delay to ensure UI updates before navigation
        setTimeout(() => {
            goto('/adventure-story/final');
        }, 500);
    }

    // Helper function to map character type enum to descriptive string
    function mapCharacterType(type: string | undefined): string {
        if (!type) return 'person';
        const typeMap: { [key: string]: string } = {
            'person': 'a person',
            'animal': 'an animal',
            'magical_creature': 'a magical creature'
        };
        return typeMap[type.toLowerCase()] || 'a person';
    }

    // Helper function to map story world enum to descriptive string
    function mapStoryWorld(world: string | undefined): string {
        if (!world) return 'the Enchanted Forest';
        const worldMap: { [key: string]: string } = {
            'forest': 'the Enchanted Forest',
            'space': 'Outer Space',
            'underwater': 'the Underwater Kingdom'
        };
        return worldMap[world.toLowerCase()] || 'the Enchanted Forest';
    }

    // Helper function to map adventure type enum to descriptive string
    function mapAdventureType(adventure: string | undefined): string {
        if (!adventure) return 'treasure hunt';
        const adventureMap: { [key: string]: string } = {
            'treasure_hunt': 'treasure hunt',
            'helping_friend': 'helping a friend'
        };
        return adventureMap[adventure.toLowerCase()] || 'treasure hunt';
    }

    // Helper function to normalize age group to backend format
    function normalizeAgeGroup(ageGroup: string | undefined): string {
        if (!ageGroup) return '7-10'; // Default age group
        // Backend expects "3-6", "7-10", or "11-12"
        // Map common variations
        const normalized = ageGroup.trim();
        if (normalized === '3-5' || normalized === '3-6') return '3-6';
        if (normalized === '6-7' || normalized === '7-10' || normalized === '8-10') return '7-10';
        if (normalized === '11-12') return '11-12';
        // If already in correct format, return as is
        if (['3-6', '7-10', '11-12'].includes(normalized)) return normalized;
        // Default fallback
        return '7-10';
    }

    // Save story to Supabase database
    async function saveStoryToDatabase(
        storyPages: Array<{ pageNumber: number; text: string; scene?: string }>,
        sceneImages: string[]
    ) {
        try {
            const storyState = get(storyCreation);
            
            // Validate required data
            if (!storyState.selectedChildProfileId || storyState.selectedChildProfileId === 'undefined') {
                console.warn('Cannot save story: No child profile selected');
                return;
            }

            if (!storyState.characterName || !storyState.characterType || !storyState.characterStyle) {
                console.warn('Cannot save story: Missing required character data');
                return;
            }

            // Get original image URL from session storage or story state
            let originalImageUrl = storyState.originalImageUrl;
            if (!originalImageUrl && browser) {
                originalImageUrl = sessionStorage.getItem('characterImageUrl') || 
                                 sessionStorage.getItem('uploadedImageUrl') || '';
            }

            if (!originalImageUrl) {
                console.warn('Cannot save story: No original image URL found');
                return;
            }

            // Format story_content as JSON
            // Store story pages with their text and associated scene images
            const storyContent = {
                pages: storyPages.map((page, index) => ({
                    pageNumber: page.pageNumber || index + 1,
                    text: page.text,
                    sceneImage: page.scene || sceneImages[index] || null
                }))
            };

            // Prepare story data
            const storyData = {
                child_profile_id: storyState.selectedChildProfileId,
                character_name: storyState.characterName,
                character_type: storyState.characterType,
                special_ability: storyState.specialAbility || '',
                character_style: storyState.characterStyle,
                story_world: storyState.storyWorld || 'forest',
                adventure_type: storyState.adventureType || 'treasure_hunt',
                original_image_url: originalImageUrl,
                enhanced_images: storyState.enhancedImages || [],
                story_title: storyState.storyTitle || undefined,
                cover_design: storyState.coverDesign || undefined,
                story_content: JSON.stringify(storyContent),
                scene_images: sceneImages.length > 0 ? sceneImages.map(url => url.split('?')[0]) : [],
                status: 'completed' as const
            };

            console.log('Saving story to database:', storyData);

            const result = await createStory(storyData);

            if (result.success && result.data) {
                console.log('Story saved successfully:', result.data);
                // Store story ID in session storage and story creation store
                if (browser && result.data.id) {
                    sessionStorage.setItem('currentStoryId', result.data.id.toString());
                    storyCreation.update(state => ({
                        ...state,
                        storyId: result.data.id.toString()
                    }));
                }
            } else {
                console.error('Failed to save story:', result.error);
            }
        } catch (error) {
            console.error('Error saving story to database:', error);
        }
    }

    async function generateStory() {
        if (storyGenerated) return;
        
        try {
            // Initialize story creation store to get latest data
            storyCreation.init();
            const storyState = get(storyCreation);
            
            // Fetch child profile to get age_group
            let ageGroup = '7-10'; // Default age group
            if (storyState.selectedChildProfileId && storyState.selectedChildProfileId !== 'undefined') {
                try {
                    const { data: childProfile, error: profileError } = await supabase
                        .from('child_profiles')
                        .select('age_group')
                        .eq('id', parseInt(storyState.selectedChildProfileId))
                        .single();
                    
                    if (!profileError && childProfile?.age_group) {
                        ageGroup = normalizeAgeGroup(childProfile.age_group);
                    }
                } catch (error) {
                    console.warn('Could not fetch child profile age group, using default:', error);
                }
            }
            
            // Get selected character enhanced image from session storage
            let selectedCharacterEnhancedImage: string | null = null;
            if (browser) {
                const storedEnhancedImage = sessionStorage.getItem('selectedCharacterEnhancedImage');
                if (storedEnhancedImage) {
                    selectedCharacterEnhancedImage = storedEnhancedImage.split('?')[0]; // Clean URL
                    console.log('Using selected character enhanced image:', selectedCharacterEnhancedImage);
                } else {
                    console.log('Selected character enhanced image not found in session storage');
                }
            }
            
            // Prepare request body matching backend StoryRequest model
            const requestBody: any = {
                character_name: storyState.characterName || '',
                character_type: mapCharacterType(storyState.characterType),
                special_ability: storyState.specialAbility || '',
                age_group: ageGroup,
                story_world: mapStoryWorld(storyState.storyWorld),
                adventure_type: mapAdventureType(storyState.adventureType),
                occasion_theme: null, // Optional field, set to null for now
                character_image_url: selectedCharacterEnhancedImage
            };
            
            // Add selected character enhanced image if available
            // if (selectedCharacterEnhancedImage) {
            //     requestBody.character_image_url = selectedCharacterEnhancedImage;
            // }
            
            // Validate required fields
            if (!requestBody.character_name || !requestBody.character_type || !requestBody.special_ability) {
                throw new Error('Missing required character data');
            }
            
            // Update progress: Starting story generation (5%)
            storyTextProgress = 5;
            
            // Send request to generate-story endpoint
            const storyGenerationEndpoint = 'https://image-edit-five.vercel.app';
            const response = await fetch(`${storyGenerationEndpoint}/generate-story`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to generate story: ${response.status} ${response.statusText}`);
            }
            
            // Update progress: Story generation in progress (25%)
            storyTextProgress = 25;
            
            const result = await response.json();
            
            // Update progress: Story text received (50%)
            storyTextProgress = 50;
            
            // Extract story pages with text and scene images
            // Expected format: { pages: [{ text: "...", scene: "https://..." }, ...] }
            let storyPages: Array<{ pageNumber: number; text: string; scene?: string }> = [];
            let sceneImages: string[] = [];
            
            if (result.pages && Array.isArray(result.pages)) {
                // Primary format: pages array with text and scene properties
                storyPages = result.pages.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        // Handle string-only format (legacy)
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        // Handle object format with text and scene
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                
                // Extract scene images from pages array (scene property)
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (result.storyPages && Array.isArray(result.storyPages)) {
                // Alternative format: storyPages
                storyPages = result.storyPages.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (result.story && Array.isArray(result.story)) {
                // Alternative format: story array
                storyPages = result.story.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else if (Array.isArray(result)) {
                // Direct array format
                storyPages = result.slice(0, 5).map((page: any, index: number) => {
                    if (typeof page === 'string') {
                        return { pageNumber: index + 1, text: page };
                    } else if (page.text) {
                        return { 
                            pageNumber: page.pageNumber || index + 1, 
                            text: page.text,
                            scene: page.scene || page.imageUrl || page.image || page.sceneUrl
                        };
                    } else {
                        return { pageNumber: index + 1, text: String(page) };
                    }
                });
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            } else {
                // Fallback: try to extract from other response formats
                console.warn('Unexpected response structure:', result);
                for (let i = 1; i <= 5; i++) {
                    const pageData = result[`page${i}`] || result[`page_${i}`] || result[i];
                    if (pageData) {
                        if (typeof pageData === 'string') {
                            storyPages.push({ pageNumber: i, text: String(pageData) });
                        } else if (pageData.text) {
                            storyPages.push({ 
                                pageNumber: i, 
                                text: pageData.text,
                                scene: pageData.scene || pageData.imageUrl || pageData.image || pageData.sceneUrl
                            });
                        } else {
                            storyPages.push({ pageNumber: i, text: String(pageData) });
                        }
                    }
                }
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            }
            
            // Also check for separate scene arrays (fallback)
            if (sceneImages.length === 0) {
                if (result.sceneImages && Array.isArray(result.sceneImages)) {
                    sceneImages = result.sceneImages.slice(0, 5);
                } else if (result.scenes && Array.isArray(result.scenes)) {
                    sceneImages = result.scenes.slice(0, 5).map((scene: any) => 
                        typeof scene === 'string' ? scene : (scene.url || scene.imageUrl || scene.image || scene.scene)
                    );
                } else if (result.images && Array.isArray(result.images)) {
                    sceneImages = result.images.slice(0, 5);
                }
            }
            
            // Ensure scene images are extracted from storyPages if not already extracted
            // This ensures scenes match the order of pages
            if (sceneImages.length === 0 && storyPages.length > 0) {
                sceneImages = storyPages
                    .map(page => page.scene)
                    .filter((url): url is string => !!url);
            }
            
            // Save story pages with text and scenes to session storage
            if (browser && storyPages.length > 0) {
                sessionStorage.setItem('storyPages', JSON.stringify(storyPages));
                
                // Also save individual pages for easier access
                storyPages.forEach((page, index) => {
                    sessionStorage.setItem(`storyPage${index + 1}`, page.text);
                });
                
                console.log('Story pages saved to session storage:', storyPages.length);
                console.log('Story pages with scenes:', storyPages.map(p => ({ text: p.text.substring(0, 30) + '...', hasScene: !!p.scene })));
            }
            
            // Scene images should be included in the /generate-story response
            // Update progress based on number of images received
            if (sceneImages.length > 0) {
                const validImages = sceneImages.filter(img => img).length;
                // Each valid image contributes to progress
                // Since images come all at once, we can set progress to 50% (complete)
                sceneImageProgress = 50;
            } else {
                // No images received, set to 50% (images complete)
                sceneImageProgress = 50;
            }
            
            // Save scene images to session storage
            // Store scenes in the same order as pages (by page number/index)
            const cleanSceneImages: string[] = [];
            if (browser && sceneImages.length > 0) {
                sceneImages.forEach((imageUrl, index) => {
                    if (imageUrl) {
                        // Store with multiple key patterns for compatibility
                        // Clean URL by removing query parameters for consistency
                        const cleanUrl = imageUrl.split('?')[0];
                        sessionStorage.setItem(`storyScene_${index + 1}`, cleanUrl);
                        sessionStorage.setItem(`adventureScene_${index + 1}`, cleanUrl);
                        cleanSceneImages.push(cleanUrl);
                    }
                });
                
                // Also store as an array for easier access (with clean URLs)
                if (cleanSceneImages.length > 0) {
                    sessionStorage.setItem('storyScenes', JSON.stringify(cleanSceneImages));
                }
                
                console.log('Scene images saved to session storage:', sceneImages.length);
                console.log('Scene URLs:', sceneImages.map(url => url.split('?')[0]));
            } else if (browser) {
                console.warn('No scene images found in response');
            }
            
            // Save story to Supabase database
            await saveStoryToDatabase(storyPages, cleanSceneImages);
            
            storyGenerated = true;
        } catch (error) {
            console.error('Error generating story:', error);
            // Set progress to 100% to allow navigation even on error
            storyTextProgress = 50;
            sceneImageProgress = 50;
            storyGenerated = true;
            // Don't block navigation if story generation fails
            // The user can still proceed, but story pages won't be available
        }
    }


    onMount(() => {
        // Initialize story creation store
        if (browser) {
            storyCreation.init();
        }
        
        // Generate story immediately when page loads
        generateStory();
        
        // Fallback timer - only used if generation takes too long
        intervalId = window.setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                // Only update from timer if actual progress hasn't reached 100%
                // This ensures the timer doesn't override real progress
                if (completionPercent < 100) {
                    const timerProgress = ((TOTAL_TIME - timeRemaining) / TOTAL_TIME) * 100;
                    // Use timer progress only if it's higher than actual progress
                    // This prevents the timer from slowing down real progress
                    if (timerProgress > completionPercent) {
                        // Don't override if we have real progress
                        if (storyTextProgress === 0 && sceneImageProgress === 0) {
                            storyTextProgress = timerProgress * 0.5;
                            sceneImageProgress = timerProgress * 0.5;
                        }
                    }
                }
            } else {
                timeRemaining = 0;
                // Only set to 100% if generation hasn't completed
                if (completionPercent < 100 && !storyGenerated) {
                    storyTextProgress = 50;
                    sceneImageProgress = 50;
                }
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        }, 1000);
    });

    onDestroy(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    });
</script>

<div class="loading-option-3-1">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopia} alt="Drawtopia Logo" class="logo-img" />
        </div>
    </div>
    <div class="arrow">
        <div class="button" on:click={() => {goto('/adventure-story/story-preview')}}>
            <div class="arrowleft">
                <img
                    src={arrowleft}
                    alt="arrowleft"
                    class="img-arrowleft"
                />
            </div>
            <div class="back">
                <span class="back_span">Back</span>
            </div>
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="creating-your-story">
                <span class="creatingyourstory_span">Creating Your Story</span>
            </div>
            <div class="your-preview-will-be-ready-in-about-47-seconds">
                <span class="yourpreviewwillbereadyinabout47seconds_span_01"
                    >Your preview will be ready in about
                </span>&nbsp;<span
                    class="yourpreviewwillbereadyinabout47seconds_span_02"
                    >{timeRemaining} {timeRemaining === 1 ? 'second' : 'seconds'}</span
                >
            </div>
            <div class="tag">
                <img
                    src={shieldstar}
                    alt="Shield Star"
                    class="img-shieldstar"
                />
                <div>
                    <span class="ffreepagepreview_span"
                        >2 Free Page Preview</span
                    >
                </div>
            </div>
        </div>
        <MobileStepProgressBar currentStep={6} />
        <ProgressBar currentStep={5} />
        <div class="frame-13">
            <div class="frame-1410103853">
                <div class="frame">
                    <div class="frame-2147227347">
                        <div class="frame-2147227507">
                            <img
                                class="magic-wand_12404075-1"
                                src={currentMagicalWand}
                                alt="Magical Wand"
                            />
                            <div class="content">
                                <div class="enhancing-your-character">
                                    <span class="enhancingyourcharacter_span"
                                        >Enhancing your character…</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227505">
                            <div class="frame-1410103855">
                                <div class="bar_05"></div>
                                <div class="bar_06" style="width: {completionPercent}%"></div>
                            </div>
                            <div class="text-25-complete">
                                <span class="f5complete_span">{Math.round(completionPercent)}% Complete</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="frame-2147227509">
                        <div class="frame-1410104037">
                            <div class="shootingstar">
                                <img src={shootingstar} alt="Shooting Star" class="img-shootingstar">
                            </div>
                            <div class="frame-2147227506">
                                <div class="fun-fact">
                                    <span class="funfact_span">Fun Fact</span>
                                </div>
                                <div
                                    class="your-characters-special-ability-will-help-solve-a-big-problem"
                                >
                                    <span
                                        class="yourcharactersspecialabilitywillhelpsolveabigproblem_span"
                                        >Your character's special ability will
                                        help solve a big problem</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="frame-2147227510">
                            <div class="frame-2147227508">
                                <div class="tag_01">
                                    <div>
                                        <span class="sketch_span">Sketch</span>
                                    </div>
                                </div>
                            </div>
                            <img
                                class="frame-2147227509_01"
                                src="https://placehold.co/171x218"
                                alt="no image1"
                            />
                            <img
                                class="frame-2147227510_01"
                                src="https://placehold.co/171x218"
                                alt="no image2"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="frame-13_01">
                <div class="button">
                    <div class="cancel">
                        <span class="cancel_span">Cancel</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .creatingyourstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .creating-your-story {
        align-self: stretch;
        text-align: center;
    }

    .yourpreviewwillbereadyinabout47seconds_span_01 {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .yourpreviewwillbereadyinabout47seconds_span_02 {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .your-preview-will-be-ready-in-about-47-seconds {
        align-self: stretch;
        text-align: center;
    }

    .img-shieldstar {
        margin: auto;
        width: 20px;
        height: 20px;
    }

    .shootingstar {
        width: 32px;
        height: 32px;
        position: relative;
        overflow: hidden;
    }

    .ffreepagepreview_span {
        color: #438bff;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }


    .magic-wand_12404075-1 {
        width: 60px;
        height: 60px;
    }

    .enhancingyourcharacter_span {
        color: #438bff;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .enhancing-your-character {
        align-self: stretch;
        text-align: center;
    }

    .bar_05 {
        align-self: stretch;
        height: 13px;
        position: relative;
        background: #eef6ff;
        border-radius: 12px;
    }

    .bar_06 {
        height: 13px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: #438bff;
        border-radius: 12px;
        transition: width 0.3s ease;
    }

    .f5complete_span {
        color: #438bff;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 21.6px;
        word-wrap: break-word;
    }

    .text-25-complete {
        align-self: stretch;
        text-align: center;
    }

    .funfact_span {
        color: #6912c5;
        font-size: 20px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28px;
        word-wrap: break-word;
    }

    .fun-fact {
        align-self: stretch;
    }

    .yourcharactersspecialabilitywillhelpsolveabigproblem_span {
        color: black;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .your-characters-special-ability-will-help-solve-a-big-problem {
        align-self: stretch;
    }

    .sketch_span {
        color: #141414;
        font-size: 12px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }

    .frame-2147227509_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .frame-2147227510_01 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 12px;
        border: 1px #ededed solid;
    }

    .cancel_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .cancel {
        text-align: center;
    }


    .content {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-2147227506 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .tag_01 {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 2px;
        padding-bottom: 2px;
        left: 54px;
        top: 178px;
        position: absolute;
        background: #f8fafb;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .button {
        width: 200px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 16px;
        padding-bottom: 16px;
        box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .logo-img {
        width: 100%;
    }

    .frame-1410103855 {
        align-self: stretch;
        position: relative;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }


    .frame-2147227507 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-13_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .navbar {
        align-self: stretch;
        height: 79px;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 24px;
        padding-right: 12px;
        border-radius: 20px;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .tag {
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        background: #eef6ff;
        border-radius: 99px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .frame-2147227505 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104037 {
        align-self: stretch;
        padding: 12px;
        background: #f5f2ff;
        border-radius: 10px;
        outline: 1px #964dff solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227508 {
        flex: 1 1 0;
        height: 218px;
        position: relative;
        background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.25) 100%
        );
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        overflow: hidden;
        border-radius: 12px;
        background-image: url(https://placehold.co/171x218);
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-2147227347 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 32px;
        display: flex;
    }

    .frame-2147227510 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .frame-2147227509 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame {
        width: 576px;
        padding: 20px;
        background: white;
        box-shadow: 0px 0px 18px rgba(67, 139, 255, 0.1);
        border-radius: 10px;
        outline: 1px #f8f8f8 solid;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 32px;
        display: flex;
    }

    .frame-1410103853 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-13 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .frame-1410103818 {
        width: 1240px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .loading-option-3-1 {
        width: 100%;
        height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        overflow: hidden;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
        display: inline-flex;
    }

    .arrow {
        display: none;
    }

    .back_span {
        color: black;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 22.40px;
        word-wrap: break-word;
    }

    .back {
        text-align: center;
    }

    .arrowleft {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
    }

    .img-arrowleft {
        width: 100%;
        height: 100%;
    }

    .img-shootingstar {
        width: 100%;
        height: 100%;
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
        .loading-option-3-1 {
            padding-top: 24px;
            padding-bottom: 32px;
            padding-left: 16px;
            padding-right: 16px;
            gap: 32px;
        }

        .arrow {
            width: 100%;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 6px;
            padding-bottom: 6px;
            justify-content: flex-start;
            align-items: center;
            gap: 12px;
            display: inline-flex;
        }

        .arrow .button {
            padding-left: 24px;
            padding-right: 24px;
            padding-top: 12px;
            padding-bottom: 12px;
            box-shadow: 0px 0px 0px 2px #EEF6FF;
            border-radius: 20px;
            outline: 1px #DCDCDC solid;
            outline-offset: -1px;
            justify-content: center;
            align-items: center;
            gap: 10px;
            display: flex;
            cursor: pointer;
            width: auto;
        }

        .arrow .arrowleft {
            width: 20px;
            height: 20px;
        }

        .navbar {
            padding-left: 24px;
            padding-right: 12px;
        }

        .logo-text-full {
            width: 170.15px;
            height: 31.80px;
        }

        .frame-1410103818 {
            width: 100%;
            align-self: stretch;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 24px;
        }

        .creatingyourstory_span {
            font-size: 32px;
            line-height: 38.40px;
        }

        .creating-your-story {
            text-align: left;
        }

        .yourpreviewwillbereadyinabout47seconds_span_01,
        .yourpreviewwillbereadyinabout47seconds_span_02 {
            font-size: 16px;
            line-height: 22.40px;
        }

        .your-preview-will-be-ready-in-about-47-seconds {
            text-align: left;
        }

        .ffreepagepreview_span {
            font-size: 16px;
        }

        .heading {
            align-items: flex-start;
        }


        .frame-13 {
            width: 100%;
            align-self: stretch;
        }

        .frame-1410103853 {
            width: 100%;
            align-self: stretch;
        }

        .frame {
            width: 100%;
            align-self: stretch;
            padding: 10px;
            gap: 24px;
        }

        .frame-2147227347 {
            gap: 24px;
        }

        .magic-wand_12404075-1 {
            width: 48px;
            height: 48px;
        }

        .enhancingyourcharacter_span {
            font-size: 20px;
            line-height: 24px;
        }

        .bar_05 {
            height: 10px;
        }

        .bar_06 {
            height: 10px;
        }

        .f5complete_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .frame-2147227509 {
            gap: 16px;
        }

        .frame-1410104037 {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .img-shootingstar {
            width: 28px;
            height: 28px;
        }

        .funfact_span {
            font-size: 18px;
            line-height: 21.60px;
        }

        .yourcharactersspecialabilitywillhelpsolveabigproblem_span {
            font-size: 14px;
            line-height: 19.60px;
        }

        .frame-2147227510 {
            /* flex-direction: column; */
            gap: 12px;
        }

        .frame-2147227508 {
            width: 100%;
            height: 146px;
        }

        .tag_01 {
            left: 21px;
            top: 114.70px;
        }

        .frame-2147227509_01,
        .frame-2147227510_01 {
            width: 100%;
            height: 146px;
        }

        .frame-13_01 {
            width: 100%;
            align-self: stretch;
        }

        .button {
            width: 100%;
            align-self: stretch;
            padding-left: 24px;
            padding-right: 24px;
            padding-top: 12px;
            padding-bottom: 12px;
        }

        .cancel_span {
            font-size: 16px;
            line-height: 22.40px;
        }
    }
</style>
