import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Resilient Supabase Storage Pipeline for Campaign Screenshot Proofs
 * Bucket: 'ad-proofs' (Public)
 */
export async function uploadPlacementProofToStorage(
  imageData: string, // Base64 data URL or external HTTP URL
  assignmentId: string
): Promise<{ success: boolean; url: string; isFallback: boolean }> {
  // If it's already an external HTTP link, return it directly
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return { success: true, url: imageData, isFallback: false };
  }

  // If Supabase Admin is not configured, return data URL fallback
  if (!isSupabaseAdminConfigured()) {
    console.warn('[Proof Storage] Supabase Admin not configured. Using data URL fallback.');
    return { success: true, url: imageData, isFallback: true };
  }

  try {
    // 1. Parse base64 data URL
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // Not a standard data URL, return original
      return { success: true, url: imageData, isFallback: true };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine clean file extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const filename = `proofs/${assignmentId}_${Date.now()}.${ext}`;

    // 2. Upload to 'ad-proofs' storage bucket
    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('ad-proofs')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) {
      console.warn(
        `[Proof Storage] Upload to 'ad-proofs' bucket failed (${uploadErr.message}). Falling back to compressed data URL. (Ensure 'ad-proofs' bucket is created and Public in Supabase Dashboard)`
      );
      return { success: true, url: imageData, isFallback: true };
    }

    // 3. Obtain public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('ad-proofs')
      .getPublicUrl(filename);

    if (urlData?.publicUrl) {
      return { success: true, url: urlData.publicUrl, isFallback: false };
    }

    return { success: true, url: imageData, isFallback: true };
  } catch (error: any) {
    console.error('[Proof Storage Exception]:', error);
    // Never fail user submission due to storage glitches
    return { success: true, url: imageData, isFallback: true };
  }
}
