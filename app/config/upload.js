const path = require('path')
const multer = require('multer');

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

module.exports = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      const fileName = file.originalname.replace(/\s/g,'+')
      return callback(null, fileName);
    },
  }),
}