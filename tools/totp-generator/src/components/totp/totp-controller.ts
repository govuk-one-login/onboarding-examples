import { Request, Response } from 'express';
import crypto from 'node:crypto';
import base32 from "hi-base32";

export const totpController = async (
    req: Request, 
    res: Response
): Promise<void> => {
    
    try {
        const secret: string = req.query.secret;
        let counter = Math.floor(Date.now() / 30000);
          
        const decodedSecret = base32.decode.asBytes(secret);
        const buffer = Buffer.alloc(8);
        for (let i = 0; i < 8; i++) {
            buffer[7 - i] = counter & 0xff;
            counter = counter >> 8;
        }
    
        const hmac = crypto.createHmac("SHA1", Buffer.from(decodedSecret)).update(buffer).digest();
        const offset = hmac[hmac.length - 1] & 0xf;
        const code =
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff);
        const totp = (code % 10 ** 6).toString().padStart(6, "0");
        res.contentType('text/plain').send(totp);
    } catch (error) {
        console.error('TOTP generation failed:', error);
        return res.status(500)
          .contentType('text/plain')
          .send('Error: Failed to generate secret');
    }    
}