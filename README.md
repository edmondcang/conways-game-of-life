# Description

The major challenge in this project is how to process and calculate the array of cells precisely according to the rules. The solution is to put all dead cells in a list, marking that they will die, then kill them after finishing the evaluation loop for each cell's state.

Another challenge is to make maintain consistancy between all clients and the server.
To achieve this we place cells evaluation process into the server, broadcasting to all clients a same list of processed cells. Then it is the client's job to render the view according to the data it receives.

Demo

[https://edmondcang-game-of-life.herokuapp.com/](https://edmondcang-game-of-life.herokuapp.com/)

# How to use

## Install dependencies
```
$ npm i
```

## To develop
```
$ node index # or use nodemon if you have it installed
```
Then open another terminal and run
```
$ npm run watch
```
And point your browser to `http://localhost:8080`. Optionally, specify
a port by supplying the `PORT` env variable.

## To deploy
```
$ npm start
```
# TODOs
- Improve performance and efficiency