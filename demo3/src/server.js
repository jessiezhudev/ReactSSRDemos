import express from 'express'
import React from 'react'
import HomePage, {loadData} from '../src/pages/HomePage'
import {renderToString} from 'react-dom/server'
const app = express()
app.use(express.static('public'))
app.get('/', (req,res)=>{
    let initialGoods = []
    loadData().then((response)=>{
        initialGoods = response.data.data.list
        const content = renderToString(<HomePage initialGoods={initialGoods}/>)
        const html = `
            <html>
                <body>
                    <div id="root">${content}</div>
                    <script>window._initialGoods=${JSON.stringify(initialGoods)}</script>
                    <script src="bundle.js"></script>
                </body>
            </html>
        `
        res.send(html)
    })
})
app.listen(3000, ()=>{
    console.log('listening 3000')
})