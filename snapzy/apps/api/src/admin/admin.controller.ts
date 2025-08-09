import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const prisma = new PrismaClient();

@ApiTags('admin')
@ApiBearerAuth()
@Controller('/api/v1/admin')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminController {
  @Get('audit-logs')
  async logs() {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return { logs };
  }

  @Patch('users/:id/role/:role')
  async setRole(@Param('id') id: string, @Param('role') role: Role) {
    const updated = await prisma.user.update({ where: { id }, data: { role } });
    await prisma.auditLog.create({ data: { userId: id, action: 'role_change', metadata: { role } as any } });
    return { user: updated };
  }
}