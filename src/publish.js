/* 
  This script is responsible for: 
  - Triggered by GA workflow
  - Connecting with contentful API
  - Accomplishes a simple update action 
  - Runs a secondary parse script
 */
// import 'dotenv/config';
import contentful from 'contentful-management';
import * as core from '@actions/core';
import fs from 'fs';

// has variables
// console.log(process.env.SHA);
// console.log(process.env.ACTOR);
// console.log(process.env.REPOSITORY);
// console.log(process.env.EVENT);
// console.log(process.env.FILES_CHANGED);

// get files changed / updated
// console.log('here are the: ', process.env.FILES_CHANGED);
// console.log('size of the: ', process.env.FILES_CHANGED.length);
// console.log(typeof process.env.FILES_CHANGED);
// for (let ele of process.env.FILES_CHANGED) {
//   console.log(ele);
// }
let paths = process.env.FILES_CHANGED
  .split(' ') 
  .filter(str => /^docs\/.*/.test(str)); // /docs/* only
console.log('Filtered files: \n', paths);
readData(paths);

async function readData(fPaths) {
  let fileData = {};
  for (const path of fPaths) {
    try {
      let data = await fs.promises.readFile(path);
      fileData[path] = data;
    } catch (err) {
      fileData[path] = null;
    }
  }
  console.log(fileData);
  return fileData;
}

// pull changed docs and read them into memory

// create the Page object
// publish to contentful with the client

// set up client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});
console.log('TEST: HAS CLIENT', client);