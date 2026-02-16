import { describe, it, expect } from 'vitest';
import { aiPrioritizeTasks, generateAIPriorityReason } from '../ai-prioritizer';

describe('AI Prioritizer', () => {
  describe('aiPrioritizeTasks', () => {
    it('should classify urgent security issues as high priority', () => {
      const title = 'Fix critical security vulnerability';
      const description = 'Production system has a security issue that needs immediate attention';
      const priority = aiPrioritizeTasks(title, description);
      expect(priority).toBe('high');
    });

    it('should classify feature requests as medium priority', () => {
      const title = 'Add new feature to dashboard';
      const description = 'Implement a new analytics feature for users';
      const priority = aiPrioritizeTasks(title, description);
      expect(priority).toBe('medium');
    });

    it('should classify documentation updates as low priority', () => {
      const title = 'Update README documentation';
      const description = 'Add more details to the readme file';
      const priority = aiPrioritizeTasks(title, description);
      expect(priority).toBe('low');
    });

    it('should handle bug fixes appropriately', () => {
      const title = 'Fix production bug';
      const description = 'Critical bug causing errors in production';
      const priority = aiPrioritizeTasks(title, description);
      expect(priority).toBe('high');
    });
  });

  describe('generateAIPriorityReason', () => {
    it('should generate appropriate reason for high priority', () => {
      const reason = generateAIPriorityReason('high', 'fix critical bug in production');
      expect(reason).toContain('HIGH priority');
      expect(reason).toContain('immediate attention');
    });

    it('should generate appropriate reason for medium priority', () => {
      const reason = generateAIPriorityReason('medium', 'add feature to dashboard');
      expect(reason).toContain('MEDIUM priority');
    });

    it('should generate appropriate reason for low priority', () => {
      const reason = generateAIPriorityReason('low', 'update documentation');
      expect(reason).toContain('LOW priority');
    });
  });
});
