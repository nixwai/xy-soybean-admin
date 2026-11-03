import { fetchAdminPublicKey } from '@/service/api';

let publicKeyPromise: Promise<CryptoKey> | null = null;

function pemToDer(pem: string) {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '');
  const binary = window.atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0)).buffer;
}

async function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = fetchAdminPublicKey().then(async ({ data, error }) => {
      if (error || !data?.publicKey) {
        throw new Error('获取密码加密公钥失败');
      }

      return window.crypto.subtle.importKey(
        'spki',
        pemToDer(data.publicKey),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );
    });
  }

  return publicKeyPromise;
}

/** 使用后端公钥加密管理员密码，避免明文密码直接传输。 */
export async function encryptAdminPassword(password: string) {
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    await getPublicKey(),
    new TextEncoder().encode(password)
  );

  return window.btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
