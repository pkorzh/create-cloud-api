const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const paths = require('../../config/paths');

function archive(lambda) {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(path.join(paths.appBuildPath, lambda.zip));
		const archive = archiver.create('zip');

		output.on('close', function () {
			resolve();
		});

		archive.on('error', function(err){
			reject(err);
		});

		archive.pipe(output);
		archive.directory(path.join(paths.appLambdaPath, lambda.name), '/');
		
		archive.finalize();
	});
}

module.exports = {
	archive
};