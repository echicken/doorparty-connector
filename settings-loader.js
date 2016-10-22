const fs = require('fs');
const path = require('path');

try {
	var settings = JSON.parse(
		fs.readFileSync(path.join(__dirname, 'settings.json'))
	);
} catch (err) {
	console.log(err);
}

module.exports = settings;