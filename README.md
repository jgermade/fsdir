
## fsdir

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
  --watch "{,**/}* ; !{,**/}*.sass" "make js" \
  --watch "{,**/}*.sass" "make css" \
  --after-watch "echo 'all when detected has finished'"
```

### JavaScript API

``` js
import WatchDir from 'fsdir/watchdir'

new WatchDir('./src')
  .when('{,**/}* ; !{,**/}*.sass', () => console.log('js files changed') )
  .when('{,**/}*.sass', () => console.log('sass files changed') )
  .run( () => console.log('all when detected has finished) )

```
