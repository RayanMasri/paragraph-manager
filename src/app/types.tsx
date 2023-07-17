export interface ParagraphQuestion {
	question: string;
	answers: string[];
	true: string;
	status: string;
	selected?: boolean;
	index?: number;
}

export interface ParagraphType {
	title: string;
	url: string;
	index: number;
	paragraph: string;
	questions: ParagraphQuestion[];
}
