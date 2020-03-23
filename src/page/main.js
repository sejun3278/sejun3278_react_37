import React, { Component } from 'react';
import './main.css';

import { Route, Switch } from 'react-router-dom';
import { List, Write, View, Signup } from './index.js'; 

import { Right_Write } from './right/index.js'; 
import { Category } from './left/index.js'; 

class main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      category : '',
      category_change : false,
      contents : "",
      title : ""
    }
  }

  _withProps = function (Component, props) {
    return function(matchProps) {
      return <Component {...props} {...matchProps} />
    }
  }

   _changeState = () => {
    this.setState({ category_change : true })
  }

  _getContents = (val) => {
    const contents = val.trim();

    this.setState({ contents : contents })
  }

  _getTitles = () => {
    const title = document.getElementsByName('title')[0].value.trim();

    this.setState({ title : title })
  }

  render() {
    const { _changeState, _getContents, _getTitles } = this;
    const { contents, title } = this.state;
    const { 
      login, admin, user_ip,
      list_data, list_all_page, list_search, list_page, _changePage,
      _changeCatgory, user_id, _toggleModal, _getData, _getAllLike,
      data, date, like_num
    } = this.props;

    return (
        <div className='Mains'>
          <div id='Mains-left'>
            {/* 변경 전 <Route path='/' component={Category} exact/> */}

            <Category _changeCatgory={_changeCatgory} 
                      login = {login}
                      _changeState = {_changeState}
                      admin = {admin}
                      user_ip = {user_ip}
            exact />
          </div>

          <div>
            <Switch>
              <Route path='/' 
                     component={this._withProps(List, { 
                       category : this.state.category,
                       list_data : list_data,
                       list_all_page : list_all_page,
                       list_search : list_search,
                       list_page : list_page,
                       _changePage : _changePage
                      })} 
                     exact/>
            </Switch>

            <Route path='/write' 
                   component={this._withProps(Write, { 
                     _getContents : _getContents,
                     _getTitles : _getTitles,
                     contents : contents,
                     title : title
                     })} />

            <Route path='/signup' 
                   component={Signup}
            />
                   
            <Route path='/view/:data' 
             component={this._withProps(View, { 
              login : login,
              user_id : user_id,
              _toggleModal : _toggleModal,
              data : data,
              date : date,
              like_num : like_num,
              _getData : _getData,
              _getAllLike : _getAllLike
            })} />
          </div>

          <div id='Mains-right'>
            <Route path='/write'
            component={this._withProps(Right_Write, { contents : contents })} />
          </div>
        </div>
    );
  }
}

export default main;
