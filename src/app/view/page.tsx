'use client';
import React, { useState, useEffect } from 'react';
import data from '../data.json';
import { ParagraphQuestion } from '../types';
import { BsAsterisk } from 'react-icons/bs';
import { AiOutlineCheck } from 'react-icons/ai';
import { FiArrowRight } from 'react-icons/fi';
import { useContext } from '../context';

import { useRouter } from 'next/navigation';

import useEdit from '../editHook';

// TODO: Add individiual collapsing/expanding

const statuses = ['normal', 'difficult', 'incorrect', 'unsure', 'mismatched', 'incomplete'];

const IconButton = (props: { children?: React.ReactNode; onClick?: () => void }) => {
	return (
		<div className='rounded-full flex justify-center items-center w-[34px] h-[34px] mr-2 group p-1 hover:bg-gray-300 transition-all' onClick={props.onClick}>
			{props.children}
		</div>
	);
};

const Button = (props: { children?: React.ReactNode; onClick?(): void }) => {
	return (
		<button className={`w-fit rounded p-2 py-1 text-1xl bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-200 transition-all`} onClick={props.onClick}>
			{props.children}
		</button>
	);
};

// const QuestionCard = (props: { question: ParagraphQuestion; onSubmit: (data: ParagraphQuestion) => void }) => {
const QuestionCard = (props: { paragraphIndex: number; questionIndex: number; question: ParagraphQuestion; collapsed: boolean }) => {
	const [state, setState] = useState({
		saved: true,
		initial: true,
		overlay: false,
		question: props.question.question, // This will be the default question, or the question after each save to detect change reversion
		correct: props.question.true,
		answers: props.question.answers,
		selected: true,
	});

	const { editChange } = useEdit();

	const [question, setQuestion] = useState(props.question.question);
	const [correct, setCorrect] = useState(props.question.true);
	const [answers, setAnswers] = useState(props.question.answers);

	const { context, setContext } = useContext();

	const onSubmit = () => {
		if (state.saved) return;

		// props.onSubmit({
		// 	question: question,
		// 	true: correct,
		// 	answers: answers,
		// 	status: props.question.status,
		// });

		setState({
			...state,
			saved: true,
			question: question,
			correct: correct,
			answers: answers,
		});

		let questions = [...context.questions];

		questions[props.questionIndex] = {
			...questions[props.questionIndex],
			question: question,
			true: correct,
			answers: answers,
		};

		setContext({
			...context,
			questions: questions,
		});

		editChange(props.paragraphIndex, props.questionIndex, {
			question: question,
			answers: answers,
			true: correct,
			status: props.question.status,
		});

		// fetch('http://localhost:4000/changes', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Accept': 'application/json, text/plain, */*',
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		questionIndex: props.questionIndex,
		// 		paragraphIndex: props.paragraphIndex,
		// 		changes: {
		// 			question: question,
		// 			answers: answers,
		// 			true: correct,
		// 			status: props.question.status,
		// 		},
		// 	}),
		// })
		// 	.then(console.log)
		// 	.catch(console.error);
	};

	useEffect(() => {
		if (state.initial) return setState({ ...state, initial: false });

		setState({
			...state,
			saved: question == state.question && correct == state.correct && answers == state.answers,
		});
	}, [question, correct, answers]);

	const getQuestion = () => {
		return context.questions[props.questionIndex];
	};

	return (
		<div className='bg-gray-400 relative w-full rounded p-2 flex flex-col text-black text-3xl' style={{ direction: 'rtl' }}>
			<div className={`w-full fixed top-0 left-0 h-full pointer-events-none ${state.overlay ? 'glass' : 'bg-transparent'}`}>&nbsp;</div>

			<div className='absolute top-0 left-0 p-2 pointer-events-none'>
				<BsAsterisk size={32} className={`${state.saved ? 'text-gray-400' : 'text-red-700'} transition-all`} />
			</div>
			<div className='absolute top-0 right-0 p-2 flex flex-row gap-x-2'>
				<div className='rounded w-fit text-[24px] h-full flex justify-center items-center bg-gray-800 text-gray-200 px-3'>
					<div className='max-w-[350px] truncate' style={{ direction: 'ltr' }}>
						Status: {props.question.status}
					</div>
				</div>
				<div
					className={`rounded w-fit text-[24px] h-full flex justify-center items-center ${
						getQuestion() && !getQuestion().selected ? 'bg-gray-800 text-gray-200' : 'bg-green-800 text-gray-200'
					} px-3 transition-all select-none`}
					onClick={() => {
						// setState({
						// 	...state,
						// 	selected: !state.selected,
						// });

						let questions = [...context.questions];

						questions[props.questionIndex].selected = !questions[props.questionIndex].selected;

						setContext({
							...context,
							questions: questions,
						});
					}}
				>
					<div>{getQuestion() && getQuestion().selected ? 'Unselect' : 'Select'}</div>
				</div>
			</div>

			{/* input field here */}
			{/* <div className='w-full text-center'>{props.question.question}</div> */}
			<input type='text' className='w-full text-center bg-transparent outline-none border-none' value={question} onChange={(event) => setQuestion(event.target.value)} />
			{props.collapsed ? '' : <div className='w-auto h-[3px] bg-gray-800 m-[-8px] my-[5px]'>&nbsp;</div>}
			{props.collapsed ? (
				''
			) : (
				<div className='w-full grid grid-cols-2 justify-center gap-3 p-2'>
					{answers.map((answer, index) => {
						return (
							<div className='bg-gray-500 w-full p-2 pr-0 rounded text-gray-200 flex flex-row items-center'>
								<div className='w-min h-full'>
									<IconButton onClick={() => setCorrect(answer)}>
										<AiOutlineCheck className='group-hover:text-black transition-all' />
									</IconButton>
								</div>
								<div className='w-[2px] bg-gray-900 mx-2' style={{ height: 'calc(100% + 16px)' }}>
									&nbsp;
								</div>
								<input
									type='text'
									className='w-full text-right bg-transparent outline-none border-none'
									value={answers[index]}
									onChange={(event) => {
										if (answer == correct) {
											setCorrect(event.target.value);
										}

										setAnswers(
											answers.map((_answer, _index) => {
												return _index == index ? event.target.value : _answer;
											})
										);
									}}
								/>
								<div>{answer == correct ? <AiOutlineCheck className='text-green-300' /> : ''}</div>
							</div>
						);
					})}
				</div>
			)}
			{/* <div className='w-full px-2 flex justify-center items-center'> */}
			{props.collapsed ? (
				''
			) : (
				<div className='w-full px-2 flex'>
					{/* <button className='w-[250px] rounded bg-gray-700 p-2 py-1 text-1xl text-gray-300 hover:bg-gray-600 hover:text-gray-200 transition-all'>Submit</button> */}
					<button
						className={`w-full rounded  p-2 py-1 text-1xl ${state.saved ? 'bg-gray-500 text-gray-600' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-200'} transition-all`}
						onClick={onSubmit}
					>
						Submit
					</button>
				</div>
			)}
		</div>
	);
};

export default function View() {
	let index: number;
	if (localStorage) {
		index = parseInt(localStorage.getItem('index') || '0');
	} else {
		index = 0;
	}
	const paragraph = data[index];

	const router = useRouter();

	const [state, setState] = useState({
		collapsed: false,
		// submitting: false,
		// submit: {
		// 	question: {},
		// 	answers: [],
		// 	true: {},
		// },
	});

	const [reset, setReset] = useState({
		attempts: 0,
	});

	interface StatusOverlayType {
		enabled: boolean;
		selected: string[];
	}

	const [statusOverlay, setStatusOverlay] = useState<StatusOverlayType>({
		enabled: false,
		selected: [],
	});

	const { context, setContext } = useContext();
	const { getChanges, editBulkChange, editReset } = useEdit();

	useEffect(() => {
		setContext({
			index: index,
			questions: paragraph.questions.map((question) => {
				return {
					...question,
					selected: false,
				};
			}),
		});
	}, []);

	// const onSubmitQuestion = (newQuestion: ParagraphQuestion, questionIndex: number) => {
	// 	let question = paragraph.questions[questionIndex];
	// 	setState({
	// 		...state,
	// 		submitting: true
	// 		submit: {
	// 			question: { previous}
	// 		}
	// 	});

	// 	console.log(question);
	// 	console.log(newQuestion);
	// };

	const getSelected = () => {
		return context.questions.filter((question) => question.selected);
	};

	const onStatusChange = () => {
		let statuses = statusOverlay.selected;
		if (statuses.length == 0) return;

		let selected: ParagraphQuestion[] = context.questions.map((question) => {
			if (question.selected) {
				question.status = statuses.join(' && ');
			}
			return question;
		});

		setContext({
			...context,
			questions: selected,
		});

		let selectedIndexed: { question: ParagraphQuestion; index: number }[] = selected
			.map((question: ParagraphQuestion, index: number) => {
				return { question: question, index: index };
				// if (question.selected) {
				// 	delete question.selected;
				// 	question.index = index;
				// 	return question;
				// }
				// return null;
			})
			.filter(({ question, index }) => {
				if (question.selected) {
					delete question.selected;
					question.index = index;
					return true;
				}
				return false;
			});

		console.log(selectedIndexed);

		setStatusOverlay({
			enabled: false,
			selected: [],
		});

		let changes: ParagraphQuestion[] = selectedIndexed.map((e) => e.question);
		editBulkChange(index, changes);
	};

	const onReset = async () => {
		if (reset.attempts + 1 >= 2) {
			// router.push('/');\
			setReset({
				...reset,
				attempts: 0,
			});

			let result = await editReset(index);
			let json = await result.json();
			setContext({
				...context,
				questions: json.questions,
			});

			// FIXME: Have to reload page like this
			setTimeout(function () {
				router.push('/');
				setTimeout(function () {
					router.push('/view');
				}, 100);
			}, 100);
			return;
		}

		setReset({
			...reset,
			attempts: reset.attempts + 1,
		});
	};

	return (
		<div className='w-full h-full fixed top-0 left-0 bg-gray-800 overflow-y-scroll overflow-x-hidden'>
			<div className='text-5xl p-3 w-full text-center py-6 text-gray-200'>{data[index].title}</div>
			<div className=' text-black rounded  fixed top-0 left-0 m-5 transition-all gap-x-2 flex flex-row'>
				<button className='bg-gray-300 text-black rounded p-1 text-1xl  hover:bg-gray-500 transition-all' onClick={onReset}>
					{reset.attempts == 0 ? 'Reset' : 'Are you sure?'}
				</button>
			</div>
			<div className=' text-black rounded text-3xl fixed top-0 right-0 mr-[40px] mt-[23px] transition-all gap-x-2 flex flex-row'>
				<button
					className='bg-gray-300 text-black rounded p-2 text-3xl  hover:bg-gray-500 transition-all'
					onClick={() => {
						setState({
							...state,
							collapsed: !state.collapsed,
						});
					}}
				>
					{state.collapsed ? 'Expand all' : 'Collapse all'}
				</button>
				<button
					className='bg-gray-300 text-black rounded p-2 text-3xl  hover:bg-gray-500 transition-all'
					onClick={() => {
						setStatusOverlay({
							...statusOverlay,
							enabled: true,
						});
					}}
				>
					{`Change ${getSelected().length} status(es)`}
				</button>
			</div>
			<div className='h-[3px] bg-gray-200 w-full mb-3'>&nbsp;</div>

			{statusOverlay.enabled ? (
				<div className='w-screen h-screen fixed top-0 left-0 white-glass z-10 flex justify-center items-center'>
					<div className='bg-gray-500 w-[400px] h-min rounded p-2 pt-0 flex flex-col justify-start'>
						<div>
							<div className='w-full text-center text-white text-3xl my-4'>Changing {getSelected().length} question(s)</div>
							<div className='w-auto h-[2px] bg-white m-[-8px] mt-[0px] mb-[12px]'>&nbsp;</div>
						</div>

						<div className='flex flex-wrap justify-center items-center w-full gap-2'>
							{statuses.map((status: string) => {
								return (
									<div
										className={`${
											statusOverlay.selected.includes(status) ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-400 '
										} text-white rounded p-2 transition-all select-none`}
										onClick={() => {
											let selected = [...statusOverlay.selected];

											if (selected.includes(status)) {
												let index = selected.findIndex((item) => item == status);
												selected.splice(index, 1);
											} else {
												selected.push(status);
											}

											setStatusOverlay({
												...statusOverlay,
												selected: selected,
											});
										}}
									>
										{status}
									</div>
								);
							})}
						</div>

						<div className='w-auto h-[2px] bg-white m-[-8px] mb-[12px] mt-2'>&nbsp;</div>

						<div className='w-full flex justify-center items-center'>
							<Button
								onClick={() => {
									onStatusChange();
								}}
							>
								Submit
							</Button>
						</div>
					</div>
				</div>
			) : (
				''
			)}

			{/* <div className={`w-full flex flex-col gap-y-3 p-3 ${state.submitting ? 'pointer-events-none' : ''}`}> */}
			<div className={`w-full flex flex-col gap-y-3 p-3`}>
				{context.questions.map((question: ParagraphQuestion, questionIndex) => {
					// return <QuestionCard question={question} onSubmit={(changed) => onSubmitQuestion(changed, questionIndex)} />;
					return <QuestionCard paragraphIndex={index} questionIndex={questionIndex} question={question} collapsed={state.collapsed} />;
				})}
			</div>
		</div>
	);
}
