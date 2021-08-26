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
console.log(process.env.SHA);
console.log(process.env.ACTOR);
console.log(process.env.REPOSITORY);
console.log(process.env.EVENT);
console.log(process.env.FILES_CHANGED);

// get files changed
const regx = new RegExp('^docs\/.*')
const files = process.env.FILES_CHANGED.split(' ').filter(ele => regx.test(ele))
console.log('Changed files: \n', files);

// set up client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});
console.log('TEST: HAS CLIENT', client);