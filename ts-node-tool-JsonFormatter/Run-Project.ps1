$here = $PSScriptRoot

node --enable-source-maps --unhandled-rejections=strict $here\dist\index.js @args
