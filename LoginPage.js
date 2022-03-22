import React, {Component, Fragment} from 'react';
import * as WebBrowser              from 'expo-web-browser';
import {connect}                    from 'react-redux';

import {
  Platform,
  Keyboard,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView, StatusBar, Image
}                                            from 'react-native';
import {ButtonAnim}                          from "../Views/buttons";
import styles                                from '../Inc/styles'
import LoadingView                           from "../Views/LoadingView";
import {FadeAnim, NotifyAnim, TranslateAnim} from "../Views/Animations";

import Fetch        from "../Inc/Fetch";
import {aStoreUser} from "../Inc/actions";

const PAGES = {
  LOGIN_PHONE: 0,
  LOGIN_PHONE_DIGITS: 1,
  PROVIDE_EMAIL: 2,
  SELECT_ACCOUNT: 3,
  LOGIN_EMAIL: 4
}

const MESSAGES = {
  LOGIN_PHONE: 'Войдите с помощью телефона:',
  LOGIN_PHONE_BTN: 'Войти по Email',
  LOGIN_PHONE_DIGITS: 'Введите цифры позвонившего номера:',
  PROVIDE_EMAIL: 'Пожалуйста, укажите свой Email и имя:',
  SELECT_ACCOUNT: 'Выберите аккаунт:',
  LOGIN_EMAIL: 'Войдите с помощью Email:',
  LOGIN_EMAIL_BTN: 'Войти по телефону',
}

const beginColor = 'rgb(246,220,52)'
const endColor = 'rgb(135,225,169)'

class LoginPage extends Component {

  phoneInputRef = React.createRef();
  emailInputRef = React.createRef();
  passwordInputRef = React.createRef();
  emailNameInputRef = React.createRef();
  emailNameNameInputRef = React.createRef();

  d1Ref = React.createRef();
  d2Ref = React.createRef();
  d3Ref = React.createRef();
  d4Ref = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      // phone: '9777332700', //my
      // phone: '9265717236', // cri
      phone: '',
      // digits: '1234',
      digits: '',
      email: '',
      password: '',
      emailName: '',
      emailNameName: '',

      fetchedLogins: null,
      selectedLogin: null,

      fetchLoading: false,

      notifyMessage: '',
      notifysubmit: false,
      notifyError: false,

      currentPage: PAGES.LOGIN_PHONE,
      message: MESSAGES.LOGIN_PHONE,
      loginButtonText: MESSAGES.LOGIN_PHONE_BTN,

      phoneVisible: true,
      digitsVisible: false,
      selectAccountVisible: false,
      emailNameVisible: false,
      loginVisible: false,

    };

    this.firstLoad = false;

    this.modalDelay = 200;
    this.modalDelayDefault = 200;
    if(this.props.modalWindow && Platform.OS === 'ios')
      this.modalDelay = 800;

    this.Fetch = null;

    this.submitPressed = this.submitPressed.bind(this);

    this.windowWidth = Dimensions.get('window').width;
    this.windowHeight = Dimensions.get('window').height;

  }

  componentDidMount() {
    this.firstLoad = true;

    // todo: check cookie is valid. Got login stuck with expired cookie.
    this.Fetch.getCookie().then((_cookie) => {
      if(_cookie !== '' && _cookie !== undefined) {
        if(this.Fetch) {
          this.setState({fetchLoading: true}, () => {
            this.Fetch.AuthorizeByCookie(_cookie, this.LoginSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
          })
        }
      }
    });

  }

  inputs = () => {
    return [
      this.phoneInputRef,
      this.emailInputRef,
      this.passwordInputRef,

      this.d1Ref,
      this.d2Ref,
      this.d3Ref,
      this.d4Ref,

      this.emailNameInputRef,
      this.emailNameNameInputRef,
    ];
  };

  editNextInput = () => {
    const activeIndex = this.getActiveInputIndex();
    if(activeIndex === -1) {
      return;
    }

    const nextIndex = activeIndex + 1;
    if(nextIndex < this.inputs().length && this.inputs()[nextIndex].current != null) {
      this.setFocus(this.inputs()[nextIndex], true);
    } else {
      this.finishEditing();
    }
  }

  onInputDigitsFocus = () => {
    const activeIndex = this.getActiveInputIndex();
    this.setState({
      activeIndex: this.getActiveInputIndex(),
    });
  }

  onInputFocus = () => {
    this.setState({
      activeIndex: this.getActiveInputIndex(),
    });
  }

  onChangeInputHandler = (text, name) => {
    const activeIndex = this.getActiveInputIndex();
    // console.log(activeIndex)
    this.setState({
      [name]: text,
    });
  }

  onChangeInputDigitsHandler = (text, name) => {
    const activeIndex = this.getActiveInputIndex();
    this.setState({
      [name]: text,
    });
    if(activeIndex <= 5)
      this.setFocus(this.inputs()[activeIndex + 1], true)
    else
      Keyboard.dismiss();
  }

  getActiveInputIndex = () => {
    const activeIndex = this.inputs().findIndex((input) => {
      if(input.current == null) {
        return false;
      }
      // console.log("input: ", input);
      return input.current.isFocused();
    });
    // console.log("activeIndex: ", activeIndex);
    return activeIndex;
  }

  finishEditing = () => {
    const activeIndex = this.getActiveInputIndex();
    if(activeIndex === -1) {
      return;
    }
    this.setFocus(this.inputs()[activeIndex], false);
  }

  setFocus(textInputRef, shouldFocus) {
    if(shouldFocus) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 100);
    } else {
      textInputRef.current.blur();
    }
  }

  submitPressed() {
    this.setState({
      showEmailError: this.state.email.length < 4,
      showPasswordError: this.state.password.length < 4,
    });
    Keyboard.dismiss();
  }

  phoneInputs() {
    return (
      <TranslateAnim
        value={this.state.phoneVisible}
        delay={!this.firstLoad ? this.modalDelay : this.modalDelayDefault}
      >
        <View style={styles.login_inputTextWrapper}>
          <TextInput
            placeholder="+7(999) 999-99-99"
            placeholderTextColor={"#CCC"}
            keyboardType="phone-pad"
            style={[
              styles.textBold,
              styles.login_textInput,
              this.state.fetchLoading ? styles.inputLoading : {}
            ]}
            returnKeyType="send"
            onSubmitEditing={this.editNextInput}
            onFocus={this.onInputFocus}
            onChangeText={(text) => this.onChangeInputHandler(text, 'phone')}
            ref={this.phoneInputRef}
          />
          {this.state.showEmailError &&
          <Text style={styles.login_errorText}>Please enter your email address.</Text>
          }
        </View>
      </TranslateAnim>
    )
  }

  selectAccountInputs() {
    if(!this.state.fetchedLogins)
      return;

    let loginsOut = [];
    this.state.fetchedLogins.forEach(login => {
      loginsOut.push(
        <TouchableOpacity
          key={login.email}
          activeOpacity={0.6}
          onPress={() => {
            this.setState({
              selectedLogin: login
            })
          }}>
          <View style={[
            {
              paddingHorizontal: 15,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#fff',
              backgroundColor: 'transparent',
              borderRadius: 10,
              marginBottom: 10
            },
            this.state.selectedLogin && this.state.selectedLogin.id === login.id ? {backgroundColor: '#fff'} : {}
          ]}>
            <Text style={[
              styles.textBold,
              styles.fontSize14
            ]}>{login.email}</Text>
          </View>
        </TouchableOpacity>
      )
    });

    return (
      <TranslateAnim
        value={this.state.selectAccountVisible}
        delay={!this.firstLoad ? this.modalDelay : this.modalDelayDefault}
        style={{marginBottom: 15}}
      >
        {loginsOut}
      </TranslateAnim>
    )
  }

  digitsInputs() {
    return (
      <TranslateAnim
        value={this.state.digitsVisible}
      >
        <View style={[
          styles.row,
          {
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>

          <View style={[
            styles.login_inputTextWrapper,
            {marginRight: 10}
          ]}>
            <TextInput
              placeholder="9"
              keyboardType="numeric"
              maxLength={1}
              placeholderTextColor={"#fff"}
              style={[
                styles.textBold,
                styles.login_textInput,
                styles.textCenter,
                this.state.fetchLoading ? styles.inputLoading : {},
                {width: 35}
              ]}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={this.editNextInput}
              onFocus={this.onInputDigitsFocus}
              onChangeText={(text) => this.onChangeInputDigitsHandler(text, 'd1')}

              ref={this.d1Ref}
            />
          </View>

          <View style={[
            styles.login_inputTextWrapper,
            {marginRight: 10}
          ]}>
            <TextInput
              placeholder="9"
              keyboardType="numeric"
              maxLength={1}
              placeholderTextColor={"#fff"}
              style={[
                styles.textBold,
                styles.login_textInput,
                styles.textCenter,
                this.state.fetchLoading ? styles.inputLoading : {},
                {width: 35}
              ]}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={this.editNextInput}
              onFocus={this.onInputDigitsFocus}
              onChangeText={(text) => this.onChangeInputDigitsHandler(text, 'd2')}
              ref={this.d2Ref}
            />
          </View>

          <View style={[
            styles.login_inputTextWrapper,
            {marginRight: 10}
          ]}>
            <TextInput
              placeholder="9"
              keyboardType="numeric"
              maxLength={1}
              placeholderTextColor={"#fff"}
              style={[
                styles.textBold,
                styles.login_textInput,
                styles.textCenter,
                this.state.fetchLoading ? styles.inputLoading : {},
                {width: 35}
              ]}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={this.editNextInput}
              onFocus={this.onInputDigitsFocus}
              onChangeText={(text) => this.onChangeInputDigitsHandler(text, 'd3')}
              ref={this.d3Ref}
            />
          </View>

          <View style={[
            styles.login_inputTextWrapper,
            {marginRight: 0}
          ]}>
            <TextInput
              placeholder="9"
              keyboardType="numeric"
              maxLength={1}
              placeholderTextColor={"#fff"}
              style={[
                styles.textBold,
                styles.login_textInput,
                styles.textCenter,
                this.state.fetchLoading ? styles.inputLoading : {},
                {width: 35}
              ]}
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={this.editNextInput}
              onFocus={this.onInputDigitsFocus}
              onChangeText={(text) => this.onChangeInputDigitsHandler(text, 'd4')}
              ref={this.d4Ref}
            />
          </View>

        </View>
      </TranslateAnim>
    )
  }

  emailNameInputs() {
    return (
      <TranslateAnim
        value={this.state.emailNameVisible}
      >
        <View style={styles.login_inputTextWrapper}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={"#CCC"}
            style={[
              styles.textBold,
              styles.login_textInput,
              this.state.fetchLoading ? styles.inputLoading : {},
            ]}
            returnKeyType="done"
            onSubmitEditing={this.editNextInput}
            onFocus={this.onInputFocus}
            onChangeText={(text) => this.onChangeInputHandler(text, 'emailName')}
            ref={this.emailNameInputRef}
          />
        </View>

        <View style={styles.login_inputTextWrapper}>
          <TextInput
            placeholder="Имя"
            placeholderTextColor={"#CCC"}
            style={[
              styles.textBold,
              styles.login_textInput,
              this.state.fetchLoading ? styles.inputLoading : {},
            ]}
            returnKeyType="done"
            onSubmitEditing={this.editNextInput}
            onFocus={this.onInputFocus}
            onChangeText={(text) => this.onChangeInputHandler(text, 'emailNameName')}
            ref={this.emailNameNameInputRef}
          />
        </View>
      </TranslateAnim>
    )
  }

  emailInputs() {
    return (
      <TranslateAnim
        value={this.state.loginVisible}
      >
        <View style={styles.login_inputTextWrapper}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={"#CCC"}
            style={[
              styles.textBold,
              styles.login_textInput,
              this.state.fetchLoading ? styles.inputLoading : {},
            ]}
            returnKeyType="done"
            onSubmitEditing={this.editNextInput}
            onFocus={this.onInputFocus}
            onChangeText={(text) => this.onChangeInputHandler(text, 'email')}
            ref={this.emailInputRef}
          />
        </View>

        <View style={styles.login_inputTextWrapper}>
          <TextInput
            placeholder="Пароль"
            placeholderTextColor={"#CCC"}
            secureTextEntry={true}
            style={[
              styles.textBold,
              styles.login_textInput,
              this.state.fetchLoading ? styles.inputLoading : {},
            ]}
            returnKeyType="done"
            onSubmitEditing={this.editNextInput}
            onFocus={this.onInputFocus}
            onChangeText={(text) => this.onChangeInputHandler(text, 'password')}
            ref={this.passwordInputRef}
          />
        </View>
      </TranslateAnim>
    )
  }

  setDigits() {
    this.setState({
      phoneVisible: false,
      digitsVisible: true,
      selectAccountVisible: false,
      emailNameVisible: false,
      loginVisible: false,
      message: MESSAGES.LOGIN_PHONE_DIGITS,
      currentPage: PAGES.LOGIN_PHONE_DIGITS,
      d1: '',
      d2: '',
      d3: '',
      d4: '',
    })
  }

  setEmailName() {
    this.setState({
      phoneVisible: false,
      digitsVisible: false,
      selectAccountVisible: false,
      emailNameVisible: true,
      loginVisible: false,
      message: MESSAGES.PROVIDE_EMAIL,
      currentPage: PAGES.PROVIDE_EMAIL,
      d1: '',
      d2: '',
      d3: '',
      d4: ''
    })
  }

  setSelectAccount() {
    this.setState({
      phoneVisible: false,
      digitsVisible: false,
      selectAccountVisible: true,
      emailNameVisible: false,
      loginVisible: false,
      message: MESSAGES.SELECT_ACCOUNT,
      currentPage: PAGES.SELECT_ACCOUNT,
    })
  }

  setLoginEmail() {
    this.setState({
      phoneVisible: false,
      digitsVisible: false,
      selectAccountVisible: false,
      emailNameVisible: false,
      loginVisible: true,
      message: MESSAGES.LOGIN_EMAIL,
      loginButtonText: MESSAGES.LOGIN_EMAIL_BTN,
      currentPage: PAGES.LOGIN_EMAIL,
      phone: '',
      email: '',
      password: ''
    })
  }

  setPhone() {
    this.setState({
      phoneVisible: true,
      digitsVisible: false,
      selectAccountVisible: false,
      emailNameVisible: false,
      loginVisible: false,
      message: MESSAGES.LOGIN_PHONE,
      loginButtonText: MESSAGES.LOGIN_PHONE_BTN,
      currentPage: PAGES.LOGIN_PHONE,
      phone: '',
      email: '',
      password: ''
    })
  }

  dispatchError = (message) => {
    this.setState({
      notifyMessage: message,
      notifyError: true,
      notifySubmit: !this.state.notifySubmit
    });
  }

  toast = (message, error = false) => {
    if(error) {
      this.dispatchError(message);
      return;
    }
    this.setState({
      notifyMessage: message,
      notifyError: false,
      notifySubmit: !this.state.notifySubmit
    });
  }

  formSubmit = () => {
    if(this.state.fetchLoading)
      return;

    switch(this.state.currentPage) {
      case PAGES.LOGIN_PHONE: {
        if(this.state.phone === '') {
          this.dispatchError('Пожалуйста, введите свой Телефон');
          break;
        }

        this.setState({fetchLoading: true}, () => {
          this.Fetch.AuthorizeByPhone(this.state.phone, this.PhoneSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
        });
        break;
      }
      case PAGES.LOGIN_PHONE_DIGITS: {
        // if(!this.state.d1 || !this.state.d2 || !this.state.d3 || !this.state.d4){
        //   this.dispatchError('Пожалуйста, введите 4 цифры позвонившего номера');
        //   break;
        // }

        let digits = this.state.d1 + this.state.d2 + this.state.d3 + this.state.d4;
        // let digits = this.state.digits;

        this.setState({fetchLoading: true}, () => {
          this.Fetch.AuthorizeByDigits(this.state.phone, digits, this.DigitsSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
        });
        break;
      }
      case PAGES.SELECT_ACCOUNT: {
        if(!this.state.selectedLogin) {
          this.dispatchError('Пожалуйста, выберите аккаунт');
          break;
        }
        this.setState({fetchLoading: true}, () => {
          this.Fetch.AuthorizeBySelectAccount(this.state.selectedLogin.id, this.SelectAccountSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
        });
        break;
      }
      case PAGES.PROVIDE_EMAIL: {
        if(this.state.emailName === '') {
          this.dispatchError('Пожалуйста, укажите своей Email');
          break;
        }

        this.setState({fetchLoading: true}, () => {
          this.Fetch.RegisterEmail(this.state.emailName, this.state.emailNameName, this.SelectAccountSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
        });
        break;
      }

      case PAGES.LOGIN_EMAIL:
        if(this.state.email === '') {
          this.dispatchError('Пожалуйста, введите свой Email');
          break;
        }
        if(this.state.password === '') {
          this.dispatchError('Пожалуйста, введите свой пароль');
          break;
        }
        this.setState({fetchLoading: true}, () => {
          this.Fetch.AuthorizeUser(this.state.email, this.state.password, this.LoginSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
        })

        break;
    }
  }

  async PhoneSuccessfulToProps(message) {
    if(message)
      this.toast(message);
    this.setState({fetchLoading: false})
    this.setDigits();
  }
  async DigitsSuccessfulToProps(status, fetchedLogins, message) {
    if(status === 'show_email_name') {
      if(message)
        this.toast(message);

      this.setState({
        fetchLoading: false,
      })
      this.setEmailName();
    } else {
      if(fetchedLogins.length === 1) {
        this.Fetch.AuthorizeBySelectAccount(fetchedLogins[0].id, this.SelectAccountSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
      } else {
        if(message)
          this.toast(message);
        this.setState({
          fetchLoading: false,
          fetchedLogins: fetchedLogins
        })
        this.setSelectAccount();
      }
    }
  }

  async SelectAccountSuccessfulToProps(cookie, message) {
    // if(message)
    //   this.toast(message);
    this.Fetch.AuthorizeByCookie(cookie, this.LoginSuccessfulToProps.bind(this), this.LoginFailedToProps.bind(this));
  }

  async LoginSuccessfulToProps(result) {
    this.setState({fetchLoading: false}, async() => {
      if(result.user && result.cookie) {
        this.toast('Успешная авторизация')

        await new Promise(r => setTimeout(r, 1500));

        if(this.props.userLoggedToProps)
          this.props.userLoggedToProps()
        if(this.props.loginPopup)
          this.props.closeFunc();
        else
          this.props.navigation.navigate('MainTabs')

        this.setPhone();
      } else {
        this.LoginFailedToProps();
      }

    })
  }

  LoginFailedToProps(errorMessage) {
    if(errorMessage)
      this.dispatchError(errorMessage);
    this.setState({fetchLoading: false})
  }


  render() {
    return (
      <Fragment>
        {/*<KeyboardAwareScrollView*/}
        {/*style={[styles.container, {backgroundColor: '#FAEA85'}]}*/}
        {/*contentOffset={{*/}
        {/*x: 0,*/}
        {/*y: 24*/}
        {/*}}*/}
        {/*ref={this._scrollViewRef}*/}
        {/*scrollEventThrottle={16}*/}
        {/*contentContainerStyle={{*/}
        {/*padding: 0,*/}
        {/*flex: 1*/}
        {/*}}*/}
        {/*contentInsetAdjustmentBehavior="always"*/}
        {/*keyboardShouldPersistTaps="handled"*/}
        {/*keyboardDismissMode="on-drag"*/}
        {/*enableOnAndroid={true}*/}
        {/*extraHeight={32}*/}
        {/*extraScrollHeight={Platform.OS == "android" ? 32 : 0}*/}
        {/*enableResetScrollToCoords={false}*/}
        {/*// onKeyboardDidShow={this._keyboardDidShowHandler}*/}
        {/*style={{padding: 0}}*/}
        {/*>*/}
        <View style={[
          styles.login_container,
          {
            paddingTop: 20,
            paddingBottom: 20
          }
        ]}
        >
          <StatusBar
            animated={true}
            backgroundColor="#fff"
            barStyle="dark-content"
            hidden={false}
            // showHideTransition={statusBarTransition}
          />
          <ScrollView style={{paddingBottom: 20}}>

            <Fetch
              onRef={ref => (this.Fetch = ref)}
              TestServer={this.props.TestServer}
            />
            {
              <NotifyAnim
                value={this.state.notifyMessage}
                error={this.state.notifyError}
                notifyMessage={this.state.notifyMessage}
                submit={this.state.notifySubmit}
                offset={-90}
                translateDuration={250}
                fadeDuration={250}
                // noFadeOnExit = {true}
                easingLinear={true}

              />
            }
            <View>
              {
                this.state.fetchLoading &&
                <LoadingView
                  style={{
                    justifyContent: 'flex-start',
                    paddingTop: 35,
                    backgroundColor: 'transparent',
                    zIndex: 10
                  }}
                  activityIndicatorColor={'#fff'}
                />
              }

              <View style={{
                marginHorizontal: '10%'
              }}>

                <View style={[
                  styles.sStretch,
                  styles.aCenter,
                  styles.mt5,
                  styles.mb5
                ]}>
                  <Image
                    style={{
                      width: 150,
                      height: 150,
                      resizeMode: 'contain',
                      opacity: 1,
                      marginRight: 10
                    }}
                    source={require('../img/eatandtrain_logo.png')}
                  />
                </View>

                <View style={styles.mb15}>
                  <FadeAnim
                    value={this.state.message}
                  >
                    <Text style={styles.fontSize14}>{this.state.message}</Text>
                  </FadeAnim>
                </View>

                <View
                >

                  {this.state.phoneVisible && this.phoneInputs()}

                  {this.state.digitsVisible && this.digitsInputs()}

                  {this.state.selectAccountVisible && this.selectAccountInputs()}

                  {this.state.emailNameVisible && this.emailNameInputs()}

                  {this.state.loginVisible && this.emailInputs()}

                </View>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  justifyContent: 'center'
                }}>
                  {this.state.digitsVisible &&
                  <ButtonAnim
                    title="Назад"

                    onPress={() => {
                      this.setPhone()
                    }}

                    translateFrom={30}
                    translateTo={0}
                    transform="translateY"

                    style={[
                      styles.buttonWhite,
                      // styles.buttonShadow,
                      styles.buttonLogin,
                      {
                        opacity: 0.7
                      }
                    ]}
                    styleLabel={[
                      styles.textLight,
                      styles.fontSize16
                    ]}
                  />
                  }
                  {(this.state.selectAccountVisible || this.state.emailNameVisible) &&
                  <ButtonAnim
                    title="Отмена"

                    onPress={() => {
                      this.setPhone()
                    }}

                    translateFrom={30}
                    translateTo={0}
                    transform="translateY"

                    style={[
                      styles.buttonWhite,
                      // styles.buttonShadow,
                      styles.buttonLogin,
                      {
                        opacity: 0.7
                      }
                    ]}
                    styleLabel={[
                      styles.textLight,
                      styles.fontSize16
                    ]}
                  />
                  }
                  <ButtonAnim
                    title="Продолжить"

                    onPress={
                      () => {
                        this.formSubmit();
                      }
                    }

                    startAnim={true}
                    translateFrom={30}
                    translateTo={0}
                    transform="translateY"
                    delay={this.modalDelay}

                    style={[
                      styles.buttonWhite,
                      styles.buttonShadow,
                      styles.buttonLogin,
                      {
                        width: 220
                      },
                      this.state.fetchLoading === true ? styles.buttonLoading : {},
                      // {
                      //   backgroundColor: this.boxInterpolation
                      // }
                    ]}
                    styleLabel={[
                      styles.textLight,
                      styles.fontSize16
                    ]}
                  />
                </View>

                {
                  <ButtonAnim
                    title={this.state.loginButtonText}

                    onPress={
                      () => {
                        if(this.state.currentPage === PAGES.LOGIN_EMAIL)
                          this.setPhone();
                        else
                          this.setLoginEmail();
                      }
                    }

                    translateFrom={30}
                    translateTo={0}
                    transform="translateY"
                    delay={this.modalDelay}

                    style={[
                      styles.buttonWhite,
                      styles.buttonTransparent,
                      styles.mt15,
                      {
                        paddingVertical: 18,
                        marginTop: 30,
                        borderWidth: 1,
                        borderColor: '#fff'
                        // marginTop: this.state.currentPage === PAGES.LOGIN_EMAIL ? 170 : 90
                      }
                    ]}
                    styleLabel={[
                      styles.textLight,
                      styles.fontSize14
                    ]}

                  />
                }
                {
                  !this.props.loginPopup &&
                  <View>
                    <ButtonAnim
                      title="Продолжить без авторизации"

                      onPress={() => {
                        if(this.props.navigation)
                          this.props.navigation.navigate('MainTabs')
                      }}

                      startAnim={true}
                      translateFrom={30}
                      translateTo={0}
                      transform="translateY"
                      delay={this.modalDelay}


                      style={[
                        styles.buttonWhite,
                        styles.buttonTransparent,
                        styles.mt15,
                        {
                          paddingVertical: 18,
                          marginTop: 15,
                          borderWidth: 1,
                          borderColor: '#fff'
                          // marginTop: this.state.currentPage === PAGES.LOGIN_EMAIL ? 170 : 90
                        }
                      ]}
                      styleLabel={[
                        styles.textBold,
                        styles.fontSize14
                      ]}

                    />

                    <ButtonAnim
                      title="Забыли пароль?"

                      onPress={async() => {
                        await WebBrowser.openBrowserAsync('https://eatandtrain.ru/wp-login.php?action=lostpassword');
                      }}

                      startAnim={true}
                      translateFrom={30}
                      translateTo={0}
                      transform="translateY"
                      delay={this.modalDelay}


                      style={[
                        styles.buttonWhite,
                        styles.buttonTransparent,
                        styles.mt15,
                        {
                          paddingVertical: 18,
                          marginTop: 15,
                          marginBottom: 30,
                          // marginTop: this.state.currentPage === PAGES.LOGIN_EMAIL ? 170 : 90
                        }
                      ]}
                      styleLabel={[
                        styles.textRegular,
                        styles.fontSize12
                      ]}

                    />


                  </View>
                }

              </View>
            </View>
          </ScrollView>
        </View>
        {/*</KeyboardAwareScrollView>*/}
      </Fragment>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    user: {
      ...state.user
    },
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    StoreUser: (user) => {
      dispatch(aStoreUser(user))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);