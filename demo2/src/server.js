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