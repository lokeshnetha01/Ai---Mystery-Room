import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('foundation API', () => {
  it('reports API health and database connection state', async () => {
    const response = await request(createApp()).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { status: 'ok' } });
    expect(['connected', 'disconnected']).toContain(response.body.data.database);
  });

  it('returns a consistent JSON error for unknown routes', async () => {
    const response = await request(createApp()).get('/api/v1/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } });
  });

  it('validates mystery input before checking database availability', async () => {
    const response = await request(createApp()).post('/api/v1/mysteries').send({ scenario: 'too short' });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, error: { code: 'VALIDATION_ERROR' } });
  });

  it('sets a signed, HttpOnly guest session cookie', async () => {
    const response = await request(createApp()).get('/api/v1/health');
    expect(response.headers['set-cookie']?.[0]).toMatch(/mystery_session=.*HttpOnly.*SameSite=Lax/);
  });
});
