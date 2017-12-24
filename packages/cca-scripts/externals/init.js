const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');

module.exports = function init(appPath, appName, originalDirectory) {
	const ownPackageName = require(path.join(__dirname, '..', 'package.json')).name;
	const ownPath = path.join(appPath, 'node_modules', ownPackageName);

	const appPackage = require(path.join(appPath, 'package.json'));

	appPackage.scripts = {
		deploy: `${ownPackageName} deploy`,
		destroy: `${ownPackageName} destroy`,
	};

	fs.writeFileSync(
		path.join(appPath, 'package.json'),
		JSON.stringify(appPackage, null, 2)
	);

	const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));

	if (readmeExists) {
		fs.renameSync(
			path.join(appPath, 'README.md'),
			path.join(appPath, 'README.old.md')
		);
	}

	const templatePath = path.join(ownPath, 'template');

	if (fs.existsSync(templatePath)) {
		fs.copySync(templatePath, appPath);
	}
}