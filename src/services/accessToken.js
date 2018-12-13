import Cookies from 'js-cookie';

class AccessToken {
  constructor () {
    this._tokenId = 'myb';
  }

  get () {
    return Cookies.get(this._tokenId);
  }

  set (accessToken) {
    Cookies.set(this._tokenId, accessToken, { expires: 730 });
  }
}

const singleton = new AccessToken();
export default singleton;
