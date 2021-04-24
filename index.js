const axios = require('axios');

const url = 'https://www.apple.com';
const searchParam = 'reimagined';

async function fetchData(url){
  console.log(`Getting data from the URL ${url}`);
  let response = await axios(url).catch((err) => console.log(err));
  if(response.status !== 200){
      console.err("Cannot get the data from the specified URL");
  }

  console.log(response);
}



fetchData(url);