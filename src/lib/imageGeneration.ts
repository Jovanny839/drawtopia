import { browser } from "$app/environment";
import prompts from "./prompt.json";
import { buildEnhancementPrompt } from "./promptBuilder";

export interface ImageGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageGenerationOptions {
  imageUrl: string;
  style: string;
  quality?: 'initial' | 'minimal' | 'normal' | 'high' | 'forest' | 'underwater' | 'outerspace' | string;
  saveToStorage?: boolean;
  storageKey?: string;
  // Optional character details for enhancement prompts
  characterName?: string;
  characterType?: 'person' | 'animal' | 'magical';
  specialAbility?: string;
}

/**
 * Generate a styled image using the image editing API
 */
export async function generateStyledImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { 
    imageUrl, 
    style, 
    quality = 'normal', 
    saveToStorage = true, 
    storageKey,
    characterName,
    characterType,
    specialAbility
  } = options;
  
  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    let prompt: string;
    
    // Check if this is a character enhancement (minimal/normal/high with 3d/cartoon/anime style)
    const isCharacterEnhancement = 
      (quality === 'minimal' || quality === 'normal' || quality === 'high') &&
      (style === '3d' || style === 'cartoon' || style === 'anime');
    
    if (isCharacterEnhancement) {
      // Use prompt1.json for character enhancements
      // Get character details from options or sessionStorage
      let charName = characterName;
      let charType = characterType;
      let ability = specialAbility;
      
      if (browser && (!charName || !charType || !ability)) {
        // Try to load from sessionStorage if not provided
        charName = charName || sessionStorage.getItem('characterName') || 'Character';
        const storedType = characterType || sessionStorage.getItem('selectedCharacterType') || 'person';
        // Map stored type to prompt1.json format (handle both 'magical' and 'magical_creature')
        if (storedType === 'magical_creature' || storedType === 'magical') {
          charType = 'magical';
        } else if (storedType === 'animal') {
          charType = 'animal';
        } else {
          charType = 'person';
        }
        ability = ability || sessionStorage.getItem('specialAbility') || '';
      }
      
      // Build prompt using prompt1.json
      prompt = buildEnhancementPrompt({
        characterName: charName || 'Character',
        characterType: charType || 'person',
        characterStyle: style as '3d' | 'cartoon' | 'anime',
        specialAbility: ability || '',
        enhancementLevel: quality as 'minimal' | 'normal' | 'high',
        uploadedImageUrl: imageUrl
      });
    } else if (style === 'environment') {
      // Handle environment prompts
      const environmentPrompts = prompts.environment as any;
      prompt = environmentPrompts[quality] || environmentPrompts.forest;
    } else if (style === 'adventure') {
      // Handle adventure prompts
      const adventurePrompts = prompts.adventure as any;
      const [world, adventureType] = (quality as string).split('_');
      prompt = adventurePrompts[world]?.[adventureType] || adventurePrompts.forest?.treasurehunt || prompts.cartoon.normal;
    } else {
      // Handle other style prompts (fallback to old prompt.json)
      const stylePrompts = prompts[style as keyof typeof prompts];
      prompt = (stylePrompts && quality in stylePrompts) 
        ? stylePrompts[quality as keyof typeof stylePrompts] 
        : prompts.cartoon.normal;
    }

    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image_url: imageUrl, prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.storage_info.uploaded) {
      const cleanUrl = data.storage_info.url.split('?')[0];
      
      // Save to sessionStorage if requested
      if (saveToStorage && browser) {
        const key = storageKey || `generatedImage_${style}`;
        sessionStorage.setItem(key, data.storage_info.url);
      }
      
      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error(`Error generating ${style} image:`, err);
    const errorMessage = err instanceof Error ? err.message : `Failed to generate ${style} image. Please try again.`;
    return { success: false, error: errorMessage };
  }
}

/**
 * Generate multiple styled images simultaneously
 */
export async function generateMultipleStyledImages(
  imageUrl: string, 
  styles: string[], 
  quality: 'initial' | 'minimal' | 'normal' | 'high' = 'normal'
): Promise<{ [style: string]: ImageGenerationResult }> {
  const promises = styles.map(async (style) => {
    const result = await generateStyledImage({
      imageUrl,
      style,
      quality,
      saveToStorage: true
    });
    return { style, result };
  });

  const results = await Promise.allSettled(promises);
  const output: { [style: string]: ImageGenerationResult } = {};

  results.forEach((result, index) => {
    const style = styles[index];
    if (result.status === 'fulfilled') {
      output[style] = result.value.result;
    } else {
      output[style] = { success: false, error: 'Promise rejected' };
    }
  });

  return output;
}

/**
 * Load previously generated images from sessionStorage
 */
export function loadGeneratedImages(styles: string[]): { [style: string]: string } {
  if (!browser) return {};
  
  const generatedImages: { [style: string]: string } = {};
  
  styles.forEach(style => {
    const storedImage = sessionStorage.getItem(`generatedImage_${style}`);
    if (storedImage) {
      generatedImages[style] = storedImage.split('?')[0];
    }
  });
  
  return generatedImages;
}

/**
 * Clear generated images from sessionStorage
 */
export function clearGeneratedImages(styles: string[]): void {
  if (!browser) return;
  
  styles.forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
}

/**
 * Check if the original image URL has changed and clear cache if needed
 */
export function handleImageUrlChange(newImageUrl: string, styles: string[]): boolean {
  if (!browser) return false;
  
  const storedLastProcessedUrl = sessionStorage.getItem('lastProcessedImageUrl');
  const imageUrlChanged = storedLastProcessedUrl && storedLastProcessedUrl !== newImageUrl;
  
  if (imageUrlChanged) {
    // Clear old generated images
    clearGeneratedImages(styles);
    
    // Update the last processed image URL
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return true;
  } else if (!storedLastProcessedUrl) {
    // First time processing this image
    sessionStorage.setItem('lastProcessedImageUrl', newImageUrl);
    return false;
  }
  
  return false;
}

/**
 * Save selected image URL for a specific step
 */
export function saveSelectedImageUrl(step: string, imageUrl: string): void {
  if (!browser) return;
  sessionStorage.setItem(`selectedImage_step${step}`, imageUrl);
}

/**
 * Get selected image URL for a specific step
 */
export function getSelectedImageUrl(step: string): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(`selectedImage_step${step}`);
}

/**
 * Check if selected image from previous step has changed
 */
export function hasSelectedImageChanged(step: string, currentImageUrl: string): boolean {
  if (!browser) return false;
  
  const previousImageUrl = getSelectedImageUrl(step);
  return previousImageUrl !== null && previousImageUrl !== currentImageUrl;
}

/**
 * Generate character image with special ability
 * This generates the base character image before enhancement
 */
export interface CharacterGenerationOptions {
  imageUrl: string;
  characterType?: string;
  specialAbility?: string;
  description?: string;
  style: '3d' | 'cartoon' | 'anime';
  saveToStorage?: boolean;
}

export async function generateCharacterWithSpecialAbility(
  options: CharacterGenerationOptions
): Promise<ImageGenerationResult> {
  const { 
    imageUrl, 
    characterType, 
    specialAbility, 
    description, 
    style,
    saveToStorage = true 
  } = options;

  if (!imageUrl) {
    return { success: false, error: 'No image URL provided' };
  }

  try {
    // Map character type to readable format
    const characterTypeMapping: { [key: string]: string } = {
      'person': 'a person',
      'animal': 'an animal',
      'magical_creature': 'a magical creature'
    };

    // Map special ability values to prompt.json keys
    const specialAbilityMapping: { [key: string]: string } = {
      'healing-powers': 'healingPower',
      'flying': 'flying',
      'super-strength': 'superStrength',
      'invisibility': 'invisibility',
      'animal-communication': 'animalCommunication',
      'time-control': 'timeControl',
      'shape-shifting': 'shapeShifting'
    };

    let characterTypeText = '';
    if (characterType) {
      const mappedType = characterTypeMapping[characterType.toLowerCase()];
      characterTypeText = mappedType || characterType;
    }

    let specialAbilityPrompt = '';
    
    // Get special ability prompt if it's a predefined one
    if (specialAbility) {
      const mappedKey = specialAbilityMapping[specialAbility.toLowerCase()];
      if (mappedKey && prompts.specialAbility && mappedKey in prompts.specialAbility) {
        specialAbilityPrompt = (prompts.specialAbility as any)[mappedKey];
      } else {
        // Use custom special ability text
        specialAbilityPrompt = specialAbility;
      }
    }

    // Combine prompts: character type + special ability + description
    let combinedPrompt = '';
    
    // Add character type context if available
    if (characterTypeText) {
      combinedPrompt = `The character is ${characterTypeText}. `;
    }
    
    // Add special ability prompt
    if (specialAbilityPrompt) {
      combinedPrompt += specialAbilityPrompt;
    }
    
    // Add description if it exists
    if (description && description.trim()) {
      if (combinedPrompt) {
        combinedPrompt += ' ' + description.trim();
      } else {
        combinedPrompt = description.trim();
      }
    }
    
    // Trim any extra whitespace
    combinedPrompt = combinedPrompt.trim();

    // Add negative prompts/instructions to preserve character features
    const negativePrompts = [
      'Don\'t add any other character except the input character.',
      'Keep the appearance features of the input character.'
    ];
    
    // Append negative prompts to the main prompt
    if (combinedPrompt) {
      combinedPrompt += ' ' + negativePrompts.join(' ');
    } else {
      combinedPrompt = negativePrompts.join(' ');
    }

    const response = await fetch('https://image-edit-five.vercel.app/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image_url: imageUrl, 
        prompt: combinedPrompt.trim(),
        negative_prompt: negativePrompts.join(' ')
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate character image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.storage_info.uploaded) {
      const cleanUrl = data.storage_info.url.split('?')[0];
      
      // Save to sessionStorage if requested
      if (saveToStorage && browser) {
        sessionStorage.setItem(`characterWithAbility_${style}`, data.storage_info.url);
      }
      
      return { success: true, url: cleanUrl };
    } else {
      throw new Error('No image URL received from the API');
    }
  } catch (err) {
    console.error('Error generating character with special ability:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate character image. Please try again.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Clear all cached images for regeneration
 */
export function clearAllCachedImages(): void {
  if (!browser) return;
  
  // Clear style images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`generatedImage_${style}`);
  });
  
  // Clear character with ability images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    sessionStorage.removeItem(`characterWithAbility_${style}`);
  });
  
  // Clear enhancement images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      sessionStorage.removeItem(`enhancementImage_${style}_${enhancement}`);
    });
  });
  
  // Clear environment images
  ['3d', 'cartoon', 'anime'].forEach(style => {
    ['minimal', 'normal', 'high'].forEach(enhancement => {
      ['forest', 'underwater', 'outerspace'].forEach(env => {
        sessionStorage.removeItem(`environmentImage_${style}_${enhancement}_${env}`);
      });
    });
  });
  
  // Clear adventure images
  ['forest', 'underwater', 'outerspace'].forEach(world => {
    ['treasure', 'helping'].forEach(adventure => {
      sessionStorage.removeItem(`adventureImage_${world}_${adventure}`);
    });
  });
}