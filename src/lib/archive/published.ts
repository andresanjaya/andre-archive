import { validateBoard, type BoardSnapshot } from './model';
// Public endpoint only: no Auth SDK, admin code, subscriptions, or pan-triggered requests.
export async function fetchPublished(signal: AbortSignal): Promise<BoardSnapshot|null> {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const response=await fetch(`${url}/rest/v1/published_board?id=eq.1&select=snapshot`,{headers:{apikey:key},signal,cache:'no-store'});
 if(!response.ok)throw new Error('Published archive unavailable');
 const data=await response.json();
 if(!data[0]?.snapshot)return null;
 validateBoard(data[0].snapshot);
 return data[0].snapshot;
}
