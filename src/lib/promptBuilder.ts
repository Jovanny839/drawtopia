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
 * Maps world values to prompt1.json keys for story text
 */
function getStoryWorldKey(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "forest": "enchantedForest",
    "enchanted-forest": "enchantedForest",
    "enchanted_forest": "enchantedForest",
    "outerspace": "outerSpace",
    "outer-space": "outerSpace",
    "outer_space": "outerSpace",
    "underwater": "underwaterKingdom",
    "underwater-kingdom": "underwaterKingdom",
    "underwater_kingdom": "underwaterKingdom"
  };
  return worldMapping[world.toLowerCase()] || "enchantedForest";
}

/**
 * Maps adventure type to prompt1.json keys
 */
function getAdventureTypeKey(adventureType: string): string {
  const normalized = adventureType.toLowerCase();
  if (normalized.includes('treasure') || normalized.includes('hunt')) {
    return 'treasureHunt';
  }
  if (normalized.includes('help') || normalized.includes('friend')) {
    return 'helpingFriend';
  }
  return 'treasureHunt'; // default
}

/**
 * Maps occasion theme to prompt1.json keys
 */
function getOccasionThemeKey(occasionTheme: string): string {
  const normalized = occasionTheme.toLowerCase();
  if (normalized === 'birthday') return 'birthday';
  if (normalized === 'graduation') return 'graduation';
  if (normalized === 'first_day_school' || normalized === 'firstdayofschool') return 'firstDayOfSchool';
  if (normalized === 'new_sibling' || normalized === 'newsibling') return 'newSibling';
  return ''; // general or other themes don't have specific prompts
}

/**
 * Replaces placeholders in story text prompts
 */
function replaceStoryTextPlaceholders(
  template: string,
  options: StoryTextPromptOptions
): string {
  let result = template;
  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  const adventureDisplay = getAdventureTypeDisplayName(options.adventureType);
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{story_world\}/g, worldDisplay);
  result = result.replace(/\{adventure_type\}/g, adventureDisplay);
  result = result.replace(/\{adventure_objective\}/g, adventureDisplay.toLowerCase());
  
  return result;
}

/**
 * Builds a story text generation prompt for the entire 5-page story using prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateStoryText
 * 2. ageRequirement based on age group
 * 3. storyStructures for all 5 pages
 * 4. thematicRequirements based on adventure type
 * 5. occasionThemes if applicable
 * 6. worldSpecific based on story world
 * 7. characterConsistencyRequirements
 */
export function buildStoryTextPrompt(options: StoryTextPromptOptions): string {
  const storyText = (prompt1Data as any).generateStoryText;
  if (!storyText) {
    throw new Error('generateStoryText not found in prompt1.json');
  }

  const promptParts: string[] = [];

  // 1. Base prompt
  const basePrompt = storyText.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replaceStoryTextPlaceholders(basePrompt, options));
  }

  // 2. Age requirements based on age group
  const ageReq = storyText.ageRequirement?.[options.ageGroup];
  if (ageReq && ageReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(ageReq, options)}`);
  }

  // 3. Story structures for all 5 pages
  const storyStructures = storyText.storyStructures;
  if (storyStructures) {
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const pageKey = `page${pageNum}` as keyof typeof storyStructures;
      const pageStructure = storyStructures[pageKey];
      if (pageStructure && pageStructure.trim().length > 0) {
        promptParts.push(`\n\n${replaceStoryTextPlaceholders(pageStructure, options)}`);
      }
    }
  }

  // 4. Thematic requirements based on adventure type
  const adventureKey = getAdventureTypeKey(options.adventureType);
  const thematicReq = storyText.thematicRequirements?.[adventureKey];
  if (thematicReq && thematicReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(thematicReq, options)}`);
  }

  // 5. Occasion themes if applicable
  const occasionKey = getOccasionThemeKey(options.occasionTheme);
  if (occasionKey) {
    const occasionTheme = storyText.occasionThemes?.[occasionKey];
    if (occasionTheme && occasionTheme.trim().length > 0) {
      promptParts.push(`\n\n${replaceStoryTextPlaceholders(occasionTheme, options)}`);
    }
  }

  // 6. World-specific storytelling
  const worldKey = getStoryWorldKey(options.storyWorld);
  const worldSpecific = storyText.worldSpecific?.[worldKey];
  if (worldSpecific && worldSpecific.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(worldSpecific, options)}`);
  }

  // 7. Character consistency requirements
  const consistencyReq = storyText.characterConsistencyRequirements;
  if (consistencyReq && consistencyReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryTextPlaceholders(consistencyReq, options)}`);
  }

  // 8. Output format instructions
  promptParts.push(`\n\nOUTPUT FORMAT:
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
[content]`);

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
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
 * Interface for intersearch search adventure prompt options
 */
export interface IntersearchSearchAdventurePromptOptions {
  characterName: string;
  characterType: string;
  characterStyle: '3d' | 'cartoon' | 'anime';
  specialAbility: string;
  storyWorld: string; // 'enchanted-forest' | 'outer-space' | 'underwater-kingdom'
  ageGroup: string; // '3-6' | '7-10' | '11-12'
  difficulty: string; // 'easy' | 'medium' | 'hard'
  sceneNumber: number; // 1-4
  characterReferenceImage?: string;
}

/**
 * Maps world values to prompt1.json keys
 */
function getWorldKey(world: string): string {
  const worldMapping: { [key: string]: string } = {
    "enchanted-forest": "enchantedForest",
    "outer-space": "outerSpace",
    "underwater-kingdom": "underwaterKingdom"
  };
  return worldMapping[world.toLowerCase()] || "enchantedForest";
}

/**
 * Maps difficulty to prompt1.json keys
 */
function getDifficultyKey(difficulty: string): string {
  const normalized = difficulty.toLowerCase();
  if (normalized === 'easy' || normalized === '3-6') return 'easy';
  if (normalized === 'medium' || normalized === '7-10') return 'medium';
  if (normalized === 'hard' || normalized === '11-12') return 'hard';
  return 'medium'; // default
}

/**
 * Maps scene number to prompt1.json keys
 */
function getSceneKey(sceneNumber: number): string {
  return `scene${sceneNumber}`;
}

/**
 * Replaces placeholders in intersearch prompts
 */
function replaceIntersearchPlaceholders(
  template: string,
  options: IntersearchSearchAdventurePromptOptions
): string {
  let result = template;
  const worldDisplay = getWorldDisplayName(options.storyWorld);
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{story_world\}/g, worldDisplay);
  result = result.replace(/\{character_reference_image\}/g, options.characterReferenceImage || '[REFERENCE IMAGE]');
  
  return result;
}

/**
 * Builds an intersearch search adventure prompt from prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateSearchAdventure
 * 2. complexityRequirements based on difficulty
 * 3. styleSpecifications based on character style
 * 4. characterActions based on scene number
 * 5. worldSpecific based on world and scene number
 */
export function buildIntersearchSearchAdventurePrompt(
  options: IntersearchSearchAdventurePromptOptions
): string {
  const searchAdventure = (prompt1Data as any).generateSearchAdventure;
  if (!searchAdventure) {
    throw new Error('generateSearchAdventure not found in prompt1.json');
  }

  const promptParts: string[] = [];

  // 1. Base prompt
  const basePrompt = searchAdventure.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replaceIntersearchPlaceholders(basePrompt, options));
  }

  // 2. Complexity requirements based on difficulty
  const difficultyKey = getDifficultyKey(options.difficulty);
  const complexityReq = searchAdventure.complexityRequirements?.[difficultyKey];
  if (complexityReq && complexityReq.trim().length > 0) {
    promptParts.push(`\n\n${complexityReq}`);
  }

  // 3. Style specifications based on character style
  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'base';
  const styleSpecs = searchAdventure.styleSpecifications?.[styleKey] || 
                     searchAdventure.styleSpecifications?.base;
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceIntersearchPlaceholders(styleSpecs, options)}`);
  }

  // 4. Character actions based on scene number
  const sceneKey = getSceneKey(options.sceneNumber);
  const characterAction = searchAdventure.characterActions?.[sceneKey];
  if (characterAction && characterAction.trim().length > 0) {
    promptParts.push(`\n\n${characterAction}`);
  }

  // 5. World-specific scene description
  const worldKey = getWorldKey(options.storyWorld);
  const worldSpecific = searchAdventure.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const worldSceneDesc = worldSpecific[sceneKey];
    if (worldSceneDesc && worldSceneDesc.trim().length > 0) {
      promptParts.push(`\n\nWORLD-SPECIFIC SCENE:\n${worldSceneDesc}`);
    }
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}

/**
 * Replaces placeholders in story scene prompts
 */
function replaceStoryScenePlaceholders(
  template: string,
  options: StoryScenePromptOptions
): string {
  let result = template;
  const worldDisplay = getStoryWorldDisplayName(options.storyWorld);
  
  result = result.replace(/\{character_name\}/g, options.characterName);
  result = result.replace(/\{character_type\}/g, options.characterType);
  result = result.replace(/\{special_ability\}/g, options.specialAbility);
  result = result.replace(/\{character_style\}/g, options.characterStyle);
  result = result.replace(/\{age_group\}/g, options.ageGroup);
  result = result.replace(/\{story_world\}/g, worldDisplay);
  result = result.replace(/\{page_number\}/g, options.pageNumber.toString());
  result = result.replace(/\{story_page_text\}/g, options.pageText);
  
  return result;
}

/**
 * Builds a story scene image generation prompt using prompt1.json
 * 
 * Combines:
 * 1. basePrompt from generateStoryScene
 * 2. characterConsistencyEnforcement
 * 3. negativePrompts
 * 4. styleKeywords
 * 5. characterStyleSpecifications based on character style
 * 6. worldSpecific based on world and page number
 * 7. pageSpecificRequirements
 */
export function buildStoryScenePrompt(options: StoryScenePromptOptions): string {
  const storyScene = (prompt1Data as any).generateStoryScene;
  if (!storyScene) {
    throw new Error('generateStoryScene not found in prompt1.json');
  }

  const promptParts: string[] = [];

  // 1. Base prompt
  const basePrompt = storyScene.basePrompt || '';
  if (basePrompt && basePrompt.trim().length > 0) {
    promptParts.push(replaceStoryScenePlaceholders(basePrompt, options));
  }

  // 2. Character consistency enforcement
  const consistencyEnforcement = storyScene.characterConsistencyEnforcement;
  if (consistencyEnforcement && consistencyEnforcement.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(consistencyEnforcement, options)}`);
  }

  // 3. Style specifications based on character style
  const styleKey = options.characterStyle === '3d' ? '3d' : 
                   options.characterStyle === 'cartoon' ? 'cartoon' : 
                   options.characterStyle === 'anime' ? 'anime' : 'cartoon';
  const styleSpecs = storyScene.characterStyleSpecifications?.[styleKey];
  if (styleSpecs && styleSpecs.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(styleSpecs, options)}`);
  }

  // 4. World-specific environment details based on page number
  const worldKey = getStoryWorldKey(options.storyWorld);
  const worldSpecific = storyScene.worldSpecific?.[worldKey];
  if (worldSpecific) {
    const pageKey = `page${options.pageNumber}` as keyof typeof worldSpecific;
    const worldPageDesc = worldSpecific[pageKey];
    if (worldPageDesc && worldPageDesc.trim().length > 0) {
      promptParts.push(`\n\n${replaceStoryScenePlaceholders(worldPageDesc, options)}`);
    }
  }

  // 5. Page-specific requirements
  const pageSpecificReq = storyScene.pageSpecificRequirements;
  if (pageSpecificReq && pageSpecificReq.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(pageSpecificReq, options)}`);
  }

  // 6. Additional context if provided
  if (options.pageSceneDescription) {
    promptParts.push(`\n\nADDITIONAL SCENE DESCRIPTION: ${options.pageSceneDescription}`);
  }
  
  if (options.pageCharacterAction) {
    promptParts.push(`\n\nCHARACTER ACTION: ${options.pageCharacterAction}`);
  }
  
  if (options.pageEmotion) {
    promptParts.push(`\n\nCHARACTER EMOTION: ${options.pageEmotion}`);
  }
  
  if (options.companionCharacters) {
    promptParts.push(`\n\nCOMPANION CHARACTERS: ${options.companionCharacters}`);
  }

  // 7. Character reference image instructions
  if (options.characterImageUrl) {
    promptParts.push(`\n\nCHARACTER REFERENCE IMAGE:
- A reference image of ${options.characterName} is provided
- Use this reference image to maintain consistent character appearance across all scenes
- The character in the scene must match the appearance, style, and features shown in the reference image
- Keep the character's visual identity consistent with the reference image`);
  }

  // 8. Negative prompts
  const negativePrompts = storyScene.negativePrompts;
  if (negativePrompts && negativePrompts.trim().length > 0) {
    promptParts.push(`\n\n${replaceStoryScenePlaceholders(negativePrompts, options)}`);
  }

  // Combine all parts
  const finalPrompt = promptParts.join('');

  return finalPrompt;
}