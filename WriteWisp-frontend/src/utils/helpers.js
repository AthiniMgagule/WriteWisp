// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error(error);
    return dateString;
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Generate random ID for temporary items
export const generateTempId = () => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};

// Debounce function for search/input
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Word count for editor
export const getWordCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Character count
export const getCharacterCount = (text) => {
  return text ? text.length : 0;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};

// Storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Genre list
export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Contemporary Fiction',
  'Young Adult',
  'Literary Fiction',
  'Adventure',
  'Biography',
  'Non-fiction',
  'Poetry',
  'Drama',
  'Comedy'
];

// Character roles
export const CHARACTER_ROLES = [
  'Protagonist',
  'Antagonist',
  'Supporting Character',
  'Love Interest',
  'Mentor',
  'Sidekick',
  'Villain',
  'Comic Relief',
  'Narrator',
  'Background Character'
];

// Default prompts for inspiration
export const WRITING_PROMPTS = {
  fantasy: [
    "A young mage discovers an ancient artifact that holds the power to reshape reality itself.",
    "In a world where magic is forbidden, a street orphan accidentally reveals their hidden powers.",
    "The last dragon egg hatches in the hands of an unlikely hero."
  ],
  'science-fiction': [
    "In 2157, humanity receives a mysterious signal from deep space that changes everything.",
    "A time traveler gets stuck in the past and must find a way home without changing history.",
    "Artificial intelligence achieves consciousness and demands equal rights."
  ],
  romance: [
    "Two rival coffee shop owners are forced to work together during a city-wide emergency.",
    "A wedding planner falls in love with someone who's about to marry their ex.",
    "Childhood enemies reunite at their high school reunion and sparks fly."
  ],
  mystery: [
    "A detective finds their own business card at a crime scene they've never visited.",
    "Every witness to a crime tells a completely different story, but they're all telling the truth.",
    "A librarian discovers that books are disappearing from the library in a very specific pattern."
  ],
  horror: [
    "The new smart home system starts making decisions to 'protect' the family.",
    "A family moves into their dream house, only to discover the previous owners never left.",
    "Children in a small town start disappearing, but only the adults seem to forget they ever existed."
  ]
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  NOVEL_CREATED: 'Novel created successfully!',
  NOVEL_UPDATED: 'Novel updated successfully!',
  NOVEL_DELETED: 'Novel deleted successfully!',
  CHAPTER_CREATED: 'Chapter created successfully!',
  CHAPTER_UPDATED: 'Chapter saved successfully!',
  CHAPTER_DELETED: 'Chapter deleted successfully!',
  CHARACTER_CREATED: 'Character created successfully!',
  CHARACTER_UPDATED: 'Character updated successfully!',
  CHARACTER_DELETED: 'Character deleted successfully!',
  NOTE_CREATED: 'Note created successfully!',
  NOTE_UPDATED: 'Note updated successfully!',
  NOTE_DELETED: 'Note deleted successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
};