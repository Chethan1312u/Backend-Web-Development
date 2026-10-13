const prisma = require('../src/db/prisma');
const seedPosts = require('../src/data/postSeed');

async function main() {
  const author = await prisma.user.upsert({
    where: { email: 'seed@community.local' },
    update: {},
    create: { name: 'Community Seed', email: 'seed@community.local' },
  });

  for (const seedPost of seedPosts) {
    const existingPost = await prisma.post.findFirst({
      where: {
        title: seedPost.title,
        body: seedPost.body,
        authorId: author.id,
      },
      select: { id: true },
    });

    if (!existingPost) {
      await prisma.post.create({
        data: {
          title: seedPost.title,
          body: seedPost.body,
          authorId: author.id,
        },
      });
    }
  }
}

main()
  .catch(() => {
    console.error('Database seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });