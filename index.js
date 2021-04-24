const axios = require('axios');
const { JSDOM } = require('jsdom');

var args = process.argv.slice(2);

const testURL = args[0] ?  args[0] : 'https://www.apple.com';
const searchParam = args[1] ?  args[1] : 'watch';
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
 
const fetchChildUrl = (url) => new Promise ((resolve) => {
    fetchData(url).then((HTMLOutput) => {
      resolve({url, HTMLOutput: HTMLOutput ? HTMLOutput : '' })
    });
 
});

async function foo(element) {
  const url = element.href;
  const completeurl = testURL+element.href;
  let HTMLOutput = '';
  if(url.indexOf('/') === 0 && crawledPages.indexOf(completeurl) === -1){
    crawledPages.push(completeurl);
    crawledCounter++;
    await fetchChildUrl(completeurl).then((result) => {
      HTMLOutput = result
    });
    return {HTMLOutput, url: completeurl};
  }
}

async function fetchMainURL(url,deep){
  await fetchData(url).then((HTMLOutput) => {
    if(HTMLOutput){
      const parsedLists = parseData(HTMLOutput);
      getAllMatchesFromList(parsedLists.textList, url);
      getAllMatchesFromList(parsedLists.headingsList, url);

      if(deep === 0){
        Promise.all(parsedLists.anchorsList.map(foo))
        .then(output => {
          output.forEach((data) => {
            if(data){
              const parsedLists = parseData(HTMLOutput);
              getAllMatchesFromList(parsedLists.textList, data.url);
              getAllMatchesFromList(parsedLists.headingsList, data.url);
            }
          })
          printResults();
        });
      }
    }
  });
}

const main = (async () => {
  await fetchMainURL(testURL, 0);
})();


