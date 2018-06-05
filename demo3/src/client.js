import React from 'react'
import ReactDom from 'react-dom'
import HomePage from './pages/HomePage'
ReactDom.hydrate(<HomePage initialGoods={window._initialGoods}/>, document.getElementById('root'))