//@ts-expect-error
export function wrapNativeSuper(Class) {
  var _cache = typeof Map === 'function' ? new Map() : undefined;
  //@ts-expect-error
  wrapNativeSuper = function wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;
    if (typeof Class !== 'function') {
      throw new TypeError('Super expression must either be null or a function');
    }
    if (typeof _cache !== 'undefined') {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper(this: any) {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
    return _setPrototypeOf(Wrapper, Class);
  };
  return wrapNativeSuper(Class);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
  //@ts-expect-error
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === 'function') return true;
  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], () => {}));
    return true;
  } catch {
    return false;
  }
}

//@ts-expect-error
function _construct(_Parent, _args, _Class) {
  if (isNativeReflectConstruct()) {
    //@ts-expect-error
    _construct = Reflect.construct;
  } else {
    //@ts-expect-error
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      //@ts-expect-error
      var Constructor = Function.bind.apply(Parent, a);
      //@ts-expect-error
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }
  //@ts-expect-error
  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn: any) {
  return Function.toString.call(fn).indexOf('[native code]') !== -1;
}

//@ts-expect-error
function _setPrototypeOf(o, p) {
  //@ts-expect-error
  _setPrototypeOf =
    Object.setPrototypeOf ||
    //@ts-expect-error
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
}

//@ts-expect-error
function _getPrototypeOf(o): any {
  //@ts-expect-error
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(
        //@ts-expect-error
        o,
      ) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

module.exports = {
  wrapNativeSuper,
};
