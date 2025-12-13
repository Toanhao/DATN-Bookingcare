import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import HomeFooter from '../../HomePage/HomeFooter/HomeFooter';
class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {},
      currentDoctorId: -1,
      // fake social data (local only until BE available)
      likesCount: 42,
      userLiked: false,
      ratingAvg: 4.2,
      ratingCount: 10,
      lastRated: 0,
      comments: [
        {
          id: 1,
          user: 'Nguyen A',
          text: 'Bác sĩ rất tận tâm',
          date: '2025-01-01',
        },
      ],
      newComment: '',
    };
  }

  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.setState({
        currentDoctorId: id,
      });
      let res = await getDetailInforDoctor(id);
      if (res && res.errCode === 0) {
        this.setState({
          detailDoctor: res.data,
        });
      }
    }
  }

  handleToggleLike = () => {
    this.setState((prev) => {
      const userLiked = !prev.userLiked;
      const likesCount = userLiked ? prev.likesCount + 1 : prev.likesCount - 1;
      return { userLiked, likesCount };
    });
  };

  handleRate = (value) => {
    this.setState((prev) => {
      const newCount = prev.ratingCount + 1;
      const newAvg = (prev.ratingAvg * prev.ratingCount + value) / newCount;
      return {
        ratingAvg: parseFloat(newAvg.toFixed(2)),
        ratingCount: newCount,
        lastRated: value,
      };
    });
  };

  handleCommentChange = (e) => {
    this.setState({ newComment: e.target.value });
  };

  handleSubmitComment = () => {
    const { newComment } = this.state;
    if (!newComment || !newComment.trim()) return;
    const newC = {
      id: Date.now(),
      user: 'Bạn',
      text: newComment.trim(),
      date: new Date().toISOString(),
    };
    this.setState((prev) => ({
      comments: [...prev.comments, newC],
      newComment: '',
    }));
  };

  handleToggleCommentLike = (commentId) => {
    this.setState((prev) => ({
      comments: prev.comments.map((c) => {
        if (c.id === commentId) {
          const likedByUser = !c.likedByUser;
          const likesCount = likedByUser
            ? (c.likesCount || 0) + 1
            : (c.likesCount || 0) - 1;
          return { ...c, likedByUser, likesCount };
        }
        return c;
      }),
    }));
  };

  handleStartReply = (commentId) => {
    this.setState({ replyingToId: commentId, replyText: '' });
  };

  handleReplyChange = (e) => {
    this.setState({ replyText: e.target.value });
  };

  handleSubmitReply = (commentId) => {
    const { replyText } = this.state;
    if (!replyText || !replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      user: 'Bạn',
      text: replyText.trim(),
      date: new Date().toISOString(),
      likesCount: 0,
      likedByUser: false,
    };
    this.setState((prev) => ({
      comments: prev.comments.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c
      ),
      replyingToId: null,
      replyText: '',
    }));
  };

  handleToggleReplyLike = (commentId, replyId) => {
    this.setState((prev) => ({
      comments: prev.comments.map((c) => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          replies: (c.replies || []).map((r) => {
            if (r.id !== replyId) return r;
            const likedByUser = !r.likedByUser;
            const likesCount = likedByUser
              ? (r.likesCount || 0) + 1
              : (r.likesCount || 0) - 1;
            return { ...r, likedByUser, likesCount };
          }),
        };
      }),
    }));
  };

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    let { detailDoctor } = this.state;
    let { language } = this.props;
    let name = `${detailDoctor.lastName} ${detailDoctor.firstName}`;
    let nameVi = '';
    let nameEn = '';
    if (detailDoctor && detailDoctor.positionData) {
      nameVi = `${detailDoctor.positionData.valueVi}, ${name}`;
      nameEn = `${detailDoctor.positionData.valueEn}, ${name}`;
    }
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="doctor-detail-container">
          <div className="intro-doctor">
            <div
              className="content-left"
              style={{
                backgroundImage: `url(${
                  detailDoctor && detailDoctor.image ? detailDoctor.image : ''
                })`,
              }}
            ></div>
            <div className="content-right">
              <div className="up">
                {language === LANGUAGES.VI ? nameVi : nameEn}
              </div>
              <div className="meta-actions" style={{ marginTop: 8 }}>
                <button
                  className={`btn-like ${this.state.userLiked ? 'liked' : ''}`}
                  onClick={this.handleToggleLike}
                >
                  <i className="fas fa-thumbs-up"></i> ({this.state.likesCount})
                </button>
                <span style={{ marginLeft: 12 }}>
                  Rating: {this.state.ratingAvg} / 5{' '}
                  <i class="fas fa-star rating"></i> ({this.state.ratingCount})
                </span>
                <div style={{ marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      className={
                        'star-button' +
                        (this.state.lastRated >= i ? ' active' : '')
                      }
                      style={{ marginRight: 6 }}
                      onClick={() => this.handleRate(i)}
                      aria-label={`Rate ${i}`}
                    >
                      {i}★
                    </button>
                  ))}
                </div>
              </div>
              <div className="down">
                {detailDoctor &&
                  detailDoctor.Doctor_Info &&
                  detailDoctor.Doctor_Info.description && (
                    <span>{detailDoctor.Doctor_Info.description}</span>
                  )}
              </div>
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
            <div className="content-right">
              <DoctorExtraInfor
                doctorIdFromParent={this.state.currentDoctorId}
              />
            </div>
          </div>

          <div className="detail-Infor-doctor">
            {detailDoctor &&
              detailDoctor.Doctor_Info &&
              detailDoctor.Doctor_Info.descriptionHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctor.Doctor_Info.descriptionHTML,
                  }}
                ></div>
              )}
          </div>

          {/* comments for clinic */}
          <div className="clinic-comments" style={{ padding: 12 }}>
            <h4>Bình luận về phòng khám</h4>
            <div className="comment-list">
              {this.state.comments.map((c) => (
                <div
                  key={c.id}
                  className="comment-item"
                  style={{ marginBottom: 12 }}
                >
                  <div className="comment-head">
                    <strong>{c.user}</strong>
                    <small
                      className="comment-date"
                      style={{ marginLeft: 8, color: '#666' }}
                    >
                      {new Date(c.date).toLocaleString()}
                    </small>
                  </div>
                  <div className="comment-body" style={{ marginTop: 6 }}>
                    {c.text}
                  </div>
                  <div className="comment-actions" style={{ marginTop: 6 }}>
                    <button
                      className={`btn-like ${c.likedByUser ? 'liked' : ''}`}
                      onClick={() => this.handleToggleCommentLike(c.id)}
                    >
                      {/* {c.likedByUser ? 'Unlike' : 'Like'} ({c.likesCount || 0}){' '} */}
                      <i className="fas fa-thumbs-up"></i> {c.likesCount || 0}
                    </button>
                    <button
                      className="btn-reply"
                      style={{ marginLeft: 8 }}
                      onClick={() => this.handleStartReply(c.id)}
                    >
                      Trả lời <i className="fas fa-reply"></i>
                    </button>
                  </div>

                  {/* replies */}
                  <div
                    className="replies"
                    style={{ marginTop: 8, paddingLeft: 12 }}
                  >
                    {c.replies &&
                      c.replies.map((r) => (
                        <div
                          key={r.id}
                          className="reply-item"
                          style={{ marginBottom: 8 }}
                        >
                          <div className="reply-head">
                            <strong>{r.user}</strong>{' '}
                            <small style={{ marginLeft: 8, color: '#666' }}>
                              {new Date(r.date).toLocaleString()}
                            </small>
                          </div>
                          <div className="reply-body" style={{ marginTop: 4 }}>
                            {r.text}
                          </div>
                          <div
                            className="reply-actions"
                            style={{ marginTop: 4 }}
                          >
                            <button
                              className={`btn-like ${
                                r.likedByUser ? 'liked' : ''
                              }`}
                              onClick={() =>
                                this.handleToggleReplyLike(c.id, r.id)
                              }
                            >
                              <i className="fas fa-thumbs-up"></i>{' '}
                              {r.likesCount || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* reply box */}
                  {this.state.replyingToId === c.id && (
                    <div className="reply-box" style={{ marginTop: 8 }}>
                      <textarea
                        value={this.state.replyText}
                        onChange={this.handleReplyChange}
                        placeholder="Viết trả lời..."
                        style={{ width: '100%', minHeight: 60 }}
                      />
                      <div style={{ textAlign: 'right', marginTop: 6 }}>
                        <button onClick={() => this.handleSubmitReply(c.id)}>
                          Gửi trả lời <i class="fas fa-paper-plane"></i>
                        </button>
                        <button
                          style={{ marginLeft: 8 }}
                          onClick={() =>
                            this.setState({ replyingToId: null, replyText: '' })
                          }
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="new-comment" style={{ marginTop: 12 }}>
              <textarea
                value={this.state.newComment}
                onChange={this.handleCommentChange}
                placeholder="Viết bình luận..."
                style={{ width: '100%', minHeight: 80 }}
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button onClick={this.handleSubmitComment}>
                  Gửi bình luận <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
          <HomeFooter />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
