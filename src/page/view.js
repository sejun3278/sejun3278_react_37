import React, { Component } from 'react';
import './main.css';

import axios from 'axios';

class view extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data : [],
      date : "",
      none_like : 'https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-10.png&r=171&g=171&b=171',
      like : 'https://iconmonstr.com/wp-content/g/gd/makefg.php?i=../assets/preview/2013/png/iconmonstr-thumb-10.png&r=171&g=53&b=53',
      like_exist : false,
      like_num : 0,
    }
  }

  componentDidMount() {
    const board_id = this.props.match.params.data;

    this._getData(board_id);
    this._addViewCnt(board_id);
    this._getLikeInfo();
  }

  _getLikeInfo = async function() {
    const { user_id, login } = this.props;

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
        this.setState({ 
          like_exist : true
        })
      }
    }
  };

  _getAllLike = function(type) {
    const { data } = this.state;

    if(type === 'add') {
      this.setState({ like_num : data.data[0].likes + 1})

    } else if (type === 'remove') {
      this.setState({ like_num : data.data[0].likes - 1})
    }
  }

  _getData = async function(board_id) {
    const getData = await axios('/get/board_data', {
      method : 'POST',
      headers: new Headers(),
      data : { id : board_id }
    });

    // 날짜 구하기
    const date = getData.data[0].date.slice(0, 10) + ' ' + getData.data[0].date.slice(11, 16);

    return this.setState({ data : getData, date : date, like_num : getData.data[0].likes })
  }

  _addViewCnt = async function(board_id) {
    await axios('/update/view_cnt', {
      method : 'POST',
      headers: new Headers(),
      data : { id : board_id }
    })
  }

  _toggleLike = async function() {
    const { user_id, login, _toggleModal } = this.props;

    if(!login) {
      alert('로그인이 필요합니다.');
      return _toggleModal(true)
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

        this.setState({ like_exist : false })
        this._getAllLike('remove')

        alert('좋아요가 취소되었습니다.');
      }
       
    } else {
      this.setState({ like_exist : true })
      this._getAllLike('add')

      alert('해당 게시물에 좋아요를 누르셨습니다.')
    }
    return this._getData(board_id)
  }

  render() {
    const { 
      data, date, none_like, like, like_exist, like_num 
    } = this.state;

    return (
        <div className='Write View'>
          {data.data 
          ? <div>
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
                <div> {/* left empty*/} </div>
                <div className='Like'>
                  <img src={!like_exist ? none_like : like} onClick={() => this._toggleLike()}/>
                  <h5> 좋아요 ( {like_num} ) </h5>
                </div>
                <div> {/* right empty*/} </div>
              </div>
            </div>

          : null}
        </div>
    );
  }
}

export default view;
