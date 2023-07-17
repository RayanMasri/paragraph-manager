const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
var fs = require('fs');

const filePath = '../src/app/data.json';
const originalPath = '../stable-data.json';

const getFile = (path) => {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const setFile = (data, path) => {
	console.log(path);
	return fs.writeFileSync(path, JSON.stringify(data), 'utf8');
};

app.use(bodyParser.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

app.post('/changes', (req, res) => {
	let { questionIndex, paragraphIndex, changes } = req.body;
	let data = getFile(filePath);

	data[paragraphIndex].questions[questionIndex] = {
		question: changes.question,
		answers: changes.answers,
		true: changes.true,
		status: changes.status,
	};

	setFile(data);
});
app.post('/bulk-changes', (req, res) => {
	let { paragraphIndex, changes } = req.body;
	let data = getFile(filePath);

	changes.map((question) => {
		let index = question.index;
		delete question.index;

		data[paragraphIndex].questions[index] = question;
	});

	console.log(`Applied ${changes.length} bulk change(s)`);

	setFile(data, filePath);
});
app.post('/reset', (req, res) => {
	let { paragraphIndex } = req.body;
	let data = getFile(filePath);
	let original = getFile(originalPath);

	data[paragraphIndex] = original[paragraphIndex];

	setFile(data, filePath);
	res.json(data[paragraphIndex]);
});

app.listen(4000);
