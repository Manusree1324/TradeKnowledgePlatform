const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const User = require('../src/models/User');
const { app } = require('../src/server');

process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';

function makeUser(overrides = {}) {
	const user = {
		_id: '64a000000000000000000001',
		id: '64a000000000000000000001',
		name: 'Casey Electrician',
		email: 'casey@example.com',
		role: 'professional',
		bookmarks: [],
		toSafeObject() { return { _id: this.id, name: this.name, email: this.email, role: this.role }; },
		comparePassword: async (password) => password === 'correct-horse-battery',
		...overrides
	};
	return user;
}

test('registration validates required fields and rejects public admin role assignment', async () => {
	const invalid = await request(app).post('/api/auth/register').send({ name: 'A', email: 'not-an-email', password: 'short' });
	assert.equal(invalid.status, 400);

	const adminAttempt = await request(app).post('/api/auth/register').send({
		name: 'Casey Electrician', email: 'casey@example.com', password: 'correct-horse-battery', role: 'admin'
	});
	assert.equal(adminAttempt.status, 400);
});

test('registration returns a token and never includes the password', async (t) => {
	let created;
	t.mock.method(User, 'create', async (fields) => {
		created = fields;
		return makeUser({ role: fields.role, email: fields.email });
	});

	const response = await request(app).post('/api/auth/register').send({
		name: 'Casey Electrician', email: 'casey@example.com', password: 'correct-horse-battery', role: 'professional'
	});

	assert.equal(response.status, 201);
	assert.equal(created.role, 'professional');
	assert.ok(response.body.token);
	assert.equal(response.body.user.password, undefined);
});

test('duplicate email is returned as a conflict', async (t) => {
	t.mock.method(User, 'create', async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); });
	const response = await request(app).post('/api/auth/register').send({
		name: 'Casey Electrician', email: 'casey@example.com', password: 'correct-horse-battery'
	});
	assert.equal(response.status, 409);
});

test('invalid login receives a generic unauthorized response', async (t) => {
	t.mock.method(User, 'findOne', () => ({ select: async () => null }));
	const response = await request(app).post('/api/auth/login').send({ email: 'casey@example.com', password: 'wrong-password' });
	assert.equal(response.status, 401);
	assert.match(response.body.message, /incorrect/i);
});

test('valid login returns a signed token and current user endpoint accepts it', async (t) => {
	const user = makeUser();
	t.mock.method(User, 'findOne', () => ({ select: async () => user }));
	const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'correct-horse-battery' });
	assert.equal(login.status, 200);
	assert.ok(login.body.token);

	t.mock.method(User, 'findById', async () => user);
	const current = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
	assert.equal(current.status, 200);
	assert.equal(current.body.user.email, user.email);
});

test('protected endpoints reject missing or invalid tokens', async () => {
	const missing = await request(app).get('/api/auth/me');
	const invalid = await request(app).get('/api/bookmarks').set('Authorization', 'Bearer not-a-token');
	assert.equal(missing.status, 401);
	assert.equal(invalid.status, 401);
});

test('database lookup failures are not reported as invalid credentials', async (t) => {
	const user = makeUser();
	t.mock.method(User, 'findById', async () => { throw new Error('simulated database outage'); });
	t.mock.method(console, 'error', () => {});
	const token = require('jsonwebtoken').sign({ sub: user.id }, process.env.JWT_SECRET);
	const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
	assert.equal(response.status, 500);
});

test('non-admin users cannot access admin APIs', async (t) => {
	const user = makeUser({ role: 'student' });
	t.mock.method(User, 'findById', async () => user);
	const jwt = require('jsonwebtoken');
	const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
	const response = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
	assert.equal(response.status, 403);
});