/**
 * Auto-categorize transaction based on description keywords
 */
export const categorizeTransaction = (description) => {
  const desc = description.toLowerCase();

  // Food keywords
  const foodKeywords = [
    'starbucks', 'coffee', 'restaurant', 'cafe', 'burger', 'diner',
    'pizza', 'mcdonald', 'kfc', 'subway', 'chipotle', 'taco',
    'food', 'lunch', 'dinner', 'breakfast', 'meal', 'grocery',
    'whole foods', 'trader joe', 'safeway', 'kroger'
  ];

  // Rent keywords
  const rentKeywords = ['rent', 'lease', 'landlord', 'apartment', 'housing'];

  // Transport keywords
  const transportKeywords = [
    'uber', 'lyft', 'taxi', 'bus', 'metro', 'subway', 'train',
    'fuel', 'gas', 'gasoline', 'shell', 'chevron', 'exxon',
    'parking', 'toll', 'car'
  ];

  // Subscription keywords
  const subscriptionKeywords = [
    'spotify', 'netflix', 'amazon prime', 'hulu', 'disney',
    'subscription', 'membership', 'gym', 'fitness', 'premium'
  ];

  // Shopping keywords
  const shoppingKeywords = [
    'amazon', 'ebay', 'walmart', 'target', 'shop', 'store',
    'mall', 'retail', 'flipkart', 'alibaba'
  ];

  // Utilities keywords
  const utilitiesKeywords = [
    'electric', 'electricity', 'water', 'gas bill', 'internet',
    'phone bill', 'utilities', 'verizon', 'at&t', 'comcast'
  ];

  // Healthcare keywords
  const healthcareKeywords = [
    'doctor', 'hospital', 'pharmacy', 'cvs', 'walgreens',
    'medical', 'health', 'clinic', 'dental', 'insurance'
  ];

  // Entertainment keywords
  const entertainmentKeywords = [
    'movie', 'cinema', 'theater', 'concert', 'game',
    'entertainment', 'ticket', 'show', 'event'
  ];

  // Education keywords
  const educationKeywords = [
    'school', 'university', 'college', 'tuition', 'course',
    'education', 'book', 'textbook', 'udemy', 'coursera'
  ];

  // Check each category
  if (foodKeywords.some(keyword => desc.includes(keyword))) {
    return 'food';
  }
  if (rentKeywords.some(keyword => desc.includes(keyword))) {
    return 'rent';
  }
  if (transportKeywords.some(keyword => desc.includes(keyword))) {
    return 'transport';
  }
  if (subscriptionKeywords.some(keyword => desc.includes(keyword))) {
    return 'subscriptions';
  }
  if (shoppingKeywords.some(keyword => desc.includes(keyword))) {
    return 'shopping';
  }
  if (utilitiesKeywords.some(keyword => desc.includes(keyword))) {
    return 'utilities';
  }
  if (healthcareKeywords.some(keyword => desc.includes(keyword))) {
    return 'healthcare';
  }
  if (entertainmentKeywords.some(keyword => desc.includes(keyword))) {
    return 'entertainment';
  }
  if (educationKeywords.some(keyword => desc.includes(keyword))) {
    return 'education';
  }

  return 'others';
};

/**
 * Parse date string in various formats
 */
export const parseDate = (dateString) => {
  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    // Try MM/DD/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
    }
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  return date;
};
