const fs = require('fs');
const {secrets} = require('../config/keys');
const axios = require('axios');

const imgUrl = 'test/Capture.PNG';

function base64_encode(file) {
	// read binary data
	const image = fs.readFileSync(file);
	
	// convert binary data to base64 encoded string
	// return new Buffer.from(image).toString('base64');
	return new Buffer.from(image);
}

async function callAzureFormRecognizerAsync(image){
	console.log(`callAzureFormRecognizerAsync`);

	/*
	const url0 = `${secrets.AZURE.ENDPOINT}formrecognizer/v2.0/custom/models`
	console.log(`callAzureFormRecognizerAsync - endpoint: ${url0}`);
  // Request Operation 
  const response0 = await axios.get(url0, {
    headers: {
      // 'Accept': 'application/json',
      // 'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': 'd5417c54327e4af1a6f0e4775ee77585',
    },
    // data: image,
  });
	console.log(response0.data);
	*/

	const url = `${secrets.AZURE.ENDPOINT}formrecognizer/v2.0/layout/analyze`
	console.log(`callAzureFormRecognizerAsync - endpoint: ${url}`);

  // Request Operation 
  const response = await axios({
		url:url,
		method:'POST',
    headers: {
      // 'Accept': 'application/json',
      'Content-Type': 'image/png',
      'Ocp-Apim-Subscription-Key': secrets.AZURE.KEY,
    },
    data: image,
	});
	// operation submitted
	if (result.status === 202){
		const getResultUrl = response.headers['operation-location'];
		console.log(`callAzureFormRecognizerAsync - endpoint: ${getResultUrl}`);
		let result;
		const waitTime = 5;
		for (let step = 0; step < 10; step++){
			result = await axios({
				url:getResultUrl,
				method:'GET',
				headers: {
					'Ocp-Apim-Subscription-Key': secrets.AZURE.KEY,
				}
			});
			if (result.status !== 200){
				return Promise.reject(new Error('Get Layout Failed'));
			}
			if (result.status !== 200){
				return Promise.reject(new Error('Get Layout Failed'));
			}
			break
		}
		
		console.log(result.data)
	}

	return response;
}

/*
curl -v -X POST "https://westus2.api.cognitive.microsoft.com/formrecognizer/v2.0/custom/models/{modelId}/analyze?includeTextDetails={boolean}"
-H "Content-Type: application/json"
-H "Ocp-Apim-Subscription-Key: {subscription key}"
--data-ascii "{body}" 
*/

const img = base64_encode(imgUrl);
// console.log(img);
(async()=>{
	const result = await callAzureFormRecognizerAsync(img);
	console.log(result);

})();
