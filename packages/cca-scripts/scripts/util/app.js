const path = require('path');

const paths = require('../../config/paths');

const appJson = require(paths.appJson);

module.exports = {
	name: path.basename(paths.appPath),
	region: appJson.region,
	uploadsBucket: appJson.uploadsBucket,
	uploadsBucketKeyPrefix: appJson.uploadsBucketKeyPrefix,
};