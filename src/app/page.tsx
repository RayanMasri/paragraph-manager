'use client';
import data from './data.json';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useRouter } from 'next/navigation';

import { ParagraphType } from './types';

const ParagraphCard = (props: { paragraph: ParagraphType; onEnter: () => void }) => {
	return (
		<div className='w-[250px] h-min bg-gray-600 text-gray-300 text-4xl flex justify-between flex-row items-center rounded p-3'>
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
	);
};

export default function Home() {
	const router = useRouter();

	const onEnter = (index: number) => {
		localStorage.setItem('index', index.toString());
		router.push('/view');
	};

	return (
		<div className='w-full h-full fixed top-0 left-0 bg-gray-900 overflow-y-scroll overflow-x-hidden'>
			<div className='w-full text-5xl text-center py-3 bg-gray-800'>Pick from index</div>
			<div className='w-full p-4 flex flex-wrap flex-row-reverse gap-5 mt-5'>
				{data.map((paragraph: ParagraphType) => {
					return (
						<ParagraphCard
							paragraph={paragraph}
							onEnter={() => {
								onEnter(paragraph.index);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}
