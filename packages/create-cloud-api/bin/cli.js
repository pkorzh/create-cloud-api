#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');

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
	version: '1.0.0',
	private: true,
};

fs.writeFileSync(
	path.join(root, 'package.json'),
	JSON.stringify(packageJson, null, 2)
);

const originalDirectory = process.cwd();
process.chdir(root);

run(root, ['../packages/cca-scripts']);

function run(root, dependencies) {
	return install(root, dependencies).then(() => {
		const scriptsPath = path.resolve(
			process.cwd(),
			'node_modules',
			'cca-scripts',
			'externals',
			'init.js'
		);

		const init = require(scriptsPath);
		return init(root, appName, originalDirectory);
	});
}

function install(root, dependencies) {
	return new Promise((resolve, reject) => {
		let command,
			args;

		command = 'npm';
		args = [
			'install',
			'--save',
			'--save-exact',
			'--loglevel',
			'error',
		].concat(dependencies);

		const child = spawn(command, args, { stdio: 'inherit' });
		child.on('close', code => {
			if (code !== 0) {
				reject({
					command: `${command} ${args.join(' ')}`,
				});
				return;
			}
			
			resolve();
		});
	});
}