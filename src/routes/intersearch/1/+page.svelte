<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "../../../lib/supabase";
  import logo from "../../../assets/logo.png";
  import bookCover from "../../../assets/Luna1.png";
  import tempScene from "../../../assets/temp.jpg";
  import fullscreen from "../../../assets/fullscreen.svg";
  import coverIcon from "../../../assets/covericon.svg";
  import mailIcon from "../../../assets/mailicon.svg";
  import lockKeyIcon from "../../../assets/LockKey.svg";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import hintIcon from "../../../assets/hintIcon.svg";
  import shareIcon from '../../../assets/Share.svg';
  import dotsThreeOutline from '../../../assets/DotsThreeOutline.svg';
  import zoomIcon from '../../../assets/zoomIcon.svg';
  import arrowleft from '../../../assets/ArrowLeft.svg';
  import originalPrompts from '../../../lib/prompt.json';
  import { enhance } from "$app/forms";

  let activePage = 1;
  const totalPages = 5;

  let generating = false;
  let generatedImages: string[] = [];
  let currentSceneIndex = 0;
  let selectedWorld: string | null = null;
  let selectedDifficulty: string | null = null;
  let characterImageUrl: string | null = null;
  let selectedStyle: string | null = null;
  let selectedEnhancement: string | null = null;

  // Drag selection state
  let imageWrapperRef: HTMLDivElement | null = null;
  let imageRef: HTMLImageElement | null = null;
  let isDragging = false;
  let selectionStart = { x: 0, y: 0 };
  let selectionEnd = { x: 0, y: 0 };
  let showSelection = false;
  let showFoundModal = false;
  let croppedImageUrl: string | null = null;
  let cropError: string | null = null;
  let calculatingSimilarity = false;
  
  // Stats for modal
  let sceneTime = "10:13";
  let hintsUsed = 0;
  let hintsLeft = 3;
  let stars = 0;

  // Scene titles based on world
  const sceneTitles: { [key: string]: string[] } = {
    "enchanted-forest": [
      "The Magical Forest",
      "The Enchanted Castle",
      "The Crystal Cave",
      "The Rainbow Meadow",
      "The Starlight Library",
      "The Whispering Woods",
      "The Moonlit Grove",
      "The Victory Celebration",
    ],
    "outer-space": [
      "The Cosmic Station",
      "The Alien Planet",
      "The Asteroid Field",
      "The Nebula Garden",
      "The Star Library",
      "The Galaxy Maze",
      "The Comet Trail",
      "The Victory Celebration",
    ],
    "underwater-kingdom": [
      "The Coral Reef",
      "The Sunken Palace",
      "The Pearl Cave",
      "The Kelp Forest",
      "The Treasure Library",
      "The Abyss Deep",
      "The Mermaid Garden",
      "The Victory Celebration",
    ],
  };

  // Get prompts for each scene based on world and difficulty
  function getScenePrompts(world: string, difficulty?: string, style?: string, enhancement?: string): string[] {
    // Upgraded prompts for hidden-object puzzle illustration
    const basePrompts: { [key: string]: string[] } = {
      "enchanted-forest": [
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied enchanted forest environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied enchanted castle environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied crystal cave environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied rainbow meadow environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
      ],
      "outer-space": [
        `An extremely crowded, chaotic Zero-Gravity Playground hidden-object scene filled with drifting kids, aliens, robots, and space pets flying, flipping, tumbling, and bouncing around. The environment includes colorful anti-gravity equipment, floating platforms, neon rings, wormhole slides, asteroid climbing rocks, hover-swings, floating toys, anti-gravity balls, glowing particles, hologram signs, and drifting backpacks. Nearly every inch of the scene is packed—overlapping characters, lively interactions, comedic moments, and visual chaos everywhere, similar to an ultra-dense Where’s Waldo parade. All characters—children, aliens, robots, and space pets—must be fully formed, with clean outlines, distinct faces, complete limbs, and no blurry or distorted shapes. Foreground and background characters must remain clearly readable despite the density of the scene.`,
        `An extremely crowded, chaotic Zero-Gravity Playground hidden-object scene filled with drifting kids, aliens, robots, and space pets flying, flipping, tumbling, and bouncing around. The environment includes colorful anti-gravity equipment, floating platforms, neon rings, wormhole slides, asteroid climbing rocks, hover-swings, floating toys, anti-gravity balls, glowing particles, hologram signs, and drifting backpacks. Nearly every inch of the scene is packed—overlapping characters, lively interactions, comedic moments, and visual chaos everywhere, similar to an ultra-dense Where’s Waldo parade.`,
        `An extremely crowded, chaotic Robot Repair Shop hidden-object scene filled with hundreds of fully drawn robots, mechanics, alien engineers, and automated tools moving everywhere. The space is overflowing with activity: malfunctioning robots running wild, floating robot parts, conveyor belts carrying heads and limbs, sparks flying from welding machines, robotic arms grabbing tools, giant circuit boards, repair tables covered in wires, glowing battery chargers, floating hologram manuals, aliens tightening bolts, tiny robot pets wandering, workers arguing, and comedic mechanical failures in every corner. The scene should have no empty spaces, with overlapping interactions, micro-stories, and dense visual depth in a Where’s Waldo–style layout.`,
        `An extremely crowded, chaotic Intergalactic School hidden-object scene filled with hundreds of alien students, human students, robot classmates, floating teachers, hologram projectors, cosmic chalkboards, science experiments exploding, anti-gravity classroom desks drifting, space pets running between hallways, floating books, glowing orbs, tiny spaceships used as school buses, lockers shaped like planets, kids riding hover-desks, cafeteria trays levitating, and comedic micro-stories everywhere. The environment must be filled to every edge with overlapping crowds, busy classroom chaos, and high-density playground energy similar to a Where’s Waldo parade scene, with no empty spaces anywhere. Every character and background element must be fully drawn with complete faces, limbs, and clothing, with clean outlines and readable expressions.`,
      ],
      "underwater-kingdom": [
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied coral reef environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied sunken palace environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied pearl cave environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
        `Generate a hidden-object puzzle illustration.\n\nPrimary requirements:\n* Base background: use the supplied kelp forest environment image\n\nTarget Character Rules:\n* Embed the supplied character image exactly once\n* No distortions\n* Position within a moderately busy area\n* Partial occlusion allowed (objects/people overlapping)\n* Character must remain findable but not obvious\n\nVisual Complexity:\n* Add clutter, patterns, repeated items, color overlaps\n* Use variations of red/white/striped elements to increase challenge\n\nOutput:\nA high-resolution final illustration designed for a “find the character” game.`,
      ]
    };

    const characterDesc = "\n\nInclude the character from the provided reference image without changing any features. The character must have the exact same face, limbs, proportions, hair, skin tone, clothing details, and overall design as the reference. No changes to anatomy, style, or structure. The model must reproduce the character with full fidelity to the reference.";
    
    const prompts = basePrompts[world] || basePrompts["enchanted-forest"];

    // Difficulty modifiers appended to each prompt
    const difficultyExtras: { [key: string]: string } = {
      easy: `\n\nDifficulty modifiers:\n* Character 15-20% Visible\n* 5-8 other characters or other elements\n* Age 3-6 (Recommended)`,
      medium: `\n\nDifficulty modifiers:\n* Character 10-15% Visible\n* 10-15 other characters or other elements\n* Age 7-10 (Recommended)`,
      hard: `\n\nDifficulty modifiers:\n* Character 8-12% Visible\n* 15-25 other characters or other elements\n* Age 11-12 (Recommended)`,
    };

    const extra = difficulty ? difficultyExtras[difficulty] || "" : "";

    // Style extras - different prompts for each style
    const styleExtras: { [key: string]: string } = {
      "3d": `\n\nStyle guidelines:\n* Render character and scene in a 3D Pixar/Disney animated movie style.\n* Use smooth 3D modeling, cinematic lighting, and polished textures.\n* Keep the character's likeness and visual language consistent with the supplied character image.\n* The scene should feel like a frame from a high-quality animated film.\n *Ultra-clean 4K rendering, high clarity, and fully readable tiny details in even the densest areas. All characters must be large enough to clearly see eyes, expressions, antennas, robot details, and outfits. The scene image ratio is 16:9.`,
      "cartoon": `\n\nStyle guidelines:\n* Render character and scene in a classic storybook cartoon style.\n* Use clean lines, bright colors, and friendly, approachable designs.\n* Keep the character's likeness and visual language consistent with the supplied character image.\n* The scene should feel warm, timeless, and perfect for a children's storybook.\n *Ultra-clean 4K rendering, high clarity, and fully readable tiny details in even the densest areas. All characters must be large enough to clearly see eyes, expressions, antennas, robot details, and outfits. The scene image ratio is 16:9.`,
      "anime": `\n\nStyle guidelines:\n* Render character and scene in a Japanese anime style.\n* Use expressive features, cel-shading, and dynamic anime-style coloring.\n* Keep the character's likeness and visual language consistent with the supplied character image.\n* The scene should have the distinctive look and feel of professional anime artwork.\n *Ultra-clean 4K rendering, high clarity, and fully readable tiny details in even the densest areas. All characters must be large enough to clearly see eyes, expressions, antennas, robot details, and outfits. The scene image ratio is 16:9.`,
    };

    const styleExtra = style ? styleExtras[style] || "" : "";
  
    // Safely resolve enhancement text from prompt data (avoid complex keyof indexing in template)
    const enhancementExtra = (() => {
      if (!enhancement) return "";
      // Cast to any to bypass strict indexed access typing and possible TS parse issues inside template literal
      const enhancementValue = (originalPrompts as any)[style as any]?.[enhancement as any] ?? "";
      return `\n\nEnhancement level:\n* ${enhancementValue} (apply corresponding level of detail and polish to the character and scene).`;
    })();
  
    const combinedExtra = `${extra}${styleExtra}${characterDesc}${enhancementExtra}`;

    // Return prompts augmented with difficulty extras when provided
    if (combinedExtra) {
      return prompts.map((p) => p + combinedExtra);
    }

    return prompts;
  }

  async function generateAllImages() {
    if (!characterImageUrl || !selectedWorld) return;

    generating = true;
    generatedImages = [];

    try {
      const prompts = getScenePrompts(
        selectedWorld!,
        selectedDifficulty ?? undefined,
        selectedStyle ?? undefined,
        selectedEnhancement ?? undefined
      );
      const promises = prompts.map(async (prompt, index) => {
        // Generate image using the prompt directly via API
        const response = await fetch(
          'https://image-edit-five.vercel.app/edit-image',
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image_url: characterImageUrl,
              prompt: prompt,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to generate image ${index + 1}: ${response.status}`,
          );
        }

        const data = await response.json();

        if (data.storage_info?.uploaded && data.storage_info?.url) {
          const cleanUrl = data.storage_info.url.split("?")[0];

          // Save to sessionStorage
          if (browser) {
            sessionStorage.setItem(
              `intersearch_scene_${index + 1}`,
              data.storage_info.url,
            );
          }

          return cleanUrl;
        } else {
          throw new Error(`No image URL received for scene ${index + 1}`);
        }
      });

      const results = await Promise.allSettled(promises);
      generatedImages = results
        .map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            console.error(
              `Failed to generate scene ${index + 1}:`,
              result.reason,
            );
            return "";
          }
        })
        .filter((url) => url !== "");
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to generate images. Please try again.");
    } finally {
      generating = false;
    }
  }

  function nextScene() {
    if (currentSceneIndex < generatedImages.length - 1) {
      currentSceneIndex++;
    }
  }

  function previousScene() {
    if (currentSceneIndex > 0) {
      currentSceneIndex--;
    }
  }

  function goToScene(index: number) {
    if (index >= 0 && index < generatedImages.length) {
      currentSceneIndex = index;
    }
  }

  onMount(() => {
    if (browser) {
      selectedWorld = sessionStorage.getItem("intersearch_world");
      selectedDifficulty = sessionStorage.getItem("intersearch_difficulty");
      characterImageUrl = sessionStorage.getItem("characterImageUrl");
      // Also retrieve selected style and enhancement from character creation
      selectedStyle = sessionStorage.getItem('selectedStyle');
      selectedEnhancement = sessionStorage.getItem('selectedEnhancement');

      // Check if we need to regenerate scenes (from Play Again button)
      const shouldRegenerate = sessionStorage.getItem("intersearch_regenerate") === "true";
      
      if (shouldRegenerate) {
        // Clear existing scene images
        for (let i = 1; i <= 8; i++) {
          sessionStorage.removeItem(`intersearch_scene_${i}`);
        }
        // Clear the regeneration flag
        sessionStorage.removeItem("intersearch_regenerate");
        // Generate new images
        if (characterImageUrl && selectedWorld) {
          generateAllImages();
        } else {
          alert("Please complete character setup first");
          goto("/intersearch");
        }
      } else {
        // Check if images already exist in sessionStorage
        const existingImages: string[] = [];
        for (let i = 1; i <= 8; i++) {
          const stored = sessionStorage.getItem(`intersearch_scene_${i}`);
          if (stored) {
            existingImages.push(stored.split("?")[0]);
          }
        }

        if (existingImages.length === 8 && characterImageUrl) {
          generatedImages = existingImages;
          currentSceneIndex = 0;
        } else if (characterImageUrl && selectedWorld) {
          // Generate new images
          generateAllImages();
        } else {
          // No character image or world selected, go back
          alert("Please complete character setup first");
          goto("/intersearch");
        }
      }
    }
  });

  onDestroy(() => {
    // Clean up global event listeners
    if (browser) {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
    // Clean up cropped image URL
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
    }
  });

  function handleStartScene1() {
    // If on the last scene, navigate to results page
    if (currentSceneIndex === generatedImages.length - 1) {
      goto("/intersearch/3");
    } else if (currentSceneIndex < generatedImages.length - 1) {
      // Show the next scene on the current page
      currentSceneIndex++;
    }
  }

  function handleMouseDown(event: MouseEvent) {
    if (!imageWrapperRef || generating || generatedImages.length === 0) return;
    
    const rect = imageWrapperRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    isDragging = true;
    selectionStart = { x, y };
    selectionEnd = { x, y };
    showSelection = true;
    
    // Prevent default to avoid image dragging
    event.preventDefault();
    
    // Add global mouse listeners for smoother dragging
    if (browser) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging || !imageWrapperRef) return;
    updateSelection(event);
  }

  function handleGlobalMouseMove(event: MouseEvent) {
    if (!isDragging || !imageWrapperRef) return;
    updateSelection(event);
  }

  function updateSelection(event: MouseEvent) {
    if (!imageWrapperRef) return;
    const rect = imageWrapperRef.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    
    // Clamp to image bounds
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    
    selectionEnd = { x, y };
  }

  function handleMouseUp() {
    finishSelection();
  }

  function handleGlobalMouseUp() {
    finishSelection();
    if (browser) {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }

  async function cropImage() {
    if (!imageRef || !imageWrapperRef || generatedImages.length === 0) return null;
    
    const img = imageRef;
    const wrapperRect = imageWrapperRef.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    // Calculate actual image dimensions and position within wrapper
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const imgDisplayWidth = imgRect.width;
    const imgDisplayHeight = imgRect.height;
    
    // Calculate scale factors
    const scaleX = imgNaturalWidth / imgDisplayWidth;
    const scaleY = imgNaturalHeight / imgDisplayHeight;
    
    // Get selection coordinates relative to wrapper
    const startX = Math.min(selectionStart.x, selectionEnd.x);
    const startY = Math.min(selectionStart.y, selectionEnd.y);
    const endX = Math.max(selectionStart.x, selectionEnd.x);
    const endY = Math.max(selectionStart.y, selectionEnd.y);
    
    // Calculate image position within wrapper
    const imgOffsetX = (wrapperRect.width - imgDisplayWidth) / 2;
    const imgOffsetY = (wrapperRect.height - imgDisplayHeight) / 2;
    
    // Adjust selection coordinates to be relative to image
    const selectionX = Math.max(0, startX - imgOffsetX);
    const selectionY = Math.max(0, startY - imgOffsetY);
    const selectionWidth = Math.min(imgDisplayWidth, endX - imgOffsetX) - selectionX;
    const selectionHeight = Math.min(imgDisplayHeight, endY - imgOffsetY) - selectionY;
    
    // Convert to natural image coordinates
    const cropX = selectionX * scaleX;
    const cropY = selectionY * scaleY;
    let cropWidth = selectionWidth * scaleX;
    let cropHeight = selectionHeight * scaleY;
    
    // Make the crop square by using the smaller dimension
    const size = Math.min(cropWidth, cropHeight);
    cropWidth = size;
    cropHeight = size;
    
    // Center the crop area
    const centerX = cropX + (selectionWidth * scaleX) / 2;
    const centerY = cropY + (selectionHeight * scaleY) / 2;
    const adjustedCropX = Math.max(0, centerX - size / 2);
    const adjustedCropY = Math.max(0, centerY - size / 2);
    
    // Ensure we don't go outside image bounds
    const finalCropX = Math.min(adjustedCropX, imgNaturalWidth - size);
    const finalCropY = Math.min(adjustedCropY, imgNaturalHeight - size);
    
    try {
      // Fetch the image as a blob to avoid CORS issues
      const imageUrl = generatedImages[currentSceneIndex];
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a new image element and load the blob
      // Blob URLs are same-origin, so no CORS issues
      return new Promise<string | null>((resolve) => {
        const tempImg = new Image();
        
        tempImg.onload = () => {
          try {
            // Create canvas to crop the image (square)
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              URL.revokeObjectURL(blobUrl);
              resolve(null);
              return;
            }
            
            // Draw the cropped portion (square)
            ctx.drawImage(
              tempImg,
              finalCropX, finalCropY, size, size,
              0, 0, size, size
            );
            
            // Convert canvas to blob
            canvas.toBlob((croppedBlob) => {
              URL.revokeObjectURL(blobUrl);
              if (croppedBlob) {
                const url = URL.createObjectURL(croppedBlob);
                resolve(url);
              } else {
                resolve(null);
              }
            }, 'image/png');
          } catch (error) {
            console.error('Error cropping image:', error);
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          }
        };
        
        tempImg.onerror = () => {
          console.error('Error loading image for cropping');
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        };
        
        tempImg.src = blobUrl;
      });
    } catch (error) {
      console.error('Error fetching image for crop:', error);
      return null;
    }
  }

  // Helper function to resize image to a standard size
  async function resizeImageToSquare(blobUrl: string, targetSize: number = 512): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(null);
              return;
            }
            
            // Draw image resized to square
            ctx.drawImage(img, 0, 0, targetSize, targetSize);
            
            canvas.toBlob((resizedBlob) => {
              if (resizedBlob) {
                const url = URL.createObjectURL(resizedBlob);
                resolve(url);
              } else {
                resolve(null);
              }
            }, 'image/png');
          } catch (error) {
            console.error('Error resizing image:', error);
            resolve(null);
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image for resizing');
          resolve(null);
        };
        
        img.src = blobUrl;
      });
    } catch (error) {
      console.error('Error resizing image:', error);
      return null;
    }
  }

  // Helper function to resize image from URL to a standard size
  async function resizeImageFromUrl(imageUrl: string, targetSize: number = 512): Promise<string | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const resizedUrl = await resizeImageToSquare(blobUrl, targetSize);
      URL.revokeObjectURL(blobUrl);
      
      return resizedUrl;
    } catch (error) {
      console.error('Error resizing image from URL:', error);
      return null;
    }
  }

  async function uploadCroppedImageToSupabase(blobUrl: string): Promise<string | null> {
    try {
      // Resize the cropped image to a standard square size before uploading
      const resizedBlobUrl = await resizeImageToSquare(blobUrl, 512);
      if (!resizedBlobUrl) {
        console.error('Failed to resize cropped image');
        return null;
      }
      
      // Fetch the resized blob from the URL
      const response = await fetch(resizedBlobUrl);
      const blob = await response.blob();
      
      // Clean up the resized blob URL
      URL.revokeObjectURL(resizedBlobUrl);
      
      // Convert blob to File
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `cropped_${timestamp}_${randomString}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading cropped image to Supabase:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      return null;
    }
  }

  async function calculateSimilarity(characterImageUrl: string, croppedImageUrl: string): Promise<number> {
    try {
      // Resize both images to the same standard size (512x512) before comparison
      const standardSize = 512;
      
      const resizedCharacterUrl = await resizeImageFromUrl(characterImageUrl, standardSize);
      const resizedCroppedUrl = await resizeImageFromUrl(croppedImageUrl, standardSize);
      
      if (!resizedCharacterUrl || !resizedCroppedUrl) {
        console.error('Failed to resize images for comparison');
        // Fallback to original URLs if resize fails
        const response = await fetch('https://image-edit-five.vercel.app/compare-similarity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image1_url: characterImageUrl,
            image2_url: croppedImageUrl
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to calculate similarity: ${response.status}`);
        }

        const data = await response.json();
        return data.similarity || data.score || data.similarity_score || data.result?.similarity || 0;
      }
      
      // Upload both resized images to Supabase for comparison
      const charResponse = await fetch(resizedCharacterUrl);
      const croppedResponse = await fetch(resizedCroppedUrl);
      
      if (!charResponse.ok || !croppedResponse.ok) {
        throw new Error('Failed to fetch resized images');
      }
      
      const charBlob = await charResponse.blob();
      const croppedBlob = await croppedResponse.blob();
      
      // Upload character image
      const timestamp = Date.now();
      const charFileName = `compare_char_${timestamp}_${Math.random().toString(36).substring(2, 15)}.png`;
      const charFile = new File([charBlob], charFileName, { type: 'image/png' });
      
      const { data: charData, error: charError } = await supabase.storage
        .from('images')
        .upload(charFileName, charFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (charError) {
        console.error('Error uploading resized character image:', charError);
        // Clean up
        URL.revokeObjectURL(resizedCharacterUrl);
        URL.revokeObjectURL(resizedCroppedUrl);
        return 0;
      }

      // Upload cropped image
      const croppedFileName = `compare_cropped_${timestamp}_${Math.random().toString(36).substring(2, 15)}.png`;
      const croppedFile = new File([croppedBlob], croppedFileName, { type: 'image/png' });
      
      const { data: croppedData, error: croppedError } = await supabase.storage
        .from('images')
        .upload(croppedFileName, croppedFile, {
          cacheControl: '3600',
          upsert: false
        });

      // Clean up blob URLs
      URL.revokeObjectURL(resizedCharacterUrl);
      URL.revokeObjectURL(resizedCroppedUrl);

      if (croppedError) {
        console.error('Error uploading resized cropped image:', croppedError);
        return 0;
      }

      // Get public URLs
      const { data: charUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(charData.path);
      
      const { data: croppedUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(croppedData.path);

      console.log('Comparing resized images:', charUrlData.publicUrl, croppedUrlData.publicUrl);
      
      const response = await fetch('https://image-edit-five.vercel.app/compare-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image1_url: charUrlData.publicUrl,
          image2_url: croppedUrlData.publicUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate similarity: ${response.status}`);
      }

      const data = await response.json();
      // Try multiple possible response field names
      return data.similarity || data.score || data.similarity_score || data.result?.similarity || 0;
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  function calculateStars(similarity: number): number {
    if (similarity >= 0.75) {
      return 3;
    } else if (similarity >= 0.65 && similarity < 0.75) {
      return 2;
    } else if (similarity >= 0.5 && similarity < 0.65) {
      return 1;
    } else {
      return 0;
    }
  }

  async function finishSelection() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Only show modal if there's a meaningful selection (at least 20px)
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    if (width > 20 && height > 20) {
      cropError = null;
      calculatingSimilarity = true;
      // Crop the image
      const croppedBlobUrl = await cropImage();
      if (croppedBlobUrl && characterImageUrl) {
        // Store cropped image in Supabase first
        const croppedSupabaseUrl = await uploadCroppedImageToSupabase(croppedBlobUrl);
        
        if (croppedSupabaseUrl) {
          // Use the blob URL for display (local)
          croppedImageUrl = croppedBlobUrl;
          
          // Calculate similarity using Supabase URLs
          try {
            const similarity = await calculateSimilarity(characterImageUrl, croppedSupabaseUrl);
            stars = calculateStars(similarity);
          } catch (error) {
            console.error('Error calculating similarity:', error);
            stars = 0;
          }
        } else {
          console.warn("Failed to upload cropped image to Supabase");
          // Still show the cropped image but without similarity calculation
          croppedImageUrl = croppedBlobUrl;
          stars = 0;
        }
        
        calculatingSimilarity = false;
        showFoundModal = true;
      } else {
        calculatingSimilarity = false;
        if (!croppedBlobUrl) {
          cropError = "Unable to crop image. This may be due to CORS restrictions.";
        }
        console.warn("Image cropping failed");
      }
    }
    
    // Hide selection after a brief delay
    setTimeout(() => {
      showSelection = false;
    }, 100);
  }

  function closeFoundModal() {
    showFoundModal = false;
    cropError = null;
    // Clean up cropped image URL after a delay
    if (croppedImageUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(croppedImageUrl!);
        croppedImageUrl = null;
      }, 100);
    }
  }

  function downloadCroppedImage() {
    if (!croppedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = croppedImageUrl;
    link.download = `cropped-scene-${currentSceneIndex + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleModalNextScene() {
    closeFoundModal();
    if (currentSceneIndex < generatedImages.length - 1) {
      currentSceneIndex++;
    }
  }

  function starDisplay(count: number) {
    const filled = Array(count).fill("★").join("");
    const empty = Array(3 - count).fill("☆").join("");
    return filled + empty;
  }

  function handleBack() {
    goto("/intersearch");
  }
</script>

<div class="preview-outer">
  <div class="preview-logo-container">
    <img class="preview-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  <div class="arrow">
    <div class="button" on:click={handleBack} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleBack()}>
      <img src={arrowleft} alt="Arrow Left" />
      <div class="back"><span class="back_span">Back</span></div>
    </div>
    <div class="frame-2147227650">
      <button class="button_01" aria-label="More options">
        <img src={dotsThreeOutline} alt="More options">
      </button>
      <button class="button_02" aria-label="Share">
        <img src={shareIcon} alt="Share">
      </button>
    </div>
  </div>
  <div class="preview-content-container">
    <div class="preview-header-row">
      <div class="preview-header-title">
        <div class="preview-header-topic">
          Your Search Adventure : Where is Luna?
        </div>
        <div class="preview-header-note">
          FREE PREVIEW &#8226; Other pages available after purchased
        </div>
      </div>
      <div class="preview-header-actions">
        <button class="preview-header-btn" aria-label="Share">
          <img src={shareIcon} alt="Share" />
        </button>
        <button class="preview-header-btn" aria-label="More options">
          <img src={dotsThreeOutline} alt="More" />
        </button>
      </div>
    </div>
    <div class="rectangle"></div>
    {#if generating}
      <div class="generating-container">
        <div class="generating-spinner"></div>
        <div class="generating-text">
          Generating your 4 adventure scenes...
        </div>
        <div class="generating-progress">This may take a few moments</div>
      </div>
    {:else if generatedImages.length > 0}
      <div class="scene-view-container">
        <div class="scene-image-container">
          <div 
            class="book-container"
            bind:this={imageWrapperRef}
            on:mousedown={handleMouseDown}
            on:mousemove={handleMouseMove}
            on:mouseup={handleMouseUp}
            on:mouseleave={handleMouseUp}
            role="application"
            tabindex="0"
            aria-label="Image selection area"
          >
            <!-- Mobile: Split into left and right halves -->
            <div class="mobile-image-split">
              <div class="mobile-image-half mobile-image-left">
                <img
                  src={generatedImages[currentSceneIndex]}
                  alt={sceneTitles[selectedWorld || "enchanted-forest"]?.[
                    currentSceneIndex
                  ] || `Scene ${currentSceneIndex + 1} - Left`}
                  class="scene-main-image"
                  draggable="false"
                />
              </div>
              <div class="mobile-image-half mobile-image-right">
                <img
                  src={generatedImages[currentSceneIndex]}
                  alt={sceneTitles[selectedWorld || "enchanted-forest"]?.[
                    currentSceneIndex
                  ] || `Scene ${currentSceneIndex + 1} - Right`}
                  class="scene-main-image"
                  draggable="false"
                />
              </div>
            </div>
            <div class="scene-control-buttons">
              <button class="notification" aria-label="Full Screen Preview">
                <img src={fullscreen} alt="fullscreen" />
                <div><span class="fullscreenpreview_span">Full Screen Preview</span></div>
              </button>
              <button class="control-btn hint-btn" aria-label="Hint">
                <img src={hintIcon} alt="Hint" class="btn-icon" />
                <span>Hint ({hintsLeft} Left)</span>
              </button>
              <button class="control-btn zoom-btn" aria-label="Zoom">
                <img src={zoomIcon} alt="Zoom" class="btn-icon" />
                <span>Zoom</span>
              </button>
            </div>
            {#if showSelection}
              <div
                class="selection-overlay"
                style="left: {Math.min(selectionStart.x, selectionEnd.x)}px; 
                       top: {Math.min(selectionStart.y, selectionEnd.y)}px; 
                       width: {Math.abs(selectionEnd.x - selectionStart.x)}px; 
                       height: {Math.abs(selectionEnd.y - selectionStart.y)}px;"
              ></div>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="scene-view-container">
        <div class="scene-image-container">
          <!-- Mobile: Split into left and right halves -->
          <div class="mobile-image-split">
            <div class="mobile-image-half mobile-image-left">
              <img
                src={tempScene}
                alt="Preview - Where Is Luna? - Left"
                class="scene-main-image"
                draggable="false"
              />
            </div>
            <div class="mobile-image-half mobile-image-right">
              <img
                src={tempScene}
                alt="Preview - Where Is Luna? - Right"
                class="scene-main-image"
                draggable="false"
              />
            </div>
          </div>
          <div class="scene-control-buttons">
            <button class="notification" aria-label="Full Screen Preview">
              <img src={fullscreen} alt="fullscreen" />
              <div><span class="fullscreenpreview_span">Full Screen Preview</span></div>
            </button>
            <button class="control-btn hint-btn" aria-label="Hint">
              <img src={hintIcon} alt="Hint" class="btn-icon" />
              <span>Hint ({hintsLeft} Left)</span>
            </button>
            <button class="control-btn zoom-btn" aria-label="Zoom">
              <img src={zoomIcon} alt="Zoom" class="btn-icon" />
              <span>Zoom</span>
            </button>
          </div>
        </div>
      </div>
    {/if}
    <div class="preview-footer-area">
      <button
        class="preview-nav-btn"
        on:click={previousScene}
        disabled={currentSceneIndex === 0}>{"← Previous"}</button
      >
      <div class="preview-dots">
        {#if generatedImages.length > 0}
          {#each generatedImages as _, idx}
            <button
              class="preview-dot"
              class:active={currentSceneIndex === idx}
              on:click={() => goToScene(idx)}
              aria-label={`Go to scene ${idx + 1}`}
              disabled={generating}
            >
              {idx + 1}
            </button>
          {/each}
        {:else}
        <div class="preview-dots-container">

          {#each Array(totalPages) as _, idx}
            {#if idx === 0}
              <span class="preview-dot active">
                <img src={coverIcon} alt="cover icon" />
              </span>
            {:else if idx == 1}
              <span class="preview-dot">
                <img src={mailIcon} alt="mail icon" />
              </span>
            {:else if idx < 4}
              <span
                class="preview-dot"
                style="color: #fff; font-size: 24px; font-weight: 600;"
              >
                {idx - 1}
              </span>
            {:else}
              <span class="preview-dot lock">
                <img src={lockKeyIcon} alt="mail icon" />
              </span>
            {/if}
          {/each}
        </div>
        {/if}
      </div>
      <button
        class="preview-start-btn"
        on:click={handleStartScene1}
        disabled={generating || generatedImages.length === 0}
      >
        {generating 
          ? "Generating..." 
          : currentSceneIndex === generatedImages.length - 1 
            ? "Show Results" 
            : currentSceneIndex === 0 
              ? "Start Scene 1" 
              : "Next Scene"}
      </button>
    </div>
    <div class="frame-1410104203">
      <button class="button-nav" on:click={previousScene}>
        <div class="arrowleft-nav">
          <div class="vector-nav"></div>
        </div>
        <div class="previous"><span class="previous_span">Previous</span></div>
      </button>
      <button class="button_01-nav" on:click={handleStartScene1}>
        <div class="next"><span class="next_span">Next</span></div>
        <div class="arrowleft_01">
          <div class="vector_01"></div>
        </div>
        <div class="ellipse-1415"></div>
      </button>
    </div>
  </div>
</div>

<!-- You Found Luna Modal -->
{#if showFoundModal}
  <div 
    class="found-modal-overlay"
    on:click={closeFoundModal}
    on:keydown={(e) => e.key === 'Escape' && closeFoundModal()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div 
      class="found-modal-container" 
      on:click|stopPropagation
      on:keydown={(e) => e.key === 'Escape' && closeFoundModal()}
      tabindex="0"
    >
      <button class="found-modal-close" on:click={closeFoundModal} aria-label="Close">
        ×
      </button>
      
      <h2 class="found-modal-title">You Found Luna!</h2>
      
      {#if calculatingSimilarity}
        <div class="calculating-similarity">
          <div class="calculating-spinner"></div>
          <p>Calculating similarity...</p>
        </div>
      {:else if croppedImageUrl}
        <div class="cropped-image-preview">
          <img 
            src={croppedImageUrl} 
            alt="Cropped selection" 
            class="cropped-preview-image"
          />
          <button class="download-cropped-btn" on:click={downloadCroppedImage}>
            Download Cropped Image
          </button>
        </div>
      {:else if cropError}
        <div class="crop-error-message">
          <p>{cropError}</p>
        </div>
      {/if}
      
      <div class="found-modal-stats">
        <div class="stat-item">
          <img src={timeIcon} alt="Time" class="stat-icon" />
          <span class="stat-label">Time : {sceneTime}</span>
        </div>
        <div class="stat-item">
          <img src={hintIcon} alt="Hint" class="stat-icon" />
          <span class="stat-label">Hint Used: {hintsUsed}</span>
        </div>
        <div class="stat-item">
          <span class="star-display">{starDisplay(stars)}</span>
        </div>
      </div>
      
      <button class="found-modal-next-btn" on:click={handleModalNextScene}>
        Next Scene
      </button>
    </div>
  </div>
{/if}

<style>
  .preview-outer {
    min-height: 100vh;
    width: 100%;
    padding: 24px 100px 80px 100px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 30px;
    gap: 24px;
    overflow: hidden;
  }
  .preview-logo-container {
    justify-content: center;
    align-items: center;
    padding: 12px 12px 12px 24px;
  }

  .preview-logo {
    height: 43px;
  }

  .back_span {
    color: black;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .back {
    text-align: center;
  }

  .vector_01 {
    width: 21px;
    height: 6px;
    left: 1.50px;
    top: 9px;
    position: absolute;
    background: black;
    border-radius: 50%;
    box-shadow: 6px 0 0 black, 12px 0 0 black;
  }

  
  .rectangle {
    display: flex;
    height: 2px;
    background: #d9d9d9;
  }

  .button {
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
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button:hover {
    background: #f5f7fa;
  }

  .button_01 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_01:hover {
    background: #f5f7fa;
  }

  .button_02 {
    width: 48px;
    height: 48px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
    border-radius: 8px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_02:hover {
    background: #f5f7fa;
  }

  .frame-2147227650 {
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .arrow {
    display: none;
  }

  .preview-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1240px;
    max-width: 100%;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 12px;
  }

  .preview-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
    padding-top: 8px;
  }
  .preview-header-title {
    display: flex;
    flex-direction: column;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    letter-spacing: 0.01em;
    margin-bottom: 0;
    gap: 8px;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 14px;
    color: #888;
    font-weight: 400;
    margin-top: 2px;
  }
  .preview-header-actions {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 4px;
  }
  .preview-header-btn {
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 2px #0001;
    outline: none;
  }
  .preview-header-btn:hover {
    background: #f5f7fa;
    box-shadow: 0 2px 8px #0001;
  }
  .preview-header-btn img {
    width: 22px;
    height: 22px;
    display: block;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 12px;
    color: #b8b8bb;
  }
  
  .notification {
    height: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 16px;
    padding-right: 20px;
    background: #F8FAFB;
    box-shadow: 0px 1px 4px rgba(141.80, 141.80, 141.80) inset;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 18px;
    display: inline-flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notification:hover {
    background: #F0F4F7;
  }

  .fullscreenpreview_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .preview-footer-area {
    height: 57px;
    width: 1216px;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
  .preview-nav-btn {
    font-family: Nunito, sans-serif;
    font-size: 13px;
    border: none;
    background: #f6f9fd;
    color: #a8a8ac;
    border-radius: 6px;
    padding: 6px 16px;
    height: 57px;
    width: 151px;
  }
  .preview-dots {
    display: flex;
    gap: 7px;
  }
  .preview-dot {
    width: 40px;
    height: 40px;
    border-radius: 7px;
    background: #f0f0f8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1px;
    border: none;
    cursor: pointer;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #727272;
    transition: all 0.2s;
  }
  .preview-dot:hover:not(:disabled) {
    background: #e6ebf3;
    transform: translateY(-2px);
  }
  .preview-dot.active {
    background: #144be1;
    color: white;
    box-shadow: 0 2px 12px #477de710;
  }
  .preview-dot:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .preview-start-btn {
    font-family: Quicksand, sans-serif;
    color: #fff;
    background: #438bff;
    font-weight: 600;
    border: none;
    border-radius: 9px;
    font-size: 15px;
    padding: 10px 28px;
    min-width: 122px;
    box-shadow: 0 1.5px 6px #438bff22;
    cursor: pointer;
    transition: background 0.18s;
    height: 57px;
    width: 159px;
  }
  .preview-start-btn:hover:not(:disabled) {
    background: #2566c9;
  }
  .preview-start-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Generating state */
  .generating-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }

  .generating-spinner {
    width: 64px;
    height: 64px;
    border: 4px solid #e6ebf3;
    border-top-color: #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .generating-text {
    font-family: Quicksand, sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #23243c;
    text-align: center;
  }

  .generating-progress {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #727272;
    text-align: center;
  }

  /* Scene View Styles */
  .scene-view-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1216px;
    max-width: 100%;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }

  .scene-image-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8fafb;
    border-radius: 12px;
    overflow: visible;
    padding: 20px;
    gap: 20px;
  }

  .book-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .scene-main-image {
    display: block;
    max-width: 100%;
    max-height: 750px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  /* Mobile image split container - hidden on desktop */
  .mobile-image-split {
    /* display: none; */
    display: flex;
    flex-direction: row;
    gap: 2px;
    width: 100%;
  }

  .mobile-image-half {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 8px;
    height: 100%;
    position: relative;
    background: white;
    box-shadow: -2px 10px 0px black;
    border-radius: 24px;
  }

  .mobile-image-half .scene-main-image {
    width: 200%;
    max-width: 200%;
    height: auto;
    object-fit: cover;
  }

  .mobile-image-left .scene-main-image {
    object-position: left center;
    margin-left: 0;
  }

  .mobile-image-right .scene-main-image {
    object-position: right center;
    margin-left: -100%;
  }

  .book-container::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 85%;
    height: 20px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.05) 40%,
      transparent 70%
    );
    border-radius: 0 0 50% 50% / 0 0 100% 100%;
    z-index: 0;
  }

  .selection-overlay {
    position: absolute;
    background: rgba(173, 216, 230, 0.3);
    border: 2px dashed #438bff;
    pointer-events: none;
    z-index: 5;
  }

  .scene-control-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
    z-index: 10;
    pointer-events: auto;
    justify-content: center;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #e6e6e6;
    background: white;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #141414;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .control-btn:hover {
    background: #f5f7fa;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .control-btn .btn-icon {
    width: 18px;
    height: 18px;
    display: block;
  }

  .hint-btn {
    background: linear-gradient(180deg, #ff9500 0%, #ff7a00 100%);
    border: none;
    color: white;
    box-shadow: 0 2px 4px rgba(255, 149, 0, 0.3);
  }

  .hint-btn:hover {
    background: linear-gradient(180deg, #ff8500 0%, #ff6a00 100%);
    box-shadow: 0 4px 8px rgba(255, 149, 0, 0.4);
  }

  .hint-btn .btn-icon {
    filter: brightness(0) invert(1);
  }

  /* Found Luna Modal */
  .found-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    padding: 20px;
  }

  .found-modal-container {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .found-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: #f6f9fd;
    border-radius: 50%;
    font-size: 24px;
    color: #727272;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    line-height: 1;
  }

  .found-modal-close:hover {
    background: #e6ebf3;
    color: #23243c;
  }

  .found-modal-title {
    font-family: Quicksand, sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #23243c;
    margin: 0;
    text-align: center;
  }

  .calculating-similarity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px;
  }

  .calculating-similarity p {
    font-family: Nunito, sans-serif;
    font-size: 16px;
    color: #727272;
  }

  .calculating-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e6ebf3;
    border-top-color: #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .cropped-image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 0;
  }

  .cropped-preview-image {
    max-width: 100%;
    max-height: 300px;
    width: auto;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    object-fit: contain;
  }

  .download-cropped-btn {
    padding: 12px 24px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }

  .download-cropped-btn:hover {
    background: #059669;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    transform: translateY(-2px);
  }

  .crop-error-message {
    padding: 16px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    color: #991b1b;
    font-family: Nunito, sans-serif;
    font-size: 14px;
    text-align: center;
  }

  .found-modal-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: Nunito, sans-serif;
    font-size: 18px;
    color: #23243c;
  }

  .stat-icon {
    width: 24px;
    height: 24px;
  }

  .stat-label {
    font-weight: 600;
  }

  .star-display {
    font-size: 28px;
    letter-spacing: 4px;
    color: #FFD700;
    font-weight: 600;
  }

  .found-modal-next-btn {
    width: 100%;
    padding: 16px 32px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 12px;
    font-family: Quicksand, sans-serif;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
  }

  .found-modal-next-btn:hover {
    background: #2566c9;
    box-shadow: 0 6px 16px rgba(67, 139, 255, 0.4);
    transform: translateY(-2px);
  }

  /* Navigation Button Set Styles */
  .frame-1410104203 {
    display: none;
  }

  .vector-nav {
    width: 15px;
    height: 12.50px;
    left: 2.50px;
    top: 3.75px;
    position: absolute;
    background: black;
    clip-path: polygon(0 50%, 35% 0, 35% 25%, 100% 25%, 100% 75%, 35% 75%, 35% 100%);
  }

  .previous_span {
    color: black;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .previous {
    text-align: center;
  }

  .next_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans, sans-serif;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .next {
    text-align: center;
  }

  .vector_01 {
    width: 15px;
    height: 12.50px;
    left: 2.50px;
    top: 3.75px;
    position: absolute;
    background: white;
    clip-path: polygon(0 50%, 35% 0, 35% 25%, 100% 25%, 100% 75%, 35% 75%, 35% 100%);
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -42.50px;
    top: 13.20px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .arrowleft-nav {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft_01 {
    width: 20px;
    height: 20px;
    position: relative;
    transform: rotate(-180deg);
    overflow: hidden;
  }

  .button-nav {
    flex: 1 1 0;
    height: 48px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-nav:hover:not(:disabled) {
    background: #f5f7fa;
  }

  .button-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button_01-nav {
    flex: 1 1 0;
    height: 48px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_01-nav:hover:not(:disabled) {
    background: #2566c9;
  }

  .button_01-nav:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .preview-dots-container {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  /* ---------- Responsive styles ---------- */

  @media (max-width: 1024px) {
    .preview-outer {
      padding-left: 40px;
      padding-right: 40px;
    }

    .preview-content-container {
      width: 100%;
    }

    .preview-footer-area,
    .scene-view-container {
      width: 100%;
    }

    .arrow {
      width: 100%;
      height: 100%;
      padding-top: 6px;
      padding-bottom: 6px;
      justify-content: space-between;
      align-items: center;
      display: inline-flex;
      max-width: 1240px;
      width: 100%;
    }

    .preview-header-actions {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .preview-outer {
      padding: 16px;
      gap: 16px;
    }

    .preview-header-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .preview-header-title {
      font-size: 24px;
    }

    .scene-image-container {
      min-height: 60vh;
      padding: 8px;
    }

    .book-container {
      max-width: 100%;
    }

    .mobile-image-split {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .mobile-image-half {
      width: 100%;
    }

    .mobile-image-half .scene-main-image {
      width: 200%;
      max-width: 200%;
      height: auto;
      max-height: none;
    }

    .mobile-image-left .scene-main-image {
      object-position: left center;
      margin-left: 0;
    }

    .mobile-image-right .scene-main-image {
      object-position: right center;
      margin-left: -100%;
    }

    .scene-control-buttons {
      flex-direction: column;
      bottom: 16px;
      width: 100%;
    }

    .preview-footer-area {
      flex-direction: column;
      align-items: stretch;
      height: auto;
      gap: 12px;
    }

    .preview-nav-btn,
    .preview-start-btn {
      width: 100%;
      display: none;
    }

    .preview-logo {
      height: 32px;
    }

    .preview-header-topic {
      width: 70%;
      text-align: center;
      margin: auto;
    }

    .preview-header-note {
      width: 70%;
      text-align: center;
      margin: auto;
    }

    .frame-1410104203 {
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      gap: 12px;
      display: inline-flex;
    }

    .preview-dots-container {
      display: flex;
      flex-direction: row;
      gap: 4px;
      margin: auto;
    }

    .notification {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .preview-header-title {
      font-size: 20px;
    }

    .preview-start-btn {
      font-size: 14px;
    }

    .control-btn {
      padding: 8px 12px;
      font-size: 13px;
      width: 100%;
      height: 50px;
    }

    .found-modal-container {
      padding: 24px;
      max-width: 90%;
    }

    .found-modal-title {
      font-size: 24px;
    }

    .stat-item {
      font-size: 16px;
    }
  }
</style>
