import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userLoader = new DataLoader<string, any>(async (ids) => {
  const users = await prisma.user.findMany({ where: { id: { in: ids as string[] } } });
  const map = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => map.get(id));
});