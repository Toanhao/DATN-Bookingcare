import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { getAllHandbook } from '../../../../services/userService';
import { withRouter } from 'react-router';

class HandBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHandbook: [],
    };
  }

  async componentDidMount() {
    let res = await getAllHandbook();
    if (res && res.errCode === 0) {
      this.setState({
        dataHandbook: res.data ? res.data : [],
      });
    }
  }

  handleViewDetailHandbook = (item) => {
    if (this.props.history) {
      this.props.history.push(`/detail-handbook/${item.id}`);
    }
  };

  render() {
    let { dataHandbook } = this.state;

    return (
      <div className="section-share section-handbook">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              {' '}
              <FormattedMessage id="homepage.handbook" />
            </span>
            <Link className="btn-section" to="/all-directory?tab=all">
              <FormattedMessage id="homepage.more-Infor" />
            </Link>
          </div>
          <div className="section-body">
            <Slider {...this.props.settings}>
              {dataHandbook &&
                dataHandbook.length > 0 &&
                dataHandbook.map((item, index) => {
                  return (
                    <div
                      className="section-customize"
                      key={index}
                      onClick={() => this.handleViewDetailHandbook(item)}
                    >
                      <div
                        className="bg-image section-handbook"
                        style={{
                          backgroundImage: `url(${item.image})`,
                        }}
                      />
                      <div>{item.title}</div>
                    </div>
                  );
                })}
            </Slider>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HandBook)
);
