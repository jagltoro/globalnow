const axios = require('axios');
const { JSDOM } = require('jsdom');

const url = 'https://www.apple.com';
const searchParam = 'government';

const regexp = new RegExp(searchParam, "g");

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
  
  
  console.log(nodeList)
}



fetchData(url).then((HTMLOutput) => {
  if(HTMLOutput){
    parseData(HTMLOutput);
  }
});
