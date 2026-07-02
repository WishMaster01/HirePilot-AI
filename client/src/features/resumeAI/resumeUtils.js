export const parseResumeKeywords = (text = '') => text.toLowerCase().split(/\W+/).filter(Boolean)
