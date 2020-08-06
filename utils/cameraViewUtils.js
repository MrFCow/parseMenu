const jmespath = require('jmespath');
const secrets = require('../keys');

const API_KEY = secrets.API_KEY;
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

function zip(arr1, arr2){
  return arr1.map((k, i) => [k, arr2[i]])
};

async function callGoogleVisionAsync(image) {
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
  const parsed = await response.json();

  //console.log('Result:', parsed);

  //console.log(parsed.responses[0].fullTextAnnotation);
  return parsed;
}

function parseGoogleResultBlockBoundingBox(result){
  const blocksVerticesJmesPath = "responses[*].fullTextAnnotation.pages[*].blocks[*].paragraphs[*].boundingBox.vertices | [] | [] | [] ";
  const tmpResult = jmespath.search(result, blocksVerticesJmesPath);
  //console.log(tmpResult);
  return tmpResult;
}

function parseGoogleResultBlockText(result){
  const blocksJmesPath = "responses[*].fullTextAnnotation.pages[*].blocks[*].paragraphs[*] | [] | [] | [] | [*].words[*].symbols[*].text";
  let tmpResult = jmespath.search(result, blocksJmesPath);
  tmpResult = tmpResult.map(i => {
    return i.map(j =>j.join("")).join(" ");
  })
  //console.log(tmpResult);
  console.log(`Text Length: ${tmpResult.length}`);
  return tmpResult;
}

export {zip, callGoogleVisionAsync, parseGoogleResultBlockBoundingBox, parseGoogleResultBlockText}