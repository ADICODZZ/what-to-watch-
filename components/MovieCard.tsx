import React, { useState, useEffect } from 'react';
import type { Movie } from '../types';
import { ICONS } from '../constants';
import { saveMovieFeedback, getMovieFeedback } from '../services/feedbackService';

interface MovieCardProps {
  movie: Movie;
  isSearchResult?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, isSearchResult = false }) => {
  const imageIdSeed = movie.title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) + movie.year;
  const placeholderImageUrl = `https://picsum.photos/seed/${imageIdSeed}/400/300`;
  const genericFallbackImageUrl = 'https://picsum.photos/400/300?grayscale&blur=2';

  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>(movie.posterUrl || placeholderImageUrl);

  useEffect(() => {
    if (isSearchResult) return;

    const existingFeedback = getMovieFeedback(movie.title, movie.year);
    if (existingFeedback) {
      setFeedbackGiven(existingFeedback.feedback);
    } else {
      setFeedbackGiven(null);
    }
  }, [movie.title, movie.year, isSearchResult]);

  useEffect(() => {
    const fetchPoster = async () => {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&y=${movie.year}&apikey=eb2a7002`
      );
      const data = await res.json();
      if (data?.Poster && data.Poster !== 'N/A') {
        setPosterUrl(data.Poster);
      }
    };

    fetchPoster();
  }, [movie.title, movie.year]);

  const handleFeedback = (feedbackType: 'Loved it!' | 'Liked it' | 'Not my vibe') => {
    saveMovieFeedback(movie.title, movie.year, feedbackType);
    setFeedbackGiven(feedbackType);
  };

  const moreInfoLink = `https://www.google.com/search?q=${encodeURIComponent(movie.title + " " + movie.year + " movie")}`;

  const matchScoreColor =
    movie.matchScore && movie.matchScore >= 75
      ? 'text-green-400'
      : movie.matchScore && movie.matchScore >= 50
      ? 'text-yellow-400'
      : movie.matchScore
      ? 'text-red-400'
      : 'text-slate-400';

  return (
    <div className={`bg-slate-800 rounded-lg shadow-xl flex flex-col transition-all duration-300 w-full ${isSearchResult ? 'border-2 border-purple-500' : 'hover:shadow-2xl'}`}>
      <img
        src={posterUrl}
        alt={`Poster for ${movie.title}`}
        className="w-full aspect-[4/3] object-cover rounded-t-lg relative z-0"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== genericFallbackImageUrl) {
            target.src = genericFallbackImageUrl;
          }
        }}
      />

      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="min-w-0 text-center">
          <h3 className="truncate text-xl font-semibold text-purple-300 mb-1">
            {movie.title} ({movie.year})
          </h3>
        </div>

        {movie.matchScore !== undefined && !isSearchResult && (
          <div className={`flex items-center justify-center text-sm font-semibold mb-2 ${matchScoreColor}`}>
            <span role="img" aria-label="heart" className="mr-1.5 text-lg">❤️</span>
            Taste Match: {movie.matchScore}/100
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2 justify-center">
          {movie.genres?.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 bg-slate-700 text-xs text-purple-200 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-grow">
          <p className="text-slate-300 text-sm leading-relaxed mb-3 text-center sm:text-left line-clamp-4">
            {movie.summary}
          </p>
        </div>

        {!isSearchResult && (
          <div className="my-4 py-3 border-y border-slate-700">
            {feedbackGiven ? (
              <p className="text-sm text-center text-green-400 font-semibold">
                Your feedback: {feedbackGiven}!
              </p>
            ) : (
              <>
                <div className="group relative text-center">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out bg-purple-500/30 text-purple-200 hover:bg-purple-500/50 hover:text-white ring-1 ring-purple-500/50"
                  >
                    Already Watched This?
                  </button>
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2
                                bg-slate-900 border border-slate-600 rounded-md shadow-lg
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible
                                transition-all duration-200 ease-in-out flex space-x-2 z-20"
                    role="menu"
                  >
                    <button
                      onClick={() => handleFeedback("Loved it!")}
                      className="text-xs px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white font-semibold"
                    >
                      Loved it! 😍
                    </button>
                    <button
                      onClick={() => handleFeedback("Liked it")}
                      className="text-xs px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                    >
                      Liked it 😊
                    </button>
                    <button
                      onClick={() => handleFeedback("Not my vibe")}
                      className="text-xs px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold"
                    >
                      Not my vibe 😕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center mt-2 px-2">
                  The more you tell us what you like, the more personalised the movie suggestions get!
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-auto text-center">
          <a
            href={moreInfoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-slate-400 hover:text-purple-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V10.5m-7.5 0h7.5" />
            </svg>
            More Info on Google
          </a>
        </div>
      </div>
    </div>
  );
};
