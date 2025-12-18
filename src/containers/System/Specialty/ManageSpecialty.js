import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ManageSpecialty.scss';
import MarkDownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { createNewSpecialty } from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkDownIt(/* Markdown-it options */);

class ManageSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      imageBase64: '',
      description: '',
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
      // Lưu markdown text để editor controlled đúng, backend vẫn nhận string description
      description: text,
    });
  };

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);

      this.setState({
        imageBase64: base64,
      });
    }
  };

  handleSaveNewSpecialty = async () => {
    // Validate required fields
    if (!this.state.name || !this.state.name.trim()) {
      toast.error('Vui lòng nhập tên chuyên khoa');
      return;
    }
    if (!this.state.imageBase64) {
      toast.error('Vui lòng chọn ảnh chuyên khoa');
      return;
    }
    if (!this.state.description || !this.state.description.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    const payload = {
      name: this.state.name,
      image: this.state.imageBase64,
      description: this.state.description,
    };

    let res = await createNewSpecialty(payload);
    if (res && (res.success === true || res.errCode === 0)) {
      toast.success('Thêm chuyên khoa mới thành công!');
      this.setState({
        name: '',
        imageBase64: '',
        description: '',
      });
    } else {
      toast.error('Thêm chuyên khoa mới thất bại!');
      console.log('check res', res);
    }
  };

  render() {
    return (
      <div className="manage-specialty-container">
        <div className="ms-title">Quản lý chuyên khoa</div>
        <div className="add-new-specialty row">
          <div className="col-6 form-group">
            <label>Tên chuyên khoa</label>
            <input
              className="form-control"
              type="text"
              value={this.state.name}
              onChange={(event) => this.handleOnChangeInput(event, 'name')}
            />
          </div>
          <div className="col-6 form-group">
            <label>Ảnh chuyên khoa</label>
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
              value={this.state.description}
            />
          </div>
          <div className="col-12">
            <button
              className="btn-save-specialty"
              onClick={() => this.handleSaveNewSpecialty()}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty);
