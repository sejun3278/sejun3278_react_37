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
      like_num : 0,
      like_exist : null,
      like_num : "",
      pre_view : "",
      next_view : "",
      category_data : [],
      select_category : "",
      reply_data : [],
      reply_num : null,
      reply_all_page : [],
      reply_page : 1,
      reply_limit : 2,
      reply_block : 1,
      reply_pre_block : false,
      reply_next_block : false,
      reply_block_limit : 10
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

    if(sessionStorage.reply) {
      this._setReplyPage()
    }
  }

  _getAllLike = async (board_id) => {
    const getData = await axios('/get/board_data', {
      method : 'POST',
      headers: new Headers(),
      data : { id : board_id }
    });

    this.setState({ like_num : getData.data[0].likes })
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

  _setReplyPage = function() {
    if(sessionStorage.reply) {
      // 댓글
      const reply = JSON.parse(sessionStorage.reply);

      this.setState({ 
        reply_page : Number(reply.reply_page)
      })

      return this._getAllPage(reply.board_id)
    }
  }

  _changePage = (el, board_id) => {
    if(board_id === undefined) {
      // 게시글 형태에서
      this.setState({ list_page : el })
      sessionStorage.setItem('page', el);

      return this._getListData();

    } else {
    // 댓글 형태에서
      this.setState({ reply_page : el })
      const reply_session = { reply_page : el, board_id : board_id }
      sessionStorage.setItem('reply', JSON.stringify(reply_session));

      return this._getReplyData(board_id);
    }
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

  _selectCategoryData = async (board_id) => {
    let category = document.getElementsByName('select_category')[0].value;

    if(board_id) {
      // 수정 페이지일 경우 카테고리 변경
      const getData = await axios('/get/board_data', {
        method : 'POST',
        headers: new Headers(),
        data : { id : board_id }
      });

      return this.setState({ select_category : getData.data[0].cat_id })
    }

    this.setState({
      select_category : category
    })
  }

  // like 여부 확인
  _getLikeExist = (boo) => {
    this.setState({ like_exist : boo })
  }

  _getReplyData = async (board_id) => {

    var reply_page = 1;
    if(sessionStorage.getItem('reply')) {
      reply_page = JSON.parse(sessionStorage.getItem('reply')).reply_page

    } else {
      reply_page = this.state.reply_page
    }

    // 한 페이지에 불러올 댓글의 갯수 설정
    const { reply_limit } = this.state;

    const obj = {
      board_id : board_id,
      reply_page : Number(reply_page),
      reply_limit : reply_limit
    }

    // 데이터와 총 갯수 구하기
    const data = await axios('/get/reply_data', {
      method : 'POST',
      headers: new Headers(),
      data : obj
    })

    // 페이징 정보 구해오기
    const page_data = this._getAllPage(data.data.count)

    return this.setState({
      reply_data : data.data.rows,
      reply_num : data.data.count,
      reply_all_page : page_data.page_arr
    })
  }

  _getAllPage = function(cnt) {
    let result = new Object;

    // 전체 페이지 수 구하기
    let page_arr = [];

    const { reply_limit, reply_block_limit } = this.state;

    // 현재 페이지 구하기
    let reply_page = 1;
    if(sessionStorage.getItem('reply')) {
      reply_page = JSON.parse(sessionStorage.getItem('reply')).reply_page

    } else {
      reply_page = this.state.reply_page
    } 
    
    // 블록 최대 범위 (소수점 포함)
    const max_block = (Math.ceil(cnt / reply_limit)) / reply_block_limit;

    // 현재 페이지 위치를 블록 단위로 변환
    const block_point = Math.ceil(reply_page / reply_block_limit);
    this.setState({ reply_block : block_point, reply_page : reply_page })

    // 다음 블록이 있는지 판단
    if(block_point < max_block) {
      this.setState({ reply_next_block : true })
    
    } else {
      this.setState({ reply_next_block : false })
    }

    // 이전 블록이 있는지 판단
    if(block_point > 1) {
      this.setState({ reply_pre_block : true })

    } else {
      this.setState({ reply_pre_block : false })
    }

    let start = block_point;
    if(start !== 1) {
      start = ((start - 1) * reply_block_limit) + 1;
    }
    
    let end = Math.ceil(cnt / reply_limit);
    if(end > reply_block_limit) {
      end = (start + reply_block_limit) - 1;
    
      if(end > (max_block * 10)) {
        end = max_block * 10
      }
    }

    for(start; start <= end; start++) {
      page_arr.push(start);
    }

    result['page_arr'] = page_arr;
    return result;
  }

  _changeBlock = (reply_page, board_id) => {
    const reply_session = { reply_page : reply_page, board_id : board_id }
    sessionStorage.setItem('reply', JSON.stringify(reply_session));


    return this._getReplyData(board_id)
  }

  render() {
    const { 
      login, admin, user_ip, login_modal,
      list_data, list_all_page, list_search, list_page, user_id,
      data, date, like_num, like_exist, pre_view, next_view, 
      category_data, select_category, reply_data, reply_num,
      reply_all_page, reply_page, replt_limit,
      reply_pre_block, reply_next_block, reply_block, reply_block_limit
    } = this.state;

    const { 
      _login, _logout, _toggleModal, _getSearch, _changePage,
      _changeCatgory, _getData, _getAllLike, _getPreAndNextData,
      _selectCategoryData, _getLikeExist, _getReplyData
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
          _getLikeExist = {_getLikeExist}
          like_exist = {like_exist}
          reply_data = {reply_data}
          reply_num = {reply_num}
          _getReplyData = {_getReplyData}
          reply_all_page = {reply_all_page}
          reply_page = {reply_page}
          replt_limit = {replt_limit}
          reply_pre_block = {reply_pre_block}
          reply_next_block = {reply_next_block}
          reply_block = {reply_block}
          reply_block_limit = {reply_block_limit}
        />
      </div>
    </div>
    )
  }
}

export default App;
