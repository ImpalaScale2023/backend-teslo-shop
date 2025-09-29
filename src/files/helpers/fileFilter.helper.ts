

export const fileFilter = (req: Express.Request, file:Express.Multer.File, cb:Function)=>{

    //console.log({file});
if (!file) return cb(new Error('File is empty'),false); //este flase indica rechaze del archivo

const fileExtension  = file.mimetype.split('/')[1]; // mimetype = image/jpg
const validExtension = ['jpg','jpeg','png','gif'];

if (validExtension.includes(fileExtension) ){
    cb(null, true);
}


cb(null, false);
}