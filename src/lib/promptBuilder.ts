import prompt1Data from './prompt1.json';

interface PromptBuilderOptions {
  characterName: string;
  characterType: 'person' | 'animal' | 'magical';
  characterStyle: '3d' | 'cartoon' | 'anime';
  specialAbility: string;
  enhancementLevel: 'minimal' | 'normal' | 'high';
  ageGroup?: string;
  uploadedImageUrl?: string;
}

/**
 * Maps special ability values from the form to prompt1.json keys
 */
function mapSpecialAbilityKey(specialAbility: string): string {
  const mapping: { [key: string]: string } = {
    'healing-powers': 'healingPower',
    'flying': 'flying',
    'super-strength': 'superStrength',
    'invisibility': 'invisibility',
    'animal-communication': 'animalCommunication',
    'time-control': 'timeControl',
    'shape-shifting': 'shapeShifting',
    'custom': 'custom'
  };
  
  return mapping[specialAbility.toLowerCase()] || 'custom';
}

/**
 * Gets character type key for prompt1.json
 */
function getCharacterTypeKey(characterType: string): 'person' | 'animal' | 'magical' {
  const normalized = characterType.toLowerCase();
  if (normalized === 'magical' || normalized === 'magical_creature') {
    return 'magical';
  }
  return normalized as 'person' | 'animal';
}

/**
 * Replaces placeholders in a prompt template
 */
function replacePlaceholders(
  template: string,
  options: PromptBuilderOptions
): string {
  let result = template;
  
  // Replace all placeholders
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{age_group\}/g, options.ageGroup || '7-10');
  result = result.replace(/\{uploaded_child_drawing\}/g, options.uploadedImageUrl || '[REFERENCE IMAGE]');
  
  return result;
}

/**
 * Builds a comprehensive enhancement prompt from prompt1.json
 * 
 * The prompt is built by combining:
 * 1. Base enhancement level prompt (minimal/normal/high)
 * 2. Base character type specifications
 * 3. Additional enhancement specifications (from additionalEnhancement) based on:
 *    - Enhancement level (normal/high only - minimal doesn't have additional specs)
 *    - Character type
 *    - Character style (3d/cartoon/anime)
 *    - Special ability
 */
export function buildEnhancementPrompt(options: PromptBuilderOptions): string {
  const { characterType, characterStyle, specialAbility, enhancementLevel } = options;
  
  // Get base enhancement level prompt (minimal/normal/high)
  const basePrompt = (prompt1Data as any).enhanceCharacter?.enhancementLevel?.[enhancementLevel] || '';
  
  // Get character type specifications (base specs, always included)
  const characterTypeKey = getCharacterTypeKey(characterType);
  const characterTypeSpecs = (prompt1Data as any).enhanceCharacter?.characterType?.[characterTypeKey] || '';
  
  // Get additional enhancement specs based on enhancement level (normal/high)
  // Note: minimal level doesn't have additionalEnhancement, which is fine
  const additionalEnhancement = (prompt1Data as any).enhanceCharacter?.additionalEnhancement?.[enhancementLevel];
  
  // Get additional character type specs from additionalEnhancement (if exists and has content)
  const additionalCharacterTypeSpecs = additionalEnhancement?.characterType?.[characterTypeKey];
  const hasAdditionalCharacterTypeSpecs = additionalCharacterTypeSpecs && additionalCharacterTypeSpecs.trim().length > 0;
  
  // Get style specifications from additionalEnhancement (if exists and has content)
  const styleSpecs = additionalEnhancement?.characterStyle?.[characterStyle];
  const hasStyleSpecs = styleSpecs && styleSpecs.trim().length > 0;
  
  // Map and get special ability specifications
  const abilityKey = mapSpecialAbilityKey(specialAbility);
  let specialAbilitySpecs = (prompt1Data as any).enhanceCharacter?.specialAbility?.[abilityKey] || '';
  
  // Get additional special ability specifications from additionalEnhancement (if exists and has content)
  const additionalSpecialAbilitySpecs = additionalEnhancement?.specialAbility?.[abilityKey];
  const hasAdditionalSpecialAbilitySpecs = additionalSpecialAbilitySpecs && additionalSpecialAbilitySpecs.trim().length > 0;
  
  // If it's a custom ability and no predefined specs exist, create a custom description
  if (abilityKey === 'custom' && !specialAbilitySpecs && specialAbility && specialAbility.trim()) {
    specialAbilitySpecs = `CUSTOM SPECIAL ABILITY: ${specialAbility}\n\nApply this custom ability visually to the character, making it clear and appropriate for the character type and style.`;
  }
  
  // Build the combined prompt
  const promptParts: string[] = [];
  
  // 1. Base enhancement level prompt (with placeholders replaced)
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replacePlaceholders(basePrompt, options));
  }
  
  // 2. Base character type specifications (always included if exists)
  if (characterTypeSpecs && characterTypeSpecs.trim().length > 0) {
    promptParts.push(`\n\nCHARACTER TYPE SPECIFICATIONS:\n${characterTypeSpecs}`);
  }
  
  // 3. Additional character type specifications from additionalEnhancement (based on enhancement level)
  if (hasAdditionalCharacterTypeSpecs) {
    promptParts.push(`\n\n${replacePlaceholders(additionalCharacterTypeSpecs, options)}`);
  }
  
  // 4. Style specifications from additionalEnhancement (based on enhancement level and character style)
  if (hasStyleSpecs) {
    promptParts.push(`\n\n${replacePlaceholders(styleSpecs, options)}`);
  }
  
  // 5. Base special ability specifications (always included if exists)
  if (specialAbilitySpecs && specialAbilitySpecs.trim().length > 0) {
    promptParts.push(`\n\n${specialAbilitySpecs}`);
  }
  
  // 6. Additional special ability specifications from additionalEnhancement (based on enhancement level)
  // if (hasAdditionalSpecialAbilitySpecs) {
  //   promptParts.push(`\n\n${replacePlaceholders(additionalSpecialAbilitySpecs, options)}`);
  // }
  
  // Combine all parts
  const finalPrompt = promptParts.join('');
  
  return finalPrompt;
}

/**
 * Gets a simplified prompt for quick reference
 */
export function getPromptSummary(options: PromptBuilderOptions): string {
  return `Character: ${options.characterName} (${options.characterType}), Style: ${options.characterStyle}, Ability: ${options.specialAbility}, Level: ${options.enhancementLevel}`;
}

/**
 * Interface for intersearch scene prompt options
 */
export interface IntersearchScenePromptOptions {
  sceneNumber: number; // 1-4
  storyTitle: string;
  storyWorld: string; // 'enchanted-forest' | 'outer-space' | 'underwater-kingdom'
  characterName: string;
  characterType: string; // 'person' | 'animal' | 'magical'
  characterStyle: string; // '3d' | 'cartoon' | 'anime'
  specialAbility: string;
  ageGroup: string;
  sceneTitle: string;
  sceneDescription: string;
  characterActionForScene: string;
  characterEmotionForScene: string;
  storyContinuationForThisScene: string;
}

/**
 * Maps world values to display names
 */
function getWorldDisplayName(world: string): string {
  const worldDisplayNames: { [key: string]: string } = {
    "enchanted-forest": "Enchanted Forest",
    "outer-space": "Outer Space",
    "underwater-kingdom": "Underwater Kingdom"
  };
  return worldDisplayNames[world] || world;
}

/**
 * Builds an intersearch scene prompt based on the provided format
 */
export function buildIntersearchScenePrompt(options: IntersearchScenePromptOptions): string {
  const worldDisplay = getWorldDisplayName(options.storyWorld);

  return `SCENE INFORMATION:
- Scene Number: ${options.sceneNumber} (1-4)
- Book Title: "${options.storyTitle}"
- World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Character to Find: ${options.characterName}, a ${options.characterType}
- Character Style: ${options.characterStyle}
- Character Special Ability: ${options.specialAbility}
- Target Age Group: ${options.ageGroup}
- Scene Title: "${options.sceneTitle}"


SCENE CONTEXT & NARRATIVE:

Scene Setting: ${options.sceneDescription}

Character's Action in This Scene: ${options.characterActionForScene}

Character's Emotional State: ${options.characterEmotionForScene}

Story Context: ${options.storyContinuationForThisScene}`;
}

/**
 * Interface for story text generation prompt options
 */
export interface StoryTextPromptOptions {
  characterName: string;
  characterType: string; // 'person' | 'animal' | 'magical_creature'
  specialAbility: string;
  characterStyle: string; // '3d' | 'cartoon' | 'anime'
  storyWorld: string; // 'Enchanted Forest' | 'Outer Space' | 'Underwater Kingdom'
  adventureType: string; // 'Treasure Hunt' | 'Helping a Friend'
  occasionTheme: string; // 'birthday' | 'graduation' | 'first_day_school' | 'new_sibling' | 'holiday' | 'general'
  ageGroup: string; // '3-6' | '7-10' | '11-12'
  readingLevel: string; // 'early_reader' | 'developing_reader' | 'independent_reader'
  storyTitle: string;
  pageNumber: number; // 1-5
  pageText?: string; // For pages 2-5, the previous page text
  pageSceneDescription?: string; // Scene description for the page
  pageCharacterAction?: string; // Character action for the page
  pageEmotion?: string; // Character emotion for the page
  companionCharacters?: string; // Companion characters if any
}

/**
 * Maps world values to display names
 */
function getStoryWorldDisplayName(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "forest": "Enchanted Forest",
    "enchanted-forest": "Enchanted Forest",
    "enchanted_forest": "Enchanted Forest",
    "outerspace": "Outer Space",
    "outer-space": "Outer Space",
    "outer_space": "Outer Space",
    "underwater": "Underwater Kingdom",
    "underwater-kingdom": "Underwater Kingdom",
    "underwater_kingdom": "Underwater Kingdom"
  };
  return worldMapping[world.toLowerCase()] || world;
}

/**
 * Maps adventure type values to display names
 */
function getAdventureTypeDisplayName(adventureType: string): string {
  const adventureMapping: { [key: string]: string } = {
    "treasure": "Treasure Hunt",
    "treasure-hunt": "Treasure Hunt",
    "treasure_hunt": "Treasure Hunt",
    "helping": "Helping a Friend",
    "helping-a-friend": "Helping a Friend",
    "helping_a_friend": "Helping a Friend",
    "helpfriend": "Helping a Friend"
  };
  return adventureMapping[adventureType.toLowerCase()] || adventureType;
}

/**
 * Builds a story text generation prompt for the entire 5-page story
 */
export function buildStoryTextPrompt(options: StoryTextPromptOptions): string {
  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  
  let prompt = `Create a personalized 5-page children's storybook.

CHARACTER INFORMATION:
- Character Name: ${options.characterName}
- Character Type: ${options.characterType} (person/animal/magical_creature)
- Special Ability: ${options.specialAbility}
- Character Description: As uploaded/described by child
- Art Style (for visual context): ${options.characterStyle}

STORY CONFIGURATION:
- Story World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Adventure Type: ${adventureDisplay} (Treasure Hunt / Helping a Friend)
- Occasion Theme: ${options.occasionTheme} (birthday/graduation/first_day_school/new_sibling/holiday/general)
- Target Age Group: ${options.ageGroup} (3-6 / 7-10 / 11-12)
- Reading Level: ${options.readingLevel} (early_reader / developing_reader / independent_reader)

BOOK & PAGE INFORMATION:
- Book Title: "${options.storyTitle}"
- World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Adventure Type: ${adventureDisplay} (Treasure Hunt / Helping a Friend)
- Target Age Group: ${options.ageGroup}

CHARACTER INFORMATION:
- Character Name: ${options.characterName}
- Character Type: ${options.characterType}
- Special Ability: ${options.specialAbility}
- Art Style: ${options.characterStyle}
- Character Visual Reference: [Based on enhancement image]

Generate a complete 5-page story following this structure:
- PAGE 1: Introduce ${options.characterName} and reveal their special ability
- PAGE 2: ${options.characterName} discovers/enters ${worldDisplay}
- PAGE 3: The ${adventureDisplay.toLowerCase()} adventure begins
- PAGE 4: ${options.characterName} faces a challenge and uses their special ability
- PAGE 5: Resolution and positive ending

Format the output as:
PAGE 1:
[content]

PAGE 2:
[content]

PAGE 3:
[content]

PAGE 4:
[content]

PAGE 5:
[content]`;

  return prompt;
}

/**
 * Interface for story scene image generation prompt options
 */
export interface StoryScenePromptOptions {
  characterName: string;
  characterType: string;
  specialAbility: string;
  characterStyle: string;
  storyWorld: string;
  adventureType: string;
  ageGroup: string;
  storyTitle: string;
  pageNumber: number;
  pageText: string;
  pageSceneDescription?: string;
  pageCharacterAction?: string;
  pageEmotion?: string;
  companionCharacters?: string;
  characterImageUrl?: string; // Reference image URL
}

/**
 * Builds a story scene image generation prompt
 */
export function buildStoryScenePrompt(options: StoryScenePromptOptions): string {
  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  
  let prompt = `Create a beautiful, colorful children's storybook illustration for this story page.

STORY PAGE TEXT (Page ${options.pageNumber}):
${options.pageText}
- Embed this story page text into the image naturally.

BOOK & PAGE INFORMATION:
- Book Title: "${options.storyTitle}"
- Page Number: ${options.pageNumber} of 5
- World: ${worldDisplay} (Enchanted Forest / Outer Space / Underwater Kingdom)
- Adventure Type: ${adventureDisplay} (Treasure Hunt / Helping a Friend)
- Target Age Group: ${options.ageGroup}

CHARACTER INFORMATION:
- Character Name: ${options.characterName}
- Character Type: ${options.characterType}
- Special Ability: ${options.specialAbility}
- Art Style: ${options.characterStyle}
- Character Visual Reference: [Based on enhancement image]`;

  if (options.pageSceneDescription) {
    prompt += `\n\nSCENE DESCRIPTION: ${options.pageSceneDescription}`;
  }
  
  if (options.pageCharacterAction) {
    prompt += `\n\nCHARACTER ACTION: ${options.pageCharacterAction}`;
  }
  
  if (options.pageEmotion) {
    prompt += `\n\nCHARACTER EMOTION: ${options.pageEmotion}`;
  }
  
  if (options.companionCharacters) {
    prompt += `\n\nCOMPANION CHARACTERS: ${options.companionCharacters}`;
  }

  if (options.characterImageUrl) {
    prompt += `\n\nCHARACTER REFERENCE:
- A reference image of ${options.characterName} is provided below
- Use this reference image to maintain consistent character appearance across all scenes
- The character in the scene must match the appearance, style, and features shown in the reference image
- Keep the character's visual identity consistent with the reference image

=== MANDATORY CHARACTER STYLE CONSISTENCY REQUIREMENTS ===
CRITICAL: The character from the provided reference image MUST be embedded with EXACT visual fidelity.

REQUIRED CHARACTER FEATURES (DO NOT CHANGE):
* Face: Exact same facial features, eye shape, nose, mouth, and expression style as reference
* Limbs: Exact same proportions, length, and structure as reference
* Body proportions: Exact same height-to-width ratio and body shape as reference
* Hair: Exact same hair style, color, texture, and length as reference
* Skin tone: Exact same skin color and tone as reference
* Clothing: Exact same clothing design, colors, patterns, and details as reference
* Overall design: Exact same character design language, style, and visual identity as reference
* Anatomy: Exact same anatomical structure - no changes to bone structure, muscle definition, or body type
* Style: The character's artistic style must remain consistent with the reference image

=== NEGATIVE PROMPTS (STRICTLY AVOID) ===
DO NOT:
* Alter the character's facial features, proportions, or anatomy
* Change the character's hair style, color, or texture
* Modify the character's skin tone or color
* Alter the character's clothing design, colors, or patterns
* Change the character's body proportions or structure
* Apply different artistic styles to the character than the reference
* Distort, stretch, or resize the character in ways that change appearance
* Add features not present in the reference image
* Remove features present in the reference image
* Create variations of the character - use the exact reference character only`;
  }

  prompt += `\n\nILLUSTRATION REQUIREMENTS:
1. Create a vibrant, age-appropriate children's book illustration
2. Include the main character (${options.characterName}) as a ${options.characterType} - ${options.characterName} is the clear hero of this story
3. CHARACTER PROMINENCE: The character (${options.characterName}) must occupy 60-70% of the composition. The character should be the dominant visual element, clearly visible and prominent in the scene
4. Match the mood, setting, and events from the story text
5. Use bright, cheerful colors suitable for children
6. Make it visually appealing and engaging
7. Ensure the scene is positive and appropriate for children
8. Include relevant details about the setting and characters
9. Style should be like a professional children's book illustration
10. IMPORTANT: The image must be in 768x512 dimensions
${options.characterImageUrl ? '11. CRITICAL: The character must match the appearance shown in the reference image provided' : ''}

Generate a high-quality illustration that perfectly captures this story moment in 768x512 dimensions.`;

  return prompt;
}