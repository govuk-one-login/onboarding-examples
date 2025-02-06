import * as crypto from "node:crypto";
import * as fs from "fs/promises";
import path from "node:path";

/**
 * Generates an RSA key pair and saves them to files
 * @param privateKeyPath Path to save the private key
 * @param publicKeyPath Path to save the public key
 * @param keySize Size of the RSA key (default: 2048 bits)
 */
async function generateKeyPair(privateKeyFilename: string, publicKeyFilename: string, keySize: number = 2048): Promise<void> {
    try {
        // Generate the key pair
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

        // Save the private key to a file
        await writeFile(privateKeyFilename, privateKey);
        console.log(`Private key saved to ${privateKeyFilename}`);

        // Save the public key to a file
        await writeFile(publicKeyFilename, publicKey);
        console.log(`Public key saved to ${publicKeyFilename}`);
    } catch (error) {
        console.error('Error generating key pair:', error);
        throw error;
    }
}

export async function createKeys() {
    try {
        await generateKeyPair("private_key.pem", "public_key.pem");
    } catch (error) {
        console.error('Operation failed:', error);
    }
}

async function writeFile(filename: string, content: string): Promise<void> {

    let filePath: string;
    try {
        // Resolve the full path (optional, but recommended)
        filePath = path.resolve(process.cwd(), filename);
                
        // Write the token to file
        await fs.writeFile(filePath, content, { 
            encoding: 'utf8',
            flag: 'w' // write (creates or truncates)
        });

        console.log(`Content saved to ${filePath}`);
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
}