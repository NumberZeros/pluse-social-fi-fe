import React from 'react';

export function parseHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
}

export function highlightHashtags(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const hashtagRegex = /#[\w]+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = hashtagRegex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add hashtag as clickable element
    const hashtag = match[0];
    const matchIndex = match.index;
    parts.push(
      <span
        key={matchIndex}
        className="text-[#ABFE2C] hover:underline cursor-pointer font-medium"
        onClick={(e) => {
          e.stopPropagation();
          // Could navigate to hashtag page or filter by hashtag
        }}
      >
        {hashtag}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
