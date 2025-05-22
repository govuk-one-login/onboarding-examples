import { createKeys } from './keys';
import { createSecret } from './secret';

// Main execution logic
async function main() {
    
        await createKeys();
        await createSecret();

}
  
main().catch(console.error);