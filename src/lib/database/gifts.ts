/**
 * Gifts Database Operations
 */

import { getCurrentUser } from '$lib/auth';
import { supabase } from '../supabase';

export interface Gift {
  id?: string;
  created_at?: string;
  user_id?: string;
  status: 'generating' | 'completed' | 'failed';
  occasion: string;
  relationship: string;
  delivery_time: string;
  child_profile_id?: string;
  special_msg?: string;
  delivery_email: string;
  child_name: string;
  age_group: string;
}

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Create a new gift
 * @param gift - The gift data to insert
 * @returns Promise with operation result
 */
export async function createGift(gift: Gift): Promise<DatabaseResult> {
  console.log('Creating gift:', gift);
  try {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('gifts')
      .insert([{
        user_id: user?.id,
        status: gift.status || 'generating',
        occasion: gift.occasion,
        relationship: gift.relationship,
        delivery_time: gift.delivery_time,
        child_profile_id: gift.child_profile_id,
        special_msg: gift.special_msg,
        delivery_email: gift.delivery_email,
        child_name: gift.child_name,
        age_group: gift.age_group
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating gift:', error);
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
    console.error('Unexpected error creating gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the gift'
    };
  }
}

/**
 * Update a gift
 * @param giftId - The gift ID to update
 * @param updates - The fields to update
 * @returns Promise with operation result
 */
export async function updateGift(giftId: string, updates: Partial<Gift>): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .update(updates)
      .eq('id', giftId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating gift:', error);
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
    console.error('Unexpected error updating gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the gift'
    };
  }
}

/**
 * Get gifts for current user
 * @returns Promise with gifts data
 */
export async function getGiftsForUser(): Promise<DatabaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gifts:', error);
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
    console.error('Unexpected error fetching gifts:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching gifts'
    };
  }
}

/**
 * Get a single gift by ID
 * @param giftId - The gift ID
 * @returns Promise with gift data
 */
export async function getGiftById(giftId: string): Promise<DatabaseResult> {
  try {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();

    if (error) {
      console.error('Error fetching gift:', error);
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
    console.error('Unexpected error fetching gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the gift'
    };
  }
}

/**
 * Delete a gift
 * @param giftId - The gift ID to delete
 * @returns Promise with operation result
 */
export async function deleteGift(giftId: string): Promise<DatabaseResult> {
  try {
    const { error } = await supabase
      .from('gifts')
      .delete()
      .eq('id', giftId);

    if (error) {
      console.error('Error deleting gift:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error deleting gift:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the gift'
    };
  }
}
