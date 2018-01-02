const AWS = require('aws-sdk');

const { getStackOutputs } = require('./cloudformation');

const ag = new AWS.APIGateway();

function exportApi(stage) {
	return getStackOutputs().then((outputs) => {
		let restApi = outputs.apiId;
		
		let params = {
			exportType: 'swagger',
			restApiId: restApi,
			stageName: stage,
			accepts: 'application/json',
			parameters: {
				extensions: 'integrations'
			}
		};

		return new Promise((resolve, reject) => {
			ag.getExport(params, function (err, data) {
				if (err) {
					reject(err);
				} else {
					let apiDoc = JSON.parse(data.body);
					resolve(apiDoc);
				}
			});
		});
	});
}

module.exports = {
	exportApi
};