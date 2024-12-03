import * as path from 'path';
import * as fs from 'fs';

interface ImageData {
	id: string;
	author: string;
	url: string;
	download_url: string;
	[key: string]: any;
}

const jsonPath = path.join(path.resolve(__dirname, 'pics.json'));

let jsonData: ImageData | any = {};
let newImageList: { src: string; alt: string }[] = [];

fs.readFile(jsonPath, { encoding: 'utf-8' }, (err, data) => {
	if (err) {
		console.error(err);
		throw err;
	}
	try {
		const jsonData: any = JSON.parse(data);
		const arrayInQuestion: ImageData[] = jsonData[1];

		const urls = arrayInQuestion.map((item, index) => ({
			src: item.download_url,
			alt: `sample alt text_${index}`
		}));

		newImageList.push(...urls);

		console.log('Image urls: ', newImageList);
	} catch (error) {
		console.error('Error: ', error);
	}
});
