<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "../../../lib/supabase";
  import logo from "../../../assets/logo.png";
  import bookCover from "../../../assets/Luna1.png";
  import fullscreen from "../../../assets/fullscreen.svg";
  import coverIcon from "../../../assets/covericon.svg";
  import mailIcon from "../../../assets/mailicon.svg";
  import lockKeyIcon from "../../../assets/LockKey.svg";
  import timeIcon from "../../../assets/redtimeicon.svg";
  import hintIcon from "../../../assets/hintpurpleicon.svg";

  let activePage = 1;
  const totalPages = 5;

  let generating = false;
  let generatedImages: string[] = [];
  let currentSceneIndex = 0;
  let selectedWorld: string | null = null;
  let selectedDifficulty: string | null = null;
  let characterImageUrl: string | null = null;

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

  // Get prompts for each scene based on world
  function getScenePrompts(world: string): string[] {
    const basePrompts: { [key: string]: string[] } = {
      "enchanted-forest": [
        "Enhance this character image into a vibrant magical forest scene. The character searches for Luna among glowing plants, talking animals, and hidden treasures. Keep the character's original style and quality while enriching the magical woodland background with mystery and wonder.",
        "Enhance this character image into an enchanted castle scene. The character explores ancient halls filled with magical artifacts, hidden passages, and mystical creatures. Maintain the character's personality while adding mysterious castle details and enchanting atmosphere.",
        "Enhance this character image into a sparkling crystal cave scene. The character searches among glowing crystals, reflective pools, and hidden gems. Preserve the character's features while creating a dazzling underground wonderland.",
        "Enhance this character image into a colorful rainbow meadow scene. The character wanders through fields of flowers, butterflies, and magical rainbows. Keep the character's style while adding vibrant colors and joyful atmosphere.",
        "Enhance this character image into a mystical starlight library scene. The character explores bookshelves filled with glowing books, floating tomes, and magical knowledge. Maintain character authenticity while adding ethereal library elements.",
        "Enhance this character image into a whispering woods scene. The character listens carefully among ancient trees, mysterious shadows, and soft whispers. Preserve character features while creating an atmospheric woodland setting.",
        "Enhance this character image into a moonlit grove scene. The character searches under moonbeams, silvery leaves, and peaceful night creatures. Keep character style while adding serene nighttime magic.",
        "Enhance this character image into a victory celebration scene. The character celebrates finding Luna with friends, confetti, and joyful decorations in the magical forest. Maintain character personality while adding festive celebration elements.",
      ],
      "outer-space": [
        "Enhance this character image into a cosmic space station scene. The character searches for Luna among space modules, alien technology, and distant planets. Keep the character's original style while adding futuristic space elements and cosmic atmosphere.",
        "Enhance this character image into an alien planet scene. The character explores strange landscapes, colorful alien plants, and mysterious extraterrestrial life. Maintain character features while creating an otherworldly environment.",
        "Enhance this character image into an asteroid field scene. The character navigates through floating rocks, space debris, and twinkling stars. Preserve character style while adding dynamic space adventure elements.",
        "Enhance this character image into a nebula garden scene. The character wanders through colorful cosmic clouds, glowing space flowers, and shimmering stardust. Keep character authenticity while adding vibrant nebula details.",
        "Enhance this character image into a star library scene. The character explores shelves of glowing star-books, cosmic knowledge, and floating constellations. Maintain character personality while adding mystical space library elements.",
        "Enhance this character image into a galaxy maze scene. The character navigates through swirling galaxies, cosmic pathways, and stellar patterns. Preserve character features while creating an intricate space labyrinth.",
        "Enhance this character image into a comet trail scene. The character follows a glowing comet through space, among shooting stars and cosmic winds. Keep character style while adding dynamic movement and space excitement.",
        "Enhance this character image into a victory celebration scene. The character celebrates finding Luna with alien friends, space confetti, and cosmic decorations. Maintain character personality while adding festive space celebration elements.",
      ],
      "underwater-kingdom": [
        "Enhance this character image into a vibrant coral reef scene. The character searches for Luna among colorful corals, tropical fish, and underwater plants. Keep the character's original style while adding rich aquatic details and marine life.",
        "Enhance this character image into a sunken palace scene. The character explores ancient underwater ruins, treasure chambers, and mysterious aquatic architecture. Maintain character features while creating a majestic underwater kingdom.",
        "Enhance this character image into a pearl cave scene. The character searches among glowing pearls, shimmering shells, and hidden underwater treasures. Preserve character style while adding lustrous cave details.",
        "Enhance this character image into a kelp forest scene. The character swims through swaying seaweed, hidden sea creatures, and underwater pathways. Keep character authenticity while adding dynamic kelp forest elements.",
        "Enhance this character image into a treasure library scene. The character explores underwater bookshelves filled with aquatic scrolls, glowing sea maps, and ocean knowledge. Maintain character personality while adding mystical underwater library details.",
        "Enhance this character image into an abyss deep scene. The character searches in the mysterious depths among bioluminescent creatures, dark waters, and hidden secrets. Preserve character features while creating an atmospheric deep-sea setting.",
        "Enhance this character image into a mermaid garden scene. The character discovers beautiful underwater gardens, friendly sea creatures, and magical aquatic flowers. Keep character style while adding enchanting garden details.",
        "Enhance this character image into a victory celebration scene. The character celebrates finding Luna with sea friends, underwater confetti, and festive marine decorations. Maintain character personality while adding joyful aquatic celebration elements.",
      ],
    };

    return basePrompts[world] || basePrompts["enchanted-forest"];
  }

  async function generateAllImages() {
    if (!characterImageUrl || !selectedWorld) return;

    generating = true;
    generatedImages = [];

    try {
      const prompts = getScenePrompts(selectedWorld);
      const promises = prompts.map(async (prompt, index) => {
        // Generate image using the prompt directly via API
        const response = await fetch(
          "https://image-edit-five.vercel.app/edit-image",
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
        const response = await fetch('http://localhost:8000/compare-similarity', {
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
      
      const response = await fetch('http://localhost:8000/compare-similarity', {
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
</script>

<div class="preview-outer">
  <div class="preview-logo-container">
    <img class="preview-logo" src={logo} alt="Drawtopia Logo" />
  </div>
  <div class="preview-content-container">
    <div class="preview-header-title">
      Your Search Adventure : Where is Luna?
      <div class="preview-header-note">
        FREE PREVIEW · Other pages available after purchased
      </div>
    </div>
    <div class="preview-book-area">
      {#if generating}
        <div class="generating-container">
          <div class="generating-spinner"></div>
          <div class="generating-text">
            Generating your 8 adventure scenes...
          </div>
          <div class="generating-progress">This may take a few moments</div>
        </div>
      {:else if generatedImages.length > 0}
        <div class="scene-view-container">
          <div class="scene-info-header">
            <div class="scene-counter">
              Scene {currentSceneIndex + 1} of {generatedImages.length}
            </div>
            <div class="scene-title">
              {sceneTitles[selectedWorld || "enchanted-forest"]?.[
                currentSceneIndex
              ] || `Scene ${currentSceneIndex + 1}`}
            </div>
          </div>

          <div class="scene-image-container">
            <div 
              class="scene-image-wrapper"
              bind:this={imageWrapperRef}
              on:mousedown={handleMouseDown}
              on:mousemove={handleMouseMove}
              on:mouseup={handleMouseUp}
              on:mouseleave={handleMouseUp}
              role="application"
              tabindex="0"
              aria-label="Image selection area"
            >
              <img
                src={generatedImages[currentSceneIndex]}
                alt={sceneTitles[selectedWorld || "enchanted-forest"]?.[
                  currentSceneIndex
                ] || `Scene ${currentSceneIndex + 1}`}
                class="scene-main-image"
                draggable="false"
                bind:this={imageRef}
              />
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
        <div class="preview-book-container">
          <div class="preview-book-border">
            <div class="preview-book-mockup">
              <img
                class="preview-book-img"
                src={bookCover}
                alt="Preview - Where Is Luna?"
              />
            </div>
            <div class="preview-book-base"></div>
          </div>
          <button class="preview-fullscreen"
            ><img src={fullscreen} alt="Fullscreen" /> Full Screen Preview</button
          >
        </div>
      {/if}
    </div>
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

  .preview-content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 1240px;
    height: 1335px;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    padding: 12px;
  }

  .preview-header-title {
    width: 1216px;
    gap: 12px;
    display: flex;
    flex-direction: column;
    font-family: Quicksand, sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #23243c;
    letter-spacing: 0.01em;
    margin-bottom: 24px;
  }
  .preview-header-note {
    font-family: Nunito, sans-serif;
    font-size: 12px;
    color: #b8b8bb;
  }
  .preview-book-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 1216px;
    height: 1078px;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }
  .preview-book-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 745px;
    height: 1054px;
  }
  .preview-book-mockup {
    background: #000;
    border-radius: 19px 19px 22px 22px;
    box-shadow:
      0 4px 32px rgba(47, 70, 110, 0.16),
      0 0 0 2px #e7eaf8;
    padding: 0;
    margin-bottom: 0;
    border: 2.7px solid #e1e7f8;
    position: relative;
    z-index: 2;
  }
  .preview-book-img {
    width: 745px;
    height: 950px;
    border-radius: 18px 18px 22px 22px;
    background: white;
    object-fit: cover;
    box-shadow: none;
  }
  .preview-book-base {
    width: 77%;
    height: 24px;
    margin-top: -7px;
    background: radial-gradient(ellipse at center, #0001 33%, #fff0 74%);
    border-radius: 0 0 17px 17px / 0 0 48% 48%;
    box-shadow: 0 16px 32px 0 #abb4cf26;
    z-index: 1;
  }
  .preview-fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 270px;
    height: 56px;
    padding: 9px 23px;
    background: #f8fafc;
    border: 1.3px solid #e6ebf3;
    font-family: Nunito, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #141414;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.18s;
  }
  .preview-fullscreen:hover {
    background: #edf4fd;
  }
  .preview-footer-area {
    height: 57px;
    width: 1216px;
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
  .preview-dot.lock svg {
    margin: 0 auto;
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
    height: 1078px;
    background-color: #f8fafb;
    border-radius: 12px;
    padding: 12px;
  }

  .scene-info-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 0 24px;
  }

  .scene-counter {
    font-family: Nunito, sans-serif;
    font-size: 14px;
    color: #727272;
  }

  .scene-title {
    font-family: Quicksand, sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #23243c;
  }

  .scene-image-container {
    position: relative;
    width: 100%;
    height: 800px; /* Adjust as needed for image display */
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafb;
    border-radius: 12px;
    overflow: hidden;
  }

  .scene-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: crosshair;
    user-select: none;
  }

  .scene-main-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 12px;
    pointer-events: none;
  }

  .selection-overlay {
    position: absolute;
    background: rgba(173, 216, 230, 0.3);
    border: 2px dashed #438bff;
    pointer-events: none;
    z-index: 10;
  }

  .scene-navigation-controls {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 24px;
    margin-top: 24px;
  }

  .scene-nav-btn {
    font-family: Nunito, sans-serif;
    font-size: 13px;
    border: none;
    background: #f6f9fd;
    color: #a8a8ac;
    border-radius: 6px;
    padding: 6px 16px;
    cursor: pointer;
    height: 57px;
    width: 151px;
  }

  .scene-nav-btn:hover:not(:disabled) {
    background: #edf4fd;
  }

  .scene-nav-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  @media (max-width: 600px) {
    .scene-view-container {
      width: 96vw;
      height: auto;
      padding: 0;
    }
    .scene-info-header {
      padding: 0 10px;
    }
    .scene-image-container {
      height: 60vh; /* Adjust for smaller screens */
    }

    .scene-navigation-controls {
      padding: 0 10px;
      margin-top: 10px;
    }

    .found-modal-container {
      padding: 24px;
      max-width: 90%;
    }

    .found-modal-title {
      font-size: 24px;
    }

    .found-character-image {
      width: 150px;
      height: 150px;
    }

    .stat-item {
      font-size: 16px;
    }
    .scene-nav-btn {
      width: 120px; /* Adjust button width for smaller screens */
    }
  }

  @media (max-width: 600px) {
    .preview-book-img {
      width: 96vw;
      max-width: 320px;
      height: auto;
    }
    .preview-footer-area {
      gap: 7px;
      flex-direction: column;
    }
    .preview-book-mockup {
      padding: 0;
    }
    .preview-book-base {
      height: 16px;
    }
    .preview-logo {
      margin-top: 8vw;
      height: 28px;
    }
  }
</style>
