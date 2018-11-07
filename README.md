# brouter-online

Web client for the BRouter routing engine. http://brouter.mekto.net/

BRouter (which is not part of this project) is configurable OSM bike router with elevation awareness
designed for an offline use on Android devices.
For more information see http://brouter.de/brouter/

### Getting started

```
git clone …
yarn install
cp config.js.tmpl config.js
$EDITOR config.js
yarn build
```

Serve the `index.html` and `public/` folder (for instance with `python3 -m
http.server`) and open your browser :)

### Screenshot

![alt tag](screenshot.png?raw=true)

## License

Copyright (c) 2016 Tomasz Krzyszczyk, licensed under the [MIT License (MIT)](LICENSE)
