# Description

This is a simple web game based on Conway's Game of Life.

This project consists of a node.js server application with Socket.io services and a game client application.

Using the client application, a player can spawn cells by clicking on the space within the border or selecting predefined patterns. Then they are sent to the server in the form of `{x, y}` (one cell) or `[{x1,y1}, ... , {xn,yn}]` (multiple cells). The server evaluate the state for each cell and broadcast a list of living cells to all players.

Multiple players can play in the same time. Each player is assigned a colour once entered the game. Every cell raised or revived by 3 neighbour cells have an average colour between those of the 3 cells.

The major challenge in this project is how to process and calculate the array of cells precisely according to the rules. The solution is to put all dead cells in a list, marking that they will die, then kill them after finishing the evaluation loop for each cell's state.

Another challenge is to maintain consistancy between all clients and the server.
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
- Add controls to navigate the space (move around, zoom in and out)
- Increase the space
- Add colour selection (the default colour doesn't always please me)
- Add testing