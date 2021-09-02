/* 
  This script is responsible for: 
  - Triggered by GA workflow
  - Connecting with contentful API
  - Accomplishes a simple update action 
  - Runs a secondary parse script
 */
import contentful from 'contentful-management';
import fs from 'fs';
import marked from 'marked';

// set up plain scoped client 
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
},
{
  type: 'plain',
  defaults: {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENV_ID,
  },
});

let paths = process.env.FILES_CHANGED
  .split(' ') 
  .filter(str => /^docs\/.*/.test(str)); // docs/* changed files only

publishToCms();

async function publishToCms() {
  // read data from changed files 
  let files = await readData(paths);
  let fPaths = Object.keys(files);
  for (const path of fPaths) {
    let fContent = files[path];
    let refId = `${process.env.REPOSITORY}/${path}`;
    // attempt to fetch an existing entry

    // if change is content associated with the changed file
    if (fContent !== null) {
      console.log('content not null!')
      let { frontMatter } = parse(fContent);
        // create entry
        try {
          let res = await client.entry.createWithId('page', refId, { 
            fields: {
              source: `https://github.com/${process.env.REPOSITORY}/blob/main/${path}`,
              locale: frontMatter['lang'],
              markdown: fContent,
            }
          })
          console.log('SUCCESS RES:', res);
        } catch (error) {
          console.log('ERR', error);
        }
    } else {
      // is content associated with a deleted or renamed file
      // then deletes or archives it
    }
  }
}

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
  // console.log(fileData);
  return fileData;
}

// returns obj with front matter + page content separate
const parse = (data) => {
  const lexed = marked.lexer(data);
  const frontMatter = {};
  if (hasFrontMatter(lexed)) {
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


// publish to contentful with the client