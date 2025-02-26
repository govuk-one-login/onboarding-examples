import * as crypto from "node:crypto";
import { writeFile } from "node:fs/promises";
import argon2, { Options } from 'argon2';

export async function createSecret() {
    try {
        hashSecret(await generateClientSecret(40, "client_secret.txt"), "client_secret_hash.txt");
    } catch (error) {
        console.error('Operation failed:', error);
    }
}

async function generateClientSecret(
    bytes: number,
    clientSecretFilename: string    
): Promise<string> {
    try {
        const randomBytes = crypto.randomBytes(bytes);
        const secret = randomBytes.toString('base64');
        writeFile(clientSecretFilename, secret);
        console.log(`Generated client secret saved to ${clientSecretFilename}`);

        return secret
    } catch (error) {
        console.error('Error generating secret:', error);
        throw error;
    }
}

async function hashSecret(
    secret: string,
    clientSecretHashFilename: string
): Promise<void> {
    try {
        // Configure hashing options with Argon2's Options type
        const hashingOptions: Options = {
            type: argon2.argon2id,
            memoryCost: 15360,  // Memory usage in KiB (64 MB)
            timeCost: 2,        // Number of iterations
            parallelism: 1,     // Degree of parallelism
            hashLength: 16     // Length of the hash output
        };

        const hash = await argon2.hash(secret, hashingOptions);
        writeFile(clientSecretHashFilename, hash);
        console.log(`Generated client secret hash saved to ${clientSecretHashFilename}`);
        
    } catch (error) {
        console.error('Error hashing secret:', error);
        throw error;
    }
}