import * as argon2 from 'argon2';

async function generateArgon2Hash(clientSecret: string, salt: string): Promise<string> {
    try {
        // Convert salt to Buffer
        const saltBuffer = Buffer.from(salt);

        // Configure Argon2id options
        const options = {
            type: argon2.argon2id,
            memoryCost:     15360,  // in KiB
            timeCost:       2,      // Number of iterations
            parallelism:    1,      // Degree of parallelism
            salt: saltBuffer,
            hashLength:     16      // Output hash length in bytes
        };

        // Generate the hash
        const hash = await argon2.hash(clientSecret, options);
        
        return hash;
    } catch (error) {
        throw new Error(`Failed to generate Argon2id hash: ${error}`);
    }
}

async function main() {
    const [,, clientSecret, salt] = process.argv;
    if (!clientSecret || !salt) {
        console.error('Usage: node generate-argon2id-hash.js <SECRET> <SALT>');
        process.exit(1);
    }

    try {
        const encodedHash = await generateArgon2Hash(clientSecret, salt);
        console.log(encodedHash);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();