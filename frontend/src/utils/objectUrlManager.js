/**
 * Object URL Manager
 * ==================
 * Centralized, safe management of blob: URLs to prevent memory leaks.
 *
 * Features:
 * - Automatic tracking
 * - React hook for easy per-component usage with cleanup
 * - Global revokeAll for emergency / unmount scenarios
 * - Revoke by ID for lists (e.g. photo carousels)
 *
 * Usage:
 *   const url = useObjectURL(blob, photo.id);
 *   // or for manual
 *   const url = createManagedObjectURL(blob, 'photo-123');
 *   revokeObjectURL('photo-123');
 */

const urlRegistry = new Map(); // id -> { url, blob, createdAt }

let isRegistered = false;

function ensureCleanupOnUnload() {
  if (isRegistered) return;
  isRegistered = true;

  // Best effort cleanup on page unload (helps in some cases)
  window.addEventListener('beforeunload', () => {
    revokeAllObjectURLs();
  });
}

export function createManagedObjectURL(blob, id = null) {
  if (!blob) return null;

  const key = id || `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // If already exists for this id, revoke old one first
  if (urlRegistry.has(key)) {
    const existing = urlRegistry.get(key);
    try {
      URL.revokeObjectURL(existing.url);
    } catch { /* ignore during replacement */ }
  }

  const url = URL.createObjectURL(blob);
  urlRegistry.set(key, {
    url,
    blob,
    createdAt: Date.now(),
  });

  ensureCleanupOnUnload();

  return url;
}

export function getManagedObjectURL(id) {
  const entry = urlRegistry.get(id);
  return entry ? entry.url : null;
}

export function revokeObjectURL(id) {
  const entry = urlRegistry.get(id);
  if (!entry) return false;

  try {
    URL.revokeObjectURL(entry.url);
  } catch (e) {
    console.warn('Failed to revoke object URL', e);
  } // non-fatal

  urlRegistry.delete(id);
  return true;
}

export function revokeAllObjectURLs() {
  for (const [, entry] of urlRegistry.entries()) {
    try {
      URL.revokeObjectURL(entry.url);
    } catch { /* ignore revoke errors during bulk cleanup */ }
  }
  urlRegistry.clear();
}

export function getActiveObjectURLCount() {
  return urlRegistry.size;
}

// React Hook for components
import { useEffect, useState } from 'react';

export function useObjectURL(blob, id = null) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }

    const managedId = id || `hook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const createdUrl = createManagedObjectURL(blob, managedId);
    setUrl(createdUrl);

    return () => {
      // Cleanup when component unmounts or blob/id changes
      revokeObjectURL(managedId);
    };
  }, [blob, id]);

  return url;
}

// Utility to get stats for debugging / status card
export function getObjectURLStats() {
  return {
    count: urlRegistry.size,
    entries: Array.from(urlRegistry.entries()).map(([id, entry]) => ({
      id,
      createdAt: entry.createdAt,
      size: entry.blob?.size || 0,
    })),
  };
}
