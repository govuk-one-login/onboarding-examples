import * as fs from "fs/promises";
import path from "node:path";

export async function writeFile(filename: string, content: string): Promise<void> {

    let filePath: string;
    try {
        // Resolve the full path (optional, but recommended)
        filePath = path.resolve(process.cwd(), filename);
                
        // Write the token to file
        await fs.writeFile(filePath, content, { 
            encoding: 'utf8',
            flag: 'w' // write (creates or truncates)
        });
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
}