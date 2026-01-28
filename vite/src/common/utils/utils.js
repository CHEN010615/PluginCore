class Utils {
  isEmpty(value) {
    return value === "";
  }

  isNumber(value) {
    return /\d/.test(value);
  }

  isIPv4Address(value) {
    if (value.length === 0) {
      return false;
    }
    let reVal = /^(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])$/;
    return (reVal.test(value));
  }

  isIPv4WithPort(value = "") {
    if (value.length === 0 || !value.includes(":")) {
      return false;
    }
    const [ip, port] = value.split(':');
    if (!this.isIPv4Address(ip) || !this.isNumber(port)) {
      return false;
    }
    return true;
  }
}

export default new Utils();