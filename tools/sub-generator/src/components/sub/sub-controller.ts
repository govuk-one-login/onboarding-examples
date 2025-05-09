import { Request, Response } from 'express';
import { createHash, randomBytes } from "crypto";



export const subController = async (
  req: Request, 
  res: Response
): Promise<void> => {
  
  try {
    const PAIRWISE_PREFIX = "urn:fdc:gov.uk:2022:";
    const subjectID: string = req.query.id;
    const sectorHost: string = req.query.sector;
    const salt = Buffer.from(randomBytes(32).toString());
    const pairwiseIdentifier = calculatePairwiseIdentifier(PAIRWISE_PREFIX, subjectID, sectorHost, salt);
    
    res.contentType('text/plain').send(pairwiseIdentifier);
  } catch (error) {
      console.error('Sub generation failed:', error);
      return res.status(500)
          .contentType('text/plain')
          .send('Error: Failed to generate sub');
  }
}

function calculatePairwiseIdentifier(
  pairwisePrefix: string,
  subjectID: string,
  sectorHost: string,
  salt: Buffer
): string {
  try {
    const md = createHash('sha256');
    md.update(Buffer.from(sectorHost, 'utf8'));
    md.update(Buffer.from(subjectID, 'utf8'));
    md.update(salt);
    const bytes = md.digest();
    const sb = bytes.toString('base64url');
    return pairwisePrefix + sb;
  } catch (e) {
    console.error('Failed to hash', e);
    throw new Error('Hashing failed: ' + (e instanceof Error ? e.message : String(e)));
  }
}