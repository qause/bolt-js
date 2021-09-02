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

// init client
const spaceId = 'lfws4sw3zx32';
const envId = 'master';
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_API_KEY
});

publishToCms();

/* 
  returns a formatted reference id:
  in format of <org>_<repo>__docs_<filename>
  i.e. slackapi_bolt-js__docs_mydoc.md
*/ 
function formatRefId(path) {
  let refId = `${process.env.REPOSITORY}__${path}`
  return refId.replaceAll('/', '_') // CMS accepts _, - or . in ids
}

async function publishToCms() {
  const allChangedFiles = await readData(getPaths());
  const fPaths = Object.keys(allChangedFiles);
  for (const path of fPaths) {
    const fContent = allChangedFiles[path];
    const refId = formatRefId(path);
    // attempt to fetch the existing entry

    // creates entry if changed file has content
    if (fContent !== null) {
      const { frontMatter } = parse(fContent);
      client.getSpace(spaceId)
        .then((space) => space.getEnvironment(envId))
        .then((environment) => environment.createEntryWithId('page', refId, {
          fields: {
            title: {
              'en-US': frontMatter['title']
            },
            author: {
              'en-US': [process.env.AUTHOR]
            },
            source: {
              // TODO: logic to handle ja-JP locale
              'en-US': `https://github.com/${process.env.REPOSITORY}/blob/main/${path}`,
            },
            markdown: {
              'en-US': fContent
            },
          }
        }))
        .then((entry) => console.log(entry))
        .catch((error) => console.log(error))
    } else {
      // content associated with a deleted or renamed file
      // TODO: should delete or archive?
      client.getSpace(spaceId)
        .then(space => space.getEnvironment(envId))
        .then(environment => environment.deleteEntry(refId))
        .catch(error => {
          console.log('DELETE ERROR: ', error)
        })
    }
  }
}

// returns an object of type Page
function formatPage() {
  // TODO: Implement
  return;
}

// returns changed filepaths including docs/* only
function getPaths() {
  return process.env.FILES_CHANGED
  .split(' ') 
  .filter(str => /^docs\/.*/.test(str)); 
}

// accepts an array of paths and returns an object where
// key is filepath and value is the associated file data
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

// utility object with lexed types data
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


/* 

TODO
- can create a new Page ✅
- can delete an existing Page ✅
- can update an existing Page 
- when doc is renamed (i.e new ref ID)
  - can create new Page
  - can delete existing Page
- can update Authors field correctly
- can create, delete, update i.e. handle a JP language Page

*/