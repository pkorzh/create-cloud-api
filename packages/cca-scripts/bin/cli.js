#!/usr/bin/env node

const spawn = require('cross-spawn');

const script = process.argv.slice(2)[0];

if (!script) {
	process.exit(1);
}

switch(script) {
	case 'deploy':
	case 'destroy':
	case 'get-client-config':
		{
			const result = spawn.sync(
				'node',
				[require.resolve(`../scripts/${script}`)],
				{ stdio: 'inherit' }
			);

			process.exit(result.status);
		}
	default:
		console.log('Unknown script "' + script + '".');
		process.exit(1);
}