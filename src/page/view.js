import React, { Component } from 'react';
import './main.css';

import axios from 'axios';
import { Link } from 'react-router-dom';

class view extends Component {
  constructor(props) {
    super(props)
    this.state = {
      none_like : 'https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-10.png&r=171&g=171&b=171',
      like : 'https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-10.png&r=171&g=53&b=53',
      pre : "https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2018/png/iconmonstr-angel-left-thin.png&r=0&g=0&b=0",
      next : "https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2018/png/iconmonstr-angel-right-thin.png&r=0&g=0&b=0",
      pre_block : "https://cdns.iconmonstr.com/wp-content/assets/preview/2017/240/iconmonstr-arrow-64.png",
      next_block : "https://cdns.iconmonstr.com/wp-content/assets/preview/2017/240/iconmonstr-arrow-63.png"
    }
  }

  componentDidMount() {
    const board_id = this.props.match.params.data;

    const { 
      pre_view, next_view, _getPreAndNextData, like_exist,
      reply_num, _getReplyData
    } = this.props;

    this._addViewCnt(board_id);

    if(reply_num === null) {
      _getReplyData(board_id)
    }

    if(!this.props.data) {
      this.props._getData(board_id)
    }

    if(like_exist === null) {
      this._getLikeInfo()
    }
    
    if(pre_view === "" || next_view === "") {
      _getPreAndNextData(board_id)
    }

    if(sessionStorage.getItem('reply')) {
      const reply_session = JSON.parse(sessionStorage.getItem('reply'))
      
      if(reply_session.board_id !== board_id) {
        sessionStorage.removeItem('reply')
        _getReplyData(board_id)
      }
    } 
  }

  _getLikeInfo = async function() {
    const { user_id, login, _getLikeExist } = this.props;

    if(login) {
      // 로그인 된 상태에서만 실행

      const board_id = this.props.match.params.data;
      const obj = { user_id : user_id, board_id : board_id }

      const getData = await axios('/check/like', {
        method : 'POST',
        headers: new Headers(),
        data : obj
      })

      if(getData.data[0]) {
        return _getLikeExist(true)
      }
      _getLikeExist(false)
    }
  };

  _addViewCnt = async function(board_id) {
    await axios('/update/view_cnt', {
      method : 'POST',
      headers: new Headers(),
      data : { id : board_id }
    })
  }

  _toggleLike = async function() {
    const { 
      user_id, _getAllLike 
    } = this.props;

    if(!this._loginCheck()) {
      return
    }

    const board_id = this.props.match.params.data;
    const obj = { type : 'add', user_id : user_id, board_id : board_id }

    const res = await axios('/update/like', {
      method : 'POST',
      headers: new Headers(),
      data : obj
    })

    if(!res.data) {
      if(window.confirm('좋아요를 취소하시겠습니까?')) {
        const cancel = { type : 'remove', user_id : user_id, board_id : board_id }

        await axios('/update/like', {
          method : 'POST',
          headers: new Headers(),
          data : cancel
        })

        this.props._getLikeExist(false)
        //this._getAllLike('remove')
        _getAllLike(board_id)

        alert('좋아요가 취소되었습니다.');
      }
       
    } else {
      this.props._getLikeExist(true)
      //this._getAllLike('add')
      _getAllLike(board_id)

      alert('해당 게시물에 좋아요를 누르셨습니다.')
    }
  }

  _changeViewPage = function(url) {
    if(url === 'null_pre') {
      return alert('첫번째 게시물입니다.')
      
    } else if (url === 'null_next') {
      return alert('마지막 게시물입니다.')
    }

    return window.location.href = url;
  }

  _removeView = async function() {
    if(window.confirm('해당 게시물을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      const board_id = this.props.match.params.data;
      
      await axios('/delete/board', {
        method : 'POST',
        headers: new Headers(),
        data : { board_id : board_id }
      })

      alert('게시물이 삭제되었습니다.')
      return window.location.href = '/'
    }
  }

  _loginCheck = () => {
    const { 
      login, _toggleModal
    } = this.props;

    if(!login) {
      alert('로그인이 필요합니다.');
      _toggleModal(true)

      return false;
    }

    return true;
  }

  _addReply = async () => {
    let reply = document.getElementsByName('write_reply')[0].value.trim();

    // 내용 줄바꿈 처리하기
    reply = reply.replace(/(\n|\r\n)/g, '<br>');

    const board_id = this.props.match.params.data;
    const { user_id } = this.props;

    if(!this._loginCheck()) {
      return
    }

    if(reply === "" || reply.length === 0) {
      document.getElementsByName('write_reply')[0].focus()
      document.getElementsByName('write_reply')[0].value = reply;

      return alert('댓글을 입력해주세요.');

    } else if(reply.split('<br>').length > 5) {
      return alert('댓글 내용이 5줄 이상 초과되었습니다.')
    }

    const data = { 
      board_id : board_id,
      contents : reply,
      user_id : user_id 
    }

    await axios('/add/reply', {
      method : 'POST',
      headers: new Headers(),
      data : data
    })

    alert('댓글이 등록되었습니다.')
    return window.location.reload();
  }

  _getUserInfo = async function(user_id) {
    const data = await axios('/get/user_info', {
      method : 'POST',
      headers: new Headers(),
      data : { user_id : user_id }
    })

    return data.data[0];
  }

  _removeReply = async function(reply_id) {
    
    if(window.confirm('해당 댓글을 삭제하시겠습니까?')) {
      await axios('/delete/reply', {
        method : 'POST',
        headers: new Headers(),
        data : { reply_id : reply_id }
      })
    }

    alert('댓글 삭제가 완료되었습니다.')
    return window.location.reload();
  }

  _changeBlock = (type) => {
    const { 
      reply_pre_block, reply_next_block,
      reply_block_limit, reply_block, _getReplyData
    } = this.props;

    const board_id = this.props.match.params.data;
    let reply_session = new Object
    let reply_page = this.props.reply_page;

    if(type === 'pre') {
      if(reply_pre_block) {
        if(reply_block === 2) {
          reply_session = { reply_page : 10, board_id : board_id }

        } else {
          reply_page = (reply_block * reply_block_limit) - 1;
          reply_session = { reply_page : reply_page, board_id : board_id }
        }
      } else {
        return alert('첫번째 블록입니다.')
      }

    } else if(type === 'next') {
      if(reply_next_block) {
        reply_page = (reply_block * reply_block_limit) + 1;
        reply_session = { reply_page : reply_page, board_id : board_id }

      } else {
        return alert('마지막 블록입니다.')
      }
    }

    sessionStorage.setItem('reply', JSON.stringify(reply_session));
    return _getReplyData(board_id)
  }

  render() {
    const { 
      none_like, like, pre, next, pre_block, next_block
    } = this.state;
    
    const { 
      data, date, like_num, pre_view, next_view, admin,
      like_exist, reply_num, reply_data, reply_all_page, reply_page,
      _changePage
    } = this.props


    const { _loginCheck, _addReply, _changeBlock } = this; 

    // 해당 게시물의 id 값
    const board_id = this.props.match.params.data;

    if(next_view.length) {
      var next_url = '/view/' + next_view[0].board_id;
    }

    if(pre_view.length) {
      var pre_url = '/view/' + pre_view[0].board_id;
    }

    if(data.data) {
      var modify_url = '/write/modify/' + data.data[0].board_id;
    }
    
    return (
        <div className='Write View'>
          {data.data 
          ? <div>
            {admin === 'Y'
            ?
              <div className='write_option_div'>
                <Link to={modify_url}> <input type='button' value='수정' /> </Link>
                <input type='button' value='삭제' onClick={() => this._removeView()} />
              </div>
            : null }

              <div className='top_title'>
                <input type='text' id='title_txt' name='title' defaultValue={data.data[0].title} readOnly/>

                <div className='date_div'>
                  {date}
                </div>
              </div>
              
              <div id='contents_div' 
                   dangerouslySetInnerHTML={ { __html : data.data[0].contents }}
              >
              </div>

              <div className='other_div'>
                <input type='button' value='목록' id='view_list_button'
                       onClick={() => window.location.href = '/'}
                />
                
                <div className='view_pre_next_div view_pre'> 
                  {/* left empty */}
                  <p> 이전글 </p>

                  <img src={pre} onClick={
                    pre_url 
                    ? () => this._changeViewPage(pre_url) 
                    : () => this._changeViewPage('null_pre') }/>

                  <div>
                  {pre_view.length > 0 
                    ? <b onClick={ () => this._changeViewPage(pre_url) }>
                        { pre_view[0].title }
                      </b>
                    : <p> 첫번째 글입니다. </p>}
                  </div>
                  
                </div>

                <div className='Like'>
                  <img src={!like_exist ? none_like : like} onClick={() => this._toggleLike()}/>
                  <h5> 좋아요 ( {like_num} ) </h5>
                </div>

                <div className='view_pre_next_div view_next'> 
                  {/* right empty */} 
                  <p> 다음글 </p>

                  <img src={next} onClick={
                    next_url 
                    ? () => this._changeViewPage(next_url) 
                    : () => this._changeViewPage('null_next') }/>

                  <div>
                  {next_view.length > 0 
                    ? <b onClick={ () => this._changeViewPage(next_url) }>
                        { next_view[0].title }
                      </b>
                    : <p> 마지막 글입니다. </p>}
                  </div>
                </div>
              </div> 
              {/* other_div className 끝 */}

              <div className='Reply_div'>
                <h4> 댓글 </h4>

                <div className='Reply_write'>
                  <textarea rows='3'placeholder='100자 이내의 글을 입력해주세요.'
                    maxLength='100' name='write_reply' onClick={() => _loginCheck()}
                    >
                  </textarea>
                  
                  <input type='button' value='등록' id='reply_submit_button'
                         onClick={() => _addReply()}
                  />
                </div>

                <div className='Reply_list'>
                  {reply_data.length > 0 && reply_num > 0
                    ? <div> 
                        <h5> {reply_num} 개의 댓글이 있습니다. </h5>

                        <div className='reply_list_div'>
                          {reply_data.map( (el) => {

                            let id = el.user.id;
                            if(el.user.admin === 'Y') {
                              id = '관리자'
                            }

                            let date = el.date.slice(2, 10) + ' ' + el.date.slice(11, 16); 

                            return(
                              <div className='reply_list_gird'> 
                                <div style={ el.user.admin === 'Y' ? {'fontWeight' : 'bold'} : null}
                                     className='reply_list_id'
                                > 
                                  {/* 아이디 */}
                                  {id}
                                </div>

                                <div
                                className='reply_list_contents'
                                dangerouslySetInnerHTML={ { __html : el.contents }}> 
                                  {/* 내용 */}
                                </div>

                                <div className='reply_list_date'> 
                                  {/* 작성일 및 기타 */}
                                  {date}

                                  {(this.props.login && this.props.login === el.user.id) || this.props.admin === 'Y'
                                  ? <input type='button' value='삭제' className='reply_delete_btn'
                                          onClick={() => this._removeReply(el.reply_id)}
                                  />
                                  : null}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {/* reply_list_div 끝 */}
                        
                        <div className='reply_paging'> 
                        {/* 댓글 페이징 시작 */}
                          <div>
                            {reply_all_page ?
                            <ul>
                              <li className='page_num'> 
                                <img id='pre_block' src={pre_block}
                                     onClick={() => _changeBlock('pre')}
                                />
                              </li>

                                {reply_all_page.map( (el, key) => {
                                  return(
                                    el === reply_page ? 
                                    /* 현재 페이지 */
                                    <li key={key} className='page_num'> 
                                      <b> {el} </b> 
                                    </li>

                                :  <li key={key} className='page_num'
                                      onClick={() => _changePage(el, board_id)}
                                  > 
                                    {el} 
                                  </li>
                                  )
                                })
                              }
                              <li className='page_num'> 
                                <img id='next_block' src={next_block}
                                     onClick={() => _changeBlock('next')}
                                />
                              </li>
                            </ul> 
                            : null}
                          </div>

                        </div> {/* 댓글 페이징 끝 */}
                      </div>
                              
                    : <h5> 작성된 댓글이 없습니다. </h5>}
                </div>
              </div> {/* Reply_div 끝 */}
            </div>

          : null}
        </div>
    );
  }
}

export default view;
