import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { analyzeRepository, fetchLatestReview } from "../api/reviews";
import { deriveReviewViewModel } from "../lib/reviewHelpers";

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);

  useEffect(() => {
    if (manualMode) {
      return undefined;
    }

    let active = true;

    const loadLatest = async () => {
      try {
        const payload = await fetchLatestReview();
        if (!active) return;

        if (payload) {
          setReviewData(payload);
          setError("");
        } else {
          setReviewData(null);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || "Review service unavailable");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLatest();
    const timer = setInterval(loadLatest, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [manualMode]);

  const analyzeRepo = useCallback(async (urlOverride) => {
    const trimmedUrl = (urlOverride ?? repoUrl).trim();

    if (!trimmedUrl) {
      const message = "Enter a GitHub repository URL to analyze.";
      setRepoError(message);
      return { ok: false, error: message };
    }

    try {
      setRepoError("");
      setRepoLoading(true);
      setManualMode(true);
      setLoading(false);

      const { reviews } = await analyzeRepository(trimmedUrl);

      if (reviews.length > 0) {
        setReviewData({
          reviews,
          pr: {
            repo: trimmedUrl,
            number: "Repo Scan",
            title: "Repository analysis",
          },
        });
        setError("");
        setLastAnalyzedAt(new Date().toISOString());
        setRepoUrl(trimmedUrl);
        return { ok: true };
      }

      const message = "No reviewable files found in this repository.";
      setReviewData(null);
      setRepoError(message);
      return { ok: false, error: message };
    } catch (err) {
      const message = err.message || "Repository analysis failed.";
      setRepoError(message);
      return { ok: false, error: message };
    } finally {
      setRepoLoading(false);
    }
  }, [repoUrl]);

  const resumeLivePolling = useCallback(() => {
    setManualMode(false);
    setLoading(true);
  }, []);

  const viewModel = useMemo(
    () => deriveReviewViewModel(reviewData),
    [reviewData]
  );

  const value = useMemo(
    () => ({
      reviewData,
      loading,
      error,
      repoUrl,
      setRepoUrl,
      repoLoading,
      repoError,
      setRepoError,
      manualMode,
      lastAnalyzedAt,
      analyzeRepo,
      resumeLivePolling,
      viewModel,
    }),
    [
      reviewData,
      loading,
      error,
      repoUrl,
      repoLoading,
      repoError,
      manualMode,
      lastAnalyzedAt,
      analyzeRepo,
      resumeLivePolling,
      viewModel,
    ]
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error("useReview must be used within ReviewProvider");
  }
  return ctx;
}
