const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const spawn = require('cross-spawn');
const chalk = require('chalk');

const paths = require('../config/paths');
const util = require('./util');

inquirer.prompt({
	type: 'confirm',
	name: 'shouldEject',
	message: 'Are you sure you want to eject?',
	default: false,
}).then(answer => {
	if (answer.shouldEject) {

		const ownPath = paths.ownPath;
		const appPath = paths.appPath;

		const folders = [
			'config',
			'scripts',
			'scripts/util',
			'scripts/util/codegen',
		];

		folders.forEach(folder => fs.mkdirSync(path.join(appPath, folder)));

		const blackList = new RegExp(
			['eject.js'].join('|')
		);

		const files = folders.reduce((acc, folder) => {
			const innerFile = fs.readdirSync(path.join(ownPath, folder))
				.map(file => path.join(folder, file))
				.filter(file => {
					if (blackList.test(file)) {
						return false;
					}

					return fs.lstatSync(path.join(ownPath, file)).isFile()
				})

			return acc.concat(innerFile);
		}, []);

		files.forEach(file => {
			console.log(`Copying ${chalk.cyan(file)}`);

			fs.copySync(
				path.join(ownPath, file),
				path.join(appPath, file)
			)
		});

		const ownPackage = require(path.join(ownPath, 'package.json'));
		const appPackage = require(path.join(appPath, 'package.json'));

		delete appPackage.scripts['eject'];
		delete appPackage.dependencies['cca-scripts'];

		console.log();

		Object.keys(ownPackage.dependencies).forEach(dep => {
			console.log(`Adding npm dependency ${chalk.cyan(dep)}`);

			appPackage.dependencies[dep] = ownPackage.dependencies[dep];
		});

		Object.keys(appPackage.scripts).forEach(dep => {
			appPackage.scripts[dep] = appPackage.scripts[dep].replace(
				/cca-scripts\s+/,
				'node ./scripts/'
			);
		});

		fs.writeFileSync(
			path.join(appPath, 'package.json'),
			JSON.stringify(appPackage, null, 2) + '\n'
		);

		console.log();
		console.log('Installing dependencies...');

		spawn('npm', ['install', '--loglevel', 'error'], {
			stdio: 'inherit',
		});

		console.log();
		console.log(chalk.green('Please tell us why you ejected. This will help improve the project.'));
		console.log('\thttps://goo.gl/forms/nKiecNBegiLrjyVl2');
		console.log();
	}
});