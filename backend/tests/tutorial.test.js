const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const User = require('../src/models/User');
const Tutorial = require('../src/models/Tutorial');
const Category = require('../src/models/Category');
const Comment = require('../src/models/Comment');
const { app } = require('../src/server');
const { categoryDefinitions, tutorialDefinitions } = require('../src/seed');

process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';

function makeUser(id, role = 'professional') {
	return { id, _id: id, role, name: 'Trade Member', toSafeObject() { return { _id: id, role }; } };
}

function tokenFor(user) {
	return require('jsonwebtoken').sign({ sub: user.id }, process.env.JWT_SECRET);
}

test('tutorial submission requires authentication and safety precautions', async (t) => {
	const anonymous = await request(app).post('/api/tutorials').send({});
	assert.equal(anonymous.status, 401);

	const user = makeUser('64a000000000000000000002');
	t.mock.method(User, 'findById', async () => user);
	const response = await request(app)
		.post('/api/tutorials')
		.set('Authorization', `Bearer ${tokenFor(user)}`)
		.send({ title: 'A properly named field guide', description: 'A clear guide with enough descriptive context.', content: 'A'.repeat(100), category: 'electrical', steps: [{ title: 'Prepare the area', description: 'Review the task and prepare the work area.' }] });
	assert.equal(response.status, 400);
	assert.ok(response.body.errors.some((error) => error.field.startsWith('safetyPrecautions')));
});

test('a member cannot edit another author’s tutorial', async (t) => {
	const member = makeUser('64a000000000000000000002');
	t.mock.method(User, 'findById', async () => member);
	t.mock.method(Tutorial, 'findById', async () => ({
		_id: '64a000000000000000000099',
		author: '64a000000000000000000003',
		title: 'A properly named field guide'
	}));

	const response = await request(app)
		.put('/api/tutorials/64a000000000000000000099')
		.set('Authorization', `Bearer ${tokenFor(member)}`)
		.send({ description: 'A sufficiently descriptive replacement summary.' });
	assert.equal(response.status, 403);
});

test('a member cannot delete another author’s tutorial', async (t) => {
	const member = makeUser('64a000000000000000000002');
	t.mock.method(User, 'findById', async () => member);
	t.mock.method(Tutorial, 'findById', async () => ({
		_id: '64a000000000000000000099',
		author: '64a000000000000000000003'
	}));

	const response = await request(app)
		.delete('/api/tutorials/64a000000000000000000099')
		.set('Authorization', `Bearer ${tokenFor(member)}`);
	assert.equal(response.status, 403);
});

test('invalid tutorial identifiers and unknown API paths return client errors', async () => {
	const invalidId = await request(app).get('/api/tutorials/not-an-id');
	const missingRoute = await request(app).get('/api/does-not-exist');
	assert.equal(invalidId.status, 400);
	assert.equal(missingRoute.status, 404);
});

test('public tutorial feed returns a published-only page', async (t) => {
	const query = {
		populate() { return this; },
		sort() { return this; },
		skip() { return this; },
		limit() { return Promise.resolve([]); }
	};
	t.mock.method(Tutorial, 'find', (filter) => {
		assert.equal(filter.status, 'published');
		return query;
	});
	t.mock.method(Tutorial, 'countDocuments', async (filter) => {
		assert.equal(filter.status, 'published');
		return 0;
	});

	const response = await request(app).get('/api/tutorials');
	assert.equal(response.status, 200);
	assert.deepEqual(response.body.tutorials, []);
	assert.equal(response.body.page, 1);
});

test('public categories route returns category records and published counts', async (t) => {
	const categories = [
		{ _id: 'electrical-id', name: 'Electrical', slug: 'electrical', tutorialCount: 3 },
		{ _id: 'masonry-id', name: 'Masonry', slug: 'masonry', tutorialCount: 0 }
	];
	t.mock.method(Category, 'aggregate', async (pipeline) => {
		assert.equal(pipeline[0].$lookup.from, 'tutorials');
		return categories;
	});

	const response = await request(app).get('/api/categories');
	assert.equal(response.status, 200);
	assert.deepEqual(response.body.categories, categories);
});

test('seed library meets required trade counts and includes practical steps and safety notes', () => {
	const counts = tutorialDefinitions.reduce((result, tutorial) => {
		result[tutorial.category] = (result[tutorial.category] || 0) + 1;
		return result;
	}, {});
	assert.equal(categoryDefinitions.length, 7);
	assert.equal(tutorialDefinitions.length, 15);
	assert.ok(counts.Electrical >= 3);
	assert.ok(counts.Plumbing >= 3);
	assert.ok(counts.Welding >= 3);
	assert.ok(counts.HVAC >= 2);
	assert.ok(counts.Carpentry >= 2);
	assert.ok(counts.Automotive >= 2);
	for (const tutorial of tutorialDefinitions) {
		assert.ok(tutorial.description.length >= 20, tutorial.title);
		assert.ok(tutorial.content.length >= 80, tutorial.title);
		assert.ok(tutorial.steps.length > 0, tutorial.title);
		assert.ok(tutorial.safetyPrecautions.length > 0, tutorial.title);
		assert.ok(tutorial.steps.every((step) => step.title.length >= 3 && step.description.length >= 10), tutorial.title);
	}
});

test('valid tutorial submission is attributed to its author and held for review', async (t) => {
	const member = makeUser('64a000000000000000000002');
	const category = { _id: '64a000000000000000000004' };
	const created = {
		_id: '64a000000000000000000099',
		status: 'pending',
		populate: async () => created
	};
	t.mock.method(User, 'findById', async () => member);
	t.mock.method(Category, 'findOne', async () => category);
	t.mock.method(Tutorial, 'create', async (fields) => {
		assert.equal(fields.author, member.id);
		assert.equal(fields.status, 'pending');
		return created;
	});

	const response = await request(app)
		.post('/api/tutorials')
		.set('Authorization', `Bearer ${tokenFor(member)}`)
		.send({
			title: 'A properly named field guide',
			description: 'A clear guide with enough descriptive context.',
			content: 'A'.repeat(100),
			category: 'electrical',
			steps: [{ title: 'Prepare the area', description: 'Review the task and prepare the work area.' }],
			safetyPrecautions: ['Wear the required protective equipment for the task.']
		});
	assert.equal(response.status, 201);
	assert.equal(response.body.tutorial.status, 'pending');
});

test('editing published content returns it to pending moderation', async (t) => {
	const member = makeUser('64a000000000000000000002');
	const tutorial = {
		_id: '64a000000000000000000099',
		author: member.id,
		status: 'published',
		moderationNote: '',
		async save() { return this; },
		async populate() { return this; }
	};
	t.mock.method(User, 'findById', async () => member);
	t.mock.method(Tutorial, 'findById', async () => tutorial);

	const response = await request(app)
		.put('/api/tutorials/64a000000000000000000099')
		.set('Authorization', `Bearer ${tokenFor(member)}`)
		.send({ description: 'A sufficiently descriptive replacement summary.' });
	assert.equal(response.status, 200);
	assert.equal(tutorial.status, 'pending');
});

test('comment, rating, bookmark, profile, upload and category write routes require authentication', async () => {
	const unauthorized = [
		request(app).post('/api/comments/tutorial/64a000000000000000000099').send({ content: 'Useful note' }),
		request(app).put('/api/ratings/64a000000000000000000099').send({ value: 4 }),
		request(app).post('/api/bookmarks/64a000000000000000000099'),
		request(app).get('/api/profile/me'),
		request(app).post('/api/uploads'),
		request(app).post('/api/categories').send({ name: 'Electrical' })
	];
	const responses = await Promise.all(unauthorized);
	assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401, 401, 401]);
});

test('administrator statistics API returns aggregated usage data', async (t) => {
	const admin = makeUser('64a000000000000000000005', 'admin');
	t.mock.method(User, 'findById', async () => admin);
	t.mock.method(User, 'countDocuments', async () => 8);
	t.mock.method(Tutorial, 'countDocuments', async (filter = {}) => filter.status === 'pending' ? 2 : filter.status === 'published' ? 6 : 8);
	t.mock.method(Comment, 'countDocuments', async () => 15);
	t.mock.method(Category, 'countDocuments', async () => 7);
	t.mock.method(Tutorial, 'aggregate', async () => [{ total: 125 }]);

	const response = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${tokenFor(admin)}`);
	assert.equal(response.status, 200);
	assert.deepEqual(response.body.stats, { users: 8, tutorials: 8, pendingTutorials: 2, publishedTutorials: 6, comments: 15, categories: 7, views: 125 });
});