import { prisma } from './client';

export const dbConnector = {
  async createEmail(data: { subject: string; recipient: string; sender: string; senderIp?: string | null }) {
    return prisma.email.create({ data });
  },

  async getEmailById(id: string) {
    return prisma.email.findUnique({
      where: { id },
      include: { views: true },
    });
  },

  async getAllEmails() {
    return prisma.email.findMany({
      include: { views: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async searchEmails(subject: string) {
    return prisma.email.findMany({
      where: { subject: { contains: subject, mode: 'insensitive' } },
      include: { views: { orderBy: { viewedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
  },

  async getEmailStatuses() {
    return prisma.email.findMany({
      select: {
        subject: true,
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async logEmailView(
    emailId: string,
    data: {
      ipAddress?: string;
      userAgent?: string;
      city?: string;
      region?: string;
      country?: string;
      browser?: string;
      os?: string;
      device?: string;
    }
  ) {
    return prisma.viewLog.create({
      data: { emailId, ...data },
    });
  },

  async deleteRecentViews(emailId: string, since: Date) {
    return prisma.viewLog.deleteMany({
      where: {
        emailId,
        viewedAt: { gte: since },
      },
    });
  },
};
