import { describe, it, expect } from 'vitest';
import { taskSchema, serviceSchema, incidentSchema } from '../validation';

describe('Validation Schemas', () => {
  describe('taskSchema', () => {
    it('should validate a correct task', () => {
      const validTask = {
        title: 'Test Task',
        description: 'Test description',
        priority: 'medium',
        status: 'todo',
        position: 0,
        tags: ['test'],
      };
      const result = taskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should reject task with empty title', () => {
      const invalidTask = {
        title: '',
        description: 'Test',
        priority: 'medium',
        status: 'todo',
        position: 0,
        tags: [],
      };
      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject task with invalid priority', () => {
      const invalidTask = {
        title: 'Test',
        description: 'Test',
        priority: 'invalid',
        status: 'todo',
        position: 0,
        tags: [],
      };
      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject task with invalid status', () => {
      const invalidTask = {
        title: 'Test',
        description: 'Test',
        priority: 'medium',
        status: 'invalid',
        position: 0,
        tags: [],
      };
      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject task with negative position', () => {
      const invalidTask = {
        title: 'Test',
        description: 'Test',
        priority: 'medium',
        status: 'todo',
        position: -1,
        tags: [],
      };
      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe('serviceSchema', () => {
    it('should validate a correct service', () => {
      const validService = {
        name: 'API Gateway',
        status: 'operational',
        uptime: 99.9,
        latency: 42,
      };
      const result = serviceSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    it('should reject service with empty name', () => {
      const invalidService = {
        name: '',
        status: 'operational',
        uptime: 99.9,
        latency: 42,
      };
      const result = serviceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it('should reject service with uptime over 100', () => {
      const invalidService = {
        name: 'Test',
        status: 'operational',
        uptime: 101,
        latency: 42,
      };
      const result = serviceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    it('should reject service with negative latency', () => {
      const invalidService = {
        name: 'Test',
        status: 'operational',
        uptime: 99.9,
        latency: -1,
      };
      const result = serviceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });
  });

  describe('incidentSchema', () => {
    it('should validate a correct incident', () => {
      const validIncident = {
        service_id: '123e4567-e89b-12d3-a456-426614174000',
        severity: 'critical',
        title: 'Service Down',
        description: 'The service is not responding',
        status: 'open',
      };
      const result = incidentSchema.safeParse(validIncident);
      expect(result.success).toBe(true);
    });

    it('should reject incident with empty title', () => {
      const invalidIncident = {
        service_id: '123e4567-e89b-12d3-a456-426614174000',
        severity: 'critical',
        title: '',
        description: 'Test',
        status: 'open',
      };
      const result = incidentSchema.safeParse(invalidIncident);
      expect(result.success).toBe(false);
    });

    it('should reject incident with invalid severity', () => {
      const invalidIncident = {
        service_id: '123e4567-e89b-12d3-a456-426614174000',
        severity: 'invalid',
        title: 'Test',
        description: 'Test',
        status: 'open',
      };
      const result = incidentSchema.safeParse(invalidIncident);
      expect(result.success).toBe(false);
    });
  });
});
