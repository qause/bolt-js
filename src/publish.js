/* 
  This script is responsible for: 
  - Triggered by GA workflow
  - Connecting with contentful API
  - Accomplishes a simple update action 
  - Runs a secondary parse script
 */
// import 'dotenv/config';
import contentful from 'contentful-management';

// has variables
// console.log(process.env.SHA);
// console.log(process.env.ACTOR);
// console.log(process.env.REPOSITORY);
// console.log(process.env.EVENT);
// console.log(process.env.FILES_CHANGED);

// get files changed / updated
console.log('here are the: ', process.env.FILES_CHANGED);
console.log('size of the: ', process.env.FILES_CHANGED.length);
process.env.FILES_CHANGED.forEach(element => {
  console.log(element);
});
// let files = process.env.FILES_CHANGED
//   .split(' ') 
//   .filter(str => /^docs\/.*/.test(str)); // filter for docs changes
// console.log('Filtered files: \n', files);

// filter files that are docs changes
// pull changed docs and read them into memory
// create the Page object
// publish to contentful with the client

// set up client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});
console.log('TEST: HAS CLIENT', client);