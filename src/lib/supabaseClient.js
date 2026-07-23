import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fhouivxynsoovugygkfl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob3Vpdnh5bnNvb3Z1Z3lna2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTMyMzYsImV4cCI6MjEwMDI4OTIzNn0.iBAruVINieV2_utU2G-CLB9_ydpGvJ0UW-POyyUxY5Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign Up
export async function signUpUser(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    });
    if (error) throw error;
    return data;
}

// Sign In
export async function signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Sign Out
export async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Password Reset Email
export async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/?reset=true',
    });
    if (error) throw error;
}

// Google OAuth Sign-In
export async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
}

// Upsert a profile row after signup (for projects without a DB trigger)
export async function upsertProfile(userId, { fullName, email }) {
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            name: fullName,
            email,
            username: email.split('@')[0],
            tier: 'Bean Explorer',
            points: 0,
        }, { onConflict: 'id', ignoreDuplicates: true });
    // Ignore errors — profile may already exist via DB trigger
    if (error) console.warn('Profile upsert skipped:', error.message);
}

// Fetch Logged-in User Profile
export async function getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
}

// Update Profile Details (Bio, Avatar, Name)
export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// --- POSTS & FEED API ---
export async function fetchSupabasePosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                name,
                username,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createSupabasePost(postData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to create a post');
    const { data, error } = await supabase
        .from('posts')
        .insert([{
            user_id: user.id,
            cafe_id: postData.cafeId,
            cafe_name: postData.cafeName,
            drink_name: postData.drinkName,
            rating: postData.rating,
            caption: postData.caption,
            image_url: postData.image
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

// --- PASSPORT & STAMPS API ---
export async function fetchUserStamps() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
        .from('user_stamps')
        .select('cafe_id')
        .eq('user_id', user.id);
    if (error) throw error;

    // Transform into object lookup format { cafeId: true }
    const stampsMap = {};
    data.forEach(item => {
        stampsMap[item.cafe_id] = true;
    });
    return stampsMap;
}

export async function claimStamp(cafeId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to claim stamp');
    const { data, error } = await supabase
        .from('user_stamps')
        .insert([{ user_id: user.id, cafe_id: cafeId }])
        .select()
        .single();
    if (error) throw error;
    return data;
}
