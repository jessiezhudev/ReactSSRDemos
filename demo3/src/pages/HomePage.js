import React, {Component} from 'react'
import axios from 'axios'
class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            goods: props.initialGoods
        }
    }
    componentDidMount() {
        loadData().then((res) => {
            this.setState({
                goods: res.data.data.list
            })
        })
    }
    renderList() {
        return this.state.goods.map((item, index)=>{
            return (
                <li key={index}>
                    {item}
                </li>
            )
        })
    }
    render() {
        return (
            <div>
                <ul>
                    {this.renderList()}
                </ul>
            </div>
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