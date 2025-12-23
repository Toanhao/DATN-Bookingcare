/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './DetailHandbook.scss';
import HomeHeader from '../../../HomePage/HomeHeader/HomeHeader';
import {
  getDetailHandbookById,
  getAllHandbook,
} from '../../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../../HomePage/HomeFooter/HomeFooter';

class DetailHandbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataDetailHandbook: {},
      allHandbooks: [],
    };
  }

  async componentDidMount() {
    this.fetchHandbooks();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchHandbooks();
    }
  }

  fetchHandbooks = async () => {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;

      try {
        // Fetch detail handbook
        const detailRes = await getDetailHandbookById(id);
        this.setState({
          dataDetailHandbook: detailRes?.data
            ? detailRes.data
            : detailRes || {},
        });

        // Fetch all handbooks for sidebar
        const allRes = await getAllHandbook();
        this.setState({
          allHandbooks: Array.isArray(allRes) ? allRes : allRes?.data || [],
        });
      } catch (error) {
        console.log('Error fetching handbooks:', error);
      }
    }
  };

  handleSelectHandbook = (handbookId) => {
    if (this.props.history) {
      this.props.history.push(`/detail-handbook/${handbookId}`);
    }
  };

  render() {
    let { dataDetailHandbook, allHandbooks } = this.state;
    let currentId = this.props.match?.params?.id;

    // Filter out current handbook from the list
    let otherHandbooks = allHandbooks.filter(
      (handbook) => handbook.id !== parseInt(currentId)
    );

    return (
      <div className="detail-handbook-container">
        <HomeHeader />
        <div className="detail-handbook-body">
          <div className="detail-handbook-wrapper">
            <div className="handbook-content">
              {dataDetailHandbook && !_.isEmpty(dataDetailHandbook) && (
                <div>
                  <div className="handbook-header">
                    {dataDetailHandbook.image && (
                      <div
                        className="handbook-image"
                        style={{
                          backgroundImage: `url(${dataDetailHandbook.image})`,
                        }}
                      ></div>
                    )}
                    <h1 className="handbook-title">
                      {dataDetailHandbook.title}
                    </h1>
                  </div>
                  <div
                    className="handbook-html"
                    dangerouslySetInnerHTML={{
                      __html: dataDetailHandbook.content,
                    }}
                  ></div>
                </div>
              )}
            </div>

            <div className="handbook-sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-title">Bài viết khác</h3>
                <div className="sidebar-list">
                  {otherHandbooks && otherHandbooks.length > 0 ? (
                    otherHandbooks.map((handbook, index) => (
                      <div
                        key={index}
                        className="sidebar-item"
                        onClick={() => this.handleSelectHandbook(handbook.id)}
                      >
                        <div className="sidebar-item-image">
                          {handbook.image ? (
                            <img src={handbook.image} alt={handbook.title} />
                          ) : (
                            <div className="sidebar-placeholder" />
                          )}
                        </div>
                        <div className="sidebar-item-info">
                          <h4 className="sidebar-item-title">
                            {handbook.title}
                          </h4>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">Không có bài viết khác</p>
                  )}
                </div>
              </div>
            </div>
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
