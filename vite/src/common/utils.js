/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay = 300) => {
  let timer = null
  
  return function(...args) {
    // 清除之前的定时器
    if (timer) clearTimeout(timer)
    
    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export const deepClone = (obj) => {
  // 如果不是对象或者是null，直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 根据类型创建新对象
  const clone = Array.isArray(obj) ? [] : {}

  // 遍历并复制属性
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key])
    }
  }

  return clone
}