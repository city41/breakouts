#! /usr/bin/env bash
rm ../game/images/compressed/*.*
java -jar rhino/js.jar -f js/compile-json.js
java -jar rhino/js.jar -f js/compile-assets.js
rm config.json