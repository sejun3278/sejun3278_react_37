import React, { Component } from 'react';
import '../main.css';

import axios from 'axios';

class right_write extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title : "",
      contents : "",
    }
  }

  componentDidMount() {
    if(this.props.match.params.data && !this.props.select_category) {
      this.props._selectCategoryData(this.props.match.params.data);
    }
  }

  _submitBoard = async function() {
    const title = document.getElementsByName('title')[0].value.trim();
    const contents = this.props.contents;
    const category = this.props.select_category;

    if(title === "") {
      return alert('제목을 입력해주세요.');

    } else if(contents === "") {
      return alert('내용을 입력해주세요.');
    
    } else if(category === "") {
      return alert('카테고리를 선택해주세요.')
    }

    if(!this.props.match.params.data) {
      const data = { title : title, contents : contents, category : category };
      const res = await axios('/add/board', {
        method : 'POST',
        data : data,
        headers: new Headers()
      })

      if(res.data) {
        alert('글 등록이 완료되었습니다.');
        return window.location.replace('/')
      }

    } else {
      const data = { 
        title : title, 
        contents : contents, 
        category : category, 
        board_id : this.props.match.params.data };

        const res = await axios('/update/board', {
          method : 'POST',
          data : data,
          headers: new Headers()
        })

        if(res.data) {
          alert('글 수정이 완료되었습니다.');

          const url = "/view/" + this.props.match.params.data;

          sessionStorage.setItem('category', category);
          return window.location.href = url
        }
     }
  }

  render() {
    const { 
      category, select_category, _selectCategoryData
    } = this.props;

    return (
        <div>
          <div className='select_category_div'>
          <h5> 카테고리 선택 </h5>
            <select name='select_category' onChange={() => _selectCategoryData()}
                    value={select_category}
            >
              <option value=''> - 카테고리 선택 - </option>
              {category 
                ? category.map( (el) => {
                  return(
                    <option value={el.id} key={el.id}
                    > 
                      {el.name} 
                    </option>
                  )
                })
              
                : null}
            </select>
          </div>

          <div id='post_submit'>
              <button onClick={() => this._submitBoard()}> 
                { !this.props.match.params.data 
                    ? '포스트 등록'
                    : '포스트 수정'
                }
              </button>
          </div>

        </div>
    );
  }
}

export default right_write;
