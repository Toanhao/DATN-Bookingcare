import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';
import 'react-markdown-editor-lite/lib/index.css';

class TableManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersRedux: [],
    };
  }

  componentDidMount() {
    this.props.fetchUserRedux();
    // ensure roles are loaded so we can display role names in the table
    if (this.props.fetchRoleRedux) this.props.fetchRoleRedux();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.listUsers !== this.props.listUsers) {
      this.setState({
        usersRedux: this.props.listUsers,
      });
    }
  }

  handleDeleteUser = (user) => {
    this.props.deleteAUserRedux(user.id);
  };

  handleEditUser = (user) => {
    this.props.handleEditUserFromParentKey(user);
  };

  render() {
    let arrUsers = this.state.usersRedux;
    console.log('check arrUsers', arrUsers);
    return (
      <React.Fragment>
        <table id="TableManageUser">
          <tbody>
            <tr>
              <th>Email</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
            {arrUsers &&
              arrUsers.length > 0 &&
              arrUsers.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.email}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.phonenumber}</td>
                    <td>{item.address}</td>

                    <td>
                      {(() => {
                        const roles = this.props.roleRedux || [];
                        const found = roles.find(
                          (r) =>
                            r.keyMap === item.roleId ||
                            r.keyMap === (item.roleId && item.roleId.toString())
                        );
                        if (found)
                          return found.valueVi || found.valueEn || found.keyMap;
                        return item.roleId || '';
                      })()}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          this.handleEditUser(item);
                        }}
                        className="btn-edit"
                      >
                        <i className="fas fa fa-pencil-alt"></i>
                      </button>
                      <button
                        onClick={() => this.handleDeleteUser(item)}
                        className="btn-delete"
                      >
                        <i className="fas fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    listUsers: state.admin.users,
    roleRedux: state.admin.roles,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
    fetchRoleRedux: () => dispatch(actions.fetchRoleStart()),
    deleteAUserRedux: (id) => dispatch(actions.deleteAUser(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
