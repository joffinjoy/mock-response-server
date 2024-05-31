const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
require('dotenv').config({ path: './.env' });

const PORT = process.env.APPLICATION_PORT;

app.use(express.json());

const replacePlaceholders = (template, params) => {
	let result = template;
	for (const [key, value] of Object.entries(params)) {
		result = result.replace(new RegExp(`<:${key}>`, 'g'), value);
	}
	return result;
};

const loadConfigs = () => {
	const configs = [];
	const configDir = path.join(__dirname, 'routeConfigs');
	const files = fs.readdirSync(configDir);

	files.forEach((file) => {
		const filePath = path.join(configDir, file);
		const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		configs.push(...fileContent.routes);
	});

	return configs;
};

const configs = loadConfigs();

configs.forEach((routeConfig) => {
	const { method, route, requestData, returnData } = routeConfig;
	const httpMethod = method.toLowerCase();

	app[httpMethod](route, (req, res) => {
		const params = { ...req.params, ...req.query, ...req.body };
		const response = JSON.parse(replacePlaceholders(JSON.stringify(returnData), params));
		res.json(response);
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on http://${process.env.APPLICATION_HOST}:${PORT}`);
	exec('node generateCurls.js', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error generating curl commands: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`Error output from curl generation script: ${stderr}`);
			return;
		}
		console.log('Curl commands generated:');
		console.log(stdout);
	});
});
