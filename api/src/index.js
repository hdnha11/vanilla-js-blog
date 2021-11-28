const express = require('express');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = process.env.PORT || 3000;
const blogs = {};
const messages = [];

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function createResponse(data, verdict = 'success', { error } = {}) {
  return {
    data,
    verdict,
    error,
  };
}

function sanitize(dirty) {
  return sanitizeHtml(dirty, { disallowedTagsMode: 'escape' });
}

app.use(express.json());
app.use(cors());

/* Like count */

app.get('/blog/:slug/total-like', (req, res) => {
  const slug = req.params.slug;
  res.send(createResponse(blogs?.[slug]?.totalLike || 0));
});

app.post('/blog/:slug/like', (req, res) => {
  const slug = req.params.slug;
  if (!blogs[slug]) {
    blogs[slug] = { totalLike: 0 };
  }
  blogs[slug].totalLike++;
  res.send(createResponse(null));
});

/* Contact */

app.get('/messages', (req, res) => {
  res.send(createResponse(messages));
});

app.post('/messages', (req, res, next) => {
  if (!req.body.fullName) {
    return next(createError(400, 'Missing "fullName" parameter'));
  }
  if (!req.body.email) {
    return next(createError(400, 'Missing "email" parameter'));
  }
  if (!req.body.message) {
    return next(createError(400, 'Missing "message" parameter'));
  }

  messages.push({
    id: messages.length + 1,
    fullName: sanitize(req.body.fullName),
    email: sanitize(req.body.email),
    message: sanitize(req.body.message),
    read: false,
    createdAt: new Date(),
  });
  res.send(createResponse(null));
});

app.patch('/messages/:id/read', (req, res, next) => {
  const id = Number(req.params.id);
  const message = messages.find((message) => message.id === id);
  if (!message) {
    return next(createError(404, `Message with id=${id} is not found`));
  }
  message.read = true;
  res.send(createResponse(null));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  let verdict = 'error';
  if (res.statusCode === 400) {
    verdict = 'invalid_data';
  } else if (res.statusCode === 404) {
    verdict = 'not_found';
  }
  res.send(createResponse(null, verdict, { error: err.message }));
});

app.use((req, res) => {
  res.status(404);
  res.send(createResponse(null, 'not_found'));
});

app.listen(port, () => {
  console.log(`Personal Blog API listening at http://localhost:${port}`);
});
