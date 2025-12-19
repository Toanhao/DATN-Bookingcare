import { Component } from 'react';
import { connect } from 'react-redux';
import './ManageClinic.scss';
import MarkDownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { createNewClinic } from '../../../services/userService';
import { toast } from 'react-toastify';

const mdParser = new MarkDownIt(/* Markdown-it options */);

class ManageClinic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      address: '',
      imageBase64: '',
      descriptionMarkdown: '',
      descriptionHTML: '',
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
      descriptionMarkdown: text,
      descriptionHTML: html,
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

  handleSaveNewClinic = async () => {
    // Validate required fields
    if (!this.state.name || !this.state.name.trim()) {
      toast.error('Vui lòng nhập tên phòng khám');
      return;
    }
    if (!this.state.address || !this.state.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ phòng khám');
      return;
    }
    if (!this.state.imageBase64) {
      toast.error('Vui lòng chọn ảnh phòng khám');
      return;
    }
    if (!this.state.descriptionHTML || !this.state.descriptionHTML.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    const data = {
      name: this.state.name,
      address: this.state.address,
      image: this.state.imageBase64,
      description: this.state.descriptionHTML,
    };

    try {
      let res = await createNewClinic(data);
      if (res && res.id) {
        toast.success('Thêm một cơ sở y tế mới thành công!');
        this.setState({
          name: '',
          imageBase64: '',
          address: '',
          descriptionMarkdown: '',
          descriptionHTML: '',
        });
      } else {
        toast.error('Thêm một cơ sở y tế mới thất bại!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm một cơ sở y tế mới thất bại!');
    }
  };

  render() {
    return (
      <div className="manage-specialty-container">
        <div className="ms-title">Quản lý phòng khám</div>
        <div className="add-new-specialty row">
          <div className="col-6 form-group">
            <label>Tên phòng khám</label>
            <input
              className="form-control"
              type="text"
              value={this.state.name}
              onChange={(event) => this.handleOnChangeInput(event, 'name')}
            />
          </div>

          <div className="col-6 form-group">
            <label>Địa chỉ phòng khám</label>
            <input
              className="form-control"
              type="text"
              value={this.state.address}
              onChange={(event) => this.handleOnChangeInput(event, 'address')}
            />
          </div>

          <div className="col-6 form-group">
            <label>Ảnh phòng khám</label>
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
              value={this.state.descriptionMarkdown}
            />
          </div>
          <div className="col-12">
            <button
              className="btn-save-specialty"
              onClick={() => this.handleSaveNewClinic()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageClinic);
