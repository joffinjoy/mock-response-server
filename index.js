const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
require('dotenv').config({ path: './.env' });

const PORT = process.env.APPLICATION_PORT;
app.use(express.json());

const extractPlaceholders = (obj, prefix = '') => {
	const placeholders = {};
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === 'object' && value !== null) {
			Object.assign(placeholders, extractPlaceholders(value, `${prefix}${key}.`));
		} else if (typeof value === 'string' && value.startsWith('<:') && value.endsWith('>')) {
			placeholders[value.slice(2, -1)] = `${prefix}${key}`;
		}
	}
	return placeholders;
};

const getValueByPath = (obj, path) => {
	const keys = path.split('.');
	let result = obj;
	for (const key of keys) {
		result = result ? result[key] : undefined;
	}
	return result;
};

const replacePlaceholders = (template, placeholders, params) => {
	let result = template;
	for (const [placeholder, path] of Object.entries(placeholders)) {
		const value = getValueByPath(params, path);
		const regex = new RegExp(`<:${placeholder}>`, 'g');
		result = result.replace(regex, value);
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
		const placeholders = {
			...extractPlaceholders(requestData),
			...Object.fromEntries(Object.keys(req.params).map((key) => [key, key])),
			...Object.fromEntries(Object.keys(req.query).map((key) => [key, key])),
		};
		console.log('Extracted Placeholders:', placeholders);
		const responseTemplate = JSON.stringify(returnData);
		const responseWithPlaceholdersReplaced = replacePlaceholders(responseTemplate, placeholders, params);
		const response = JSON.parse(responseWithPlaceholdersReplaced);
		console.log('Response:', response);
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
