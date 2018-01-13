const { FuseBox } = require("fuse-box")
const fuse = FuseBox.init({
  homeDir : "src",
  target : 'node@es6',
  output : "dist/$name.js",
  useTypescriptCompiler : true,
});
fuse.bundle("app")
  .instructions(" > index.js").hmr().watch()
fuse.run();
