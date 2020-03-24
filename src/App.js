import React, { Component } from 'react';
import './App.css';

import { Head } from './inc'
import { Main } from './page/index.js'

import axios from 'axios';
import queryString from 'query-string';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login : false,
      admin : false,
      user_ip : "",
      signup : false,
      login_modal : false,
      list_data : [],
      list_page : 1,
      list_limit : 10,
      list_all_page : [],
      list_search : "",
      category : "",
      user_id : "",
      data : "",
      date : "",
      like_num : "",
      pre_view : "",
      next_view : "",
      category_data : [],
      select_category : "",
    }
  }

  componentDidMount() {
    this._getListData();
    this._getAllCategoryData();

    if(sessionStorage.login && sessionStorage.IP) {
      this.setState({ 
        login : JSON.parse(sessionStorage.login).id, 
        admin : JSON.parse(sessionStorage.login).admin,
        user_ip : JSON.parse(sessionStorage.IP),
        user_id : JSON.parse(sessionStorage.login).user_id, 
      })
    }
  }

  _getAllLike = (type) => {
    const { data } = this.state;

    if(type === 'add') {
      this.setState({ like_num : data.data[0].likes + 1})

    } else if (type === 'remove') {
      this.setState({ like_num : data.data[0].likes})
    }
  }

  _getData = async (board_id) => {
    const getData = await axios('/get/board_data', {
      method : 'POST',
      headers: new Headers(),
      data : { id : board_id }
    });

    // 날짜 구하기
    const date = getData.data[0].date.slice(0, 10) + ' ' + getData.data[0].date.slice(11, 16);

    return this.setState({ data : getData, date : date, like_num : getData.data[0].likes })
  }

  _setPage = function() {
    if(sessionStorage.page) {
      this.setState({ list_page : Number(sessionStorage.page) })
      return Number(sessionStorage.page);
    }

    this.setState({ list_page : 1 })
    return 1;
  }

  _changePage = (el) => {
    this.setState({ list_page : el })
    sessionStorage.setItem('page', el);

    return this._getListData();
  }

  _getListData = async function() {
    const { list_limit } = this.state;
    const list_pages = this._setPage();

    let categorys = '';
    if(sessionStorage.getItem('category')) {
      categorys = sessionStorage.getItem('category')
    }

    let search = "";
    if(queryString.parse(this.props.location.search)) {
      search = queryString.parse(this.props.location.search).search;
    }

    // Board 테이블 데이터 전체 수
    const total_cnt = await axios('/get/board_cnt', {
      method : 'POST',
      headers: new Headers(),
      data : { search : search, category : categorys }
    });

    // 데이터 가져오기
    const total_list = await axios('/get/board', {
      method : 'POST',
      headers: new Headers(),
      data : { 
        limit : list_limit, 
        page : list_pages, 
        search : search, 
        category : categorys }
    })

    // 전체 페이지 수 구하기
    let page_arr = [];

    for(let i = 1; i <= Math.ceil(total_cnt.data.cnt / list_limit); i++) {
      page_arr.push(i);
    }

    this.setState({ list_data : JSON.stringify(total_list.data), 
                    list_all_page : page_arr, 
                    list_search : search })
  }

  _login = (data) => {
    sessionStorage.setItem('login', JSON.stringify(data.suc))
    sessionStorage.setItem('IP', JSON.stringify(data.ip))

    this.setState({ login : JSON.parse(sessionStorage.login).id,  
                    admin : JSON.stringify(data.suc).admin,
                    user_ip : JSON.parse(sessionStorage.IP),
                    user_id : JSON.parse(sessionStorage.login).user_id
    })
    return window.location.reload()
  }

  _logout = () => {
    this.setState({ login : false, admin : false, user_ip : "" })

    sessionStorage.removeItem('login')
    sessionStorage.removeItem('IP')
  }

  _toggleModal = (boolean) => {
    this.setState({ login_modal : boolean })
  }
  
  // 카테고리 변동
  _changeCatgory = (target) => {
    sessionStorage.setItem('category', target);
    return window.location.href = '/';
  }

  _getPreAndNextData = async (board_id) => {
    const category = sessionStorage.getItem('category');

    const res = await axios('/get/pre_and_next', {
      method : 'POST',
      headers: new Headers(),
      data : { board_id : board_id, category : category }
    })

    this.setState({
      pre_view : res.data.pre,
      next_view : res.data.next
   })
  }

  _getAllCategoryData = async function() {
    const getData = await axios('/get/category');

    this.setState({ category_data : getData.data })
  }

  _selectCategoryData = async () => {
    const category = document.getElementsByName('select_category')[0].value;

    this.setState({
      select_category : category
    })
  }

  render() {
    const { 
      login, admin, user_ip, login_modal,
      list_data, list_all_page, list_search, list_page, user_id,
      data, date, like_num, pre_view, next_view, category_data,
      select_category
    } = this.state;

    const { 
      _login, _logout, _toggleModal, _getSearch, _changePage,
      _changeCatgory, _getData, _getAllLike, _getPreAndNextData,
      _selectCategoryData
    } = this;
    
    return(
    <div>
      <div>
        <Head 
          login = {login}
          admin = {admin}
          user_ip = {user_ip}
          _login = {_login}
          _logout = {_logout}
          login_modal= {login_modal}
          _toggleModal = {_toggleModal}
        />
      </div>

      <div>
        <Main
          admin = {admin}
          user_ip = {user_ip}
          login = {login}
          login_modal = {login_modal}
          _toggleModal = {_toggleModal}
          _getSearch = {_getSearch}
          list_data = {list_data}
          list_all_page = {list_all_page} 
          list_search = {list_search}
          list_page = {list_page}
          _changePage = {_changePage}
          _changeCatgory = {_changeCatgory}
          user_id = {user_id}
          data = {data}
          date = {date}
          like_num = {like_num}
          _getData = {_getData}
          _getAllLike = {_getAllLike}
          pre_view = {pre_view}
          next_view = {next_view}
          _getPreAndNextData = {_getPreAndNextData}
          category_data = {category_data}
          select_category = {select_category}
          _selectCategoryData = {_selectCategoryData}
        />
      </div>
    </div>
    )
  }
}

export default App;
