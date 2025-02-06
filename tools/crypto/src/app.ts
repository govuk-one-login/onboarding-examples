import { argv } from 'node:process';
import { createKeys } from './keys';
import { createSecret } from './secret';

// Main execution logic
async function main() {
    const functionName = argv[2];
  
    switch (functionName) {
      case 'createKeys':
        await createKeys();
        break;
      case 'createSecret':
        await createSecret();
        break;
      default:
        console.error('Unknown function');
        process.exit(1);
    }
  }
  
  main().catch(console.error);