export const getPrivateKey = async (
  privateKeyPem: string
): Promise<CryptoKey> => {
  
  const binaryDer = Buffer.from(privateKeyPem, 'base64');

    // Import the ArrayBuffer as a CryptoKey
    let privateKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: 'RSA-PSS',
            hash: 'SHA-256'
        },
        true, // Whether the key is extractable
        ['sign'] // Key usages (e.g., 'sign' or 'decrypt' for private keys)
    );

    return privateKey;
}