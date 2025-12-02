import { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from './HomeHeader/HomeHeader';
import Specialty from './Section/Speciatly/Specialty';
import About from './Section/About/About';
import HomeFooter from './HomeFooter/HomeFooter';
import HandBook from './Section/HandBook/HandBook';
import MedicalFacility from './Section/MedicalFacility/MedicalFacility';
import OutStandingDoctor from './Section/OutStandingDoctor/OutStandingDoctor';
import ChatWidget from '../../components/ChatWidget/ChatWidget';
import DiagnosisWidget from '../../components/DiagnosisWidget/DiagnosisWidget';
import './HomePage.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
class HomePage extends Component {
  render() {
    var settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
    };

    return (
      <div>
        <HomeHeader isShowBanner={true} />
        <OutStandingDoctor settings={settings} />
        <Specialty settings={settings} />
        <MedicalFacility settings={settings} />
        <HandBook settings={settings} />
        <About />
        <HomeFooter />
        <ChatWidget />
        <DiagnosisWidget />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
