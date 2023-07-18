'use client';
import React, { useEffect, useState } from 'react';
import data from './data.json';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { useContext } from './context';
import useEditHook from './editHook';

import { ParagraphType } from './types';

const ParagraphCard = (props: { paragraph: ParagraphType; onEnter: () => void; changes: any }) => {
	let changeTitles = ['Status', 'QTitle', 'QAnswers', 'QTrue'];

	return (
		<div className='w-[280px] h-min bg-gray-600 text-gray-300 text-4xl flex justify-between flex-col items-center rounded box-border pb-2'>
			<div className=' w-full flex flex-row justify-between p-3 py-1 pt-3 rounded items-center '>
				<div className='rounded-full flex justify-center items-center w-[34px] h-[34px] mr-2 group p-1 hover:bg-gray-300 transition-all' onClick={props.onEnter}>
					<AiOutlineArrowLeft size={48} className='group-hover:text-black transition-all' />
				</div>
				<div
					className='w-fit text-right truncate text-2xl'
					style={{
						direction: 'rtl',
					}}
				>
					{props.paragraph.title}
				</div>
			</div>

			<div className='text-[12px] flex flex-row gap-x-1 mt-1'>
				{(props.changes || []).slice(1).map((change: any, index: number) => {
					return (
						<div className={`flex flex-row bg-gray-800 rounded px-[5px] h-[30px] justify-center items-center gap-x-1 ${change == 0 ? 'opacity-30' : ''}`}>
							{`${changeTitles[index]}:`}
							<div className={change > 0 ? 'text-green-300' : 'text-red-900'}>{change}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default function Home() {
	const router = useRouter();

	const { context, setContext } = useContext();
	const { getChanges } = useEditHook();

	const onEnter = (index: number) => {
		localStorage.setItem('index', index.toString());
		router.push('/view');
	};

	const [state, setState] = useState({
		changes: [],
	});

	const handleChanges = async () => {
		let result = await getChanges();
		let json = await result.json();

		setState({
			...state,
			changes: json,
		});
	};

	useEffect(() => {
		handleChanges();

		setContext({
			index: 0,
			questions: [],
		});
	}, []);

	return (
		<div className='w-full h-full fixed top-0 left-0 bg-gray-900 overflow-y-scroll overflow-x-hidden'>
			<div className='w-full text-5xl text-center py-3 bg-gray-800'>Pick from index</div>
			<div className='w-full p-4 flex flex-wrap flex-row-reverse gap-5 gap-x-9 mt-5'>
				{data.map((paragraph: ParagraphType, index: number) => {
					return (
						<ParagraphCard
							paragraph={paragraph}
							onEnter={() => {
								onEnter(paragraph.index);
							}}
							changes={state.changes[index]}
						/>
					);
				})}
			</div>
		</div>
	);
}
