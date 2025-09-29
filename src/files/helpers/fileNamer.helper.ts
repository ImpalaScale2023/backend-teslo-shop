
import { randomUUID } from 'crypto';

export const fileNamer = (req: Express.Request, file:Express.Multer.File, cb:Function)=>{

if (!file) return cb(new Error('File is empty'),false); //este flase indica rechaze del archivo

const fileExtension  = file.mimetype.split('/')[1]; // mimetype = image/jpg

const fileName = `${ randomUUID() }.${ fileExtension }`;

cb(null, fileName);
}