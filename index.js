const axios = require('axios');
const { JSDOM } = require('jsdom');

const testURL = 'https://www.apple.com';
const searchParam = 'menu';

const regexp = new RegExp(searchParam, "ig");

function findText(element) {
  const str = element.textContent.replace(/ {2,}|[\t\n\r]/gm,'');
  return regexp.test(str);
}

async function fetchData(url){
  console.log(`Getting data from the URL ${url}`);
  let response = await axios(url).catch((err) => console.log(err));
  if(response.status !== 200){
      console.err("Cannot get the data from the specified URL");
      return;
  }
  return response.data;
}

function parseData(data){
  const dom = new JSDOM(data);
  const anchorsList = [...dom.window.document.querySelectorAll('a')];
  const textList = [...dom.window.document.querySelectorAll('span'), ...dom.window.document.querySelectorAll('p')];
  const headingsList = [...dom.window.document.querySelectorAll('h1'), 
    ...dom.window.document.querySelectorAll('h2'), 
    ...dom.window.document.querySelectorAll('h3'), 
    ...dom.window.document.querySelectorAll('h4'), 
    ...dom.window.document.querySelectorAll('h5')
  ];
  
  anchorsList.forEach((element) => {
    console.log(element.href);
  })
  //const findings = textList.filter(findText);
}


function fetchNewURL(url){
  fetchData(url).then((HTMLOutput) => {
    if(HTMLOutput){
      parseData(HTMLOutput);
    }
  });
}

fetchNewURL(testURL);