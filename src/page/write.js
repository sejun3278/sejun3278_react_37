import React, { Component } from 'react';
import './main.css';

import { CKEditor } from '../inc/index.js'; 

class write extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if(this.props.match.params.data && this.props.title.length === 0) {
      this.props._getModifyData(this.props.match.params.data);
    }
  }

  render() {
    const { 
      _getContents, _getTitles, contents, title 
    } = this.props;

    return (
        <div className='Write'>
          <div id='Title'>
            <input type='text' autoComplete='off' id='title_txt' name='title' placeholder='제목' 
                   defaultValue={title} onBlur={() => _getTitles()}
            />
          </div>

          <div>
            <CKEditor 
              _getContents = { _getContents } 
              contents = { contents }
            /> 
          </div>
        </div>
    );
  }
}

export default write;
