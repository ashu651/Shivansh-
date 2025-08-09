import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function processJobs() {
  // In a real system, consume queue. Here we just log.
  // Simulate updating posts with processed assets if needed.
  const recent = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  for (const post of recent) {
    // no-op
  }
}

setInterval(() => {
  processJobs().catch((e) => console.error(e));
}, 5000);