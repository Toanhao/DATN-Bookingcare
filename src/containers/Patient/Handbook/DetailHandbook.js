/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './DetailHandbook.scss';
import HomeHeader from '../../HomePage/HomeHeader/HomeHeader';
import { getDetailHandbookById } from '../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../HomePage/HomeFooter/HomeFooter';

class DetailHandbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataDetailHandbook: {},
    };
  }

  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      let res = await getDetailHandbookById(id);

      if (res && res.errCode === 0) {
        this.setState({
          dataDetailHandbook: res.data ? res.data : {},
        });
      }
    }
  }

  render() {
    let { dataDetailHandbook } = this.state;

    return (
      <div className="detail-handbook-container">
        <HomeHeader />
        <div className="detail-handbook-body">
          <div className="handbook-content">
            {dataDetailHandbook && !_.isEmpty(dataDetailHandbook) && (
              <div>
                <div className="handbook-header">
                  <div
                    className="handbook-image"
                    style={{
                      backgroundImage: `url(${dataDetailHandbook.image})`,
                    }}
                  ></div>
                  <h1 className="handbook-title">{dataDetailHandbook.name}</h1>
                </div>
                <div
                  className="handbook-html"
                  dangerouslySetInnerHTML={{
                    __html: dataDetailHandbook.descriptionHTML,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailHandbook);
