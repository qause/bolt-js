/* 
  This script is responsible for: 
  - Triggered by GA workflow
  - Connecting with contentful API ✅
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

// set up client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});
console.log('TEST: HAS CLIENT', client);