import { ParagraphQuestion } from './types';

// interface ParagraphQuestionIndexed extends ParagraphQuestion {
// 	index: number;
// }

export default function useEdit() {
	function postFetch(json: any, route: string) {
		return fetch(`http://localhost:4000/${route}`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(json),
		});
	}

	function getFetch(route: string) {
		fetch(`http://localhost:4000/${route}`, {
			method: 'GET',
		})
			.then(console.log)
			.catch(console.error);
	}

	function editChange(paragraphIndex: number, questionIndex: number, question: ParagraphQuestion) {
		return postFetch(
			{
				questionIndex: questionIndex,
				paragraphIndex: paragraphIndex,
				changes: {
					question: question.question,
					answers: question.answers,
					true: question.true,
					status: question.status,
				},
			},
			'changes'
		);
	}

	function editBulkChange(paragraphIndex: number, questions: ParagraphQuestion[]) {
		return postFetch(
			{
				paragraphIndex: paragraphIndex,
				changes: questions,
			},
			'bulk-changes'
		);
	}

	function editReset(paragraphIndex: number) {
		return postFetch(
			{
				paragraphIndex: paragraphIndex,
			},
			'reset'
		);
	}
	return { editChange, editBulkChange, editReset };
}
