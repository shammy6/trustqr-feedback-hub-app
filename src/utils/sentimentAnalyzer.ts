
export interface SentimentResult {
  sentiment: 'positive' | 'mixed' | 'negative';
  confidence: number;
  emoji: string;
  summary: string;
}

export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || text.trim().length === 0) {
    return {
      sentiment: 'mixed',
      confidence: 0.5,
      emoji: '😐',
      summary: 'No review text to analyze'
    };
  }

  const normalizedText = text.toLowerCase().trim();
  
  // Positive sentiment keywords
  const positiveWords = [
    'amazing', 'excellent', 'fantastic', 'great', 'wonderful', 'awesome', 'perfect',
    'love', 'loved', 'best', 'outstanding', 'brilliant', 'superb', 'marvelous',
    'delicious', 'friendly', 'helpful', 'clean', 'fast', 'quick', 'good', 'nice',
    'pleasant', 'satisfied', 'happy', 'recommend', 'impressed', 'quality'
  ];

  // Negative sentiment keywords
  const negativeWords = [
    'terrible', 'awful', 'horrible', 'disgusting', 'worst', 'hate', 'hated',
    'disappointing', 'disappointed', 'bad', 'poor', 'slow', 'cold', 'dirty',
    'rude', 'unfriendly', 'expensive', 'overpriced', 'wait', 'waiting', 'long',
    'unacceptable', 'frustrated', 'angry', 'complain', 'problem', 'issue'
  ];

  // Mixed/neutral indicators
  const mixedWords = [
    'okay', 'fine', 'average', 'decent', 'could be better', 'not bad',
    'improvement', 'sometimes', 'mostly', 'overall'
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  let mixedScore = 0;

  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      positiveScore += matches.length;
    }
  });

  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      negativeScore += matches.length;
    }
  });

  // Count mixed words
  mixedWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      mixedScore += matches.length;
    }
  });

  // Calculate sentiment based on scores and text characteristics
  const totalWords = normalizedText.split(/\s+/).length;
  const hasExclamation = text.includes('!');
  const hasQuestion = text.includes('?');
  const isShort = totalWords < 5;

  // Determine sentiment
  let sentiment: 'positive' | 'mixed' | 'negative';
  let confidence: number;
  let emoji: string;
  let summary: string;

  if (positiveScore > negativeScore && positiveScore > 0) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.6 + (positiveScore / totalWords));
    emoji = hasExclamation ? '😊' : '🙂';
    summary = `Customer expresses satisfaction with ${positiveScore} positive indicator${positiveScore > 1 ? 's' : ''}`;
  } else if (negativeScore > positiveScore && negativeScore > 0) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.6 + (negativeScore / totalWords));
    emoji = negativeScore > 2 ? '😞' : '😕';
    summary = `Customer shows dissatisfaction with ${negativeScore} negative indicator${negativeScore > 1 ? 's' : ''}`;
  } else if (mixedScore > 0 || (positiveScore > 0 && negativeScore > 0)) {
    sentiment = 'mixed';
    confidence = 0.7;
    emoji = '😐';
    summary = 'Customer review contains both positive and negative elements';
  } else {
    // Fallback based on length and punctuation
    if (isShort && !hasExclamation && !hasQuestion) {
      sentiment = 'mixed';
      confidence = 0.5;
      emoji = '😐';
      summary = 'Brief review with neutral tone';
    } else if (hasExclamation) {
      sentiment = 'positive';
      confidence = 0.6;
      emoji = '🙂';
      summary = 'Enthusiastic tone detected';
    } else {
      sentiment = 'mixed';
      confidence = 0.5;
      emoji = '😐';
      summary = 'Neutral review tone';
    }
  }

  return {
    sentiment,
    confidence,
    emoji,
    summary
  };
};
