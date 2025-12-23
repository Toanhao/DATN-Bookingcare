import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ManageHandbook.scss';
import MarkDownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../../utils';
import { createNewHandbook } from '../../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkDownIt(/* Markdown-it options */);

class ManageHandbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      imageBase64: '',
      contentHTML: '',
      contentMarkdown: '',
    };
  }

  async componentDidMount() {}

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
    }
  }

  handleOnChangeInput = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    this.setState({
      ...stateCopy,
    });
  };

  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentHTML: html,
      contentMarkdown: text,
    });
  };

  handleOnChangeImage = async (event) => {
    const data = event.target.files;
    const file = data?.[0];
    if (file) {
      const base64 = await CommonUtils.getBase64(file);
      this.setState({ imageBase64: base64 });
    }
  };

  handleSaveNewHandbook = async () => {
    const { userInfo } = this.props;
    const doctorId = userInfo?.id;

    if (!doctorId || userInfo?.role !== 'DOCTOR') {
      toast.error('Vui lòng đăng nhập bằng tài khoản bác sĩ để tạo bài viết');
      return;
    }

    if (!this.state.title || !this.state.contentHTML || !this.state.imageBase64) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề, ảnh và nội dung');
      return;
    }

    try {
      const res = await createNewHandbook({
        title: this.state.title,
        content: this.state.contentHTML,
        image: this.state.imageBase64,
        doctorId,
      });

      if (res && res.id) {
        toast.success('Thêm bài viết mới thành công');
        this.setState({
          title: '',
          imageBase64: '',
          contentHTML: '',
          contentMarkdown: '',
        });
        return;
      }

      toast.error('Thêm bài viết mới thất bại!');
    } catch (error) {
      const message = error?.message || 'Thêm bài viết mới thất bại!';
      toast.error(message);
    }
  };

  render() {
    return (
      <div className="manage-handbook-container">
        <div className="ms-title">Quản lý bài viết</div>
        <div className="add-new-handbook row">
          <div className="col-6 form-group">
            <label>Tên bài viết</label>
            <input
              className="form-control"
              type="text"
              value={this.state.title}
              onChange={(event) => this.handleOnChangeInput(event, 'title')}
            />
          </div>
          <div className="col-6 form-group">
            <label>Ảnh bài viết</label>
            <input
              className="form-control-file"
              type="file"
              onChange={(event) => this.handleOnChangeImage(event)}
            />
          </div>
          <div className="col-12">
            <MdEditor
              style={{ height: '300px' }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={this.handleEditorChange}
              value={this.state.contentMarkdown}
            />
          </div>
          <div className="col-12">
            <button
              className="btn-save-handbook"
              onClick={() => this.handleSaveNewHandbook()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageHandbook);
