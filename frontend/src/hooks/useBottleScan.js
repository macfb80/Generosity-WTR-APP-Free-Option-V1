/**
 * useBottleScan.js
 * Generosity™ WTR App V6 — Bottle Scan State Hook
 * Drop into: frontend/src/hooks/useBottleScan.js
 *
 * Manages all state for the bottle scan feature.
 * API calls route directly to the Render API — never through Next.js proxy.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getBottleByBarcode, searchBottles, getLeaderboard } from '../data/BottleScanService';

const API_BASE = 'https://generosity-sales-engine-mvp-api.onrender.com';
const SERVICE_TOKEN = '3b56aff84e17fc6b369adb1906549f10af6d4776b392b2ec843aaba958ccd102';

export function useBottleScan() {
  // Input mode: 'camera' | 'search' | 'barcode'
  const [mode, setMode] = useState('camera');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Selected brand report
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Loading / error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Not found state (shows email capture + Hub CTA)
  const [notFoundState, setNotFoundState] = useState(null); // null | { query, barcode }

  // Leaderboard
  const [leaderboardBrands, setLeaderboardBrands] = useState([]);
  const [showingLeaderboard, setShowingLeaderboard] = useState(false);

  // Popular brands (loaded on mount)
  const [popularBrands, setPopularBrands] = useState([]);

  // Waitlist submission state
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Prevent race conditions
  const currentRequest = useRef(null);

  // ── Load popular brands on mount ─────────────────────
  useEffect(() => {
    loadPopularBrands();
  }, []); // intentional empty deps — load once on mount

  const loadPopularBrands = useCallback(async () => {
    try {
      const data = await getLeaderboard(null, 9);
      setPopularBrands(data.leaderboard || []);
    } catch (e) {
      console.warn('[useBottleScan] Could not load popular brands:', e.message);
    }
  }, []);

  // ── Scan by barcode ───────────────────────────────────
  const scanByBarcode = useCallback(async (barcodeValue) => {
    const barcode = (barcodeValue || '').replace(/\D/g, '');
    if (!barcode || barcode.length < 8) {
      setError('Enter a valid 8-14 digit barcode');
      return;
    }

    const requestId = Date.now();
    currentRequest.current = requestId;

    setIsLoading(true);
    setError(null);
    setNotFoundState(null);
    setSelectedBrand(null);

    try {
      const result = await getBottleByBarcode(barcode);

      // Stale request guard
      if (currentRequest.current !== requestId) return;

      if (result.found) {
        setSelectedBrand(result);
        setShowingLeaderboard(false);
      } else if (result.partial_match) {
        // Open Food Facts found it but not in our DB
        setNotFoundState({
          query: result.off_name || barcode,
          barcode,
          off_name: result.off_name,
          off_brand: result.off_brand,
        });
      } else {
        setNotFoundState({ query: barcode, barcode });
      }
    } catch (err) {
      if (currentRequest.current === requestId) {
        setError('Lookup failed — check your connection and try again');
        console.error('[useBottleScan] Barcode lookup error:', err);
      }
    } finally {
      if (currentRequest.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  // ── Search by brand name ──────────────────────────────
  const searchBrand = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setError('Enter at least 2 characters to search');
      return;
    }

    const requestId = Date.now();
    currentRequest.current = requestId;

    setIsLoading(true);
    setError(null);
    setNotFoundState(null);
    setSelectedBrand(null);

    try {
      const data = await searchBottles(query.trim(), { limit: 8 });

      if (currentRequest.current !== requestId) return;

      if (data.results && data.results.length > 0) {
        if (data.results.length === 1) {
          // Single result — go straight to report
          selectBrand(data.results[0]);
        } else {
          setSearchResults(data.results);
        }
      } else {
        setNotFoundState({ query: query.trim(), barcode: null });
      }
    } catch (err) {
      if (currentRequest.current === requestId) {
        setError('Search failed — check your connection');
      }
    } finally {
      if (currentRequest.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []); // selectBrand is stable — defined below with useCallback

  // ── Select a brand (from grid, search results, or leaderboard) ──
  const selectBrand = useCallback(async (brandSummary) => {
    if (!brandSummary) return;

    // If we already have the full report (from barcode lookup), use it
    if (brandSummary.source_water && brandSummary.packaging) {
      setSelectedBrand(brandSummary);
      setSearchResults([]);
      setShowingLeaderboard(false);
      return;
    }

    // Need to fetch full report (from search result summary)
    const requestId = Date.now();
    currentRequest.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const barcode = brandSummary.barcode_primary || brandSummary.barcode;
      if (barcode) {
        const full = await getBottleByBarcode(barcode);
        if (currentRequest.current === requestId && full.found) {
          setSelectedBrand(full);
          setSearchResults([]);
          setShowingLeaderboard(false);
        }
      } else {
        // No barcode — use the summary data directly
        setSelectedBrand({ found: true, ...brandSummary });
        setSearchResults([]);
        setShowingLeaderboard(false);
      }
    } catch (err) {
      if (currentRequest.current === requestId) {
        setError('Failed to load brand report');
      }
    } finally {
      if (currentRequest.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  // ── Leaderboard ───────────────────────────────────────
  const showLeaderboard = useCallback(async () => {
    if (leaderboardBrands.length === 0) {
      try {
        const data = await getLeaderboard(null, 20);
        setLeaderboardBrands(data.leaderboard || []);
      } catch (e) {
        console.warn('[useBottleScan] Leaderboard load failed:', e);
      }
    }
    setShowingLeaderboard(true);
    setSelectedBrand(null);
    setSearchResults([]);
  }, [leaderboardBrands.length]);

  const hideLeaderboard = useCallback(() => {
    setShowingLeaderboard(false);
  }, []);

  // ── Not found waitlist ────────────────────────────────
  const submitWaitlist = useCallback(async (email) => {
    if (!email || !email.includes('@')) return;

    try {
      await fetch(`${API_BASE}/api/wtr/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SERVICE_TOKEN,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'bottle-scan-not-found',
          notes: `Bottle scan waitlist: "${notFoundState?.query || 'unknown'}" barcode: ${notFoundState?.barcode || 'none'}`,
          session_id: sessionStorage.getItem('wtr_session_id'),
        }),
      });

      // Log to not-found queue via bottle API
      await fetch(`${API_BASE}/api/wtr/bottle-not-found`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SERVICE_TOKEN,
        },
        body: JSON.stringify({
          query: notFoundState?.query,
          barcode: notFoundState?.barcode,
          email,
        }),
      });

      setWaitlistSubmitted(true);
    } catch (e) {
      console.warn('[useBottleScan] Waitlist submission failed:', e);
      setWaitlistSubmitted(true); // optimistic
    }
  }, [notFoundState]);

  // ── Reset ─────────────────────────────────────────────
  const reset = useCallback(() => {
    setSelectedBrand(null);
    setSearchResults([]);
    setNotFoundState(null);
    setError(null);
    setShowingLeaderboard(false);
    setWaitlistSubmitted(false);
    setSearchQuery('');
  }, []);

  return {
    // State
    mode, setMode,
    searchQuery, setSearchQuery,
    searchResults,
    selectedBrand,
    isLoading,
    error,
    notFoundState,
    leaderboardBrands,
    showingLeaderboard,
    popularBrands,
    waitlistSubmitted,

    // Actions
    scanByBarcode,
    searchBrand,
    selectBrand,
    showLeaderboard,
    hideLeaderboard,
    submitWaitlist,
    reset,
  };
}
