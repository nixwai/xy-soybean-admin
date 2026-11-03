import { encryptAdminPassword } from '@/utils/security/password';

export function encryptPassword(password: string) {
  return encryptAdminPassword(password);
}
