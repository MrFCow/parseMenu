const fs = require('fs');
const {FormRecognizerClient, AzureKeyCredential} = require('@azure/ai-form-recognizer');

const {secrets} = require('../config/keys');

async function recognize(filepath){
	const readStream = fs.createReadStream(filepath);
	
	const credential = new AzureKeyCredential(secrets.AZURE.KEY);
	const client = new FormRecognizerClient(secrets.AZURE.ENDPOINT, credential);

	const poller = await client.beginRecognizeContent(readStream, undefined , {
		onProgress: (state) => { console.log(`status: ${state.status}`); }
	});
	
  await poller.pollUntilDone();
	const response = poller.getResult();
	
	if (!response) {
    throw new Error("Expecting valid response!");
  }

  console.log(response);
  for (const page of response) {
    console.log(
      `Page ${page.pageNumber}: width ${page.width} and height ${page.height} with unit ${page.unit}`
		);
		for (const [id, line] of page.lines.entries()) {
			console.log(`line [${id}] has text: ${line.text}`);
		}
    for (const table of page.tables) {
      for (const row of table.rows) {
        for (const cell of row.cells) {
          console.log(`cell [${cell.rowIndex},${cell.columnIndex}] has text: ${cell.text}`);
        }
      }
    }
  }
}

const imgUrl = 'test/Capture.PNG';
recognize(imgUrl);