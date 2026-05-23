const request = require('supertest');
const app = require('./index');

describe('Travel Recommendation API', () => {
  // Test the root endpoint
  test('GET / should return a welcome message', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        
        expect(res.body.message).toBe('Travel Recommendation API Server is running!');
        done();
      });
  });

  // Test 404 handler
  test('Non-existent route should return 404', (done) => {
    request(app)
      .get('/nonexistent')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        
        expect(res.body.message).toBe('Route not found');
        done();
      });
  });
});