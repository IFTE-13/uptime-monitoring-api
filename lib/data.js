const fs = require('fs');
const path = require('path');

const lib = {};

// base directory of data folder
lib.basedir = path.join(__dirname, '/../.data/'); // for joining path

// write data to file
lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, (error1) => {
                if (!error1) {
                    fs.close(fileDescriptor, (error2) => {
                        if (!error2) {
                            callback(false);
                        } else {
                            callback('error closing the new file');
                        }
                    });
                } else {
                    callback('Error writing into new file');
                }
            });
        } else {
            callback('There was an error or file may already exist');
        }
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            // truncate the data
            fs.ftruncate(fileDescriptor, (err2) => {
                if (!err2) {
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (!err3) {
                            fs.close(fileDescriptor, (err4) => {
                                if (!err4) {
                                    callback(false);
                                } else {
                                    callback('Error occured during closing file');
                                }
                            });
                        } else {
                            callback('Error writing file');
                        }
                    });
                } else {
                    callback('Truncating file');
                }
            });
        } else {
            console.log('Error updating file or file may not exist');
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('error deleting file');
        }
    });
};

lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}`, (err, fileNames) => {
        if(!err && fileNames && fileNames.length > 0){
            let trimFileName = [];
            fileNames.forEach(fileNames => {
                trimFileName.push(fileNames.replace('.json', ''))
            })
            callback(false, trimFileName)
        }else{
            callback('Error')
        }
    })
}

module.exports = lib;
