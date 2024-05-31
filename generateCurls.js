const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env' });

const domain = process.env.APPLICATION_HOST;
const port = process.env.APPLICATION_PORT;

const generateRandomValue = () => Math.floor(Math.random() * 10000);

const replacePlaceholdersWithRandomValues = (obj) => {
	const jsonString = JSON.stringify(obj);
	const replacedString = jsonString.replace(/<:[^>]+>/g, generateRandomValue);
	return JSON.parse(replacedString);
};

const generateCurlCommands = (routes) => {
	return routes.map((route, index) => {
		const { method, route: endpoint, requestData } = route;
		const pathParams = endpoint.match(/:([^/]+)/g) || [];
		let url = endpoint;
		pathParams.forEach((param) => {
			const randomValue = generateRandomValue();
			url = url.replace(param, randomValue);
		});

		const queryParams = [];
		const queryParamRegex = /<:([^>]+)>/g;
		let match;
		while ((match = queryParamRegex.exec(url)) !== null) {
			const paramName = match[1];
			const randomValue = generateRandomValue();
			queryParams.push(`${paramName}=${randomValue}`);
		}
		if (queryParams.length > 0) {
			url += `?${queryParams.join('&')}`;
		}

		const methodOption = method.toUpperCase();
		let curlCommand = `curl -X ${methodOption} "http://${domain}:${port}${url}"`;

		if (['POST', 'PUT'].includes(methodOption)) {
			const requestDataWithRandomValues = requestData ? replacePlaceholdersWithRandomValues(requestData) : {};
			curlCommand += ` -H "Content-Type: application/json" -d '${JSON.stringify(requestDataWithRandomValues)}'`;
		}

		return `# Command ${index + 1}\n${curlCommand}\n`;
	});
};

const clearDirectory = (directoryPath) => {
	if (fs.existsSync(directoryPath)) {
		fs.readdirSync(directoryPath).forEach((file) => {
			const filePath = path.join(directoryPath, file);
			if (fs.lstatSync(filePath).isDirectory()) {
				clearDirectory(filePath);
			} else {
				fs.unlinkSync(filePath);
			}
		});
	}
};

const processConfigs = () => {
	const configDir = path.join(__dirname, 'routeConfigs');
	const curlDir = path.join(__dirname, 'curls');

	clearDirectory(curlDir);

	if (!fs.existsSync(curlDir)) fs.mkdirSync(curlDir);
	const files = fs.readdirSync(configDir);
	files.forEach((file) => {
		const filePath = path.join(configDir, file);
		const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		const curlCommands = generateCurlCommands(fileContent.routes);
		const outputFilePath = path.join(curlDir, `${path.basename(file, path.extname(file))}.txt`);
		fs.writeFileSync(outputFilePath, curlCommands.join('\n'), 'utf8');
		console.log(`Curl commands have been written to ${outputFilePath}`);
	});
};

processConfigs();
