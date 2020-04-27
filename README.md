
## @fsglob/watchdir

### Install
``` sh
npm i -D fsdir
```

### Running CLI

``` sh
npx fsdir -d ./src \
  --each "{,**/}*.sass" "sass ${FILE_PATH} -o ${FILE_DIR}${FILE_NAME}.css"
```

``` sh
npx fsdir -d ./src \
  --when "{,**/}* ; !{,**/}*.sass" "make js" \
  --when "{,**/}*.sass" "make css" \
  --run "echo 'all when detected has finished'"
```

### JavaScript API

``` js
import WatchDir from 'fsdir/watchdir'

new WatchDir('./src')
  .when('{,**/}* ; !{,**/}*.sass', () => console.log('js files changed') )
  .when('{,**/}*.sass', () => console.log('sass files changed') )
  .run( () => console.log('all when detected has finished) )

```
