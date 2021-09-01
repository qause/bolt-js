/* 
  This script is responsible for: 
  - Triggered by GA workflow
  - Connecting with contentful API
  - Accomplishes a simple update action 
  - Runs a secondary parse script
 */
// import 'dotenv/config';
import contentful from 'contentful-management';
import fs from 'fs';
import marked from 'marked';

// has variables
// console.log(process.env.SHA);
// console.log(process.env.ACTOR);
// console.log(process.env.REPOSITORY);

let paths = process.env.FILES_CHANGED
  .split(' ') 
  .filter(str => /^docs\/.*/.test(str)); // docs/* changed files only

let files = readData(paths);
Object.keys(files).forEach(fPath => {
  console.log('current file: ', fPath);
  let fContent = files[fPath];
  let { frontMatter } = parse(fContent);
  console.log('here is the frontMatter: ', frontMatter);

  // referenceId
  // locale
  // source
  // markdown
  // author
})   

// pull changed docs
async function readData(fPaths) {
  let fileData = {};
  for (const path of fPaths) {
    try {
      let data = await fs.promises.readFile(path, 'utf8');
      fileData[path] = data;
    } catch (err) {
      fileData[path] = null;
    }
  }
  return fileData;
}

// returns obj with front matter + page content separate
const parse = (data) => {
  const lexed = marked.lexer(data);
  const frontMatter = {};
  if (hasFrontMatter(lexed)) {
    console.log('it has front matter!');
    let split = lexed[1]['raw'].split('\n');
    for (const entry of split) {
      let [key, value] = entry.split(':');
      frontMatter[key] = value.trim();
    }
  }
  const content = lexed.filter((val, i) => i !== 0 && i !== 1 && i !== 2); 
  return {
    frontMatter,
    content
  }
}

const TYPES = Object.freeze({
  hr: "hr",
  space: "space",
  code: "code",
  paragraph: "paragraph"
});

// returns true if the document has horizontal rule delineated front matter
const hasFrontMatter = (lexed) => {
  return ((lexed)[0] && lexed[2] && lexed[0]["type"] === TYPES.hr && lexed[2]["type"] === TYPES.hr);
}

// set up client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});
// console.log('TEST: HAS CLIENT', client);


// publish to contentful with the client