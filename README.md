
## fsdir

### Install
``` sh
npm i -D fsdir
```

### API JavaScript

``` js
import WatchDir from 'fsdir/watchdir'

new WatchDir('./src')
  .when('{,**/}* ; !{,**/}*.sass', () => console.log('js files changed') )
  .when('{,**/}*.sass', () => console.log('sass files changed') )
  .run( () => console.log('all when detected has finished) )

```

### Running CLI

``` sh
npx fsdir -d ./src \
  --each "{,**/}*.sass" "sass ${FILE_PATH} -o ${FILE_DIR}${FILE_NAME}.css"
```

``` sh
npx fsdir -d ./src \
  --watch "{,**/}* ; !{,**/}*.sass" "file ${FILE_PATH} has changed" \
  --watch "{,**/}*.sass" "make css" \
  --after-watch "echo 'any watch has matched and all have finished'"
```

> These are the environment variables added to each command:
``` js
┌────────────────────────────────────────────────────────┐
│                    FILE_CWDPATH                        │
├─────────────────────────────────┬──────────────────────┤
│          FILE_CWDDIR            │       FILE_BASE      │
├────────────┬────────────────────┴──────────────────────┤
│            │                FILE_PATH                  │
│  FILE_CWD  ├────────────────────┬───────────┬──────────┤
│            │      FILE_DIR      │ FILE_NAME │ FILE_EXT │
│            │                    │           │          │
"     src    /   component/styles / component     .css   "
└────────────┴────────────────────┴───────────┴──────────┘

Also: `FILE_ROOTPATH` is filepath from system root 
```
