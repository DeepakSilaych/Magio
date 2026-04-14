import { dbConnector } from '@/lib/db/connector';

export async function getDashboardData() {
  return dbConnector.getAllEmails();
}
