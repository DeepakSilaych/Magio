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

  async logEmailView(emailId: string, ipAddress?: string, userAgent?: string) {
    return prisma.viewLog.create({
      data: { emailId, ipAddress, userAgent },
    });
  },
};
