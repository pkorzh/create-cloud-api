#!/usr/bin/env node

const spawn = require('cross-spawn');

const script = process.argv.slice(2)[0];
const rest = process.argv.slice(3);

if (!script) {
	process.exit(1);
}

switch(script) {
	case 'deploy':
	case 'destroy':
	case 'get-client-config':
	case 'eject':
	case 'template':
	case 'export-api':
		{
			const result = spawn.sync(
				'node',
				[require.resolve(`../scripts/${script}`)].concat(rest),
				{ stdio: 'inherit' }
			);

			process.exit(result.status);
		}
	default:
		console.log('Unknown script "' + script + '".');
		process.exit(1);
}