import Utils from './utils.js';

export const validateNull = () => {
  let validateNull = (rule, value, cb) => {
    if (Utils.isEmpty(value)) {
      cb(new Error("不能为空"));
    } else {
      cb();
    }
  };
  return {
    required: true,
    validator: validateNull,
    trigger: 'change'
  };
};

export const validateRange = (min, max) => {
  let validateRange = (rule, value, cb) => {
    if (!Utils.isEmpty(value) && !Utils.isNumber(value)) {
      cb(new Error("请输入数字"));
    } else if (parseInt(value, 10) < min || parseInt(value, 10) > max) {
      cb(new Error(`范围${min}-${max}`));
    } else {
      cb();
    }
  };
  return {
    validator: validateRange,
    trigger: 'change'
  };
};

export const validateIpAddress = () => {
  let validateIpAddress = (rule, value, cb) => {
    if (!Utils.isEmpty(value) && !Utils.isIPv4Address(value) && !Utils.isIPv4WithPort(value)) {
      cb(new Error("请输入正确的IP地址"));
    } else if ("0.0.0.0" === value) {
      cb(new Error("请输入正确的IP地址"));
    } else {
      cb();
    }
  };
  return {
    validator: validateIpAddress,
    trigger: 'change'
  };
};