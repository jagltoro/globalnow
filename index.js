const axios = require('axios');
const { JSDOM } = require('jsdom');

const testURL = 'https://www.apple.com';
const searchParam = 'menu';
const regexp = new RegExp(searchParam, "ig");

let crawledCounter = 0;
let crawledWithContent = 0;
let totalFindings = [];
let crawledPages = [];

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
  return {anchorsList, textList, headingsList};
}

function getAllMatchesFromList(list, url){
  const findings = list.filter(findText);
  let texts = [];
  if(findings.length > 0){
    crawledWithContent++;
    texts = findings.map((element) => {
      const matches = [...element.textContent.matchAll(regexp)];
      return matches[0].input.substr(matches[0].index - 5, matches[0].index + matches[0].length + 5);
    });
    if(totalFindings[url]){
      totalFindings[url] = [...totalFindings[url], ...texts];
    }else{
      totalFindings[url] = [...texts];
    }
  }
}

function printResults() {
  console.log(`Crawled ${crawledCounter} pages. Found ${crawledWithContent} pages with the term ‘${searchParam}’:`);
  console.log(totalFindings);
}

async function fetchNewURL(url,deep){
  if(crawledPages.indexOf(url) === -1){
    crawledPages.push(url);
    crawledCounter++;
    await fetchData(url).then((HTMLOutput) => {
      if(HTMLOutput){
        const parsedLists = parseData(HTMLOutput);
        getAllMatchesFromList(parsedLists.textList, url);
        getAllMatchesFromList(parsedLists.headingsList, url);
        if(deep === 0){
          parsedLists.anchorsList.forEach((element) => {
            if(element.href.indexOf('/') === 0){
              fetchNewURL(testURL+element.href, 1);
            }
          })
        }
      }
    });
  }
}

const main = (async () => {
  await fetchNewURL(testURL, 0);
  printResults();
})();


