import * as crypto from "node:crypto";
import { writeFile } from "node:fs/promises";

export async function createKeys() {
    try {
        generateKeyPair("private_key.pem", "public_key.pem");
    } catch (error) {
        console.error('Operation failed:', error);
    }
}

async function generateKeyPair(
    privateKeyFilename: string, 
    publicKeyFilename: string, 
    keySize: number = 2048
): Promise<void> {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: keySize,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        writeFile(privateKeyFilename, privateKey);        
        console.log(`Generated private key saved to ${privateKeyFilename}`);

        writeFile(publicKeyFilename, publicKey);
        console.log(`Generated public key saved to ${publicKeyFilename}`);

    } catch (error) {
        console.error('Error generating key pair:', error);
        throw error;
    }
}



