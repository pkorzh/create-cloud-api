#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

function printUsage() {
	console.log('Usage: create-cloud-api <name>');
}

const name = process.argv.slice(2)[0];

if (!name) {
	printUsage();
	process.exit(1);
}

const root = path.resolve(name);
const appName = path.basename(root);

fs.ensureDirSync(root);

const packageJson = {
	name: appName,
	version: '0.1.0',
	private: true,
};

fs.writeFileSync(
	path.join(root, 'package.json'),
	JSON.stringify(packageJson, null, 2)
);