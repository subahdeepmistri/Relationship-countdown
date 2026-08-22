/**
 * Image Compression
 * =================
 * Downscales user photos before they enter IndexedDB. Raw phone cameras
 * produce 3-8MB blobs; a 1600px WebP re-encode typically lands at 100-300KB,
 * cutting vault storage usage by ~80-90% with no visible quality loss at
 * mobile display sizes.
 *
 * Design notes:
 * - Never throws: on any failure the ORIGINAL file is returned, so saving
 *   always works exactly as it did before this module existed.
 * - Uses createImageBitmap when available (fast path), falls back to an
 *   <img> element for older browsers.
 */

const MAX_DIMENSION_DEFAULT = 1600;
const QUALITY_DEFAULT = 0.82;

function drawToBlob(source, width, height, mime, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, width, height);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mime, quality);
    });
}

/**
 * Compress an image File/Blob.
 * @param {File|Blob} file
 * @param {object} [options]
 * @param {number} [options.maxDimension=1600] - longest edge cap in px
 * @param {number} [options.quality=0.82] - WebP/JPEG encoder quality
 * @returns {Promise<File|Blob>} compressed blob, or the original file untouched
 */
export async function compressImage(file, {
    maxDimension = MAX_DIMENSION_DEFAULT,
    quality = QUALITY_DEFAULT
} = {}) {
    try {
        // Only compress real images; GIFs would lose animation.
        if (!file || !file.type?.startsWith('image/') || file.type === 'image/gif') {
            return file;
        }
        // Tiny images don't benefit from re-encoding.
        if (file.size < 150 * 1024) return file;
        if (typeof document === 'undefined') return file;

        let source = null;
        let width = 0;
        let height = 0;

        if (typeof createImageBitmap === 'function') {
            source = await createImageBitmap(file);
            width = source.width;
            height = source.height;
        } else {
            source = await new Promise((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
                img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
                img.src = url;
            });
            width = source.naturalWidth;
            height = source.naturalHeight;
        }

        if (!width || !height) return file;

        // Scale so the longest edge fits maxDimension, never upscale.
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        if (scale >= 1 && file.size < 1024 * 1024) {
            // Big-ish but within bounds — still re-encode for WebP savings
            // only if it's meaningfully large; otherwise leave untouched.
            if (file.size < 400 * 1024) return file;
        }

        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));

        // Prefer WebP; browsers that can't encode it fall back to PNG via
        // toBlob — either way dimensions are reduced and we accept the result.
        let blob = await drawToBlob(source, targetW, targetH, 'image/webp', quality);
        if (!blob) blob = await drawToBlob(source, targetW, targetH, 'image/jpeg', quality);
        if (!blob || blob.size >= file.size) return file; // compression didn't help

        if (typeof source.close === 'function') source.close();

        // Preserve name/lastModified where possible so callers see a File-like object.
        try {
            return new File([blob], file.name || `photo-${Date.now()}`, {
                type: blob.type,
                lastModified: file.lastModified || Date.now()
            });
        } catch {
            return blob;
        }
    } catch {
        return file; // graceful degradation — original photo still saves
    }
}
