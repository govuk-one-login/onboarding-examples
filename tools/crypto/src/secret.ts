import * as crypto from "node:crypto";
import * as fs from "fs/promises";
import path from "node:path";

import argon2, { Options } from 'argon2';

// Define types for improved type safety
interface HashingOptions {
    type: number;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    hashLength: number;
    salt?: Buffer
}

export async function createSecret() {
    try {
        const secret = await generateClientSecret(40);
        console.log('Generated client secret:', secret);

        const hash = await hashSecret(secret);
        console.log('Generated hash:', hash);

    } catch (error) {
        console.error('Operation failed:', error);
    }
}

async function generateClientSecret(
    bytes: number
): Promise<string> {
    try {
        // Generate the secret
        const randomBytes = crypto.randomBytes(bytes);
    
        // Convert to base64
        const secret = randomBytes.toString('base64');
        
        writeFile('CLIENT_SECRET.txt', secret);
        
        return secret

    } catch (error) {
        console.error('Error generating secret:', error);
        throw error;
    }
}

async function hashSecret(secret: string): Promise<string> {
    try {
        // Configure hashing options with Argon2's Options type
        const hashingOptions: Options = {
            type: argon2.argon2id,
            memoryCost: 65536,  // Memory usage in KiB (64 MB)
            timeCost: 3,        // Number of iterations
            parallelism: 4,     // Degree of parallelism
            hashLength: 32     // Length of the hash output
        };

        // Generate the hash
        const hash = await argon2.hash(secret, hashingOptions);
        writeFile('CLIENT_SECRET_HASH.txt', hash);
        return hash;
    } catch (error) {
        console.error('Error hashing secret:', error);
        throw error;
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