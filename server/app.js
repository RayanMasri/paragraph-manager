// import Audic from 'audic';
// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import fs from 'fs';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const exec = require('child_process').exec;

const play = (file) => {
	let command = `ffplay -v 0 -nodisp -autoexit ${file}`;
	exec(command);
};
const app = express();

const filePath = '../src/app/data.json';
const originalPath = '../stable-data.json';

const playSuccess = async () => {
	play('success.mp3');
};
const playError = async () => {
	play('error.mp3');
};

const getFile = (path) => {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const setFile = (data, path) => {
	console.log(path);
	return fs.writeFileSync(path, JSON.stringify(data), 'utf8');
};

const compareChanges = () => {
	let current = getFile(filePath);
	let stable = getFile(originalPath);

	let changes = current.map((paragraph, index) => {
		// Get original paragraph
		let original = stable[index];

		// Compare statuses
		let currentStatuses = paragraph.questions.map((question) => question.status);
		let stableStatuses = original.questions.map((question) => question.status);

		let statusDifference = currentStatuses.filter((x) => !stableStatuses.includes(x));
		statusDifference = statusDifference.length;

		// Compare questions
		let questionTitleDifference = 0;
		let answerDifference = 0;
		let truesDifference = 0;

		paragraph.questions.map((question, _index) => {
			let originalQuestion = original.questions[_index];

			if (originalQuestion.question != question.question) {
				questionTitleDifference += 1;
			}

			if (originalQuestion.true != question.true) {
				truesDifference += 1;
			}

			let answersDiff = originalQuestion.answers.filter((x) => !question.answers.includes(x)).length;
			answerDifference += answersDiff;
		});

		return [index, statusDifference, questionTitleDifference, answerDifference, truesDifference];
	});

	return changes;

	// Count question title changes

	// Count question answers changes

	// Count correct answer changes
};

app.use(bodyParser.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

app.get('/query-changes', (req, res) => {
	console.log(`Started /query-changes`);
	let changes = compareChanges();
	res.json(changes);
	console.log(`Finished /query-changes`);
});

app.post('/changes', (req, res) => {
	console.log(`Started /changes`);

	let { questionIndex, paragraphIndex, changes } = req.body;
	let data = getFile(filePath);

	data[paragraphIndex].questions[questionIndex] = {
		question: changes.question,
		answers: changes.answers,
		true: changes.true,
		status: changes.status,
	};

	setFile(data);

	playSuccess();
	console.log(`Finished /changes`);
});
app.post('/bulk-changes', (req, res) => {
	console.log(`Started /bulk-changes`);

	let { paragraphIndex, changes } = req.body;
	console.log(`Received ${changes.length} bulk change(s) from client`);
	let data = getFile(filePath);

	changes.map((question) => {
		let index = question.index;
		delete question.index;

		data[paragraphIndex].questions[index] = question;
	});

	console.log(changes);
	console.log(`Applied ${changes.length} bulk change(s)`);

	setFile(data, filePath);

	playSuccess();
	console.log(`Finished /bulk-changes`);
});
app.post('/reset', (req, res) => {
	console.log(`Started /reset`);
	let { paragraphIndex } = req.body;
	let data = getFile(filePath);
	let original = getFile(originalPath);

	data[paragraphIndex] = original[paragraphIndex];
	playError();

	setFile(data, filePath);
	res.json(data[paragraphIndex]);
	console.log(`Finished /reset`);
});

app.listen(4000, () => {
	console.log(`Listening on localhost:4000`);
});
