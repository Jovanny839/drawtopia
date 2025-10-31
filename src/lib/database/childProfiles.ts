/**
 * Child Profiles Database Operations
 */

import { supabase } from '../supabase';

export interface ChildProfile {
  id?: number;
  created_at?: string;
  first_name: string;
  age_group: string;
  relationship: string;
  parent_id: string;
  avatar_url: string;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Insert a single child profile into the database
 * @param childProfile - The child profile data to insert
 * @returns Promise with operation result
 */
export async function insertChildProfile(childProfile: ChildProfile): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .insert([{
        first_name: childProfile.first_name,
        age_group: childProfile.age_group,
        relationship: childProfile.relationship,
        parent_id: childProfile.parent_id,
        avatar_url: childProfile.avatar_url,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error inserting child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data?.[0]
    };

  } catch (error) {
    console.error('Unexpected error inserting child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the child profile'
    };
  }
}

/**
 * Insert multiple child profiles into the database
 * @param childProfiles - Array of child profile data to insert
 * @returns Promise with operation result
 */
export async function insertChildProfiles(childProfiles: ChildProfile[]): Promise<DatabaseResult> {
  try {
    if (childProfiles.length === 0) {
      return {
        success: false,
        error: 'No child profiles to save'
      };
    }

    const profilesData = childProfiles.map(profile => ({
      first_name: profile.first_name,
      age_group: profile.age_group,
      relationship: profile.relationship,
      parent_id: profile.parent_id,
      avatar_url: profile.avatar_url,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('child_profiles')
      .insert(profilesData)
      .select();

    if (error) {
      console.error('Error inserting child profiles:', error);
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
    console.error('Unexpected error inserting child profiles:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while saving the child profiles'
    };
  }
}

/**
 * Get child profiles for a specific parent
 * @param parentId - The parent's user ID
 * @returns Promise with child profiles
 */
export async function getChildProfiles(parentId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching child profiles:', error);
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
    console.error('Unexpected error fetching child profiles:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching child profiles'
    };
  }
}

/**
 * Delete a child profile by ID
 * @param profileId - The child profile ID to delete
 * @param parentId - The parent's user ID (for security)
 * @returns Promise with operation result
 */
export async function deleteChildProfile(profileId: number, parentId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .delete()
      .eq('id', profileId)
      .eq('parent_id', parentId)
      .select();

    if (error) {
      console.error('Error deleting child profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data?.[0]
    };

  } catch (error) {
    console.error('Unexpected error deleting child profile:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the child profile'
    };
  }
}
