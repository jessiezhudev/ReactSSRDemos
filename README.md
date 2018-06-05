# ReactSSRDemos
Three demos to show how to convert a simple traditional client-side rendered React app to a server-side rendered app.

The three demos are:
1. Demo1: A client-side rendered React app
2. Demo2: Converting the first app to a server-side rendered app
3. Demo3: Add fetching data function to the app at second step.

#### Demo1
The demo is quite simple and the file structure is as follows:

```
  |-- src 
  |    |-- pages 
  |    |-- 	|-- HomePage.js  
  |    |-- app.js //entry js
  |    |-- index.html
  |-- pagekage.json
  |-- webpack.config.js
```

First, we configurate the webpack.config.js to pack entry.js and use babel to deal with the latest ES6 syntax.

```
const path = require('path')

module.exports = {
    //tell webpack the root file of our application
    entry: './src/app.js',
    //tell webpack where to put the output file that is generated
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },

    //tell webpack to run babel on every file it runs through
    module: {
        rules: [
          {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
              presets: [
                'react',
                'stage-0',
                ['env', { targets: { browsers: ['last 2 versions'] } }]
              ]
            }
          }
        ]
    }
}
```
Add a script in `package.json` to start the build process:
```
build: "webpack --config webpack.config.js"
```
Then write the index.html file:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Client-Rendered Demo</title>
</head>
<body>
    <div id="root"></div>
    <script src="../public/bundle.js"></script> 
    <!-- This is the output file that is generated -->
</body>
</html>
```
app.js:
```
import React from 'react'
import ReactDom from 'react-dom'
import HomePage from './pages/HomePage'
ReactDom.render(<HomePage/>, document.getElementById('root'))
```
homePage.js:
```
import React from 'react'

const HomePage = () => {
    return <div>This is Home Page</div>
}

export default HomePage
```
Then:
```
npm run build
```
Open the index.html file, we can see:

![Client Rendering graphs](https://github.com/jessiezhudev/ReactSSRDemos/blob/master/assets/client-rendering.png)

#### Demo2
Then there goes with server-side rendering. Now we need a `server.js` to start the server along with a webpack server file to deal with it.

The most important one in this step is to use `renderToString` function of `react-dom/server` to render the pages into HTML strings on the server, then send them directly to the browser.

server.js:
```
import express from 'express'
import React from 'react'
import HomePage from '../src/pages/HomePage'
import {renderToString} from 'react-dom/server'
const app = express()
app.use(express.static('public'))
app.get('/', (req,res)=>{
    const content = renderToString(<HomePage/>)
    const html = `
        <html>
            <body>
                <div id="root">${content}</div>
                <script src="bundle.js"></script>
            </body>
        </html>
    `
    res.send(html)
})
app.listen(3000, ()=>{
    console.log('listening 3000')
})
```
Above, we still need to load bundle.js for page interaction.

webpack.server.js
```
const path = require('path')
module.exports = {
    //tell webpack we're running on the node environment
    target: 'node',
    //tell webpack the root file of our application
    entry: './src/server.js',

    //tell webpack where to put the output file that is generated
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },

    //tell webpack to run babel on every file it runs through
    module: {
        rules: [
          {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
              presets: [
                'react',
                'stage-0',
                ['env', { targets: { browsers: ['last 2 versions'] } }]
              ]
            }
          }
        ]
    }
}
```
And we also convert the former 'webpack.config.js' to 'webpack.client.js' and 'app.js' to 'client.js', and we no longer need index.html.

Then configurate the package.json:
```
"dev": "npm-run-all --parallel dev:*",
"dev:server": "nodemon --watch build --exec \"node build/bundle.js\"",
"dev:build-server": "webpack --config webpack.server.js --watch",
"dev:build-client": "webpack --config webpack.client.js --watch"
```
Run command:
```
npm run dev
```
Open `localhost:3000` in our browser, we are finally able to see:

![Server Rendering graphs](https://github.com/jessiezhudev/ReactSSRDemos/blob/master/assets/server-rendering.png)

It is easy to notice that the initial html we receive have already included content which is different from above example. This is how SSR really works.

#### Demo3
This demo is a little complex with fetching data. Usually we fetch data in `componentDidMount` in React, but there is no lifecycle hooks in server-side rendering. Therefore we need a `loadData` function in each page to explicitly tell the server what ajax requests it's going to make. And server implement the `loadData` function on the server to send the data to our page component through `props`.

First, let's add `loadData` function to 'HomePage.js', initiate `goods` through `props`, and call the `loadData` function in `componentDidMount`, and render list through using `goods`.
```
import React, {Component} from 'react'
class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            goods: props.initialGoods
        }
    }
    componentDidMount() {
        loadData.then((res) => {
            this.setState({
                goods: res.data.data.list
            })
        })
    }
    renderList() {
        return this.state.goods.map((item, index)=>{
            <li key={index}>
                {item}
            </li>
        })
    }
    render() {
        return (
            <div>{this.renderList()}</div>
        )
    }
}
function loadData() {
    return axios.get('https://www.easy-mock.com/mock/5b10ebe6b0cb5c4510cddf25/ssr/goods')
}
export default HomePage
export {
    loadData
}
```

Then in 'server.js', we set a `window._initialGoods` since in later client side rendering, we use it for `props`.

```
import express from 'express'
import React from 'react'
import {renderToString} from 'react-dom/server'
import Home, {loadData} from './pages/home.js'

const app = express()
app.use(express.static('public'))
app.get('/', (req, res)=>{
    let initialGoods
    loadData().then((response)=>{
        initialGoods = response.data.data.list
        const content = renderToString(<Home initialGoods={initialGoods}/>)
        const html = `
        <body>
            <div id="app">${content}</div>
            <script>window._initialGoods=${JSON.stringify(initialGoods)}</script>
            <script src="bundle.js"></script>
        </body>
        `
        res.send(html)
    })

})

app.listen(3000, ()=>{
    console.log('listening 3000')
})
```
In client-side rendering, we use window._initialGoods as props. And turn `ReactDom.render` to `ReactDom.hydrate`
```
import React from 'react'
import ReactDom from 'react-dom'
import Home from './pages/Home'
ReactDom.hydrate(<Home initialGoods={window._initialGoods}/>, document.getElementById('app'))
```
Then run 
``
npm run dev
``
Open `localhost:3000` in our browser, we are finally able to see:
![Server Rendering Data graphs](https://github.com/jessiezhudev/ReactSSRDemos/blob/master/assets/server-rendering-data.png)
 