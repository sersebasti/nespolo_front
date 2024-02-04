Install
- docker compose up
- attach to runnning container
- npm install to install node modules

Serve
- ng serve --host 0.0.0.0 --disable-host-check --poll 200 -> to serve

Deploy
- ng build --base-href=/nespolo/ -> to build the application is in dist folder 
- copy content where there is index.html file to server
- configure server to serve index.html and assets