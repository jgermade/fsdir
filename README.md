
## @fs1/watchdir

### Install
``` sh
npm i -D @fs1/watchdir
```

### Running CLI
``` sh
npx watchdir -d ./src \
  --when "{,**/}* ; {,**/}*.sass" "make js" \
  --when "{,**/}*.sass" "make css" \
  --run "echo 'all when detected has finished'"
```

### JavaScript API
``` js
import WatchDir from '@fs1/watchdir'

new WatchDir('./src')
  .when('{,**/}* ; !{,**/}*.sass', () => console.log('js files changed') )
  .when('{,**/}*.sass', () => console.log('sass files changed') )
  .run( () => console.log('all when detected has finished) )

```
