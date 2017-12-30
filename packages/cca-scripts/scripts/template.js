const stringifyObject = require('stringify-object');
const fs = require('fs-extra');
const path = require('path');

const paths = require('../config/paths');
const util = require('./util');

const resource = process.argv.slice(2)[0];

if (!resource) {
	process.exit(1);
}

const template = require(paths.appTemplateJs);

switch(resource) {
	case 'cognito':
		{
			Promise.resolve(util.codegen.cognito.generate(template)).then(save);
			
			fs.copySync(
				path.resolve(__dirname, '..', 'custom_resources', 'userPoolCustomResource'),
				path.resolve(paths.appLambdaPath, 'userPoolCustomResource')
			);
			
			break;
		}
	default:
		console.log('Unknown resource "' + resource + '".');
		process.exit(1);
}

function save(template) {
	const pretty = stringifyObject(template, {
		indent: '\t',
		singleQuotes: true
	});

	fs.writeFileSync(
		paths.appTemplateJs,
		`module.exports = ${pretty}`,
		'utf-8'
	);
}