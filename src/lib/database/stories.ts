/**
 * Stories Database Operations
 */

import { supabase } from '../supabase';

export interface Story {
  id?: string;
  created_at?: string;
  child_profile_id: string;
  character_name: string;
  character_type: 'person' | 'animal' | 'magical_creature';
  special_ability?: string;
  character_style: '3d' | 'cartoon' | 'anime';
  story_world: 'forest' | 'space' | 'underwater';
  adventure_type: 'treasure_hunt' | 'helping_friend';
  original_image_url: string;
  enhanced_images?: string[];
  story_title?: string;
  cover_design?: string;
  status?: 'generating' | 'completed' | 'failed';
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new story
 * @param story - The story data to insert
 * @returns Promise with operation result
 */
export async function createStory(story: Story): Promise<DatabaseResult> {
  console.log('Creating story:', story);
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert([{
        child_profile_id: story.child_profile_id,
        character_name: story.character_name,
        character_type: story.character_type,
        special_ability: story.special_ability,
        character_style: story.character_style,
        story_world: story.story_world,
        adventure_type: story.adventure_type,
        original_image_url: story.original_image_url,
        enhanced_images: story.enhanced_images || [],
        story_title: story.story_title,
        cover_design: story.cover_design,
        status: story.status || 'generating'
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error creating story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the story'
    };
  }
}

/**
 * Update a story
 * @param storyId - The story ID to update
 * @param updates - The fields to update
 * @returns Promise with operation result
 */
export async function updateStory(storyId: string, updates: Partial<Story>): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error updating story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the story'
    };
  }
}

/**
 * Get stories for a specific child profile
 * @param childProfileId - The child profile ID
 * @returns Promise with stories
 */
export async function getStoriesForChild(childProfileId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories for child:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Unexpected error fetching stories for child:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching stories'
    };
  }
}

/**
 * Get all stories for a parent (across all their children)
 * @param parentId - The parent's user ID
 * @returns Promise with stories
 */
export async function getAllStoriesForParent(parentId: string): Promise<DatabaseResult> {
  try {
    // First, get all child profile IDs for this parent
    const { data: childProfiles, error: childError } = await supabase
      .from('child_profiles')
      .select('id, first_name, age_group')
      .eq('parent_id', parentId);

    if (childError) {
      console.error('Error fetching child profiles:', childError);
      return {
        success: false,
        error: childError.message
      };
    }

    if (!childProfiles || childProfiles.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // Extract child profile IDs
    const childProfileIds = childProfiles.map(profile => profile.id);

    // Now get all stories for these child profiles
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .in('child_profile_id', childProfileIds)
      .order('created_at', { ascending: false });

    if (storiesError) {
      console.error('Error fetching stories for parent:', storiesError);
      return {
        success: false,
        error: storiesError.message
      };
    }

    // Merge child profile data with stories
    const storiesWithChildData = stories?.map(story => {
      const childProfile = childProfiles.find(cp => cp.id === story.child_profile_id);
      return {
        ...story,
        child_profiles: childProfile
      };
    }) || [];

    return {
      success: true,
      data: storiesWithChildData
    };

  } catch (error) {
    console.error('Unexpected error fetching stories for parent:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching stories'
    };
  }
}

/**
 * Get a single story by ID
 * @param storyId - The story ID
 * @returns Promise with story data
 */
export async function getStoryById(storyId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        child_profiles (
          id,
          first_name,
          age_group
        )
      `)
      .eq('id', storyId)
      .single();

    if (error) {
      console.error('Error fetching story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Unexpected error fetching story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the story'
    };
  }
}

/**
 * Delete a story
 * @param storyId - The story ID to delete
 * @returns Promise with operation result
 */
export async function deleteStory(storyId: string): Promise<DatabaseResult> {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      console.error('Error deleting story:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error deleting story:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the story'
    };
  }
}
