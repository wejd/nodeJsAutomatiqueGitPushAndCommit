const chokidar = require('chokidar');
const git = require('simple-git/promise')
const internetAvailable = require("internet-available");
require('dotenv').config()

const USER = process.env.USER
const PASS = process.env.PASS
const REPO = process.env.REPO
const remote = `https://${USER}:${PASS}@${REPO}`
const workingDir = process.env.workingDir
const commitMessage = 'commit on ' + new Date()


// One-liner for current directory, ignores .dotfiles
chokidar.watch(workingDir, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  if (event === 'change' || event === 'add' || event === 'unlink')
    status(workingDir).then((status) => {
      if(status.created.length > 0 || status.modified.length > 0 || status.deleted.length > 0 || status.not_added.length > 0){
        internetAvailable().then(function(){
          console.log("Internet available going to commit and push :D " + new Date())
          require('simple-git')(workingDir)
          .add('./*')
          .commit(commitMessage)
          .push(remote,  ['-f'], () => console.log('commit pushed '))
        }).catch(function(){
          console.log("No internet " + new Date());
        });

      }
    });
});

async function status(workingDir) {

  let statusSummary = null;
  try {
    statusSummary = await git(workingDir).status();
  }
  catch (e) {
    console.log('error')
  }
  return statusSummary;
}

