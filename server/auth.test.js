const request = require('supertest');
const app = require('./index');
require('dotenv').config();

describe('Authentication Flow', () => {
  let authToken = '';
  
  // Test user registration
  test('POST /api/auth/register should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
      .expect(201);
    
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
    
    // Store the token for later use
    authToken = response.body.token;
  });
  
  // Test login
  test('POST /api/auth/login should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  // Test getting user profile with authentication
  test('GET /api/users/profile should return user profile when authenticated', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.firstName).toBe('Test');
  });
  
  // Test getting recommendations
  test('GET /api/recommendations/popular should return popular destinations', async () => {
    const response = await request(app)
      .get('/api/recommendations/popular')
      .expect(200);
    
    expect(Array.isArray(response.body.destinations)).toBe(true);
    expect(response.body.destinations.length).toBeGreaterThan(0);
  });
});