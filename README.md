
## @kilt/watchdir

### Install
``` sh
npm i -D @kilt/watchdir
```

### Running CLI
``` sh
npx watchdir src \
  --when "{,**/}*.js" "make js" \
  --when "{,**/}*.sass" "make css" \
  --then "echo 'all when detected has finished'"
```
