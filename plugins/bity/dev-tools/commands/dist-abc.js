const runAll = require('npm-run-all');

const args = [].concat(process.argv.slice(2), '--env.abc-release');

const commands = [
  'dist-abc:clear-result',
  'dist:clean',
  `dist:compile -- ${args.join(' ')}`,
  'dist:clean-after-compile',
  'dist-abc:move-result'
];

const opts = {
  printName: true,
  stdin: process.stdin,
  stdout: process.stdout
};

runAll(commands, opts)
  .then(() => {
    console.log('DONE');
  })
  .catch((e) => {
    throw e;
  });
