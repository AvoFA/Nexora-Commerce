import React from "react";

/**
 * Escapes special regex characters in a string.
 * @param {string} string 
 * @returns {string} Escaped string.
 */
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Highlights matches of a search query in a text using a <mark> tag.
 * @param {string} text - The full text content.
 * @param {string} query - The search search term.
 * @returns {JSX.Element|string} Text with matching segments wrapped in <mark>.
 */
export const highlightMatch = (text, query) => {
  if (!text) return "";
  if (!query || !query.trim()) return text;

  const trimmedQuery = query.trim();
  const parts = String(text).split(
    new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi")
  );

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
