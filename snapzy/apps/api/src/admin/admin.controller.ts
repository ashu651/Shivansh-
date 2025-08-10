import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Get('reports')
  async listReports() {
    const reports = await prisma.report.findMany({ where: { status: 'open' }, orderBy: { createdAt: 'desc' }, take: 100, include: { post: true, reporter: true } });
    return { reports };
  }

  @Post('reports/:id/resolve')
  async resolveReport(@Param('id') id: string, @Body() body: any) {
    const report = await prisma.report.update({ where: { id }, data: { status: 'resolved' } });
    if (body?.action === 'hide_post') {
      await prisma.post.update({ where: { id: report.postId }, data: { hidden: true } });
    }
    return { report };
  }
}