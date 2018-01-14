const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const { FuseBox, QuantumPlugin } = require('fuse-box')
const yargs = require('yargs')

const args = yargs.option('debug', {
  'alias': 'd',
  'describe': 'Starts fusebox in debug mode. This enables debug features',
  'type': 'boolean',
  'default': false
})
.option('production', {
  'alias': ['prod', 'p'],
  'describe': 'Starts fusebox in production mode, removing logs, and sourcemaps',
  'type': 'boolean',
  'default': false
})
.option('quiet', {
  'alias': 'q',
  'describe': 'Starts fusebox in quiet mode, removing logs',
  'type': 'boolean',
  'default': false
})
.option('watch', {
  'alias': 'w',
  'describe': 'Starts fusebox in watch mode, watching for file changes',
  'type': 'boolean',
  'default': false
})
.option('invalidateCache', {
  'alias': 'i',
  'describe': 'Invalidate the cache',
  'type': 'boolean',
  'default': false
})
.help('help')
.argv

if (args.watch) {
  console.info(' Starting Fuse in WATCH mode...')
} else {
  console.info(' Starting Fuse in BUILD mode...')
}

const fuse = FuseBox.init({
  homeDir : "src",
  target : 'server@esnext',
  output : "dist/$name.js",
  useTypescriptCompiler : true,
  plugins: [
    args.production && QuantumPlugin({
      bakeApiIntoBundle : 'index',
      containedAPI : true,
      target: 'npm',
      treeshake : true,
      uglify: false
    })
  ]
});

const bundle = fuse.bundle("index")
  .instructions(" > index.js")

if (args.watch) {
  bundle.watch()
}

fuse.run()
