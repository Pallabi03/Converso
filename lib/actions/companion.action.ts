// 'use server';

// // import { auth } from "@clerk/nextjs";
// import { auth } from "@clerk/nextjs/server";
// import { createSupabaseClient } from "../supabase";
// import error from "next/error";
// // import { error } from "console";


// export const createCompanion = async(formData:CreateCompanion)=>{
//     const {userId: author}=await auth();
//     const supabase = createSupabaseClient();

//     const {data,error}=await supabase.from('companions').insert({
//         ...formData,
//         author
//     }).select().single();

//     if(error || !data){
//         throw new Error(error?.message || 'Failed to create companion');
//     }
//     return data;
// }

// export const getAllCompanions=async({limit=10,page=1,subject,topic}:GetAllCompanions)=>{
//     const supabase = createSupabaseClient();
//     let query = supabase.from('companions').select('*');
//     if(subject && topic){
//         query=query.ilike('subject', `%${subject}%`)
//         .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
//     }else if(subject){
//         query=query.ilike('subject', `%${subject}%`);
//     }else if(topic){
//         query=query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
//     }

//     query=query.range((page-1)*limit,page*limit-1);

//     const {data:companions, error: queryError} = await query;
//     if(queryError) throw new Error(queryError.message);

//     return companions;
// }

// export const getCompanion = async (id: string) => {
//     const supabase = createSupabaseClient();

//     const { data, error } = await supabase
//         .from('companions')
//         .select()
//         .eq('id', id)
//         .single();

//     if(error) return console.log(error);

//     return data;
// }

// export const addToSessionHistory = async(companionId:string) => {
//     const {userId}=await auth();
//     const supabase = createSupabaseClient();
//     const {data,error}=await supabase.from('session_history').insert({
//         companion_id: companionId,
//         user_id: userId!
//     }).select().single();
//     if(error){
//         throw new Error(error?.message || 'Failed to add to session history');
//     }
//     return data;
// }

// export const getRecentSession = async(limit=10) => {
//     const {userId}=await auth();
//     const supabase = createSupabaseClient();
//     const {data,error}=await supabase.from('session_history').select('*').eq('user_id', userId!).order('created_at', {ascending: false}).limit(limit);
//     if(error){
//         throw new Error(error?.message || 'Failed to get recent sessions');
//     }
//     return data;
// }



'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;

    if(has({ plan: 'pro' })) {
        return true;
    } else if(has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if(has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit) {
        return false
    } else {
        return true;
    }
}

// Bookmarks
// export const addBookmark = async (companionId: string, path: string) => {
//   const { userId } = await auth();
//   if (!userId) return;
  
//   const supabase = createSupabaseClient();
  
//   // Use upsert to handle duplicates gracefully
//   const { data, error } = await supabase
//     .from("bookmarks")
//     .upsert(
//       {
//         companion_id: companionId,
//         user_id: userId,
//       },
//       {
//         onConflict: "user_id,companion_id",
//         ignoreDuplicates: true, // Don't throw error on duplicates
//       }
//     )
//     .select();

//   if (error) {
//     throw new Error(error.message);
//   }

//   // Revalidate the path to force a re-render of the page
//   revalidatePath(path);
//   return data;
// };
// export const removeBookmark = async (companionId: string, path: string) => {
//   const { userId } = await auth();
//   if (!userId) return;
  
//   const supabase = createSupabaseClient();
//   const { data, error } = await supabase
//     .from("bookmarks")
//     .delete()
//     .eq("companion_id", companionId)
//     .eq("user_id", userId);
  
//   if (error) {
//     throw new Error(error.message);
//   }
  
//   revalidatePath(path);
//   return data;
// };

// // It's almost the same as getUserCompanions, but it's for the bookmarked companions
// export const getBookmarkedCompanions = async (userId: string) => {
//   const supabase = createSupabaseClient();
  
//   const { data, error } = await supabase
//     .from("bookmarks")
//     .select(`companions:companion_id (*)`)
//     .eq("user_id", userId);
  
//   if (error) {
//     throw new Error(error.message);
//   }
  
//   console.log("Bookmarked companions data:", data);
  
//   // Map the data to match what CompanionsList expects
//   return data
//     .map(({ companions }) => companions)
//     .filter((companion): companion is NonNullable<typeof companion> => 
//       companion !== null
//     )
//     .map((companion: any) => ({
//       id: companion.id,
//       name: companion.topic, // Use topic as the name
//       subject: companion.style, // Use style as the subject (for icon)
//       src: `/icons/${companion.style}.svg`, // Generate icon path from style
//       style: companion.style,
//       topic: companion.topic,
//       voice: companion.voice,
//       duration: companion.duration,
//       created_at: companion.created_at,
//     }));
// };


export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      {
        companion_id: companionId,
        user_id: userId,
      },
      {
        onConflict: "user_id,companion_id", // This tells upsert which columns form the unique constraint
      }
    );
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Revalidate the path to force a re-render of the page
  revalidatePath(path);
  return data;
};

// export const removeBookmark = async (companionId: string, path: string) => {
//   const { userId } = await auth();
//   if (!userId) return;
//   const supabase = createSupabaseClient();
//   const { data, error } = await supabase
//     .from("bookmarks")
//     .delete()
//     .eq("companion_id", companionId)
//     .eq("user_id", userId);
//   if (error) {
//     throw new Error(error.message);
//   }
//   revalidatePath(path);
//   return data;
// };


export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) {
    console.log("No userId found");
    return;
  }
  
  console.log("Attempting to remove bookmark:", { companionId, userId });
  
  const supabase = createSupabaseClient();
  
  // First, check what bookmarks exist
  const { data: existingBookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId);
  
  console.log("Existing bookmarks for user:", existingBookmarks);
  
  // Now try to delete
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId)
    .select();
  
  console.log("Delete result:", { data, error });
  
  if (error) {
    console.error("Delete error:", error);
    throw new Error(error.message);
  }
  
  if (!data || data.length === 0) {
    console.warn("No bookmark was deleted - bookmark might not exist");
  }
  
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data.map(({ companions }) => companions);
};