
## @fsglob/foreach

### Install
``` sh
npm i -D @fsglob/foreach
```

### Running CLI
``` sh
npx foreach\
  --pattern "{,**/}* ; {,**/}*.sass" "sass ${FILE_}" \
  --when "{,**/}*.sass" "make css" \
  --run "echo 'all when detected has finished'"
```

### JavaScript API
``` js
import { forEach } from '@fsglob/watchdir'

forEach('{,**/}*.sass')

  .when('{,**/}* ; !{,**/}*.sass', () => console.log('js files changed') )
  .when('{,**/}*.sass', () => console.log('sass files changed') )
  .run( () => console.log('all when detected has finished) )

```
