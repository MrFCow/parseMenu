const jmespath = require('jmespath');
const {secrets} = require('../config/keys');

const API_KEY = secrets.API_KEY;
// console.log(secrets);
// console.log(`API_KEY: ${API_KEY}`)
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

function zip(arr1, arr2){
  return arr1.map((k, i) => [k, arr2[i]])
};

async function callGoogleVisionAsync(image) {
  // console.log(`callGoogleVisionAsync - type of image: ${typeof image}`);
  // console.log(`callGoogleVisionAsync - image: ${image}`);
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            // maxResults: 50,
          }
        ]
      },
    ],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  // console.log(`callGoogleVisionAsync - response: ${response}`);
  const parsed = await response.json();

  // console.log(`callGoogleVisionAsync - parsed: ${parsed}`);

  //console.log(parsed.responses[0].fullTextAnnotation);
  return parsed;
}

function parseGoogleResultBlockBoundingBox(result){
  const blocksVerticesJmesPath = "responses[*].fullTextAnnotation.pages[*].blocks[*].paragraphs[*].boundingBox.vertices | [] | [] | [] ";
  const tmpResult = jmespath.search(result, blocksVerticesJmesPath);

  return tmpResult;
}

function parseGoogleResultBlockText(result){
  const blocksJmesPath = "responses[*].fullTextAnnotation.pages[*].blocks[*].paragraphs[*] | [] | [] | [] | [*].words[*].symbols[*].text";
  let tmpResult = jmespath.search(result, blocksJmesPath);
  tmpResult = tmpResult.map(i => {
    return i.map(j =>j.join("")).join(" ");
  })

  console.log(`Text Length: ${tmpResult.length}`);
  return tmpResult;
}

async function callAzureFormRecognizerAsync(image){

  // Request Operation 
  const response = await fetch(secrets.AZURE.ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': secrets.AZURE.KEY,
    },
    body: image,
  });

  console.log(response);
}

// module.exports = {
export {
  zip, 

  callGoogleVisionAsync, 
  parseGoogleResultBlockBoundingBox, 
  parseGoogleResultBlockText,

  callAzureFormRecognizerAsync
}