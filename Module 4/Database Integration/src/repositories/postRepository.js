const prisma = require('../db/prisma');

const postFields = {
  id: true,
  title: true,
  body: true,
  authorId: true,
};

function validId(id) {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function normalizePost(post) {
  return { ...post, authorId: post.authorId ?? undefined };
}

function translateConstraintError(error) {
  if (['P2000', 'P2002', 'P2003', 'P2004', 'P2011', 'P2014', 'P2020'].includes(error.code)) {
    const translated = new Error('Request conflicts with a database constraint');
    translated.statusCode = 409;
    return translated;
  }
  return error;
}

async function findAll() {
  const posts = await prisma.post.findMany({
    orderBy: { id: 'asc' },
    select: postFields,
  });
  return posts.map(normalizePost);
}

async function findById(id) {
  const numericId = validId(id);
  if (numericId === null) return null;
  const post = await prisma.post.findUnique({
    where: { id: numericId },
    select: postFields,
  });
  return post ? normalizePost(post) : null;
}

async function create(fields) {
  try {
    const post = await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: fields.authorId,
      },
      select: postFields,
    });
    return normalizePost(post);
  } catch (error) {
    throw translateConstraintError(error);
  }
}

async function update(id, patch) {
  const numericId = validId(id);
  if (numericId === null) return null;

  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    const post = await prisma.post.update({
      where: { id: numericId },
      data,
      select: postFields,
    });
    return normalizePost(post);
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw translateConstraintError(error);
  }
}

async function remove(id) {
  const numericId = validId(id);
  if (numericId === null) return false;
  const result = await prisma.post.deleteMany({ where: { id: numericId } });
  return result.count > 0;
}

module.exports = { findAll, findById, create, update, remove };
