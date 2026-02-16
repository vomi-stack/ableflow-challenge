import { Priority } from './types';

const highPriorityKeywords = [
  'urgent', 'critical', 'security', 'bug', 'fix', 'production', 'down',
  'broken', 'error', 'issue', 'incident', 'outage', 'vulnerability',
  'deploy', 'release', 'hotfix', 'asap', 'immediately'
];

const mediumPriorityKeywords = [
  'feature', 'implement', 'add', 'update', 'improve', 'optimize',
  'refactor', 'enhancement', 'integration', 'api', 'database'
];

const lowPriorityKeywords = [
  'documentation', 'docs', 'readme', 'comment', 'cleanup', 'typo',
  'formatting', 'style', 'minor', 'nice-to-have', 'future'
];

export function aiPrioritizeTasks(title: string, description: string): Priority {
  const text = `${title} ${description}`.toLowerCase();

  let highScore = 0;
  let mediumScore = 0;
  let lowScore = 0;

  highPriorityKeywords.forEach(keyword => {
    if (text.includes(keyword)) highScore += 2;
  });

  mediumPriorityKeywords.forEach(keyword => {
    if (text.includes(keyword)) mediumScore++;
  });

  lowPriorityKeywords.forEach(keyword => {
    if (text.includes(keyword)) lowScore += 2;
  });

  if (highScore > mediumScore && highScore > lowScore) {
    return 'high';
  } else if (lowScore > mediumScore && lowScore > highScore) {
    return 'low';
  }

  return 'medium';
}

export function generateAIPriorityReason(priority: Priority, text: string): string {
  const lowerText = text.toLowerCase();

  if (priority === 'high') {
    const detectedKeywords = highPriorityKeywords.filter(k => lowerText.includes(k));
    return `AI suggests HIGH priority: Detected critical keywords (${detectedKeywords.join(', ')}). This task requires immediate attention.`;
  } else if (priority === 'low') {
    const detectedKeywords = lowPriorityKeywords.filter(k => lowerText.includes(k));
    return `AI suggests LOW priority: Detected non-urgent keywords (${detectedKeywords.join(', ')}). This can be addressed when capacity allows.`;
  }

  return `AI suggests MEDIUM priority: Standard task with balanced urgency. Schedule appropriately within sprint cycles.`;
}
