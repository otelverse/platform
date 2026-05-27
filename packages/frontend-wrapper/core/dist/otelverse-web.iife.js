"use strict";
var OtelverseWeb = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    getSessionId: () => getSessionId,
    initOtel: () => initOtel
  });

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/version.js
  var VERSION = "1.9.1";

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/internal/semver.js
  var re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
  function _makeCompatibilityCheck(ownVersion) {
    const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
    const rejectedVersions = /* @__PURE__ */ new Set();
    const myVersionMatch = ownVersion.match(re);
    if (!myVersionMatch) {
      return () => false;
    }
    const ownVersionParsed = {
      major: +myVersionMatch[1],
      minor: +myVersionMatch[2],
      patch: +myVersionMatch[3],
      prerelease: myVersionMatch[4]
    };
    if (ownVersionParsed.prerelease != null) {
      return function isExactmatch(globalVersion) {
        return globalVersion === ownVersion;
      };
    }
    function _reject(v2) {
      rejectedVersions.add(v2);
      return false;
    }
    function _accept(v2) {
      acceptedVersions.add(v2);
      return true;
    }
    return function isCompatible2(globalVersion) {
      if (acceptedVersions.has(globalVersion)) {
        return true;
      }
      if (rejectedVersions.has(globalVersion)) {
        return false;
      }
      const globalVersionMatch = globalVersion.match(re);
      if (!globalVersionMatch) {
        return _reject(globalVersion);
      }
      const globalVersionParsed = {
        major: +globalVersionMatch[1],
        minor: +globalVersionMatch[2],
        patch: +globalVersionMatch[3],
        prerelease: globalVersionMatch[4]
      };
      if (globalVersionParsed.prerelease != null) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major !== globalVersionParsed.major) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major === 0) {
        if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
          return _accept(globalVersion);
        }
        return _reject(globalVersion);
      }
      if (ownVersionParsed.minor <= globalVersionParsed.minor) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    };
  }
  var isCompatible = _makeCompatibilityCheck(VERSION);

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
  var major = VERSION.split(".")[0];
  var GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
  var _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  function registerGlobal(type, instance, diag3, allowOverride = false) {
    var _a;
    const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
      version: VERSION
    };
    if (!allowOverride && api[type]) {
      const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
      diag3.error(err.stack || err.message);
      return false;
    }
    if (api.version !== VERSION) {
      const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
      diag3.error(err.stack || err.message);
      return false;
    }
    api[type] = instance;
    diag3.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
    return true;
  }
  function getGlobal(type) {
    var _a, _b;
    const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
    if (!globalVersion || !isCompatible(globalVersion)) {
      return;
    }
    return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
  }
  function unregisterGlobal(type, diag3) {
    diag3.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
    const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
    if (api) {
      delete api[type];
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
  var DiagComponentLogger = class {
    constructor(props) {
      this._namespace = props.namespace || "DiagComponentLogger";
    }
    debug(...args) {
      return logProxy("debug", this._namespace, args);
    }
    error(...args) {
      return logProxy("error", this._namespace, args);
    }
    info(...args) {
      return logProxy("info", this._namespace, args);
    }
    warn(...args) {
      return logProxy("warn", this._namespace, args);
    }
    verbose(...args) {
      return logProxy("verbose", this._namespace, args);
    }
  };
  function logProxy(funcName, namespace, args) {
    const logger2 = getGlobal("diag");
    if (!logger2) {
      return;
    }
    return logger2[funcName](namespace, ...args);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/diag/types.js
  var DiagLogLevel;
  (function(DiagLogLevel2) {
    DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
    DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
    DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
    DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
    DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
    DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
    DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
  })(DiagLogLevel || (DiagLogLevel = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
  function createLogLevelDiagLogger(maxLevel, logger2) {
    if (maxLevel < DiagLogLevel.NONE) {
      maxLevel = DiagLogLevel.NONE;
    } else if (maxLevel > DiagLogLevel.ALL) {
      maxLevel = DiagLogLevel.ALL;
    }
    logger2 = logger2 || {};
    function _filterFunc(funcName, theLevel) {
      const theFunc = logger2[funcName];
      if (typeof theFunc === "function" && maxLevel >= theLevel) {
        return theFunc.bind(logger2);
      }
      return function() {
      };
    }
    return {
      error: _filterFunc("error", DiagLogLevel.ERROR),
      warn: _filterFunc("warn", DiagLogLevel.WARN),
      info: _filterFunc("info", DiagLogLevel.INFO),
      debug: _filterFunc("debug", DiagLogLevel.DEBUG),
      verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/api/diag.js
  var API_NAME = "diag";
  var DiagAPI = class _DiagAPI {
    /** Get the singleton instance of the DiagAPI API */
    static instance() {
      if (!this._instance) {
        this._instance = new _DiagAPI();
      }
      return this._instance;
    }
    /**
     * Private internal constructor
     * @private
     */
    constructor() {
      function _logProxy(funcName) {
        return function(...args) {
          const logger2 = getGlobal("diag");
          if (!logger2)
            return;
          return logger2[funcName](...args);
        };
      }
      const self2 = this;
      const setLogger = (logger2, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
        var _a, _b, _c;
        if (logger2 === self2) {
          const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
          self2.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
          return false;
        }
        if (typeof optionsOrLogLevel === "number") {
          optionsOrLogLevel = {
            logLevel: optionsOrLogLevel
          };
        }
        const oldLogger = getGlobal("diag");
        const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger2);
        if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
          const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
          oldLogger.warn(`Current logger will be overwritten from ${stack}`);
          newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
        }
        return registerGlobal("diag", newLogger, self2, true);
      };
      self2.setLogger = setLogger;
      self2.disable = () => {
        unregisterGlobal(API_NAME, self2);
      };
      self2.createComponentLogger = (options) => {
        return new DiagComponentLogger(options);
      };
      self2.verbose = _logProxy("verbose");
      self2.debug = _logProxy("debug");
      self2.info = _logProxy("info");
      self2.warn = _logProxy("warn");
      self2.error = _logProxy("error");
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js
  var BaggageImpl = class _BaggageImpl {
    constructor(entries) {
      this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
    }
    getEntry(key) {
      const entry = this._entries.get(key);
      if (!entry) {
        return void 0;
      }
      return Object.assign({}, entry);
    }
    getAllEntries() {
      return Array.from(this._entries.entries());
    }
    setEntry(key, entry) {
      const newBaggage = new _BaggageImpl(this._entries);
      newBaggage._entries.set(key, entry);
      return newBaggage;
    }
    removeEntry(key) {
      const newBaggage = new _BaggageImpl(this._entries);
      newBaggage._entries.delete(key);
      return newBaggage;
    }
    removeEntries(...keys) {
      const newBaggage = new _BaggageImpl(this._entries);
      for (const key of keys) {
        newBaggage._entries.delete(key);
      }
      return newBaggage;
    }
    clear() {
      return new _BaggageImpl();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/baggage/internal/symbol.js
  var baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/baggage/utils.js
  var diag = DiagAPI.instance();
  function createBaggage(entries = {}) {
    return new BaggageImpl(new Map(Object.entries(entries)));
  }
  function baggageEntryMetadataFromString(str) {
    if (typeof str !== "string") {
      diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
      str = "";
    }
    return {
      __TYPE__: baggageEntryMetadataSymbol,
      toString() {
        return str;
      }
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/context/context.js
  function createContextKey(description) {
    return Symbol.for(description);
  }
  var BaseContext = class _BaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
      const self2 = this;
      self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
      self2.getValue = (key) => self2._currentContext.get(key);
      self2.setValue = (key, value) => {
        const context2 = new _BaseContext(self2._currentContext);
        context2._currentContext.set(key, value);
        return context2;
      };
      self2.deleteValue = (key) => {
        const context2 = new _BaseContext(self2._currentContext);
        context2._currentContext.delete(key);
        return context2;
      };
    }
  };
  var ROOT_CONTEXT = new BaseContext();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js
  var NoopMeter = class {
    constructor() {
    }
    /**
     * @see {@link Meter.createGauge}
     */
    createGauge(_name, _options) {
      return NOOP_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createHistogram}
     */
    createHistogram(_name, _options) {
      return NOOP_HISTOGRAM_METRIC;
    }
    /**
     * @see {@link Meter.createCounter}
     */
    createCounter(_name, _options) {
      return NOOP_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createUpDownCounter}
     */
    createUpDownCounter(_name, _options) {
      return NOOP_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableGauge}
     */
    createObservableGauge(_name, _options) {
      return NOOP_OBSERVABLE_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createObservableCounter}
     */
    createObservableCounter(_name, _options) {
      return NOOP_OBSERVABLE_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableUpDownCounter}
     */
    createObservableUpDownCounter(_name, _options) {
      return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(_callback, _observables) {
    }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(_callback) {
    }
  };
  var NoopMetric = class {
  };
  var NoopCounterMetric = class extends NoopMetric {
    add(_value, _attributes) {
    }
  };
  var NoopUpDownCounterMetric = class extends NoopMetric {
    add(_value, _attributes) {
    }
  };
  var NoopGaugeMetric = class extends NoopMetric {
    record(_value, _attributes) {
    }
  };
  var NoopHistogramMetric = class extends NoopMetric {
    record(_value, _attributes) {
    }
  };
  var NoopObservableMetric = class {
    addCallback(_callback) {
    }
    removeCallback(_callback) {
    }
  };
  var NoopObservableCounterMetric = class extends NoopObservableMetric {
  };
  var NoopObservableGaugeMetric = class extends NoopObservableMetric {
  };
  var NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {
  };
  var NOOP_METER = new NoopMeter();
  var NOOP_COUNTER_METRIC = new NoopCounterMetric();
  var NOOP_GAUGE_METRIC = new NoopGaugeMetric();
  var NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
  var NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
  var NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
  var NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
  var NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
  function createNoopMeter() {
    return NOOP_METER;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/metrics/Metric.js
  var ValueType;
  (function(ValueType2) {
    ValueType2[ValueType2["INT"] = 0] = "INT";
    ValueType2[ValueType2["DOUBLE"] = 1] = "DOUBLE";
  })(ValueType || (ValueType = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js
  var defaultTextMapGetter = {
    get(carrier, key) {
      if (carrier == null) {
        return void 0;
      }
      return carrier[key];
    },
    keys(carrier) {
      if (carrier == null) {
        return [];
      }
      return Object.keys(carrier);
    }
  };
  var defaultTextMapSetter = {
    set(carrier, key, value) {
      if (carrier == null) {
        return;
      }
      carrier[key] = value;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
  var NoopContextManager = class {
    active() {
      return ROOT_CONTEXT;
    }
    with(_context, fn, thisArg, ...args) {
      return fn.call(thisArg, ...args);
    }
    bind(_context, target) {
      return target;
    }
    enable() {
      return this;
    }
    disable() {
      return this;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/api/context.js
  var API_NAME2 = "context";
  var NOOP_CONTEXT_MANAGER = new NoopContextManager();
  var ContextAPI = class _ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Context API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _ContextAPI();
      }
      return this._instance;
    }
    /**
     * Set the current context manager.
     *
     * @returns true if the context manager was successfully registered, else false
     */
    setGlobalContextManager(contextManager) {
      return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
    }
    /**
     * Get the currently active context
     */
    active() {
      return this._getContextManager().active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      return this._getContextManager().with(context2, fn, thisArg, ...args);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     * @param target function or event emitter to bind
     */
    bind(context2, target) {
      return this._getContextManager().bind(context2, target);
    }
    _getContextManager() {
      return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
    }
    /** Disable and remove the global context manager */
    disable() {
      this._getContextManager().disable();
      unregisterGlobal(API_NAME2, DiagAPI.instance());
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
  var TraceFlags;
  (function(TraceFlags2) {
    TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
    TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
  })(TraceFlags || (TraceFlags = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
  var INVALID_SPANID = "0000000000000000";
  var INVALID_TRACEID = "00000000000000000000000000000000";
  var INVALID_SPAN_CONTEXT = {
    traceId: INVALID_TRACEID,
    spanId: INVALID_SPANID,
    traceFlags: TraceFlags.NONE
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
  var NonRecordingSpan = class {
    constructor(spanContext = INVALID_SPAN_CONTEXT) {
      this._spanContext = spanContext;
    }
    // Returns a SpanContext.
    spanContext() {
      return this._spanContext;
    }
    // By default does nothing
    setAttribute(_key, _value) {
      return this;
    }
    // By default does nothing
    setAttributes(_attributes) {
      return this;
    }
    // By default does nothing
    addEvent(_name, _attributes) {
      return this;
    }
    addLink(_link) {
      return this;
    }
    addLinks(_links) {
      return this;
    }
    // By default does nothing
    setStatus(_status) {
      return this;
    }
    // By default does nothing
    updateName(_name) {
      return this;
    }
    // By default does nothing
    end(_endTime) {
    }
    // isRecording always returns false for NonRecordingSpan.
    isRecording() {
      return false;
    }
    // By default does nothing
    recordException(_exception, _time) {
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
  var SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  function getSpan(context2) {
    return context2.getValue(SPAN_KEY) || void 0;
  }
  function getActiveSpan() {
    return getSpan(ContextAPI.getInstance().active());
  }
  function setSpan(context2, span) {
    return context2.setValue(SPAN_KEY, span);
  }
  function deleteSpan(context2) {
    return context2.deleteValue(SPAN_KEY);
  }
  function setSpanContext(context2, spanContext) {
    return setSpan(context2, new NonRecordingSpan(spanContext));
  }
  function getSpanContext(context2) {
    var _a;
    return (_a = getSpan(context2)) === null || _a === void 0 ? void 0 : _a.spanContext();
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
  var isHex = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  function isValidHex(id, length) {
    if (typeof id !== "string" || id.length !== length)
      return false;
    let r2 = 0;
    for (let i2 = 0; i2 < id.length; i2 += 4) {
      r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
    }
    return r2 === length;
  }
  function isValidTraceId(traceId) {
    return isValidHex(traceId, 32) && traceId !== INVALID_TRACEID;
  }
  function isValidSpanId(spanId) {
    return isValidHex(spanId, 16) && spanId !== INVALID_SPANID;
  }
  function isSpanContextValid(spanContext) {
    return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
  }
  function wrapSpanContext(spanContext) {
    return new NonRecordingSpan(spanContext);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
  var contextApi = ContextAPI.getInstance();
  var NoopTracer = class {
    // startSpan starts a noop span.
    startSpan(name, options, context2 = contextApi.active()) {
      const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
      if (root) {
        return new NonRecordingSpan();
      }
      const parentFromContext = context2 && getSpanContext(context2);
      if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
        return new NonRecordingSpan(parentFromContext);
      } else {
        return new NonRecordingSpan();
      }
    }
    startActiveSpan(name, arg2, arg3, arg4) {
      let opts;
      let ctx;
      let fn;
      if (arguments.length < 2) {
        return;
      } else if (arguments.length === 2) {
        fn = arg2;
      } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
      } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
      }
      const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
      const span = this.startSpan(name, opts, parentContext);
      const contextWithSpanSet = setSpan(parentContext, span);
      return contextApi.with(contextWithSpanSet, fn, void 0, span);
    }
  };
  function isSpanContext(spanContext) {
    return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
  var NOOP_TRACER = new NoopTracer();
  var ProxyTracer = class {
    constructor(provider, name, version, options) {
      this._provider = provider;
      this.name = name;
      this.version = version;
      this.options = options;
    }
    startSpan(name, options, context2) {
      return this._getTracer().startSpan(name, options, context2);
    }
    startActiveSpan(_name, _options, _context, _fn) {
      const tracer = this._getTracer();
      return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
    }
    /**
     * Try to get a tracer from the proxy tracer provider.
     * If the proxy tracer provider has no delegate, return a noop tracer.
     */
    _getTracer() {
      if (this._delegate) {
        return this._delegate;
      }
      const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
      if (!tracer) {
        return NOOP_TRACER;
      }
      this._delegate = tracer;
      return this._delegate;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
  var NoopTracerProvider = class {
    getTracer(_name, _version, _options) {
      return new NoopTracer();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
  var NOOP_TRACER_PROVIDER = new NoopTracerProvider();
  var ProxyTracerProvider = class {
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name, version, options) {
      var _a;
      return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
    }
    getDelegate() {
      var _a;
      return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
    }
    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate) {
      this._delegate = delegate;
    }
    getDelegateTracer(name, version, options) {
      var _a;
      return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js
  var SamplingDecision;
  (function(SamplingDecision3) {
    SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
    SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision || (SamplingDecision = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
  var SpanKind;
  (function(SpanKind2) {
    SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
    SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
    SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
    SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
    SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
  })(SpanKind || (SpanKind = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace/status.js
  var SpanStatusCode;
  (function(SpanStatusCode2) {
    SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
    SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
    SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
  })(SpanStatusCode || (SpanStatusCode = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/context-api.js
  var context = ContextAPI.getInstance();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/diag-api.js
  var diag2 = DiagAPI.instance();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/metrics/NoopMeterProvider.js
  var NoopMeterProvider = class {
    getMeter(_name, _version, _options) {
      return NOOP_METER;
    }
  };
  var NOOP_METER_PROVIDER = new NoopMeterProvider();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/api/metrics.js
  var API_NAME3 = "metrics";
  var MetricsAPI = class _MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _MetricsAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global meter provider.
     * Returns true if the meter provider was successfully registered, else false.
     */
    setGlobalMeterProvider(provider) {
      return registerGlobal(API_NAME3, provider, DiagAPI.instance());
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
      return getGlobal(API_NAME3) || NOOP_METER_PROVIDER;
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version, options) {
      return this.getMeterProvider().getMeter(name, version, options);
    }
    /** Remove the global meter provider */
    disable() {
      unregisterGlobal(API_NAME3, DiagAPI.instance());
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/metrics-api.js
  var metrics = MetricsAPI.getInstance();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js
  var NoopTextMapPropagator = class {
    /** Noop inject function does nothing */
    inject(_context, _carrier) {
    }
    /** Noop extract function does nothing and returns the input context */
    extract(context2, _carrier) {
      return context2;
    }
    fields() {
      return [];
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js
  var BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
  function getBaggage(context2) {
    return context2.getValue(BAGGAGE_KEY) || void 0;
  }
  function getActiveBaggage() {
    return getBaggage(ContextAPI.getInstance().active());
  }
  function setBaggage(context2, baggage) {
    return context2.setValue(BAGGAGE_KEY, baggage);
  }
  function deleteBaggage(context2) {
    return context2.deleteValue(BAGGAGE_KEY);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/api/propagation.js
  var API_NAME4 = "propagation";
  var NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
  var PropagationAPI = class _PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this.createBaggage = createBaggage;
      this.getBaggage = getBaggage;
      this.getActiveBaggage = getActiveBaggage;
      this.setBaggage = setBaggage;
      this.deleteBaggage = deleteBaggage;
    }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _PropagationAPI();
      }
      return this._instance;
    }
    /**
     * Set the current propagator.
     *
     * @returns true if the propagator was successfully registered, else false
     */
    setGlobalPropagator(propagator) {
      return registerGlobal(API_NAME4, propagator, DiagAPI.instance());
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param context Context carrying tracing data to inject
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     */
    inject(context2, carrier, setter = defaultTextMapSetter) {
      return this._getGlobalPropagator().inject(context2, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param context Context which the newly created context will inherit from
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     */
    extract(context2, carrier, getter = defaultTextMapGetter) {
      return this._getGlobalPropagator().extract(context2, carrier, getter);
    }
    /**
     * Return a list of all fields which may be used by the propagator.
     */
    fields() {
      return this._getGlobalPropagator().fields();
    }
    /** Remove the global propagator */
    disable() {
      unregisterGlobal(API_NAME4, DiagAPI.instance());
    }
    _getGlobalPropagator() {
      return getGlobal(API_NAME4) || NOOP_TEXT_MAP_PROPAGATOR;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/propagation-api.js
  var propagation = PropagationAPI.getInstance();

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/api/trace.js
  var API_NAME5 = "trace";
  var TraceAPI = class _TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this._proxyTracerProvider = new ProxyTracerProvider();
      this.wrapSpanContext = wrapSpanContext;
      this.isSpanContextValid = isSpanContextValid;
      this.deleteSpan = deleteSpan;
      this.getSpan = getSpan;
      this.getActiveSpan = getActiveSpan;
      this.getSpanContext = getSpanContext;
      this.setSpan = setSpan;
      this.setSpanContext = setSpanContext;
    }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _TraceAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global tracer.
     *
     * @returns true if the tracer provider was successfully registered, else false
     */
    setGlobalTracerProvider(provider) {
      const success = registerGlobal(API_NAME5, this._proxyTracerProvider, DiagAPI.instance());
      if (success) {
        this._proxyTracerProvider.setDelegate(provider);
      }
      return success;
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
      return getGlobal(API_NAME5) || this._proxyTracerProvider;
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
      return this.getTracerProvider().getTracer(name, version);
    }
    /** Remove the global tracer provider */
    disable() {
      unregisterGlobal(API_NAME5, DiagAPI.instance());
      this._proxyTracerProvider = new ProxyTracerProvider();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry/api/build/esm/trace-api.js
  var trace = TraceAPI.getInstance();

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
  var SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
  function suppressTracing(context2) {
    return context2.setValue(SUPPRESS_TRACING_KEY, true);
  }
  function isTracingSuppressed(context2) {
    return context2.getValue(SUPPRESS_TRACING_KEY) === true;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/baggage/constants.js
  var BAGGAGE_KEY_PAIR_SEPARATOR = "=";
  var BAGGAGE_PROPERTIES_SEPARATOR = ";";
  var BAGGAGE_ITEMS_SEPARATOR = ",";
  var BAGGAGE_HEADER = "baggage";
  var BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
  var BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
  var BAGGAGE_MAX_TOTAL_LENGTH = 8192;

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/baggage/utils.js
  function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce((hValue, current) => {
      const value = `${hValue}${hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR : ""}${current}`;
      return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, "");
  }
  function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(([key, value]) => {
      let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
      if (value.metadata !== void 0) {
        entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
      }
      return entry;
    });
  }
  function parsePairKeyValue(entry) {
    if (!entry)
      return;
    const metadataSeparatorIndex = entry.indexOf(BAGGAGE_PROPERTIES_SEPARATOR);
    const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
    const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
      return;
    const rawKey = keyPairPart.substring(0, separatorIndex).trim();
    const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
    if (!rawKey || !rawValue)
      return;
    let key;
    let value;
    try {
      key = decodeURIComponent(rawKey);
      value = decodeURIComponent(rawValue);
    } catch {
      return;
    }
    let metadata;
    if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) {
      const metadataString = entry.substring(metadataSeparatorIndex + 1);
      metadata = baggageEntryMetadataFromString(metadataString);
    }
    return { key, value, metadata };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/baggage/propagation/W3CBaggagePropagator.js
  var W3CBaggagePropagator = class {
    inject(context2, carrier, setter) {
      const baggage = propagation.getBaggage(context2);
      if (!baggage || isTracingSuppressed(context2))
        return;
      const keyPairs = getKeyPairs(baggage).filter((pair) => {
        return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
      }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
      const headerValue = serializeKeyPairs(keyPairs);
      if (headerValue.length > 0) {
        setter.set(carrier, BAGGAGE_HEADER, headerValue);
      }
    }
    extract(context2, carrier, getter) {
      const headerValue = getter.get(carrier, BAGGAGE_HEADER);
      const baggageString = Array.isArray(headerValue) ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR) : headerValue;
      if (!baggageString)
        return context2;
      const baggage = {};
      if (baggageString.length === 0) {
        return context2;
      }
      const pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR);
      pairs.forEach((entry) => {
        const keyPair = parsePairKeyValue(entry);
        if (keyPair) {
          const baggageEntry = { value: keyPair.value };
          if (keyPair.metadata) {
            baggageEntry.metadata = keyPair.metadata;
          }
          baggage[keyPair.key] = baggageEntry;
        }
      });
      if (Object.entries(baggage).length === 0) {
        return context2;
      }
      return propagation.setBaggage(context2, propagation.createBaggage(baggage));
    }
    fields() {
      return [BAGGAGE_HEADER];
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/common/attributes.js
  function sanitizeAttributes(attributes) {
    const out = {};
    if (typeof attributes !== "object" || attributes == null) {
      return out;
    }
    for (const key in attributes) {
      if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
        continue;
      }
      if (!isAttributeKey(key)) {
        diag2.warn(`Invalid attribute key: ${key}`);
        continue;
      }
      const val = attributes[key];
      if (!isAttributeValue(val)) {
        diag2.warn(`Invalid attribute value set for key: ${key}`);
        continue;
      }
      if (Array.isArray(val)) {
        out[key] = val.slice();
      } else {
        out[key] = val;
      }
    }
    return out;
  }
  function isAttributeKey(key) {
    return typeof key === "string" && key !== "";
  }
  function isAttributeValue(val) {
    if (val == null) {
      return true;
    }
    if (Array.isArray(val)) {
      return isHomogeneousAttributeValueArray(val);
    }
    return isValidPrimitiveAttributeValueType(typeof val);
  }
  function isHomogeneousAttributeValueArray(arr) {
    let type;
    for (const element of arr) {
      if (element == null)
        continue;
      const elementType = typeof element;
      if (elementType === type) {
        continue;
      }
      if (!type) {
        if (isValidPrimitiveAttributeValueType(elementType)) {
          type = elementType;
          continue;
        }
        return false;
      }
      return false;
    }
    return true;
  }
  function isValidPrimitiveAttributeValueType(valType) {
    switch (valType) {
      case "number":
      case "boolean":
      case "string":
        return true;
    }
    return false;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
  function loggingErrorHandler() {
    return (ex) => {
      diag2.error(stringifyException(ex));
    };
  }
  function stringifyException(ex) {
    if (typeof ex === "string") {
      return ex;
    } else {
      return JSON.stringify(flattenException(ex));
    }
  }
  function flattenException(ex) {
    const result = {};
    let current = ex;
    while (current !== null) {
      Object.getOwnPropertyNames(current).forEach((propertyName) => {
        if (result[propertyName])
          return;
        const value = current[propertyName];
        if (value) {
          result[propertyName] = String(value);
        }
      });
      current = Object.getPrototypeOf(current);
    }
    return result;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
  var delegateHandler = loggingErrorHandler();
  function globalErrorHandler(ex) {
    try {
      delegateHandler(ex);
    } catch {
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/platform/browser/environment.js
  function getStringFromEnv(_2) {
    return void 0;
  }
  function getNumberFromEnv(_2) {
    return void 0;
  }
  function getStringListFromEnv(_2) {
    return void 0;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/version.js
  var VERSION2 = "2.7.1";

  // ../../../node_modules/.pnpm/@opentelemetry+semantic-conventions@1.41.1/node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js
  var ATTR_ERROR_TYPE = "error.type";
  var ATTR_EXCEPTION_MESSAGE = "exception.message";
  var ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
  var ATTR_EXCEPTION_TYPE = "exception.type";
  var ATTR_HTTP_REQUEST_METHOD = "http.request.method";
  var ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
  var ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
  var ATTR_SERVER_ADDRESS = "server.address";
  var ATTR_SERVER_PORT = "server.port";
  var ATTR_SERVICE_NAME = "service.name";
  var ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
  var TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
  var ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
  var ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
  var ATTR_URL_FULL = "url.full";
  var ATTR_USER_AGENT_ORIGINAL = "user_agent.original";

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/semconv.js
  var ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/platform/browser/sdk-info.js
  var SDK_INFO = {
    [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
    [ATTR_PROCESS_RUNTIME_NAME]: "browser",
    [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS,
    [ATTR_TELEMETRY_SDK_VERSION]: VERSION2
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/platform/browser/index.js
  var otperformance = performance;

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/common/time.js
  var NANOSECOND_DIGITS = 9;
  var NANOSECOND_DIGITS_IN_MILLIS = 6;
  var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
  var SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
  function millisToHrTime(epochMillis) {
    const epochSeconds = epochMillis / 1e3;
    const seconds = Math.trunc(epochSeconds);
    const nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
    return [seconds, nanos];
  }
  function hrTime(performanceNow) {
    const timeOrigin = millisToHrTime(otperformance.timeOrigin);
    const now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
    return addHrTimes(timeOrigin, now);
  }
  function timeInputToHrTime(time) {
    if (isTimeInputHrTime(time)) {
      return time;
    } else if (typeof time === "number") {
      if (time < otperformance.timeOrigin) {
        return hrTime(time);
      } else {
        return millisToHrTime(time);
      }
    } else if (time instanceof Date) {
      return millisToHrTime(time.getTime());
    } else {
      throw TypeError("Invalid input type");
    }
  }
  function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    if (nanos < 0) {
      seconds -= 1;
      nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
  }
  function hrTimeToNanoseconds(time) {
    return time[0] * SECOND_TO_NANOSECONDS + time[1];
  }
  function hrTimeToMicroseconds(time) {
    return time[0] * 1e6 + time[1] / 1e3;
  }
  function isTimeInputHrTime(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
  }
  function isTimeInput(value) {
    return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
  }
  function addHrTimes(time1, time2) {
    const out = [time1[0] + time2[0], time1[1] + time2[1]];
    if (out[1] >= SECOND_TO_NANOSECONDS) {
      out[1] -= SECOND_TO_NANOSECONDS;
      out[0] += 1;
    }
    return out;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/ExportResult.js
  var ExportResultCode;
  (function(ExportResultCode2) {
    ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
    ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
  })(ExportResultCode || (ExportResultCode = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/propagation/composite.js
  var CompositePropagator = class {
    _propagators;
    _fields;
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config = {}) {
      this._propagators = config.propagators ?? [];
      const fields = /* @__PURE__ */ new Set();
      for (const propagator of this._propagators) {
        const propagatorFields = typeof propagator.fields === "function" ? propagator.fields() : [];
        for (const field of propagatorFields) {
          fields.add(field);
        }
      }
      this._fields = Array.from(fields);
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context2, carrier, setter) {
      for (const propagator of this._propagators) {
        try {
          propagator.inject(context2, carrier, setter);
        } catch (err) {
          diag2.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
        }
      }
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context2, carrier, getter) {
      return this._propagators.reduce((ctx, propagator) => {
        try {
          return propagator.extract(ctx, carrier, getter);
        } catch (err) {
          diag2.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
        }
        return ctx;
      }, context2);
    }
    fields() {
      return this._fields.slice();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/internal/validators.js
  var VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
  var VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
  var VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
  var VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
  var VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
  var INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
  function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
  }
  function validateValue(value) {
    return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/trace/TraceState.js
  var MAX_TRACE_STATE_ITEMS = 32;
  var MAX_TRACE_STATE_LEN = 512;
  var LIST_MEMBERS_SEPARATOR = ",";
  var LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
  var TraceState = class _TraceState {
    _length;
    _rawTraceState;
    _internalState;
    constructor(rawTraceState) {
      this._rawTraceState = typeof rawTraceState === "string" ? rawTraceState : "";
      this._length = this._rawTraceState.length;
    }
    set(key, value) {
      if (!validateKey(key) || !validateValue(value)) {
        return this;
      }
      const currState = this._getState();
      const currValue = currState.get(key);
      let newLength = this._length;
      if (typeof currValue === "string") {
        newLength += value.length - currValue.length;
      } else {
        newLength += key.length + value.length + (currState.size > 0 ? 2 : 1);
      }
      if (newLength > MAX_TRACE_STATE_LEN) {
        return this;
      }
      const newState = new Map(currState);
      newState.delete(key);
      newState.set(key, value);
      return this._fromState(newState, newLength);
    }
    unset(key) {
      const currState = this._getState();
      const currValue = currState.get(key);
      if (typeof currValue !== "string") {
        return this;
      }
      let newLength = this._length - (key.length + currValue.length + 1);
      if (currState.size > 1) {
        newLength = newLength - 1;
      }
      const newState = new Map(currState);
      newState.delete(key);
      return this._fromState(newState, newLength);
    }
    get(key) {
      const currState = this._getState();
      return currState.get(key);
    }
    serialize() {
      let serialized = "";
      let index = 0;
      for (const entry of this._getState()) {
        if (index > 0) {
          serialized = LIST_MEMBERS_SEPARATOR + serialized;
        }
        serialized = `${entry[0]}${LIST_MEMBER_KEY_VALUE_SPLITTER}${entry[1]}` + serialized;
        index++;
      }
      return serialized;
    }
    _getState() {
      if (this._internalState) {
        return this._internalState;
      }
      const vendorMembers = this._rawTraceState.split(LIST_MEMBERS_SEPARATOR);
      const vendorEntries = /* @__PURE__ */ new Map();
      let currentLength = 0;
      for (const member of vendorMembers) {
        const m2 = member.trim();
        const idx = m2.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (idx === -1) {
          continue;
        }
        const key = m2.slice(0, idx);
        const value = m2.slice(idx + 1);
        if (!validateKey(key) || !validateValue(value)) {
          continue;
        }
        const futureLength = currentLength + m2.length + (vendorEntries.size > 0 ? 1 : 0);
        if (futureLength > MAX_TRACE_STATE_LEN) {
          continue;
        }
        vendorEntries.set(key, value);
        currentLength = futureLength;
        if (vendorEntries.size >= MAX_TRACE_STATE_ITEMS) {
          break;
        }
      }
      this._length = currentLength;
      this._internalState = new Map(Array.from(vendorEntries.entries()).reverse());
      return this._internalState;
    }
    _fromState(state, length) {
      const traceState = Object.create(_TraceState.prototype);
      traceState._internalState = state;
      traceState._length = length;
      return traceState;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/trace/W3CTraceContextPropagator.js
  var TRACE_PARENT_HEADER = "traceparent";
  var TRACE_STATE_HEADER = "tracestate";
  var VERSION3 = "00";
  var VERSION_PART = "(?!ff)[\\da-f]{2}";
  var TRACE_ID_PART = "(?![0]{32})[\\da-f]{32}";
  var PARENT_ID_PART = "(?![0]{16})[\\da-f]{16}";
  var FLAGS_PART = "[\\da-f]{2}";
  var TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
  function parseTraceParent(traceParent) {
    const match = TRACE_PARENT_REGEX.exec(traceParent);
    if (!match)
      return null;
    if (match[1] === "00" && match[5])
      return null;
    return {
      traceId: match[2],
      spanId: match[3],
      traceFlags: parseInt(match[4], 16)
    };
  }
  var W3CTraceContextPropagator = class {
    inject(context2, carrier, setter) {
      const spanContext = trace.getSpanContext(context2);
      if (!spanContext || isTracingSuppressed(context2) || !isSpanContextValid(spanContext))
        return;
      const traceParent = `${VERSION3}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
      setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
      if (spanContext.traceState) {
        setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
      }
    }
    extract(context2, carrier, getter) {
      const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
      if (!traceParentHeader)
        return context2;
      const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
      if (typeof traceParent !== "string")
        return context2;
      const spanContext = parseTraceParent(traceParent);
      if (!spanContext)
        return context2;
      spanContext.isRemote = true;
      const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
      if (traceStateHeader) {
        const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
        spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
      }
      return trace.setSpanContext(context2, spanContext);
    }
    fields() {
      return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/utils/lodash.merge.js
  var objectTag = "[object Object]";
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  var objectCtorString = funcToString.call(Object);
  var getPrototypeOf = Object.getPrototypeOf;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  var nativeObjectToString = objectProto.toString;
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
      return false;
    }
    const proto = getPrototypeOf(value);
    if (proto === null) {
      return true;
    }
    const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  function getRawTag(value) {
    const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    let unmasked = false;
    try {
      value[symToStringTag] = void 0;
      unmasked = true;
    } catch {
    }
    const result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/utils/merge.js
  var MAX_LEVEL = 20;
  function merge(...args) {
    let result = args.shift();
    const objects = /* @__PURE__ */ new WeakMap();
    while (args.length > 0) {
      result = mergeTwoObjects(result, args.shift(), 0, objects);
    }
    return result;
  }
  function takeValue(value) {
    if (isArray(value)) {
      return value.slice();
    }
    return value;
  }
  function mergeTwoObjects(one, two, level = 0, objects) {
    let result;
    if (level > MAX_LEVEL) {
      return void 0;
    }
    level++;
    if (isPrimitive(one) || isPrimitive(two) || isFunction(two)) {
      result = takeValue(two);
    } else if (isArray(one)) {
      result = one.slice();
      if (isArray(two)) {
        for (let i2 = 0, j = two.length; i2 < j; i2++) {
          result.push(takeValue(two[i2]));
        }
      } else if (isObject(two)) {
        const keys = Object.keys(two);
        for (let i2 = 0, j = keys.length; i2 < j; i2++) {
          const key = keys[i2];
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
          }
          result[key] = takeValue(two[key]);
        }
      }
    } else if (isObject(one)) {
      if (isObject(two)) {
        if (!shouldMerge(one, two)) {
          return two;
        }
        result = Object.assign({}, one);
        const keys = Object.keys(two);
        for (let i2 = 0, j = keys.length; i2 < j; i2++) {
          const key = keys[i2];
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
          }
          const twoValue = two[key];
          if (isPrimitive(twoValue)) {
            if (typeof twoValue === "undefined") {
              delete result[key];
            } else {
              result[key] = twoValue;
            }
          } else {
            const obj1 = result[key];
            const obj2 = twoValue;
            if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
              delete result[key];
            } else {
              if (isObject(obj1) && isObject(obj2)) {
                const arr1 = objects.get(obj1) || [];
                const arr2 = objects.get(obj2) || [];
                arr1.push({ obj: one, key });
                arr2.push({ obj: two, key });
                objects.set(obj1, arr1);
                objects.set(obj2, arr2);
              }
              result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
            }
          }
        }
      } else {
        result = two;
      }
    }
    return result;
  }
  function wasObjectReferenced(obj, key, objects) {
    const arr = objects.get(obj[key]) || [];
    for (let i2 = 0, j = arr.length; i2 < j; i2++) {
      const info = arr[i2];
      if (info.key === key && info.obj === obj) {
        return true;
      }
    }
    return false;
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isObject(value) {
    return !isPrimitive(value) && !isArray(value) && !isFunction(value) && typeof value === "object";
  }
  function isPrimitive(value) {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
  }
  function shouldMerge(one, two) {
    if (!isPlainObject(one) || !isPlainObject(two)) {
      return false;
    }
    return true;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/utils/url.js
  function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === "string") {
      return url === urlToMatch;
    } else {
      return !!url.match(urlToMatch);
    }
  }
  function isUrlIgnored(url, ignoredUrls) {
    if (!ignoredUrls) {
      return false;
    }
    for (const ignoreUrl of ignoredUrls) {
      if (urlMatches(url, ignoreUrl)) {
        return true;
      }
    }
    return false;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/utils/promise.js
  var Deferred = class {
    _promise;
    _resolve;
    _reject;
    constructor() {
      this._promise = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
    }
    get promise() {
      return this._promise;
    }
    resolve(val) {
      this._resolve(val);
    }
    reject(err) {
      this._reject(err);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/utils/callback.js
  var BindOnceFuture = class {
    _isCalled = false;
    _deferred = new Deferred();
    _callback;
    _that;
    constructor(callback, that) {
      this._callback = callback;
      this._that = that;
    }
    get isCalled() {
      return this._isCalled;
    }
    get promise() {
      return this._deferred.promise;
    }
    call(...args) {
      if (!this._isCalled) {
        this._isCalled = true;
        try {
          Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
        } catch (err) {
          this._deferred.reject(err);
        }
      }
      return this._deferred.promise;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/internal/exporter.js
  function _export(exporter, arg) {
    return new Promise((resolve) => {
      context.with(suppressTracing(context.active()), () => {
        exporter.export(arg, resolve);
      });
    });
  }

  // ../../../node_modules/.pnpm/@opentelemetry+core@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/core/build/esm/index.js
  var internal = {
    _export
  };

  // ../../../node_modules/.pnpm/@opentelemetry+resources@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/resources/build/esm/default-service-name.js
  var serviceName;
  function defaultServiceName() {
    if (serviceName === void 0) {
      try {
        const argv0 = globalThis.process.argv0;
        serviceName = argv0 ? `unknown_service:${argv0}` : "unknown_service";
      } catch {
        serviceName = "unknown_service";
      }
    }
    return serviceName;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+resources@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/resources/build/esm/utils.js
  var isPromiseLike = (val) => {
    return val !== null && typeof val === "object" && typeof val.then === "function";
  };

  // ../../../node_modules/.pnpm/@opentelemetry+resources@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/resources/build/esm/ResourceImpl.js
  var ResourceImpl = class _ResourceImpl {
    _rawAttributes;
    _asyncAttributesPending = false;
    _schemaUrl;
    _memoizedAttributes;
    static FromAttributeList(attributes, options) {
      const res = new _ResourceImpl({}, options);
      res._rawAttributes = guardedRawAttributes(attributes);
      res._asyncAttributesPending = attributes.filter(([_2, val]) => isPromiseLike(val)).length > 0;
      return res;
    }
    constructor(resource, options) {
      const attributes = resource.attributes ?? {};
      this._rawAttributes = Object.entries(attributes).map(([k2, v2]) => {
        if (isPromiseLike(v2)) {
          this._asyncAttributesPending = true;
        }
        return [k2, v2];
      });
      this._rawAttributes = guardedRawAttributes(this._rawAttributes);
      this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
    }
    get asyncAttributesPending() {
      return this._asyncAttributesPending;
    }
    async waitForAsyncAttributes() {
      if (!this.asyncAttributesPending) {
        return;
      }
      for (let i2 = 0; i2 < this._rawAttributes.length; i2++) {
        const [k2, v2] = this._rawAttributes[i2];
        this._rawAttributes[i2] = [k2, isPromiseLike(v2) ? await v2 : v2];
      }
      this._asyncAttributesPending = false;
    }
    get attributes() {
      if (this.asyncAttributesPending) {
        diag2.error("Accessing resource attributes before async attributes settled");
      }
      if (this._memoizedAttributes) {
        return this._memoizedAttributes;
      }
      const attrs = {};
      for (const [k2, v2] of this._rawAttributes) {
        if (isPromiseLike(v2)) {
          diag2.debug(`Unsettled resource attribute ${k2} skipped`);
          continue;
        }
        if (v2 != null) {
          attrs[k2] ??= v2;
        }
      }
      if (!this._asyncAttributesPending) {
        this._memoizedAttributes = attrs;
      }
      return attrs;
    }
    getRawAttributes() {
      return this._rawAttributes;
    }
    get schemaUrl() {
      return this._schemaUrl;
    }
    merge(resource) {
      if (resource == null)
        return this;
      const mergedSchemaUrl = mergeSchemaUrl(this, resource);
      const mergedOptions = mergedSchemaUrl ? { schemaUrl: mergedSchemaUrl } : void 0;
      return _ResourceImpl.FromAttributeList([...resource.getRawAttributes(), ...this.getRawAttributes()], mergedOptions);
    }
  };
  function resourceFromAttributes(attributes, options) {
    return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
  }
  function defaultResource() {
    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: defaultServiceName(),
      [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
      [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
      [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
    });
  }
  function guardedRawAttributes(attributes) {
    return attributes.map(([k2, v2]) => {
      if (isPromiseLike(v2)) {
        return [
          k2,
          v2.catch((err) => {
            diag2.debug("promise rejection for resource attribute: %s - %s", k2, err);
            return void 0;
          })
        ];
      }
      return [k2, v2];
    });
  }
  function validateSchemaUrl(schemaUrl) {
    if (typeof schemaUrl === "string" || schemaUrl === void 0) {
      return schemaUrl;
    }
    diag2.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", schemaUrl);
    return void 0;
  }
  function mergeSchemaUrl(old, updating) {
    const oldSchemaUrl = old?.schemaUrl;
    const updatingSchemaUrl = updating?.schemaUrl;
    const isOldEmpty = oldSchemaUrl === void 0 || oldSchemaUrl === "";
    const isUpdatingEmpty = updatingSchemaUrl === void 0 || updatingSchemaUrl === "";
    if (isOldEmpty) {
      return updatingSchemaUrl;
    }
    if (isUpdatingEmpty) {
      return oldSchemaUrl;
    }
    if (oldSchemaUrl === updatingSchemaUrl) {
      return oldSchemaUrl;
    }
    diag2.warn('Schema URL merge conflict: old resource has "%s", updating resource has "%s". Resulting resource will have undefined Schema URL.', oldSchemaUrl, updatingSchemaUrl);
    return void 0;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/enums.js
  var ExceptionEventName = "exception";

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/Span.js
  var SpanImpl = class {
    // Below properties are included to implement ReadableSpan for export
    // purposes but are not intended to be written-to directly.
    _spanContext;
    kind;
    parentSpanContext;
    attributes = {};
    links = [];
    events = [];
    startTime;
    resource;
    instrumentationScope;
    _droppedAttributesCount = 0;
    _droppedEventsCount = 0;
    _droppedLinksCount = 0;
    _attributesCount = 0;
    name;
    status = {
      code: SpanStatusCode.UNSET
    };
    endTime = [0, 0];
    _ended = false;
    _duration = [-1, -1];
    _spanProcessor;
    _spanLimits;
    _attributeValueLengthLimit;
    _recordEndMetrics;
    _performanceStartTime;
    _performanceOffset;
    _startTimeProvided;
    /**
     * Constructs a new SpanImpl instance.
     */
    constructor(opts) {
      const now = Date.now();
      this._spanContext = opts.spanContext;
      this._performanceStartTime = otperformance.now();
      this._performanceOffset = now - (this._performanceStartTime + otperformance.timeOrigin);
      this._startTimeProvided = opts.startTime != null;
      this._spanLimits = opts.spanLimits;
      this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit ?? 0;
      this._spanProcessor = opts.spanProcessor;
      this.name = opts.name;
      this.parentSpanContext = opts.parentSpanContext;
      this.kind = opts.kind;
      if (opts.links) {
        for (const link of opts.links) {
          this.addLink(link);
        }
      }
      this.startTime = this._getTime(opts.startTime ?? now);
      this.resource = opts.resource;
      this.instrumentationScope = opts.scope;
      this._recordEndMetrics = opts.recordEndMetrics;
      if (opts.attributes != null) {
        this.setAttributes(opts.attributes);
      }
      this._spanProcessor.onStart(this, opts.context);
    }
    spanContext() {
      return this._spanContext;
    }
    setAttribute(key, value) {
      if (value == null || this._isSpanEnded())
        return this;
      if (key.length === 0) {
        diag2.warn(`Invalid attribute key: ${key}`);
        return this;
      }
      if (!isAttributeValue(value)) {
        diag2.warn(`Invalid attribute value set for key: ${key}`);
        return this;
      }
      const { attributeCountLimit } = this._spanLimits;
      const isNewKey = !Object.prototype.hasOwnProperty.call(this.attributes, key);
      if (attributeCountLimit !== void 0 && this._attributesCount >= attributeCountLimit && isNewKey) {
        this._droppedAttributesCount++;
        return this;
      }
      this.attributes[key] = this._truncateToSize(value);
      if (isNewKey) {
        this._attributesCount++;
      }
      return this;
    }
    setAttributes(attributes) {
      for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
          this.setAttribute(key, attributes[key]);
        }
      }
      return this;
    }
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [timeStamp] Specified time stamp for the event
     */
    addEvent(name, attributesOrStartTime, timeStamp) {
      if (this._isSpanEnded())
        return this;
      const { eventCountLimit } = this._spanLimits;
      if (eventCountLimit === 0) {
        diag2.warn("No events allowed.");
        this._droppedEventsCount++;
        return this;
      }
      if (eventCountLimit !== void 0 && this.events.length >= eventCountLimit) {
        if (this._droppedEventsCount === 0) {
          diag2.debug("Dropping extra events.");
        }
        this.events.shift();
        this._droppedEventsCount++;
      }
      if (isTimeInput(attributesOrStartTime)) {
        if (!isTimeInput(timeStamp)) {
          timeStamp = attributesOrStartTime;
        }
        attributesOrStartTime = void 0;
      }
      const sanitized = sanitizeAttributes(attributesOrStartTime);
      const { attributePerEventCountLimit } = this._spanLimits;
      const attributes = {};
      let droppedAttributesCount = 0;
      let eventAttributesCount = 0;
      for (const attr in sanitized) {
        if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
          continue;
        }
        const attrVal = sanitized[attr];
        if (attributePerEventCountLimit !== void 0 && eventAttributesCount >= attributePerEventCountLimit) {
          droppedAttributesCount++;
          continue;
        }
        attributes[attr] = this._truncateToSize(attrVal);
        eventAttributesCount++;
      }
      this.events.push({
        name,
        attributes,
        time: this._getTime(timeStamp),
        droppedAttributesCount
      });
      return this;
    }
    addLink(link) {
      if (this._isSpanEnded())
        return this;
      const { linkCountLimit } = this._spanLimits;
      if (linkCountLimit === 0) {
        this._droppedLinksCount++;
        return this;
      }
      if (linkCountLimit !== void 0 && this.links.length >= linkCountLimit) {
        if (this._droppedLinksCount === 0) {
          diag2.debug("Dropping extra links.");
        }
        this.links.shift();
        this._droppedLinksCount++;
      }
      const { attributePerLinkCountLimit } = this._spanLimits;
      const sanitized = sanitizeAttributes(link.attributes);
      const attributes = {};
      let droppedAttributesCount = 0;
      let linkAttributesCount = 0;
      for (const attr in sanitized) {
        if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
          continue;
        }
        const attrVal = sanitized[attr];
        if (attributePerLinkCountLimit !== void 0 && linkAttributesCount >= attributePerLinkCountLimit) {
          droppedAttributesCount++;
          continue;
        }
        attributes[attr] = this._truncateToSize(attrVal);
        linkAttributesCount++;
      }
      const processedLink = { context: link.context };
      if (linkAttributesCount > 0) {
        processedLink.attributes = attributes;
      }
      if (droppedAttributesCount > 0) {
        processedLink.droppedAttributesCount = droppedAttributesCount;
      }
      this.links.push(processedLink);
      return this;
    }
    addLinks(links) {
      for (const link of links) {
        this.addLink(link);
      }
      return this;
    }
    setStatus(status) {
      if (this._isSpanEnded())
        return this;
      if (status.code === SpanStatusCode.UNSET)
        return this;
      if (this.status.code === SpanStatusCode.OK)
        return this;
      const newStatus = { code: status.code };
      if (status.code === SpanStatusCode.ERROR) {
        if (typeof status.message === "string") {
          newStatus.message = status.message;
        } else if (status.message != null) {
          diag2.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
        }
      }
      this.status = newStatus;
      return this;
    }
    updateName(name) {
      if (this._isSpanEnded())
        return this;
      this.name = name;
      return this;
    }
    end(endTime) {
      if (this._isSpanEnded()) {
        diag2.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
        return;
      }
      this.endTime = this._getTime(endTime);
      this._duration = hrTimeDuration(this.startTime, this.endTime);
      if (this._duration[0] < 0) {
        diag2.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
        this.endTime = this.startTime.slice();
        this._duration = [0, 0];
      }
      if (this._droppedEventsCount > 0) {
        diag2.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
      }
      if (this._droppedLinksCount > 0) {
        diag2.warn(`Dropped ${this._droppedLinksCount} links because linkCountLimit reached`);
      }
      if (this._spanProcessor.onEnding) {
        this._spanProcessor.onEnding(this);
      }
      this._recordEndMetrics?.();
      this._ended = true;
      this._spanProcessor.onEnd(this);
    }
    _getTime(inp) {
      if (typeof inp === "number" && inp <= otperformance.now()) {
        return hrTime(inp + this._performanceOffset);
      }
      if (typeof inp === "number") {
        return millisToHrTime(inp);
      }
      if (inp instanceof Date) {
        return millisToHrTime(inp.getTime());
      }
      if (isTimeInputHrTime(inp)) {
        return inp;
      }
      if (this._startTimeProvided) {
        return millisToHrTime(Date.now());
      }
      const msDuration = otperformance.now() - this._performanceStartTime;
      return addHrTimes(this.startTime, millisToHrTime(msDuration));
    }
    isRecording() {
      return this._ended === false;
    }
    recordException(exception, time) {
      const attributes = {};
      if (typeof exception === "string") {
        attributes[ATTR_EXCEPTION_MESSAGE] = exception;
      } else if (exception) {
        if (exception.code) {
          attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
        } else if (exception.name) {
          attributes[ATTR_EXCEPTION_TYPE] = exception.name;
        }
        if (exception.message) {
          attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
        }
        if (exception.stack) {
          attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
        }
      }
      if (attributes[ATTR_EXCEPTION_TYPE] || attributes[ATTR_EXCEPTION_MESSAGE]) {
        this.addEvent(ExceptionEventName, attributes, time);
      } else {
        diag2.warn(`Failed to record an exception ${exception}`);
      }
    }
    get duration() {
      return this._duration;
    }
    get ended() {
      return this._ended;
    }
    get droppedAttributesCount() {
      return this._droppedAttributesCount;
    }
    get droppedEventsCount() {
      return this._droppedEventsCount;
    }
    get droppedLinksCount() {
      return this._droppedLinksCount;
    }
    _isSpanEnded() {
      if (this._ended) {
        const error = new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
        diag2.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
      }
      return this._ended;
    }
    // Utility function to truncate given value within size
    // for value type of string, will truncate to given limit
    // for type of non-string, will return same value
    _truncateToLimitUtil(value, limit) {
      if (value.length <= limit) {
        return value;
      }
      return value.substring(0, limit);
    }
    /**
     * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
     * return string with truncated to {@code attributeValueLengthLimit} characters
     *
     * If the given attribute value is array of strings then
     * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
     *
     * Otherwise return same Attribute {@code value}
     *
     * @param value Attribute value
     * @returns truncated attribute value if required, otherwise same value
     */
    _truncateToSize(value) {
      const limit = this._attributeValueLengthLimit;
      if (limit <= 0) {
        diag2.warn(`Attribute value limit must be positive, got ${limit}`);
        return value;
      }
      if (typeof value === "string") {
        return this._truncateToLimitUtil(value, limit);
      }
      if (Array.isArray(value)) {
        return value.map((val) => typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val);
      }
      return value;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/Sampler.js
  var SamplingDecision2;
  (function(SamplingDecision3) {
    SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
    SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision2 || (SamplingDecision2 = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOffSampler.js
  var AlwaysOffSampler = class {
    shouldSample() {
      return {
        decision: SamplingDecision2.NOT_RECORD
      };
    }
    toString() {
      return "AlwaysOffSampler";
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOnSampler.js
  var AlwaysOnSampler = class {
    shouldSample() {
      return {
        decision: SamplingDecision2.RECORD_AND_SAMPLED
      };
    }
    toString() {
      return "AlwaysOnSampler";
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/ParentBasedSampler.js
  var ParentBasedSampler = class {
    _root;
    _remoteParentSampled;
    _remoteParentNotSampled;
    _localParentSampled;
    _localParentNotSampled;
    constructor(config) {
      this._root = config.root;
      if (!this._root) {
        globalErrorHandler(new Error("ParentBasedSampler must have a root sampler configured"));
        this._root = new AlwaysOnSampler();
      }
      this._remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler();
      this._remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler();
      this._localParentSampled = config.localParentSampled ?? new AlwaysOnSampler();
      this._localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler();
    }
    shouldSample(context2, traceId, spanName, spanKind, attributes, links) {
      const parentContext = trace.getSpanContext(context2);
      if (!parentContext || !isSpanContextValid(parentContext)) {
        return this._root.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      if (parentContext.isRemote) {
        if (parentContext.traceFlags & TraceFlags.SAMPLED) {
          return this._remoteParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
        }
        return this._remoteParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      if (parentContext.traceFlags & TraceFlags.SAMPLED) {
        return this._localParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      return this._localParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
    }
    toString() {
      return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/TraceIdRatioBasedSampler.js
  var TraceIdRatioBasedSampler = class {
    _ratio;
    _upperBound;
    constructor(ratio = 0) {
      this._ratio = this._normalize(ratio);
      this._upperBound = Math.floor(this._ratio * 4294967295);
    }
    shouldSample(context2, traceId) {
      return {
        decision: isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound ? SamplingDecision2.RECORD_AND_SAMPLED : SamplingDecision2.NOT_RECORD
      };
    }
    toString() {
      return `TraceIdRatioBased{${this._ratio}}`;
    }
    _normalize(ratio) {
      if (typeof ratio !== "number" || isNaN(ratio))
        return 0;
      return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
    }
    _accumulate(traceId) {
      let accumulation = 0;
      for (let i2 = 0; i2 < 32; i2 += 8) {
        let part = 0;
        for (let j = 0; j < 8; j++) {
          const c2 = traceId.charCodeAt(i2 + j);
          const v2 = c2 < 58 ? c2 - 48 : c2 < 71 ? c2 - 55 : c2 - 87;
          part = part << 4 | v2;
        }
        accumulation = (accumulation ^ part) >>> 0;
      }
      return accumulation;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js
  var TracesSamplerValues;
  (function(TracesSamplerValues2) {
    TracesSamplerValues2["AlwaysOff"] = "always_off";
    TracesSamplerValues2["AlwaysOn"] = "always_on";
    TracesSamplerValues2["ParentBasedAlwaysOff"] = "parentbased_always_off";
    TracesSamplerValues2["ParentBasedAlwaysOn"] = "parentbased_always_on";
    TracesSamplerValues2["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
    TracesSamplerValues2["TraceIdRatio"] = "traceidratio";
  })(TracesSamplerValues || (TracesSamplerValues = {}));
  var DEFAULT_RATIO = 1;
  function loadDefaultConfig() {
    return {
      sampler: buildSamplerFromEnv(),
      forceFlushTimeoutMillis: 3e4,
      generalLimits: {
        attributeValueLengthLimit: getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
        attributeCountLimit: getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? 128
      },
      spanLimits: {
        attributeValueLengthLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
        attributeCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? 128,
        linkCountLimit: getNumberFromEnv("OTEL_SPAN_LINK_COUNT_LIMIT") ?? 128,
        eventCountLimit: getNumberFromEnv("OTEL_SPAN_EVENT_COUNT_LIMIT") ?? 128,
        attributePerEventCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT") ?? 128,
        attributePerLinkCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT") ?? 128
      }
    };
  }
  function buildSamplerFromEnv() {
    const sampler = getStringFromEnv("OTEL_TRACES_SAMPLER") ?? TracesSamplerValues.ParentBasedAlwaysOn;
    switch (sampler) {
      case TracesSamplerValues.AlwaysOn:
        return new AlwaysOnSampler();
      case TracesSamplerValues.AlwaysOff:
        return new AlwaysOffSampler();
      case TracesSamplerValues.ParentBasedAlwaysOn:
        return new ParentBasedSampler({
          root: new AlwaysOnSampler()
        });
      case TracesSamplerValues.ParentBasedAlwaysOff:
        return new ParentBasedSampler({
          root: new AlwaysOffSampler()
        });
      case TracesSamplerValues.TraceIdRatio:
        return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
      case TracesSamplerValues.ParentBasedTraceIdRatio:
        return new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv())
        });
      default:
        diag2.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${TracesSamplerValues.ParentBasedAlwaysOn}".`);
        return new ParentBasedSampler({
          root: new AlwaysOnSampler()
        });
    }
  }
  function getSamplerProbabilityFromEnv() {
    const probability = getNumberFromEnv("OTEL_TRACES_SAMPLER_ARG");
    if (probability == null) {
      diag2.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
      return DEFAULT_RATIO;
    }
    if (probability < 0 || probability > 1) {
      diag2.error(`OTEL_TRACES_SAMPLER_ARG=${probability} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`);
      return DEFAULT_RATIO;
    }
    return probability;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js
  var DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
  var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
  function mergeConfig(userConfig) {
    const perInstanceDefaults = {
      sampler: buildSamplerFromEnv()
    };
    const DEFAULT_CONFIG = loadDefaultConfig();
    const target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
    target.generalLimits = Object.assign({}, DEFAULT_CONFIG.generalLimits, userConfig.generalLimits || {});
    target.spanLimits = Object.assign({}, DEFAULT_CONFIG.spanLimits, userConfig.spanLimits || {});
    return target;
  }
  function reconfigureLimits(userConfig) {
    const spanLimits = Object.assign({}, userConfig.spanLimits);
    spanLimits.attributeCountLimit = userConfig.spanLimits?.attributeCountLimit ?? userConfig.generalLimits?.attributeCountLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? DEFAULT_ATTRIBUTE_COUNT_LIMIT;
    spanLimits.attributeValueLengthLimit = userConfig.spanLimits?.attributeValueLengthLimit ?? userConfig.generalLimits?.attributeValueLengthLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
    return Object.assign({}, userConfig, { spanLimits });
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/export/BatchSpanProcessorBase.js
  var BatchSpanProcessorBase = class {
    _maxExportBatchSize;
    _maxQueueSize;
    _scheduledDelayMillis;
    _exportTimeoutMillis;
    _exporter;
    _isExporting = false;
    _finishedSpans = [];
    _timer;
    _shutdownOnce;
    _droppedSpansCount = 0;
    constructor(exporter, config) {
      this._exporter = exporter;
      this._maxExportBatchSize = typeof config?.maxExportBatchSize === "number" ? config.maxExportBatchSize : getNumberFromEnv("OTEL_BSP_MAX_EXPORT_BATCH_SIZE") ?? 512;
      this._maxQueueSize = typeof config?.maxQueueSize === "number" ? config.maxQueueSize : getNumberFromEnv("OTEL_BSP_MAX_QUEUE_SIZE") ?? 2048;
      this._scheduledDelayMillis = typeof config?.scheduledDelayMillis === "number" ? config.scheduledDelayMillis : getNumberFromEnv("OTEL_BSP_SCHEDULE_DELAY") ?? 5e3;
      this._exportTimeoutMillis = typeof config?.exportTimeoutMillis === "number" ? config.exportTimeoutMillis : getNumberFromEnv("OTEL_BSP_EXPORT_TIMEOUT") ?? 3e4;
      this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
      if (this._maxExportBatchSize > this._maxQueueSize) {
        diag2.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
        this._maxExportBatchSize = this._maxQueueSize;
      }
    }
    forceFlush() {
      if (this._shutdownOnce.isCalled) {
        return this._shutdownOnce.promise;
      }
      return this._flushAll();
    }
    // does nothing.
    onStart(_span, _parentContext) {
    }
    onEnd(span) {
      if (this._shutdownOnce.isCalled) {
        return;
      }
      if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
        return;
      }
      this._addToBuffer(span);
    }
    shutdown() {
      return this._shutdownOnce.call();
    }
    _shutdown() {
      return Promise.resolve().then(() => {
        return this.onShutdown();
      }).then(() => {
        return this._flushAll();
      }).then(() => {
        return this._exporter.shutdown();
      });
    }
    /** Add a span in the buffer. */
    _addToBuffer(span) {
      if (this._finishedSpans.length >= this._maxQueueSize) {
        if (this._droppedSpansCount === 0) {
          diag2.debug("maxQueueSize reached, dropping spans");
        }
        this._droppedSpansCount++;
        return;
      }
      if (this._droppedSpansCount > 0) {
        diag2.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`);
        this._droppedSpansCount = 0;
      }
      this._finishedSpans.push(span);
      this._maybeStartTimer();
    }
    /**
     * Send all spans to the exporter respecting the batch size limit
     * This function is used only on forceFlush or shutdown,
     * for all other cases _flush should be used
     * */
    _flushAll() {
      return new Promise((resolve, reject) => {
        const promises = [];
        const count = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
        for (let i2 = 0, j = count; i2 < j; i2++) {
          promises.push(this._flushOneBatch());
        }
        Promise.all(promises).then(() => {
          resolve();
        }).catch(reject);
      });
    }
    _flushOneBatch() {
      this._clearTimer();
      if (this._finishedSpans.length === 0) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Timeout"));
        }, this._exportTimeoutMillis);
        context.with(suppressTracing(context.active()), () => {
          let spans;
          if (this._finishedSpans.length <= this._maxExportBatchSize) {
            spans = this._finishedSpans;
            this._finishedSpans = [];
          } else {
            spans = this._finishedSpans.splice(0, this._maxExportBatchSize);
          }
          const doExport = () => this._exporter.export(spans, (result) => {
            clearTimeout(timer);
            if (result.code === ExportResultCode.SUCCESS) {
              resolve();
            } else {
              reject(result.error ?? new Error("BatchSpanProcessor: span export failed"));
            }
          });
          let pendingResources = null;
          for (let i2 = 0, len = spans.length; i2 < len; i2++) {
            const span = spans[i2];
            if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
              pendingResources ??= [];
              pendingResources.push(span.resource.waitForAsyncAttributes());
            }
          }
          if (pendingResources === null) {
            doExport();
          } else {
            Promise.all(pendingResources).then(doExport, (err) => {
              globalErrorHandler(err);
              reject(err);
            });
          }
        });
      });
    }
    _maybeStartTimer() {
      if (this._isExporting)
        return;
      const flush = () => {
        this._isExporting = true;
        this._flushOneBatch().finally(() => {
          this._isExporting = false;
          if (this._finishedSpans.length > 0) {
            this._clearTimer();
            this._maybeStartTimer();
          }
        }).catch((e2) => {
          this._isExporting = false;
          globalErrorHandler(e2);
        });
      };
      if (this._finishedSpans.length >= this._maxExportBatchSize) {
        return flush();
      }
      if (this._timer !== void 0)
        return;
      this._timer = setTimeout(() => flush(), this._scheduledDelayMillis);
      if (typeof this._timer !== "number") {
        this._timer.unref();
      }
    }
    _clearTimer() {
      if (this._timer !== void 0) {
        clearTimeout(this._timer);
        this._timer = void 0;
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/browser/export/BatchSpanProcessor.js
  var BatchSpanProcessor = class extends BatchSpanProcessorBase {
    _visibilityChangeListener;
    _pageHideListener;
    constructor(_exporter, config) {
      super(_exporter, config);
      this.onInit(config);
    }
    onInit(config) {
      if (config?.disableAutoFlushOnDocumentHide !== true && typeof document !== "undefined") {
        this._visibilityChangeListener = () => {
          if (document.visibilityState === "hidden") {
            this.forceFlush().catch((error) => {
              globalErrorHandler(error);
            });
          }
        };
        this._pageHideListener = () => {
          this.forceFlush().catch((error) => {
            globalErrorHandler(error);
          });
        };
        document.addEventListener("visibilitychange", this._visibilityChangeListener);
        document.addEventListener("pagehide", this._pageHideListener);
      }
    }
    onShutdown() {
      if (typeof document !== "undefined") {
        if (this._visibilityChangeListener) {
          document.removeEventListener("visibilitychange", this._visibilityChangeListener);
        }
        if (this._pageHideListener) {
          document.removeEventListener("pagehide", this._pageHideListener);
        }
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/browser/RandomIdGenerator.js
  var TRACE_ID_BYTES = 16;
  var SPAN_ID_BYTES = 8;
  var TRACE_BUFFER = new Uint8Array(TRACE_ID_BYTES);
  var SPAN_BUFFER = new Uint8Array(SPAN_ID_BYTES);
  var HEX = Array.from({ length: 256 }, (_2, i2) => i2.toString(16).padStart(2, "0"));
  function randomFill(buf) {
    for (let i2 = 0; i2 < buf.length; i2++) {
      buf[i2] = Math.random() * 256 >>> 0;
    }
    for (let i2 = 0; i2 < buf.length; i2++) {
      if (buf[i2] > 0)
        return;
    }
    buf[buf.length - 1] = 1;
  }
  function toHex(buf) {
    let hex = "";
    for (let i2 = 0; i2 < buf.length; i2++) {
      hex += HEX[buf[i2]];
    }
    return hex;
  }
  var RandomIdGenerator = class {
    /**
     * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
     * characters corresponding to 128 bits.
     */
    generateTraceId() {
      randomFill(TRACE_BUFFER);
      return toHex(TRACE_BUFFER);
    }
    /**
     * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
     * characters corresponding to 64 bits.
     */
    generateSpanId() {
      randomFill(SPAN_BUFFER);
      return toHex(SPAN_BUFFER);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/semconv.js
  var ATTR_OTEL_SPAN_PARENT_ORIGIN = "otel.span.parent.origin";
  var ATTR_OTEL_SPAN_SAMPLING_RESULT = "otel.span.sampling_result";
  var METRIC_OTEL_SDK_SPAN_LIVE = "otel.sdk.span.live";
  var METRIC_OTEL_SDK_SPAN_STARTED = "otel.sdk.span.started";

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/TracerMetrics.js
  var TracerMetrics = class {
    startedSpans;
    liveSpans;
    constructor(meter) {
      this.startedSpans = meter.createCounter(METRIC_OTEL_SDK_SPAN_STARTED, {
        unit: "{span}",
        description: "The number of created spans."
      });
      this.liveSpans = meter.createUpDownCounter(METRIC_OTEL_SDK_SPAN_LIVE, {
        unit: "{span}",
        description: "The number of currently live spans."
      });
    }
    startSpan(parentSpanCtx, samplingDecision) {
      const samplingDecisionStr = samplingDecisionToString(samplingDecision);
      this.startedSpans.add(1, {
        [ATTR_OTEL_SPAN_PARENT_ORIGIN]: parentOrigin(parentSpanCtx),
        [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
      });
      if (samplingDecision === SamplingDecision2.NOT_RECORD) {
        return () => {
        };
      }
      const liveSpanAttributes = {
        [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
      };
      this.liveSpans.add(1, liveSpanAttributes);
      return () => {
        this.liveSpans.add(-1, liveSpanAttributes);
      };
    }
  };
  function parentOrigin(parentSpanContext) {
    if (!parentSpanContext) {
      return "none";
    }
    if (parentSpanContext.isRemote) {
      return "remote";
    }
    return "local";
  }
  function samplingDecisionToString(decision) {
    switch (decision) {
      case SamplingDecision2.RECORD_AND_SAMPLED:
        return "RECORD_AND_SAMPLE";
      case SamplingDecision2.RECORD:
        return "RECORD_ONLY";
      case SamplingDecision2.NOT_RECORD:
        return "DROP";
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/version.js
  var VERSION4 = "2.7.1";

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/Tracer.js
  var Tracer = class {
    _sampler;
    _generalLimits;
    _spanLimits;
    _idGenerator;
    instrumentationScope;
    _resource;
    _spanProcessor;
    _tracerMetrics;
    /**
     * Constructs a new Tracer instance.
     */
    constructor(instrumentationScope, config, resource, spanProcessor) {
      const localConfig = mergeConfig(config);
      this._sampler = localConfig.sampler;
      this._generalLimits = localConfig.generalLimits;
      this._spanLimits = localConfig.spanLimits;
      this._idGenerator = config.idGenerator || new RandomIdGenerator();
      this._resource = resource;
      this._spanProcessor = spanProcessor;
      this.instrumentationScope = instrumentationScope;
      const meter = localConfig.meterProvider ? localConfig.meterProvider.getMeter("@opentelemetry/sdk-trace", VERSION4) : createNoopMeter();
      this._tracerMetrics = new TracerMetrics(meter);
    }
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */
    startSpan(name, options = {}, context2 = context.active()) {
      if (options.root) {
        context2 = trace.deleteSpan(context2);
      }
      const parentSpan = trace.getSpan(context2);
      if (isTracingSuppressed(context2)) {
        diag2.debug("Instrumentation suppressed, returning Noop Span");
        const nonRecordingSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
        return nonRecordingSpan;
      }
      const parentSpanContext = parentSpan?.spanContext();
      const spanId = this._idGenerator.generateSpanId();
      let validParentSpanContext;
      let traceId;
      let traceState;
      if (!parentSpanContext || !trace.isSpanContextValid(parentSpanContext)) {
        traceId = this._idGenerator.generateTraceId();
      } else {
        traceId = parentSpanContext.traceId;
        traceState = parentSpanContext.traceState;
        validParentSpanContext = parentSpanContext;
      }
      const spanKind = options.kind ?? SpanKind.INTERNAL;
      const links = (options.links ?? []).map((link) => {
        return {
          context: link.context,
          attributes: sanitizeAttributes(link.attributes)
        };
      });
      const attributes = sanitizeAttributes(options.attributes);
      const samplingResult = this._sampler.shouldSample(context2, traceId, name, spanKind, attributes, links);
      const recordEndMetrics = this._tracerMetrics.startSpan(parentSpanContext, samplingResult.decision);
      traceState = samplingResult.traceState ?? traceState;
      const traceFlags = samplingResult.decision === SamplingDecision.RECORD_AND_SAMPLED ? TraceFlags.SAMPLED : TraceFlags.NONE;
      const spanContext = { traceId, spanId, traceFlags, traceState };
      if (samplingResult.decision === SamplingDecision.NOT_RECORD) {
        diag2.debug("Recording is off, propagating context in a non-recording span");
        const nonRecordingSpan = trace.wrapSpanContext(spanContext);
        return nonRecordingSpan;
      }
      const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
      const span = new SpanImpl({
        resource: this._resource,
        scope: this.instrumentationScope,
        context: context2,
        spanContext,
        name,
        kind: spanKind,
        links,
        parentSpanContext: validParentSpanContext,
        attributes: initAttributes,
        startTime: options.startTime,
        spanProcessor: this._spanProcessor,
        spanLimits: this._spanLimits,
        recordEndMetrics
      });
      return span;
    }
    startActiveSpan(name, arg2, arg3, arg4) {
      let opts;
      let ctx;
      let fn;
      if (arguments.length < 2) {
        return;
      } else if (arguments.length === 2) {
        fn = arg2;
      } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
      } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
      }
      const parentContext = ctx ?? context.active();
      const span = this.startSpan(name, opts, parentContext);
      const contextWithSpanSet = trace.setSpan(parentContext, span);
      return context.with(contextWithSpanSet, fn, void 0, span);
    }
    /** Returns the active {@link GeneralLimits}. */
    getGeneralLimits() {
      return this._generalLimits;
    }
    /** Returns the active {@link SpanLimits}. */
    getSpanLimits() {
      return this._spanLimits;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/MultiSpanProcessor.js
  var MultiSpanProcessor = class {
    _spanProcessors;
    constructor(spanProcessors) {
      this._spanProcessors = spanProcessors;
    }
    forceFlush() {
      const promises = [];
      for (const spanProcessor of this._spanProcessors) {
        promises.push(spanProcessor.forceFlush());
      }
      return new Promise((resolve) => {
        Promise.all(promises).then(() => {
          resolve();
        }).catch((error) => {
          globalErrorHandler(error || new Error("MultiSpanProcessor: forceFlush failed"));
          resolve();
        });
      });
    }
    onStart(span, context2) {
      for (const spanProcessor of this._spanProcessors) {
        spanProcessor.onStart(span, context2);
      }
    }
    onEnding(span) {
      for (const spanProcessor of this._spanProcessors) {
        if (spanProcessor.onEnding) {
          spanProcessor.onEnding(span);
        }
      }
    }
    onEnd(span) {
      for (const spanProcessor of this._spanProcessors) {
        spanProcessor.onEnd(span);
      }
    }
    shutdown() {
      const promises = [];
      for (const spanProcessor of this._spanProcessors) {
        promises.push(spanProcessor.shutdown());
      }
      return new Promise((resolve, reject) => {
        Promise.all(promises).then(() => {
          resolve();
        }, reject);
      });
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-base/build/esm/BasicTracerProvider.js
  var ForceFlushState;
  (function(ForceFlushState2) {
    ForceFlushState2[ForceFlushState2["resolved"] = 0] = "resolved";
    ForceFlushState2[ForceFlushState2["timeout"] = 1] = "timeout";
    ForceFlushState2[ForceFlushState2["error"] = 2] = "error";
    ForceFlushState2[ForceFlushState2["unresolved"] = 3] = "unresolved";
  })(ForceFlushState || (ForceFlushState = {}));
  var BasicTracerProvider = class {
    _config;
    _tracers = /* @__PURE__ */ new Map();
    _resource;
    _activeSpanProcessor;
    constructor(config = {}) {
      const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
      this._resource = mergedConfig.resource ?? defaultResource();
      this._config = Object.assign({}, mergedConfig, {
        resource: this._resource
      });
      const spanProcessors = [];
      if (config.spanProcessors?.length) {
        spanProcessors.push(...config.spanProcessors);
      }
      this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
    }
    getTracer(name, version, options) {
      const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
      if (!this._tracers.has(key)) {
        this._tracers.set(key, new Tracer({ name, version, schemaUrl: options?.schemaUrl }, this._config, this._resource, this._activeSpanProcessor));
      }
      return this._tracers.get(key);
    }
    forceFlush() {
      const timeout = this._config.forceFlushTimeoutMillis;
      const promises = this._activeSpanProcessor["_spanProcessors"].map((spanProcessor) => {
        return new Promise((resolve) => {
          let state;
          const timeoutInterval = setTimeout(() => {
            resolve(new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
            state = ForceFlushState.timeout;
          }, timeout);
          spanProcessor.forceFlush().then(() => {
            clearTimeout(timeoutInterval);
            if (state !== ForceFlushState.timeout) {
              state = ForceFlushState.resolved;
              resolve(state);
            }
          }).catch((error) => {
            clearTimeout(timeoutInterval);
            state = ForceFlushState.error;
            resolve(error);
          });
        });
      });
      return new Promise((resolve, reject) => {
        Promise.all(promises).then((results) => {
          const errors = results.filter((result) => result !== ForceFlushState.resolved);
          if (errors.length > 0) {
            reject(errors);
          } else {
            resolve();
          }
        }).catch((error) => reject([error]));
      });
    }
    shutdown() {
      return this._activeSpanProcessor.shutdown();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-web/build/esm/StackContextManager.js
  var StackContextManager = class {
    /**
     * whether the context manager is enabled or not
     */
    _enabled = false;
    /**
     * Keeps the reference to current context
     */
    _currentContext = ROOT_CONTEXT;
    /**
     *
     * @param context
     * @param target Function to be executed within the context
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    _bindFunction(context2 = ROOT_CONTEXT, target) {
      const manager = this;
      const contextWrapper = function(...args) {
        return manager.with(context2, () => target.apply(this, args));
      };
      Object.defineProperty(contextWrapper, "length", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: target.length
      });
      return contextWrapper;
    }
    /**
     * Returns the active context
     */
    active() {
      return this._currentContext;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function or event emitter. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context2, target) {
      if (context2 === void 0) {
        context2 = this.active();
      }
      if (typeof target === "function") {
        return this._bindFunction(context2, target);
      }
      return target;
    }
    /**
     * Disable the context manager (clears the current context)
     */
    disable() {
      this._currentContext = ROOT_CONTEXT;
      this._enabled = false;
      return this;
    }
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable() {
      if (this._enabled) {
        return this;
      }
      this._enabled = true;
      this._currentContext = ROOT_CONTEXT;
      return this;
    }
    /**
     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
     * The context will be set as active
     * @param context
     * @param fn Callback function
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      const previousContext = this._currentContext;
      this._currentContext = context2 || ROOT_CONTEXT;
      try {
        return fn.call(thisArg, ...args);
      } finally {
        this._currentContext = previousContext;
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-web/build/esm/WebTracerProvider.js
  function setupContextManager(contextManager) {
    if (contextManager === null) {
      return;
    }
    if (contextManager === void 0) {
      const defaultContextManager = new StackContextManager();
      defaultContextManager.enable();
      context.setGlobalContextManager(defaultContextManager);
      return;
    }
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
  }
  function setupPropagator(propagator) {
    if (propagator === null) {
      return;
    }
    if (propagator === void 0) {
      propagation.setGlobalPropagator(new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator()
        ]
      }));
      return;
    }
    propagation.setGlobalPropagator(propagator);
  }
  var WebTracerProvider = class extends BasicTracerProvider {
    /**
     * Constructs a new Tracer instance.
     * @param config Web Tracer config
     */
    constructor(config = {}) {
      super(config);
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
      trace.setGlobalTracerProvider(this);
      setupPropagator(config.propagator);
      setupContextManager(config.contextManager);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-web/build/esm/enums/PerformanceTimingNames.js
  var PerformanceTimingNames;
  (function(PerformanceTimingNames2) {
    PerformanceTimingNames2["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames2["CONNECT_START"] = "connectStart";
    PerformanceTimingNames2["DECODED_BODY_SIZE"] = "decodedBodySize";
    PerformanceTimingNames2["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames2["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames2["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames2["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames2["ENCODED_BODY_SIZE"] = "encodedBodySize";
    PerformanceTimingNames2["FETCH_START"] = "fetchStart";
    PerformanceTimingNames2["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames2["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames2["NAVIGATION_START"] = "navigationStart";
    PerformanceTimingNames2["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames2["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames2["REQUEST_START"] = "requestStart";
    PerformanceTimingNames2["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames2["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames2["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames2["START_TIME"] = "startTime";
    PerformanceTimingNames2["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames2["UNLOAD_EVENT_START"] = "unloadEventStart";
  })(PerformanceTimingNames || (PerformanceTimingNames = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-web/build/esm/semconv.js
  var ATTR_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
  var ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-trace-web/build/esm/utils.js
  var urlNormalizingAnchor;
  function getUrlNormalizingAnchor() {
    if (!urlNormalizingAnchor) {
      urlNormalizingAnchor = document.createElement("a");
    }
    return urlNormalizingAnchor;
  }
  function hasKey(obj, key) {
    return key in obj;
  }
  function addSpanNetworkEvent(span, performanceName, entries, ignoreZeros = true) {
    if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number" && !(ignoreZeros && entries[performanceName] === 0)) {
      return span.addEvent(performanceName, entries[performanceName]);
    }
    return void 0;
  }
  function addSpanNetworkEvents(span, resource, ignoreNetworkEvents = false, ignoreZeros, skipOldSemconvContentLengthAttrs) {
    if (ignoreZeros === void 0) {
      ignoreZeros = resource[PerformanceTimingNames.START_TIME] !== 0;
    }
    if (!ignoreNetworkEvents) {
      addSpanNetworkEvent(span, PerformanceTimingNames.FETCH_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_END, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.SECURE_CONNECTION_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_END, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.REQUEST_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_END, resource, ignoreZeros);
    }
    if (!skipOldSemconvContentLengthAttrs) {
      const encodedLength = resource[PerformanceTimingNames.ENCODED_BODY_SIZE];
      if (encodedLength !== void 0) {
        span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
      }
      const decodedLength = resource[PerformanceTimingNames.DECODED_BODY_SIZE];
      if (decodedLength !== void 0 && encodedLength !== decodedLength) {
        span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
      }
    }
  }
  function sortResources(filteredResources) {
    return filteredResources.slice().sort((a2, b2) => {
      const valueA = a2[PerformanceTimingNames.FETCH_START];
      const valueB = b2[PerformanceTimingNames.FETCH_START];
      if (valueA > valueB) {
        return 1;
      } else if (valueA < valueB) {
        return -1;
      }
      return 0;
    });
  }
  function getOrigin() {
    return typeof location !== "undefined" ? location.origin : void 0;
  }
  function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = /* @__PURE__ */ new WeakSet(), initiatorType) {
    const parsedSpanUrl = parseUrl(spanUrl);
    spanUrl = parsedSpanUrl.toString();
    const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
    if (filteredResources.length === 0) {
      return {
        mainRequest: void 0
      };
    }
    if (filteredResources.length === 1) {
      return {
        mainRequest: filteredResources[0]
      };
    }
    const sorted = sortResources(filteredResources);
    if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
      let corsPreFlightRequest = sorted[0];
      let mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END], endTimeHR);
      const responseEnd = corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END];
      const fetchStart = mainRequest[PerformanceTimingNames.FETCH_START];
      if (fetchStart < responseEnd) {
        mainRequest = corsPreFlightRequest;
        corsPreFlightRequest = void 0;
      }
      return {
        corsPreFlightRequest,
        mainRequest
      };
    } else {
      return {
        mainRequest: filteredResources[0]
      };
    }
  }
  function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    const spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
    const minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
    let mainRequest = resources[1];
    let bestGap;
    const length = resources.length;
    for (let i2 = 1; i2 < length; i2++) {
      const resource = resources[i2];
      const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      const currentGap = spanEndTime - resourceEndTime;
      if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
        bestGap = currentGap;
        mainRequest = resource;
      }
    }
    return mainRequest;
  }
  function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    const startTime = hrTimeToNanoseconds(startTimeHR);
    const endTime = hrTimeToNanoseconds(endTimeHR);
    let filteredResources = resources.filter((resource) => {
      const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      return resource.initiatorType.toLowerCase() === (initiatorType || "xmlhttprequest") && resource.name === spanUrl && resourceStartTime >= startTime && resourceEndTime <= endTime;
    });
    if (filteredResources.length > 0) {
      filteredResources = filteredResources.filter((resource) => {
        return !ignoredResources.has(resource);
      });
    }
    return filteredResources;
  }
  function parseUrl(url) {
    if (typeof URL === "function") {
      return new URL(url, typeof document !== "undefined" ? document.baseURI : typeof location !== "undefined" ? location.href : void 0);
    }
    const element = getUrlNormalizingAnchor();
    element.href = url;
    return element;
  }
  function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
    let propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
    if (typeof propagateTraceHeaderUrls === "string" || propagateTraceHeaderUrls instanceof RegExp) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }
    const parsedSpanUrl = parseUrl(spanUrl);
    if (parsedSpanUrl.origin === getOrigin()) {
      return true;
    } else {
      return propagateTraceHeaderUrls.some((propagateTraceHeaderUrl) => urlMatches(spanUrl, propagateTraceHeaderUrl));
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/OTLPExporterBase.js
  var OTLPExporterBase = class {
    _delegate;
    constructor(delegate) {
      this._delegate = delegate;
    }
    /**
     * Export items.
     * @param items
     * @param resultCallback
     */
    export(items, resultCallback) {
      this._delegate.export(items, resultCallback);
    }
    forceFlush() {
      return this._delegate.forceFlush();
    }
    shutdown() {
      return this._delegate.shutdown();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/types.js
  var OTLPExporterError = class extends Error {
    code;
    name = "OTLPExporterError";
    data;
    constructor(message, code, data) {
      super(message);
      this.data = data;
      this.code = code;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/shared-configuration.js
  function validateTimeoutMillis(timeoutMillis) {
    if (Number.isFinite(timeoutMillis) && timeoutMillis > 0) {
      return timeoutMillis;
    }
    throw new Error(`Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: '${timeoutMillis}')`);
  }
  function wrapStaticHeadersInFunction(headers) {
    if (headers == null) {
      return void 0;
    }
    return async () => headers;
  }
  function mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
    return {
      timeoutMillis: validateTimeoutMillis(userProvidedConfiguration.timeoutMillis ?? fallbackConfiguration.timeoutMillis ?? defaultConfiguration.timeoutMillis),
      concurrencyLimit: userProvidedConfiguration.concurrencyLimit ?? fallbackConfiguration.concurrencyLimit ?? defaultConfiguration.concurrencyLimit,
      compression: userProvidedConfiguration.compression ?? fallbackConfiguration.compression ?? defaultConfiguration.compression
    };
  }
  function getSharedConfigurationDefaults() {
    return {
      timeoutMillis: 1e4,
      concurrencyLimit: 30,
      compression: "none"
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/bounded-queue-export-promise-handler.js
  var BoundedQueueExportPromiseHandler = class {
    _concurrencyLimit;
    _sendingPromises = [];
    /**
     * @param concurrencyLimit maximum promises allowed in a queue at the same time.
     */
    constructor(concurrencyLimit) {
      this._concurrencyLimit = concurrencyLimit;
    }
    pushPromise(promise) {
      if (this.hasReachedLimit()) {
        throw new Error("Concurrency Limit reached");
      }
      this._sendingPromises.push(promise);
      const popPromise = () => {
        const index = this._sendingPromises.indexOf(promise);
        void this._sendingPromises.splice(index, 1);
      };
      promise.then(popPromise, popPromise);
    }
    hasReachedLimit() {
      return this._sendingPromises.length >= this._concurrencyLimit;
    }
    async awaitAll() {
      await Promise.all(this._sendingPromises);
    }
  };
  function createBoundedQueueExportPromiseHandler(options) {
    return new BoundedQueueExportPromiseHandler(options.concurrencyLimit);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/logging-response-handler.js
  function isPartialSuccessResponse(response) {
    return Object.prototype.hasOwnProperty.call(response, "partialSuccess");
  }
  function createLoggingPartialSuccessResponseHandler() {
    return {
      handleResponse(response) {
        if (response == null || !isPartialSuccessResponse(response) || response.partialSuccess == null || Object.keys(response.partialSuccess).length === 0) {
          return;
        }
        diag2.warn("Received Partial Success response:", JSON.stringify(response.partialSuccess));
      }
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-export-delegate.js
  var OTLPExportDelegate = class {
    _diagLogger;
    _transport;
    _serializer;
    _responseHandler;
    _promiseQueue;
    _timeout;
    constructor(transport, serializer, responseHandler, promiseQueue, timeout) {
      this._transport = transport;
      this._serializer = serializer;
      this._responseHandler = responseHandler;
      this._promiseQueue = promiseQueue;
      this._timeout = timeout;
      this._diagLogger = diag2.createComponentLogger({
        namespace: "OTLPExportDelegate"
      });
    }
    export(internalRepresentation, resultCallback) {
      this._diagLogger.debug("items to be sent", internalRepresentation);
      if (this._promiseQueue.hasReachedLimit()) {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error("Concurrent export limit reached")
        });
        return;
      }
      const serializedRequest = this._serializer.serializeRequest(internalRepresentation);
      if (serializedRequest == null) {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error("Nothing to send")
        });
        return;
      }
      this._promiseQueue.pushPromise(this._transport.send(serializedRequest, this._timeout).then((response) => {
        if (response.status === "success") {
          if (response.data != null) {
            try {
              this._responseHandler.handleResponse(this._serializer.deserializeResponse(response.data));
            } catch (e2) {
              this._diagLogger.warn("Export succeeded but could not deserialize response - is the response specification compliant?", e2, response.data);
            }
          }
          resultCallback({
            code: ExportResultCode.SUCCESS
          });
          return;
        } else if (response.status === "failure" && response.error) {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: response.error
          });
          return;
        } else if (response.status === "retryable") {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: response.error ?? new OTLPExporterError("Export failed with retryable status")
          });
        } else {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: new OTLPExporterError("Export failed with unknown error")
          });
        }
      }, (reason) => resultCallback({
        code: ExportResultCode.FAILED,
        error: reason
      })));
    }
    forceFlush() {
      return this._promiseQueue.awaitAll();
    }
    async shutdown() {
      this._diagLogger.debug("shutdown started");
      await this.forceFlush();
      this._transport.shutdown();
    }
  };
  function createOtlpExportDelegate(components, settings) {
    return new OTLPExportDelegate(components.transport, components.serializer, createLoggingPartialSuccessResponseHandler(), components.promiseHandler, settings.timeout);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-network-export-delegate.js
  function createOtlpNetworkExportDelegate(options, serializer, transport) {
    return createOtlpExportDelegate({
      transport,
      serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options)
    }, { timeout: options.timeoutMillis });
  }

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js
  var NoopLogger = class {
    emit(_logRecord) {
    }
    enabled() {
      return false;
    }
  };
  var NOOP_LOGGER = new NoopLogger();

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/internal/global-utils.js
  var GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
  var _global2 = globalThis;
  function makeGetter(requiredVersion, instance, fallback) {
    return (version) => version === requiredVersion ? instance : fallback;
  }
  var API_BACKWARDS_COMPATIBILITY_VERSION = 1;

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js
  var NoopLoggerProvider = class {
    getLogger(_name, _version, _options) {
      return new NoopLogger();
    }
  };
  var NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/ProxyLogger.js
  var ProxyLogger = class {
    constructor(provider, name, version, options) {
      this._provider = provider;
      this.name = name;
      this.version = version;
      this.options = options;
    }
    /**
     * Emit a log record. This method should only be used by log appenders.
     *
     * @param logRecord
     */
    emit(logRecord) {
      this._getLogger().emit(logRecord);
    }
    enabled(options) {
      return this._getLogger().enabled(options);
    }
    /**
     * Try to get a logger from the proxy logger provider.
     * If the proxy logger provider has no delegate, return a noop logger.
     */
    _getLogger() {
      if (this._delegate) {
        return this._delegate;
      }
      const logger2 = this._provider._getDelegateLogger(this.name, this.version, this.options);
      if (!logger2) {
        return NOOP_LOGGER;
      }
      this._delegate = logger2;
      return this._delegate;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/ProxyLoggerProvider.js
  var ProxyLoggerProvider = class {
    getLogger(name, version, options) {
      var _a;
      return (_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger(this, name, version, options);
    }
    /**
     * Get the delegate logger provider.
     * Used by tests only.
     * @internal
     */
    _getDelegate() {
      var _a;
      return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
    }
    /**
     * Set the delegate logger provider
     * @internal
     */
    _setDelegate(delegate) {
      this._delegate = delegate;
    }
    /**
     * @internal
     */
    _getDelegateLogger(name, version, options) {
      var _a;
      return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/api/logs.js
  var LogsAPI = class _LogsAPI {
    constructor() {
      this._proxyLoggerProvider = new ProxyLoggerProvider();
    }
    static getInstance() {
      if (!this._instance) {
        this._instance = new _LogsAPI();
      }
      return this._instance;
    }
    setGlobalLoggerProvider(provider) {
      if (_global2[GLOBAL_LOGS_API_KEY]) {
        return this.getLoggerProvider();
      }
      _global2[GLOBAL_LOGS_API_KEY] = makeGetter(API_BACKWARDS_COMPATIBILITY_VERSION, provider, NOOP_LOGGER_PROVIDER);
      this._proxyLoggerProvider._setDelegate(provider);
      return provider;
    }
    /**
     * Returns the global logger provider.
     *
     * @returns LoggerProvider
     */
    getLoggerProvider() {
      var _a, _b;
      return (_b = (_a = _global2[GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(_global2, API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
    }
    /**
     * Returns a logger from the global logger provider.
     *
     * @returns Logger
     */
    getLogger(name, version, options) {
      return this.getLoggerProvider().getLogger(name, version, options);
    }
    /** Remove the global logger provider */
    disable() {
      delete _global2[GLOBAL_LOGS_API_KEY];
      this._proxyLoggerProvider = new ProxyLoggerProvider();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+api-logs@0.218.0/node_modules/@opentelemetry/api-logs/build/esm/index.js
  var logs = LogsAPI.getInstance();

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/export/AggregationTemporality.js
  var AggregationTemporality;
  (function(AggregationTemporality2) {
    AggregationTemporality2[AggregationTemporality2["DELTA"] = 0] = "DELTA";
    AggregationTemporality2[AggregationTemporality2["CUMULATIVE"] = 1] = "CUMULATIVE";
  })(AggregationTemporality || (AggregationTemporality = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/export/MetricData.js
  var InstrumentType;
  (function(InstrumentType2) {
    InstrumentType2["COUNTER"] = "COUNTER";
    InstrumentType2["GAUGE"] = "GAUGE";
    InstrumentType2["HISTOGRAM"] = "HISTOGRAM";
    InstrumentType2["UP_DOWN_COUNTER"] = "UP_DOWN_COUNTER";
    InstrumentType2["OBSERVABLE_COUNTER"] = "OBSERVABLE_COUNTER";
    InstrumentType2["OBSERVABLE_GAUGE"] = "OBSERVABLE_GAUGE";
    InstrumentType2["OBSERVABLE_UP_DOWN_COUNTER"] = "OBSERVABLE_UP_DOWN_COUNTER";
  })(InstrumentType || (InstrumentType = {}));
  var DataPointType;
  (function(DataPointType2) {
    DataPointType2[DataPointType2["HISTOGRAM"] = 0] = "HISTOGRAM";
    DataPointType2[DataPointType2["EXPONENTIAL_HISTOGRAM"] = 1] = "EXPONENTIAL_HISTOGRAM";
    DataPointType2[DataPointType2["GAUGE"] = 2] = "GAUGE";
    DataPointType2[DataPointType2["SUM"] = 3] = "SUM";
  })(DataPointType || (DataPointType = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/utils.js
  function hashAttributes(attributes) {
    let keys = Object.keys(attributes);
    if (keys.length === 0)
      return "";
    keys = keys.sort();
    return JSON.stringify(keys.map((key) => [key, attributes[key]]));
  }
  function instrumentationScopeId(instrumentationScope) {
    return `${instrumentationScope.name}:${instrumentationScope.version ?? ""}:${instrumentationScope.schemaUrl ?? ""}`;
  }
  var TimeoutError = class _TimeoutError extends Error {
    constructor(message) {
      super(message);
      Object.setPrototypeOf(this, _TimeoutError.prototype);
    }
  };
  function callWithTimeout(promise, timeout) {
    let timeoutHandle;
    const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
      timeoutHandle = setTimeout(function timeoutHandler() {
        reject(new TimeoutError("Operation timed out."));
      }, timeout);
    });
    return Promise.race([promise, timeoutPromise]).then((result) => {
      clearTimeout(timeoutHandle);
      return result;
    }, (reason) => {
      clearTimeout(timeoutHandle);
      throw reason;
    });
  }
  function setEquals(lhs, rhs) {
    if (lhs.size !== rhs.size) {
      return false;
    }
    for (const item of lhs) {
      if (!rhs.has(item)) {
        return false;
      }
    }
    return true;
  }
  function binarySearchUB(arr, value) {
    let lo = 0;
    let hi = arr.length - 1;
    let ret = arr.length;
    while (hi >= lo) {
      const mid = lo + Math.trunc((hi - lo) / 2);
      if (arr[mid] < value) {
        lo = mid + 1;
      } else {
        ret = mid;
        hi = mid - 1;
      }
    }
    return ret;
  }
  function equalsCaseInsensitive(lhs, rhs) {
    return lhs.toLowerCase() === rhs.toLowerCase();
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/types.js
  var AggregatorKind;
  (function(AggregatorKind2) {
    AggregatorKind2[AggregatorKind2["DROP"] = 0] = "DROP";
    AggregatorKind2[AggregatorKind2["SUM"] = 1] = "SUM";
    AggregatorKind2[AggregatorKind2["LAST_VALUE"] = 2] = "LAST_VALUE";
    AggregatorKind2[AggregatorKind2["HISTOGRAM"] = 3] = "HISTOGRAM";
    AggregatorKind2[AggregatorKind2["EXPONENTIAL_HISTOGRAM"] = 4] = "EXPONENTIAL_HISTOGRAM";
  })(AggregatorKind || (AggregatorKind = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/Drop.js
  var DropAggregator = class {
    kind = AggregatorKind.DROP;
    createAccumulation() {
      return void 0;
    }
    merge(_previous, _delta) {
      return void 0;
    }
    diff(_previous, _current) {
      return void 0;
    }
    toMetricData(_descriptor, _aggregationTemporality, _accumulationByAttributes, _endTime) {
      return void 0;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/Histogram.js
  function createNewEmptyCheckpoint(boundaries) {
    const counts = boundaries.map(() => 0);
    counts.push(0);
    return {
      buckets: {
        boundaries,
        counts
      },
      sum: 0,
      count: 0,
      hasMinMax: false,
      min: Infinity,
      max: -Infinity
    };
  }
  var HistogramAccumulation = class {
    startTime;
    _boundaries;
    _recordMinMax;
    _current;
    constructor(startTime, boundaries, recordMinMax = true, current = createNewEmptyCheckpoint(boundaries)) {
      this.startTime = startTime;
      this._boundaries = boundaries;
      this._recordMinMax = recordMinMax;
      this._current = current;
    }
    record(value) {
      if (Number.isNaN(value)) {
        return;
      }
      this._current.count += 1;
      this._current.sum += value;
      if (this._recordMinMax) {
        this._current.min = Math.min(value, this._current.min);
        this._current.max = Math.max(value, this._current.max);
        this._current.hasMinMax = true;
      }
      const idx = binarySearchUB(this._boundaries, value);
      this._current.buckets.counts[idx] += 1;
    }
    setStartTime(startTime) {
      this.startTime = startTime;
    }
    toPointValue() {
      return this._current;
    }
  };
  var HistogramAggregator = class {
    kind = AggregatorKind.HISTOGRAM;
    _boundaries;
    _recordMinMax;
    /**
     * @param _boundaries sorted upper bounds of recorded values.
     * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
     */
    constructor(boundaries, recordMinMax) {
      this._boundaries = boundaries;
      this._recordMinMax = recordMinMax;
    }
    createAccumulation(startTime) {
      return new HistogramAccumulation(startTime, this._boundaries, this._recordMinMax);
    }
    /**
     * Return the result of the merge of two histogram accumulations. As long as one Aggregator
     * instance produces all Accumulations with constant boundaries we don't need to worry about
     * merging accumulations with different boundaries.
     */
    merge(previous, delta) {
      const previousValue = previous.toPointValue();
      const deltaValue = delta.toPointValue();
      const previousCounts = previousValue.buckets.counts;
      const deltaCounts = deltaValue.buckets.counts;
      const mergedCounts = new Array(previousCounts.length);
      for (let idx = 0; idx < previousCounts.length; idx++) {
        mergedCounts[idx] = previousCounts[idx] + deltaCounts[idx];
      }
      let min = Infinity;
      let max = -Infinity;
      if (this._recordMinMax) {
        if (previousValue.hasMinMax && deltaValue.hasMinMax) {
          min = Math.min(previousValue.min, deltaValue.min);
          max = Math.max(previousValue.max, deltaValue.max);
        } else if (previousValue.hasMinMax) {
          min = previousValue.min;
          max = previousValue.max;
        } else if (deltaValue.hasMinMax) {
          min = deltaValue.min;
          max = deltaValue.max;
        }
      }
      return new HistogramAccumulation(previous.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
        buckets: {
          boundaries: previousValue.buckets.boundaries,
          counts: mergedCounts
        },
        count: previousValue.count + deltaValue.count,
        sum: previousValue.sum + deltaValue.sum,
        hasMinMax: this._recordMinMax && (previousValue.hasMinMax || deltaValue.hasMinMax),
        min,
        max
      });
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
      const previousValue = previous.toPointValue();
      const currentValue = current.toPointValue();
      const previousCounts = previousValue.buckets.counts;
      const currentCounts = currentValue.buckets.counts;
      const diffedCounts = new Array(previousCounts.length);
      for (let idx = 0; idx < previousCounts.length; idx++) {
        diffedCounts[idx] = currentCounts[idx] - previousCounts[idx];
      }
      return new HistogramAccumulation(current.startTime, previousValue.buckets.boundaries, this._recordMinMax, {
        buckets: {
          boundaries: previousValue.buckets.boundaries,
          counts: diffedCounts
        },
        count: currentValue.count - previousValue.count,
        sum: currentValue.sum - previousValue.sum,
        hasMinMax: false,
        min: Infinity,
        max: -Infinity
      });
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
      return {
        descriptor,
        aggregationTemporality,
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
          const pointValue = accumulation.toPointValue();
          const allowsNegativeValues = descriptor.type === InstrumentType.GAUGE || descriptor.type === InstrumentType.UP_DOWN_COUNTER || descriptor.type === InstrumentType.OBSERVABLE_GAUGE || descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
          return {
            attributes,
            startTime: accumulation.startTime,
            endTime,
            value: {
              min: pointValue.hasMinMax ? pointValue.min : void 0,
              max: pointValue.hasMinMax ? pointValue.max : void 0,
              sum: !allowsNegativeValues ? pointValue.sum : void 0,
              buckets: pointValue.buckets,
              count: pointValue.count
            }
          };
        })
      };
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/Buckets.js
  var Buckets = class _Buckets {
    backing;
    indexBase;
    indexStart;
    indexEnd;
    /**
     * The term index refers to the number of the exponential histogram bucket
     * used to determine its boundaries. The lower boundary of a bucket is
     * determined by base ** index and the upper boundary of a bucket is
     * determined by base ** (index + 1). index values are signed to account
     * for values less than or equal to 1.
     *
     * indexBase is the index of the 0th position in the
     * backing array, i.e., backing[0] is the count
     * in the bucket with index `indexBase`.
     *
     * indexStart is the smallest index value represented
     * in the backing array.
     *
     * indexEnd is the largest index value represented in
     * the backing array.
     */
    constructor(backing = new BucketsBacking(), indexBase = 0, indexStart = 0, indexEnd = 0) {
      this.backing = backing;
      this.indexBase = indexBase;
      this.indexStart = indexStart;
      this.indexEnd = indexEnd;
    }
    /**
     * Offset is the bucket index of the smallest entry in the counts array
     * @returns {number}
     */
    get offset() {
      return this.indexStart;
    }
    /**
     * Buckets is a view into the backing array.
     * @returns {number}
     */
    get length() {
      if (this.backing.length === 0) {
        return 0;
      }
      if (this.indexEnd === this.indexStart && this.at(0) === 0) {
        return 0;
      }
      return this.indexEnd - this.indexStart + 1;
    }
    /**
     * An array of counts, where count[i] carries the count
     * of the bucket at index (offset+i).  count[i] is the count of
     * values greater than base^(offset+i) and less than or equal to
     * base^(offset+i+1).
     * @returns {number} The logical counts based on the backing array
     */
    counts() {
      return Array.from({ length: this.length }, (_2, i2) => this.at(i2));
    }
    /**
     * At returns the count of the bucket at a position in the logical
     * array of counts.
     * @param position
     * @returns {number}
     */
    at(position) {
      const bias = this.indexBase - this.indexStart;
      if (position < bias) {
        position += this.backing.length;
      }
      position -= bias;
      return this.backing.countAt(position);
    }
    /**
     * incrementBucket increments the backing array index by `increment`
     * @param bucketIndex
     * @param increment
     */
    incrementBucket(bucketIndex, increment) {
      this.backing.increment(bucketIndex, increment);
    }
    /**
     * decrementBucket decrements the backing array index by `decrement`
     * if decrement is greater than the current value, it's set to 0.
     * @param bucketIndex
     * @param decrement
     */
    decrementBucket(bucketIndex, decrement) {
      this.backing.decrement(bucketIndex, decrement);
    }
    /**
     * trim removes leading and / or trailing zero buckets (which can occur
     * after diffing two histos) and rotates the backing array so that the
     * smallest non-zero index is in the 0th position of the backing array
     */
    trim() {
      for (let i2 = 0; i2 < this.length; i2++) {
        if (this.at(i2) !== 0) {
          this.indexStart += i2;
          break;
        } else if (i2 === this.length - 1) {
          this.indexStart = this.indexEnd = this.indexBase = 0;
          return;
        }
      }
      for (let i2 = this.length - 1; i2 >= 0; i2--) {
        if (this.at(i2) !== 0) {
          this.indexEnd -= this.length - i2 - 1;
          break;
        }
      }
      this._rotate();
    }
    /**
     * downscale first rotates, then collapses 2**`by`-to-1 buckets.
     * @param by
     */
    downscale(by) {
      this._rotate();
      const size = 1 + this.indexEnd - this.indexStart;
      const each = 1 << by;
      let inpos = 0;
      let outpos = 0;
      for (let pos = this.indexStart; pos <= this.indexEnd; ) {
        let mod = pos % each;
        if (mod < 0) {
          mod += each;
        }
        for (let i2 = mod; i2 < each && inpos < size; i2++) {
          this._relocateBucket(outpos, inpos);
          inpos++;
          pos++;
        }
        outpos++;
      }
      this.indexStart >>= by;
      this.indexEnd >>= by;
      this.indexBase = this.indexStart;
    }
    /**
     * Clone returns a deep copy of Buckets
     * @returns {Buckets}
     */
    clone() {
      return new _Buckets(this.backing.clone(), this.indexBase, this.indexStart, this.indexEnd);
    }
    /**
     * _rotate shifts the backing array contents so that indexStart ==
     * indexBase to simplify the downscale logic.
     */
    _rotate() {
      const bias = this.indexBase - this.indexStart;
      if (bias === 0) {
        return;
      } else if (bias > 0) {
        this.backing.reverse(0, this.backing.length);
        this.backing.reverse(0, bias);
        this.backing.reverse(bias, this.backing.length);
      } else {
        this.backing.reverse(0, this.backing.length);
        this.backing.reverse(0, this.backing.length + bias);
      }
      this.indexBase = this.indexStart;
    }
    /**
     * _relocateBucket adds the count in counts[src] to counts[dest] and
     * resets count[src] to zero.
     */
    _relocateBucket(dest, src) {
      if (dest === src) {
        return;
      }
      this.incrementBucket(dest, this.backing.emptyBucket(src));
    }
  };
  var BucketsBacking = class _BucketsBacking {
    _counts;
    constructor(counts = [0]) {
      this._counts = counts;
    }
    /**
     * length returns the physical size of the backing array, which
     * is >= buckets.length()
     */
    get length() {
      return this._counts.length;
    }
    /**
     * countAt returns the count in a specific bucket
     */
    countAt(pos) {
      return this._counts[pos];
    }
    /**
     * growTo grows a backing array and copies old entries
     * into their correct new positions.
     */
    growTo(newSize, oldPositiveLimit, newPositiveLimit) {
      const tmp = new Array(newSize).fill(0);
      tmp.splice(newPositiveLimit, this._counts.length - oldPositiveLimit, ...this._counts.slice(oldPositiveLimit));
      tmp.splice(0, oldPositiveLimit, ...this._counts.slice(0, oldPositiveLimit));
      this._counts = tmp;
    }
    /**
     * reverse the items in the backing array in the range [from, limit).
     */
    reverse(from, limit) {
      const num = Math.floor((from + limit) / 2) - from;
      for (let i2 = 0; i2 < num; i2++) {
        const tmp = this._counts[from + i2];
        this._counts[from + i2] = this._counts[limit - i2 - 1];
        this._counts[limit - i2 - 1] = tmp;
      }
    }
    /**
     * emptyBucket empties the count from a bucket, for
     * moving into another.
     */
    emptyBucket(src) {
      const tmp = this._counts[src];
      this._counts[src] = 0;
      return tmp;
    }
    /**
     * increments a bucket by `increment`
     */
    increment(bucketIndex, increment) {
      this._counts[bucketIndex] += increment;
    }
    /**
     * decrements a bucket by `decrement`
     */
    decrement(bucketIndex, decrement) {
      if (this._counts[bucketIndex] >= decrement) {
        this._counts[bucketIndex] -= decrement;
      } else {
        this._counts[bucketIndex] = 0;
      }
    }
    /**
     * clone returns a deep copy of BucketsBacking
     */
    clone() {
      return new _BucketsBacking([...this._counts]);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/mapping/ieee754.js
  var SIGNIFICAND_WIDTH = 52;
  var EXPONENT_MASK = 2146435072;
  var SIGNIFICAND_MASK = 1048575;
  var EXPONENT_BIAS = 1023;
  var MIN_NORMAL_EXPONENT = -EXPONENT_BIAS + 1;
  var MAX_NORMAL_EXPONENT = EXPONENT_BIAS;
  var MIN_VALUE = Math.pow(2, -1022);
  function getNormalBase2(value) {
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, value);
    const hiBits = dv.getUint32(0);
    const expBits = (hiBits & EXPONENT_MASK) >> 20;
    return expBits - EXPONENT_BIAS;
  }
  function getSignificand(value) {
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, value);
    const hiBits = dv.getUint32(0);
    const loBits = dv.getUint32(4);
    const significandHiBits = (hiBits & SIGNIFICAND_MASK) * Math.pow(2, 32);
    return significandHiBits + loBits;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/util.js
  function ldexp(frac, exp) {
    if (frac === 0 || frac === Number.POSITIVE_INFINITY || frac === Number.NEGATIVE_INFINITY || Number.isNaN(frac)) {
      return frac;
    }
    return frac * Math.pow(2, exp);
  }
  function nextGreaterSquare(v2) {
    v2--;
    v2 |= v2 >> 1;
    v2 |= v2 >> 2;
    v2 |= v2 >> 4;
    v2 |= v2 >> 8;
    v2 |= v2 >> 16;
    v2++;
    return v2;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/mapping/types.js
  var MappingError = class extends Error {
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/mapping/ExponentMapping.js
  var ExponentMapping = class {
    _shift;
    constructor(scale) {
      this._shift = -scale;
    }
    /**
     * Maps positive floating point values to indexes corresponding to scale
     * @param value
     * @returns {number} index for provided value at the current scale
     */
    mapToIndex(value) {
      if (value < MIN_VALUE) {
        return this._minNormalLowerBoundaryIndex();
      }
      const exp = getNormalBase2(value);
      const correction = this._rightShift(getSignificand(value) - 1, SIGNIFICAND_WIDTH);
      return exp + correction >> this._shift;
    }
    /**
     * Returns the lower bucket boundary for the given index for scale
     *
     * @param index
     * @returns {number}
     */
    lowerBoundary(index) {
      const minIndex = this._minNormalLowerBoundaryIndex();
      if (index < minIndex) {
        throw new MappingError(`underflow: ${index} is < minimum lower boundary: ${minIndex}`);
      }
      const maxIndex = this._maxNormalLowerBoundaryIndex();
      if (index > maxIndex) {
        throw new MappingError(`overflow: ${index} is > maximum lower boundary: ${maxIndex}`);
      }
      return ldexp(1, index << this._shift);
    }
    /**
     * The scale used by this mapping
     * @returns {number}
     */
    get scale() {
      if (this._shift === 0) {
        return 0;
      }
      return -this._shift;
    }
    _minNormalLowerBoundaryIndex() {
      let index = MIN_NORMAL_EXPONENT >> this._shift;
      if (this._shift < 2) {
        index--;
      }
      return index;
    }
    _maxNormalLowerBoundaryIndex() {
      return MAX_NORMAL_EXPONENT >> this._shift;
    }
    _rightShift(value, shift) {
      return Math.floor(value * Math.pow(2, -shift));
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/mapping/LogarithmMapping.js
  var LogarithmMapping = class {
    _scale;
    _scaleFactor;
    _inverseFactor;
    constructor(scale) {
      this._scale = scale;
      this._scaleFactor = ldexp(Math.LOG2E, scale);
      this._inverseFactor = ldexp(Math.LN2, -scale);
    }
    /**
     * Maps positive floating point values to indexes corresponding to scale
     * @param value
     * @returns {number} index for provided value at the current scale
     */
    mapToIndex(value) {
      if (value <= MIN_VALUE) {
        return this._minNormalLowerBoundaryIndex() - 1;
      }
      if (getSignificand(value) === 0) {
        const exp = getNormalBase2(value);
        return (exp << this._scale) - 1;
      }
      const index = Math.floor(Math.log(value) * this._scaleFactor);
      const maxIndex = this._maxNormalLowerBoundaryIndex();
      if (index >= maxIndex) {
        return maxIndex;
      }
      return index;
    }
    /**
     * Returns the lower bucket boundary for the given index for scale
     *
     * @param index
     * @returns {number}
     */
    lowerBoundary(index) {
      const maxIndex = this._maxNormalLowerBoundaryIndex();
      if (index >= maxIndex) {
        if (index === maxIndex) {
          return 2 * Math.exp((index - (1 << this._scale)) / this._scaleFactor);
        }
        throw new MappingError(`overflow: ${index} is > maximum lower boundary: ${maxIndex}`);
      }
      const minIndex = this._minNormalLowerBoundaryIndex();
      if (index <= minIndex) {
        if (index === minIndex) {
          return MIN_VALUE;
        } else if (index === minIndex - 1) {
          return Math.exp((index + (1 << this._scale)) / this._scaleFactor) / 2;
        }
        throw new MappingError(`overflow: ${index} is < minimum lower boundary: ${minIndex}`);
      }
      return Math.exp(index * this._inverseFactor);
    }
    /**
     * The scale used by this mapping
     * @returns {number}
     */
    get scale() {
      return this._scale;
    }
    _minNormalLowerBoundaryIndex() {
      return MIN_NORMAL_EXPONENT << this._scale;
    }
    _maxNormalLowerBoundaryIndex() {
      return (MAX_NORMAL_EXPONENT + 1 << this._scale) - 1;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/exponential-histogram/mapping/getMapping.js
  var MIN_SCALE = -10;
  var MAX_SCALE = 20;
  var PREBUILT_MAPPINGS = Array.from({ length: 31 }, (_2, i2) => {
    if (i2 > 10) {
      return new LogarithmMapping(i2 - 10);
    }
    return new ExponentMapping(i2 - 10);
  });
  function getMapping(scale) {
    if (scale > MAX_SCALE || scale < MIN_SCALE) {
      throw new MappingError(`expected scale >= ${MIN_SCALE} && <= ${MAX_SCALE}, got: ${scale}`);
    }
    return PREBUILT_MAPPINGS[scale + 10];
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/ExponentialHistogram.js
  var HighLow = class _HighLow {
    static combine(h1, h2) {
      return new _HighLow(Math.min(h1.low, h2.low), Math.max(h1.high, h2.high));
    }
    low;
    high;
    constructor(low, high) {
      this.low = low;
      this.high = high;
    }
  };
  var MAX_SCALE2 = 20;
  var DEFAULT_MAX_SIZE = 160;
  var MIN_MAX_SIZE = 2;
  var ExponentialHistogramAccumulation = class _ExponentialHistogramAccumulation {
    startTime;
    _maxSize;
    _recordMinMax;
    _sum;
    _count;
    _zeroCount;
    _min;
    _max;
    _positive;
    _negative;
    _mapping;
    constructor(startTime, maxSize = DEFAULT_MAX_SIZE, recordMinMax = true, sum = 0, count = 0, zeroCount = 0, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, positive = new Buckets(), negative = new Buckets(), mapping = getMapping(MAX_SCALE2)) {
      this.startTime = startTime;
      this._maxSize = maxSize;
      this._recordMinMax = recordMinMax;
      this._sum = sum;
      this._count = count;
      this._zeroCount = zeroCount;
      this._min = min;
      this._max = max;
      this._positive = positive;
      this._negative = negative;
      this._mapping = mapping;
      if (this._maxSize < MIN_MAX_SIZE) {
        diag2.warn(`Exponential Histogram Max Size set to ${this._maxSize},                 changing to the minimum size of: ${MIN_MAX_SIZE}`);
        this._maxSize = MIN_MAX_SIZE;
      }
    }
    /**
     * record updates a histogram with a single count
     * @param {Number} value
     */
    record(value) {
      this.updateByIncrement(value, 1);
    }
    /**
     * Sets the start time for this accumulation
     * @param {HrTime} startTime
     */
    setStartTime(startTime) {
      this.startTime = startTime;
    }
    /**
     * Returns the datapoint representation of this accumulation
     * @param {HrTime} startTime
     */
    toPointValue() {
      return {
        hasMinMax: this._recordMinMax,
        min: this.min,
        max: this.max,
        sum: this.sum,
        positive: {
          offset: this.positive.offset,
          bucketCounts: this.positive.counts()
        },
        negative: {
          offset: this.negative.offset,
          bucketCounts: this.negative.counts()
        },
        count: this.count,
        scale: this.scale,
        zeroCount: this.zeroCount
      };
    }
    /**
     * @returns {Number} The sum of values recorded by this accumulation
     */
    get sum() {
      return this._sum;
    }
    /**
     * @returns {Number} The minimum value recorded by this accumulation
     */
    get min() {
      return this._min;
    }
    /**
     * @returns {Number} The maximum value recorded by this accumulation
     */
    get max() {
      return this._max;
    }
    /**
     * @returns {Number} The count of values recorded by this accumulation
     */
    get count() {
      return this._count;
    }
    /**
     * @returns {Number} The number of 0 values recorded by this accumulation
     */
    get zeroCount() {
      return this._zeroCount;
    }
    /**
     * @returns {Number} The scale used by this accumulation
     */
    get scale() {
      if (this._count === this._zeroCount) {
        return 0;
      }
      return this._mapping.scale;
    }
    /**
     * positive holds the positive values
     * @returns {Buckets}
     */
    get positive() {
      return this._positive;
    }
    /**
     * negative holds the negative values by their absolute value
     * @returns {Buckets}
     */
    get negative() {
      return this._negative;
    }
    /**
     * updateByIncr supports updating a histogram with a non-negative
     * increment.
     * @param value
     * @param increment
     */
    updateByIncrement(value, increment) {
      if (Number.isNaN(value)) {
        return;
      }
      if (value > this._max) {
        this._max = value;
      }
      if (value < this._min) {
        this._min = value;
      }
      this._count += increment;
      if (value === 0) {
        this._zeroCount += increment;
        return;
      }
      this._sum += value * increment;
      if (value > 0) {
        this._updateBuckets(this._positive, value, increment);
      } else {
        this._updateBuckets(this._negative, -value, increment);
      }
    }
    /**
     * merge combines data from previous value into self
     * @param {ExponentialHistogramAccumulation} previous
     */
    merge(previous) {
      if (this._count === 0) {
        this._min = previous.min;
        this._max = previous.max;
      } else if (previous.count !== 0) {
        if (previous.min < this.min) {
          this._min = previous.min;
        }
        if (previous.max > this.max) {
          this._max = previous.max;
        }
      }
      this.startTime = previous.startTime;
      this._sum += previous.sum;
      this._count += previous.count;
      this._zeroCount += previous.zeroCount;
      const minScale = this._minScale(previous);
      this._downscale(this.scale - minScale);
      this._mergeBuckets(this.positive, previous, previous.positive, minScale);
      this._mergeBuckets(this.negative, previous, previous.negative, minScale);
    }
    /**
     * diff subtracts other from self
     * @param {ExponentialHistogramAccumulation} other
     */
    diff(other) {
      this._min = Infinity;
      this._max = -Infinity;
      this._sum -= other.sum;
      this._count -= other.count;
      this._zeroCount -= other.zeroCount;
      const minScale = this._minScale(other);
      this._downscale(this.scale - minScale);
      this._diffBuckets(this.positive, other, other.positive, minScale);
      this._diffBuckets(this.negative, other, other.negative, minScale);
    }
    /**
     * clone returns a deep copy of self
     * @returns {ExponentialHistogramAccumulation}
     */
    clone() {
      return new _ExponentialHistogramAccumulation(this.startTime, this._maxSize, this._recordMinMax, this._sum, this._count, this._zeroCount, this._min, this._max, this.positive.clone(), this.negative.clone(), this._mapping);
    }
    /**
     * _updateBuckets maps the incoming value to a bucket index for the current
     * scale. If the bucket index is outside of the range of the backing array,
     * it will rescale the backing array and update the mapping for the new scale.
     */
    _updateBuckets(buckets, value, increment) {
      let index = this._mapping.mapToIndex(value);
      let rescalingNeeded = false;
      let high = 0;
      let low = 0;
      if (buckets.length === 0) {
        buckets.indexStart = index;
        buckets.indexEnd = buckets.indexStart;
        buckets.indexBase = buckets.indexStart;
      } else if (index < buckets.indexStart && buckets.indexEnd - index >= this._maxSize) {
        rescalingNeeded = true;
        low = index;
        high = buckets.indexEnd;
      } else if (index > buckets.indexEnd && index - buckets.indexStart >= this._maxSize) {
        rescalingNeeded = true;
        low = buckets.indexStart;
        high = index;
      }
      if (rescalingNeeded) {
        const change = this._changeScale(high, low);
        this._downscale(change);
        index = this._mapping.mapToIndex(value);
      }
      this._incrementIndexBy(buckets, index, increment);
    }
    /**
     * _incrementIndexBy increments the count of the bucket specified by `index`.
     * If the index is outside of the range [buckets.indexStart, buckets.indexEnd]
     * the boundaries of the backing array will be adjusted and more buckets will
     * be added if needed.
     */
    _incrementIndexBy(buckets, index, increment) {
      if (increment === 0) {
        return;
      }
      if (buckets.length === 0) {
        buckets.indexStart = buckets.indexEnd = buckets.indexBase = index;
      }
      if (index < buckets.indexStart) {
        const span = buckets.indexEnd - index;
        if (span >= buckets.backing.length) {
          this._grow(buckets, span + 1);
        }
        buckets.indexStart = index;
      } else if (index > buckets.indexEnd) {
        const span = index - buckets.indexStart;
        if (span >= buckets.backing.length) {
          this._grow(buckets, span + 1);
        }
        buckets.indexEnd = index;
      }
      let bucketIndex = index - buckets.indexBase;
      if (bucketIndex < 0) {
        bucketIndex += buckets.backing.length;
      }
      buckets.incrementBucket(bucketIndex, increment);
    }
    /**
     * grow resizes the backing array by doubling in size up to maxSize.
     * This extends the array with a bunch of zeros and copies the
     * existing counts to the same position.
     */
    _grow(buckets, needed) {
      const size = buckets.backing.length;
      const bias = buckets.indexBase - buckets.indexStart;
      const oldPositiveLimit = size - bias;
      let newSize = nextGreaterSquare(needed);
      if (newSize > this._maxSize) {
        newSize = this._maxSize;
      }
      const newPositiveLimit = newSize - bias;
      buckets.backing.growTo(newSize, oldPositiveLimit, newPositiveLimit);
    }
    /**
     * _changeScale computes how much downscaling is needed by shifting the
     * high and low values until they are separated by no more than size.
     */
    _changeScale(high, low) {
      let change = 0;
      while (high - low >= this._maxSize) {
        high >>= 1;
        low >>= 1;
        change++;
      }
      return change;
    }
    /**
     * _downscale subtracts `change` from the current mapping scale.
     */
    _downscale(change) {
      if (change === 0) {
        return;
      }
      if (change < 0) {
        throw new Error(`impossible change of scale: ${this.scale}`);
      }
      const newScale = this._mapping.scale - change;
      this._positive.downscale(change);
      this._negative.downscale(change);
      this._mapping = getMapping(newScale);
    }
    /**
     * _minScale is used by diff and merge to compute an ideal combined scale
     */
    _minScale(other) {
      const minScale = Math.min(this.scale, other.scale);
      const highLowPos = HighLow.combine(this._highLowAtScale(this.positive, this.scale, minScale), this._highLowAtScale(other.positive, other.scale, minScale));
      const highLowNeg = HighLow.combine(this._highLowAtScale(this.negative, this.scale, minScale), this._highLowAtScale(other.negative, other.scale, minScale));
      return Math.min(minScale - this._changeScale(highLowPos.high, highLowPos.low), minScale - this._changeScale(highLowNeg.high, highLowNeg.low));
    }
    /**
     * _highLowAtScale is used by diff and merge to compute an ideal combined scale.
     */
    _highLowAtScale(buckets, currentScale, newScale) {
      if (buckets.length === 0) {
        return new HighLow(0, -1);
      }
      const shift = currentScale - newScale;
      return new HighLow(buckets.indexStart >> shift, buckets.indexEnd >> shift);
    }
    /**
     * _mergeBuckets translates index values from another histogram and
     * adds the values into the corresponding buckets of this histogram.
     */
    _mergeBuckets(ours, other, theirs, scale) {
      const theirOffset = theirs.offset;
      const theirChange = other.scale - scale;
      for (let i2 = 0; i2 < theirs.length; i2++) {
        this._incrementIndexBy(ours, theirOffset + i2 >> theirChange, theirs.at(i2));
      }
    }
    /**
     * _diffBuckets translates index values from another histogram and
     * subtracts the values in the corresponding buckets of this histogram.
     */
    _diffBuckets(ours, other, theirs, scale) {
      const theirOffset = theirs.offset;
      const theirChange = other.scale - scale;
      for (let i2 = 0; i2 < theirs.length; i2++) {
        const ourIndex = theirOffset + i2 >> theirChange;
        let bucketIndex = ourIndex - ours.indexBase;
        if (bucketIndex < 0) {
          bucketIndex += ours.backing.length;
        }
        ours.decrementBucket(bucketIndex, theirs.at(i2));
      }
      ours.trim();
    }
  };
  var ExponentialHistogramAggregator = class {
    kind = AggregatorKind.EXPONENTIAL_HISTOGRAM;
    _maxSize;
    _recordMinMax;
    /**
     * @param _maxSize Maximum number of buckets for each of the positive
     *    and negative ranges, exclusive of the zero-bucket.
     * @param _recordMinMax If set to true, min and max will be recorded.
     *    Otherwise, min and max will not be recorded.
     */
    constructor(maxSize, recordMinMax) {
      this._maxSize = maxSize;
      this._recordMinMax = recordMinMax;
    }
    createAccumulation(startTime) {
      return new ExponentialHistogramAccumulation(startTime, this._maxSize, this._recordMinMax);
    }
    /**
     * Return the result of the merge of two exponential histogram accumulations.
     */
    merge(previous, delta) {
      const result = delta.clone();
      result.merge(previous);
      return result;
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
      const result = current.clone();
      result.diff(previous);
      return result;
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
      return {
        descriptor,
        aggregationTemporality,
        dataPointType: DataPointType.EXPONENTIAL_HISTOGRAM,
        dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
          const pointValue = accumulation.toPointValue();
          const allowsNegativeValues = descriptor.type === InstrumentType.GAUGE || descriptor.type === InstrumentType.UP_DOWN_COUNTER || descriptor.type === InstrumentType.OBSERVABLE_GAUGE || descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
          return {
            attributes,
            startTime: accumulation.startTime,
            endTime,
            value: {
              min: pointValue.hasMinMax ? pointValue.min : void 0,
              max: pointValue.hasMinMax ? pointValue.max : void 0,
              sum: !allowsNegativeValues ? pointValue.sum : void 0,
              positive: {
                offset: pointValue.positive.offset,
                bucketCounts: pointValue.positive.bucketCounts
              },
              negative: {
                offset: pointValue.negative.offset,
                bucketCounts: pointValue.negative.bucketCounts
              },
              count: pointValue.count,
              scale: pointValue.scale,
              zeroCount: pointValue.zeroCount
            }
          };
        })
      };
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/LastValue.js
  var LastValueAccumulation = class {
    startTime;
    _current;
    sampleTime;
    constructor(startTime, current = 0, sampleTime = [0, 0]) {
      this.startTime = startTime;
      this._current = current;
      this.sampleTime = sampleTime;
    }
    record(value) {
      this._current = value;
      this.sampleTime = millisToHrTime(Date.now());
    }
    setStartTime(startTime) {
      this.startTime = startTime;
    }
    toPointValue() {
      return this._current;
    }
  };
  var LastValueAggregator = class {
    kind = AggregatorKind.LAST_VALUE;
    createAccumulation(startTime) {
      return new LastValueAccumulation(startTime);
    }
    /**
     * Returns the result of the merge of the given accumulations.
     *
     * Return the newly captured (delta) accumulation for LastValueAggregator.
     */
    merge(previous, delta) {
      const latestAccumulation = hrTimeToMicroseconds(delta.sampleTime) >= hrTimeToMicroseconds(previous.sampleTime) ? delta : previous;
      return new LastValueAccumulation(previous.startTime, latestAccumulation.toPointValue(), latestAccumulation.sampleTime);
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     *
     * A delta aggregation is not meaningful to LastValueAggregator, just return
     * the newly captured (delta) accumulation for LastValueAggregator.
     */
    diff(previous, current) {
      const latestAccumulation = hrTimeToMicroseconds(current.sampleTime) >= hrTimeToMicroseconds(previous.sampleTime) ? current : previous;
      return new LastValueAccumulation(current.startTime, latestAccumulation.toPointValue(), latestAccumulation.sampleTime);
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
      return {
        descriptor,
        aggregationTemporality,
        dataPointType: DataPointType.GAUGE,
        dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
          return {
            attributes,
            startTime: accumulation.startTime,
            endTime,
            value: accumulation.toPointValue()
          };
        })
      };
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/aggregator/Sum.js
  var SumAccumulation = class {
    startTime;
    monotonic;
    _current;
    reset;
    constructor(startTime, monotonic, current = 0, reset = false) {
      this.startTime = startTime;
      this.monotonic = monotonic;
      this._current = current;
      this.reset = reset;
    }
    record(value) {
      if (this.monotonic && value < 0) {
        return;
      }
      this._current += value;
    }
    setStartTime(startTime) {
      this.startTime = startTime;
    }
    toPointValue() {
      return this._current;
    }
  };
  var SumAggregator = class {
    kind = AggregatorKind.SUM;
    monotonic;
    constructor(monotonic) {
      this.monotonic = monotonic;
    }
    createAccumulation(startTime) {
      return new SumAccumulation(startTime, this.monotonic);
    }
    /**
     * Returns the result of the merge of the given accumulations.
     */
    merge(previous, delta) {
      const prevPv = previous.toPointValue();
      const deltaPv = delta.toPointValue();
      if (delta.reset) {
        return new SumAccumulation(delta.startTime, this.monotonic, deltaPv, delta.reset);
      }
      return new SumAccumulation(previous.startTime, this.monotonic, prevPv + deltaPv);
    }
    /**
     * Returns a new DELTA aggregation by comparing two cumulative measurements.
     */
    diff(previous, current) {
      const prevPv = previous.toPointValue();
      const currPv = current.toPointValue();
      if (this.monotonic && prevPv > currPv) {
        return new SumAccumulation(current.startTime, this.monotonic, currPv, true);
      }
      return new SumAccumulation(current.startTime, this.monotonic, currPv - prevPv);
    }
    toMetricData(descriptor, aggregationTemporality, accumulationByAttributes, endTime) {
      return {
        descriptor,
        aggregationTemporality,
        dataPointType: DataPointType.SUM,
        dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
          return {
            attributes,
            startTime: accumulation.startTime,
            endTime,
            value: accumulation.toPointValue()
          };
        }),
        isMonotonic: this.monotonic
      };
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/Aggregation.js
  var DropAggregation = class _DropAggregation {
    static DEFAULT_INSTANCE = new DropAggregator();
    createAggregator(_instrument) {
      return _DropAggregation.DEFAULT_INSTANCE;
    }
  };
  var SumAggregation = class _SumAggregation {
    static MONOTONIC_INSTANCE = new SumAggregator(true);
    static NON_MONOTONIC_INSTANCE = new SumAggregator(false);
    createAggregator(instrument) {
      switch (instrument.type) {
        case InstrumentType.COUNTER:
        case InstrumentType.OBSERVABLE_COUNTER:
        case InstrumentType.HISTOGRAM: {
          return _SumAggregation.MONOTONIC_INSTANCE;
        }
        default: {
          return _SumAggregation.NON_MONOTONIC_INSTANCE;
        }
      }
    }
  };
  var LastValueAggregation = class _LastValueAggregation {
    static DEFAULT_INSTANCE = new LastValueAggregator();
    createAggregator(_instrument) {
      return _LastValueAggregation.DEFAULT_INSTANCE;
    }
  };
  var HistogramAggregation = class _HistogramAggregation {
    static DEFAULT_INSTANCE = new HistogramAggregator([0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1e3, 2500, 5e3, 7500, 1e4], true);
    createAggregator(_instrument) {
      return _HistogramAggregation.DEFAULT_INSTANCE;
    }
  };
  var ExplicitBucketHistogramAggregation = class {
    _boundaries;
    _recordMinMax;
    /**
     * @param boundaries the bucket boundaries of the histogram aggregation
     * @param _recordMinMax If set to true, min and max will be recorded. Otherwise, min and max will not be recorded.
     */
    constructor(boundaries, recordMinMax = true) {
      if (boundaries == null) {
        throw new Error("ExplicitBucketHistogramAggregation should be created with explicit boundaries, if a single bucket histogram is required, please pass an empty array");
      }
      boundaries = boundaries.concat();
      boundaries = boundaries.sort((a2, b2) => a2 - b2);
      const minusInfinityIndex = boundaries.lastIndexOf(-Infinity);
      let infinityIndex = boundaries.indexOf(Infinity);
      if (infinityIndex === -1) {
        infinityIndex = void 0;
      }
      this._boundaries = boundaries.slice(minusInfinityIndex + 1, infinityIndex);
      this._recordMinMax = recordMinMax;
    }
    createAggregator(_instrument) {
      return new HistogramAggregator(this._boundaries, this._recordMinMax);
    }
  };
  var ExponentialHistogramAggregation = class {
    _maxSize;
    _recordMinMax;
    constructor(maxSize = 160, recordMinMax = true) {
      this._maxSize = maxSize;
      this._recordMinMax = recordMinMax;
    }
    createAggregator(_instrument) {
      return new ExponentialHistogramAggregator(this._maxSize, this._recordMinMax);
    }
  };
  var DefaultAggregation = class {
    _resolve(instrument) {
      switch (instrument.type) {
        case InstrumentType.COUNTER:
        case InstrumentType.UP_DOWN_COUNTER:
        case InstrumentType.OBSERVABLE_COUNTER:
        case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER: {
          return SUM_AGGREGATION;
        }
        case InstrumentType.GAUGE:
        case InstrumentType.OBSERVABLE_GAUGE: {
          return LAST_VALUE_AGGREGATION;
        }
        case InstrumentType.HISTOGRAM: {
          if (instrument.advice.explicitBucketBoundaries) {
            return new ExplicitBucketHistogramAggregation(instrument.advice.explicitBucketBoundaries);
          }
          return HISTOGRAM_AGGREGATION;
        }
      }
      diag2.warn(`Unable to recognize instrument type: ${instrument.type}`);
      return DROP_AGGREGATION;
    }
    createAggregator(instrument) {
      return this._resolve(instrument).createAggregator(instrument);
    }
  };
  var DROP_AGGREGATION = new DropAggregation();
  var SUM_AGGREGATION = new SumAggregation();
  var LAST_VALUE_AGGREGATION = new LastValueAggregation();
  var HISTOGRAM_AGGREGATION = new HistogramAggregation();
  var EXPONENTIAL_HISTOGRAM_AGGREGATION = new ExponentialHistogramAggregation();
  var DEFAULT_AGGREGATION = new DefaultAggregation();

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/AggregationOption.js
  var AggregationType;
  (function(AggregationType2) {
    AggregationType2[AggregationType2["DEFAULT"] = 0] = "DEFAULT";
    AggregationType2[AggregationType2["DROP"] = 1] = "DROP";
    AggregationType2[AggregationType2["SUM"] = 2] = "SUM";
    AggregationType2[AggregationType2["LAST_VALUE"] = 3] = "LAST_VALUE";
    AggregationType2[AggregationType2["EXPLICIT_BUCKET_HISTOGRAM"] = 4] = "EXPLICIT_BUCKET_HISTOGRAM";
    AggregationType2[AggregationType2["EXPONENTIAL_HISTOGRAM"] = 5] = "EXPONENTIAL_HISTOGRAM";
  })(AggregationType || (AggregationType = {}));
  function toAggregation(option) {
    switch (option.type) {
      case AggregationType.DEFAULT:
        return DEFAULT_AGGREGATION;
      case AggregationType.DROP:
        return DROP_AGGREGATION;
      case AggregationType.SUM:
        return SUM_AGGREGATION;
      case AggregationType.LAST_VALUE:
        return LAST_VALUE_AGGREGATION;
      case AggregationType.EXPONENTIAL_HISTOGRAM: {
        const expOption = option;
        return new ExponentialHistogramAggregation(expOption.options?.maxSize, expOption.options?.recordMinMax);
      }
      case AggregationType.EXPLICIT_BUCKET_HISTOGRAM: {
        const expOption = option;
        if (expOption.options == null) {
          return HISTOGRAM_AGGREGATION;
        } else {
          return new ExplicitBucketHistogramAggregation(expOption.options?.boundaries, expOption.options?.recordMinMax);
        }
      }
      default:
        throw new Error("Unsupported Aggregation");
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/export/AggregationSelector.js
  var DEFAULT_AGGREGATION_SELECTOR = (_instrumentType) => {
    return {
      type: AggregationType.DEFAULT
    };
  };
  var DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = (_instrumentType) => AggregationTemporality.CUMULATIVE;

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/export/MetricReader.js
  var MetricReader = class {
    // Tracks the shutdown state.
    // TODO: use BindOncePromise here once a new version of @opentelemetry/core is available.
    _shutdown = false;
    // Additional MetricProducers which will be combined with the SDK's output
    _metricProducers;
    // MetricProducer used by this instance which produces metrics from the SDK
    _sdkMetricProducer;
    _aggregationTemporalitySelector;
    _aggregationSelector;
    _cardinalitySelector;
    constructor(options) {
      this._aggregationSelector = options?.aggregationSelector ?? DEFAULT_AGGREGATION_SELECTOR;
      this._aggregationTemporalitySelector = options?.aggregationTemporalitySelector ?? DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
      this._metricProducers = options?.metricProducers ?? [];
      this._cardinalitySelector = options?.cardinalitySelector;
    }
    setMetricProducer(metricProducer) {
      if (this._sdkMetricProducer) {
        throw new Error("MetricReader can not be bound to a MeterProvider again.");
      }
      this._sdkMetricProducer = metricProducer;
      this.onInitialized();
    }
    selectAggregation(instrumentType) {
      return this._aggregationSelector(instrumentType);
    }
    selectAggregationTemporality(instrumentType) {
      return this._aggregationTemporalitySelector(instrumentType);
    }
    selectCardinalityLimit(instrumentType) {
      return this._cardinalitySelector ? this._cardinalitySelector(instrumentType) : 2e3;
    }
    /**
     * Handle once the SDK has initialized this {@link MetricReader}
     * Overriding this method is optional.
     */
    onInitialized() {
    }
    async collect(options) {
      if (this._sdkMetricProducer === void 0) {
        throw new Error("MetricReader is not bound to a MetricProducer");
      }
      if (this._shutdown) {
        throw new Error("MetricReader is shutdown");
      }
      const [sdkCollectionResults, ...additionalCollectionResults] = await Promise.all([
        this._sdkMetricProducer.collect({
          timeoutMillis: options?.timeoutMillis
        }),
        ...this._metricProducers.map((producer) => producer.collect({
          timeoutMillis: options?.timeoutMillis
        }))
      ]);
      const errors = sdkCollectionResults.errors.concat(additionalCollectionResults.flatMap((result) => result.errors));
      const resource = sdkCollectionResults.resourceMetrics.resource;
      const scopeMetrics = sdkCollectionResults.resourceMetrics.scopeMetrics.concat(additionalCollectionResults.flatMap((result) => result.resourceMetrics.scopeMetrics));
      return {
        resourceMetrics: {
          resource,
          scopeMetrics
        },
        errors
      };
    }
    async shutdown(options) {
      if (this._shutdown) {
        diag2.error("Cannot call shutdown twice.");
        return;
      }
      if (options?.timeoutMillis == null) {
        await this.onShutdown();
      } else {
        await callWithTimeout(this.onShutdown(), options.timeoutMillis);
      }
      this._shutdown = true;
    }
    async forceFlush(options) {
      if (this._shutdown) {
        diag2.warn("Cannot forceFlush on already shutdown MetricReader.");
        return;
      }
      if (options?.timeoutMillis == null) {
        await this.onForceFlush();
        return;
      }
      await callWithTimeout(this.onForceFlush(), options.timeoutMillis);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/export/PeriodicExportingMetricReader.js
  var PeriodicExportingMetricReader = class extends MetricReader {
    _interval;
    _exporter;
    _exportInterval;
    _exportTimeout;
    constructor(options) {
      const { exporter, exportIntervalMillis = 6e4, metricProducers, cardinalityLimits } = options;
      let { exportTimeoutMillis = 3e4 } = options;
      super({
        aggregationSelector: exporter.selectAggregation?.bind(exporter),
        aggregationTemporalitySelector: exporter.selectAggregationTemporality?.bind(exporter),
        metricProducers,
        cardinalitySelector: (instrumentType) => {
          const limits = {
            default: 2e3,
            ...cardinalityLimits
          };
          switch (instrumentType) {
            case InstrumentType.COUNTER:
              return limits.counter ?? limits.default;
            case InstrumentType.GAUGE:
              return limits.gauge ?? limits.default;
            case InstrumentType.HISTOGRAM:
              return limits.histogram ?? limits.default;
            case InstrumentType.OBSERVABLE_COUNTER:
              return limits.observableCounter ?? limits.default;
            case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
              return limits.observableUpDownCounter ?? limits.default;
            case InstrumentType.OBSERVABLE_GAUGE:
              return limits.observableGauge ?? limits.default;
            case InstrumentType.UP_DOWN_COUNTER:
              return limits.upDownCounter ?? limits.default;
            default:
              return limits.default;
          }
        }
      });
      if (exportIntervalMillis <= 0) {
        throw Error("exportIntervalMillis must be greater than 0");
      }
      if (exportTimeoutMillis <= 0) {
        throw Error("exportTimeoutMillis must be greater than 0");
      }
      if (exportIntervalMillis < exportTimeoutMillis) {
        if ("exportIntervalMillis" in options && "exportTimeoutMillis" in options) {
          throw Error("exportIntervalMillis must be greater than or equal to exportTimeoutMillis");
        } else {
          diag2.info(`Timeout of ${exportTimeoutMillis} exceeds the interval of ${exportIntervalMillis}. Clamping timeout to interval duration.`);
          exportTimeoutMillis = exportIntervalMillis;
        }
      }
      this._exportInterval = exportIntervalMillis;
      this._exportTimeout = exportTimeoutMillis;
      this._exporter = exporter;
    }
    async _runOnce() {
      try {
        await callWithTimeout(this._doRun(), this._exportTimeout);
      } catch (err) {
        if (err instanceof TimeoutError) {
          diag2.error("Export took longer than %s milliseconds and timed out.", this._exportTimeout);
          return;
        }
        globalErrorHandler(err);
      }
    }
    async _doRun() {
      const { resourceMetrics, errors } = await this.collect({
        timeoutMillis: this._exportTimeout
      });
      if (errors.length > 0) {
        diag2.error("PeriodicExportingMetricReader: metrics collection errors", ...errors);
      }
      if (resourceMetrics.resource.asyncAttributesPending) {
        try {
          await resourceMetrics.resource.waitForAsyncAttributes?.();
        } catch (e2) {
          diag2.debug("Error while resolving async portion of resource: ", e2);
          globalErrorHandler(e2);
        }
      }
      if (resourceMetrics.scopeMetrics.length === 0) {
        return;
      }
      const result = await internal._export(this._exporter, resourceMetrics);
      if (result.code !== ExportResultCode.SUCCESS) {
        throw new Error(`PeriodicExportingMetricReader: metrics export failed (error ${result.error})`);
      }
    }
    onInitialized() {
      this._interval = setInterval(() => {
        void this._runOnce();
      }, this._exportInterval);
      if (typeof this._interval !== "number") {
        this._interval.unref();
      }
    }
    async onForceFlush() {
      await this._runOnce();
      await this._exporter.forceFlush();
    }
    async onShutdown() {
      if (this._interval) {
        clearInterval(this._interval);
      }
      await this.onForceFlush();
      await this._exporter.shutdown();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/ViewRegistry.js
  var ViewRegistry = class {
    _registeredViews = [];
    addView(view) {
      this._registeredViews.push(view);
    }
    findViews(instrument, meter) {
      const views = this._registeredViews.filter((registeredView) => {
        return this._matchInstrument(registeredView.instrumentSelector, instrument) && this._matchMeter(registeredView.meterSelector, meter);
      });
      return views;
    }
    _matchInstrument(selector, instrument) {
      return (selector.getType() === void 0 || instrument.type === selector.getType()) && selector.getNameFilter().match(instrument.name) && selector.getUnitFilter().match(instrument.unit);
    }
    _matchMeter(selector, meter) {
      return selector.getNameFilter().match(meter.name) && (meter.version === void 0 || selector.getVersionFilter().match(meter.version)) && (meter.schemaUrl === void 0 || selector.getSchemaUrlFilter().match(meter.schemaUrl));
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/InstrumentDescriptor.js
  function createInstrumentDescriptor(name, type, options) {
    if (!isValidName(name)) {
      diag2.warn(`Invalid metric name: "${name}". The metric name should be a ASCII string with a length no greater than 255 characters.`);
    }
    return {
      name,
      type,
      description: options?.description ?? "",
      unit: options?.unit ?? "",
      valueType: options?.valueType ?? ValueType.DOUBLE,
      advice: options?.advice ?? {}
    };
  }
  function createInstrumentDescriptorWithView(view, instrument) {
    return {
      name: view.name ?? instrument.name,
      description: view.description ?? instrument.description,
      type: instrument.type,
      unit: instrument.unit,
      valueType: instrument.valueType,
      advice: instrument.advice
    };
  }
  function isDescriptorCompatibleWith(descriptor, otherDescriptor) {
    return equalsCaseInsensitive(descriptor.name, otherDescriptor.name) && descriptor.unit === otherDescriptor.unit && descriptor.type === otherDescriptor.type && descriptor.valueType === otherDescriptor.valueType;
  }
  var NAME_REGEXP = /^[a-z][a-z0-9_.\-/]{0,254}$/i;
  function isValidName(name) {
    return NAME_REGEXP.test(name);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/Instruments.js
  var SyncInstrument = class {
    _writableMetricStorage;
    _descriptor;
    constructor(writableMetricStorage, descriptor) {
      this._writableMetricStorage = writableMetricStorage;
      this._descriptor = descriptor;
    }
    _record(value, attributes = {}, context2 = context.active()) {
      if (typeof value !== "number") {
        diag2.warn(`non-number value provided to metric ${this._descriptor.name}: ${value}`);
        return;
      }
      if (this._descriptor.valueType === ValueType.INT && !Number.isInteger(value)) {
        diag2.warn(`INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`);
        value = Math.trunc(value);
        if (!Number.isInteger(value)) {
          return;
        }
      }
      this._writableMetricStorage.record(value, attributes, context2, millisToHrTime(Date.now()));
    }
  };
  var UpDownCounterInstrument = class extends SyncInstrument {
    /**
     * Increment value of counter by the input. Inputs may be negative.
     */
    add(value, attributes, ctx) {
      this._record(value, attributes, ctx);
    }
  };
  var CounterInstrument = class extends SyncInstrument {
    /**
     * Increment value of counter by the input. Inputs may not be negative.
     */
    add(value, attributes, ctx) {
      if (value < 0) {
        diag2.warn(`negative value provided to counter ${this._descriptor.name}: ${value}`);
        return;
      }
      this._record(value, attributes, ctx);
    }
  };
  var GaugeInstrument = class extends SyncInstrument {
    /**
     * Records a measurement.
     */
    record(value, attributes, ctx) {
      this._record(value, attributes, ctx);
    }
  };
  var HistogramInstrument = class extends SyncInstrument {
    /**
     * Records a measurement. Value of the measurement must not be negative.
     */
    record(value, attributes, ctx) {
      if (value < 0) {
        diag2.warn(`negative value provided to histogram ${this._descriptor.name}: ${value}`);
        return;
      }
      this._record(value, attributes, ctx);
    }
  };
  var ObservableInstrument = class {
    /** @internal */
    _metricStorages;
    /** @internal */
    _descriptor;
    _observableRegistry;
    constructor(descriptor, metricStorages, observableRegistry) {
      this._descriptor = descriptor;
      this._metricStorages = metricStorages;
      this._observableRegistry = observableRegistry;
    }
    /**
     * @see {Observable.addCallback}
     */
    addCallback(callback) {
      this._observableRegistry.addCallback(callback, this);
    }
    /**
     * @see {Observable.removeCallback}
     */
    removeCallback(callback) {
      this._observableRegistry.removeCallback(callback, this);
    }
  };
  var ObservableCounterInstrument = class extends ObservableInstrument {
  };
  var ObservableGaugeInstrument = class extends ObservableInstrument {
  };
  var ObservableUpDownCounterInstrument = class extends ObservableInstrument {
  };
  function isObservableInstrument(it) {
    return it instanceof ObservableInstrument;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/Meter.js
  var Meter = class {
    _meterSharedState;
    constructor(meterSharedState) {
      this._meterSharedState = meterSharedState;
    }
    /**
     * Create a {@link Gauge} instrument.
     */
    createGauge(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.GAUGE, options);
      const storage = this._meterSharedState.registerMetricStorage(descriptor);
      return new GaugeInstrument(storage, descriptor);
    }
    /**
     * Create a {@link Histogram} instrument.
     */
    createHistogram(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.HISTOGRAM, options);
      const storage = this._meterSharedState.registerMetricStorage(descriptor);
      return new HistogramInstrument(storage, descriptor);
    }
    /**
     * Create a {@link Counter} instrument.
     */
    createCounter(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.COUNTER, options);
      const storage = this._meterSharedState.registerMetricStorage(descriptor);
      return new CounterInstrument(storage, descriptor);
    }
    /**
     * Create a {@link UpDownCounter} instrument.
     */
    createUpDownCounter(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.UP_DOWN_COUNTER, options);
      const storage = this._meterSharedState.registerMetricStorage(descriptor);
      return new UpDownCounterInstrument(storage, descriptor);
    }
    /**
     * Create a {@link ObservableGauge} instrument.
     */
    createObservableGauge(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_GAUGE, options);
      const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
      return new ObservableGaugeInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * Create a {@link ObservableCounter} instrument.
     */
    createObservableCounter(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_COUNTER, options);
      const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
      return new ObservableCounterInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * Create a {@link ObservableUpDownCounter} instrument.
     */
    createObservableUpDownCounter(name, options) {
      const descriptor = createInstrumentDescriptor(name, InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, options);
      const storages = this._meterSharedState.registerAsyncMetricStorage(descriptor);
      return new ObservableUpDownCounterInstrument(descriptor, storages, this._meterSharedState.observableRegistry);
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(callback, observables) {
      this._meterSharedState.observableRegistry.addBatchCallback(callback, observables);
    }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(callback, observables) {
      this._meterSharedState.observableRegistry.removeBatchCallback(callback, observables);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MetricStorage.js
  var MetricStorage = class {
    _instrumentDescriptor;
    constructor(instrumentDescriptor) {
      this._instrumentDescriptor = instrumentDescriptor;
    }
    getInstrumentDescriptor() {
      return this._instrumentDescriptor;
    }
    updateDescription(description) {
      this._instrumentDescriptor = createInstrumentDescriptor(this._instrumentDescriptor.name, this._instrumentDescriptor.type, {
        description,
        valueType: this._instrumentDescriptor.valueType,
        unit: this._instrumentDescriptor.unit,
        advice: this._instrumentDescriptor.advice
      });
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/HashMap.js
  var HashMap = class {
    _valueMap = /* @__PURE__ */ new Map();
    _keyMap = /* @__PURE__ */ new Map();
    _hash;
    constructor(hash) {
      this._hash = hash;
    }
    get(key, hashCode) {
      hashCode ??= this._hash(key);
      return this._valueMap.get(hashCode);
    }
    getOrDefault(key, defaultFactory) {
      const hash = this._hash(key);
      if (this._valueMap.has(hash)) {
        return this._valueMap.get(hash);
      }
      const val = defaultFactory();
      if (!this._keyMap.has(hash)) {
        this._keyMap.set(hash, key);
      }
      this._valueMap.set(hash, val);
      return val;
    }
    set(key, value, hashCode) {
      hashCode ??= this._hash(key);
      if (!this._keyMap.has(hashCode)) {
        this._keyMap.set(hashCode, key);
      }
      this._valueMap.set(hashCode, value);
    }
    has(key, hashCode) {
      hashCode ??= this._hash(key);
      return this._valueMap.has(hashCode);
    }
    *keys() {
      const keyIterator = this._keyMap.entries();
      let next = keyIterator.next();
      while (next.done !== true) {
        yield [next.value[1], next.value[0]];
        next = keyIterator.next();
      }
    }
    *entries() {
      const valueIterator = this._valueMap.entries();
      let next = valueIterator.next();
      while (next.done !== true) {
        yield [this._keyMap.get(next.value[0]), next.value[1], next.value[0]];
        next = valueIterator.next();
      }
    }
    get size() {
      return this._valueMap.size;
    }
  };
  var AttributeHashMap = class extends HashMap {
    constructor() {
      super(hashAttributes);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/DeltaMetricProcessor.js
  var DeltaMetricProcessor = class {
    _activeCollectionStorage = new AttributeHashMap();
    // TODO: find a reasonable mean to clean the memo;
    // https://github.com/open-telemetry/opentelemetry-specification/pull/2208
    _cumulativeMemoStorage = new AttributeHashMap();
    _cardinalityLimit;
    _overflowAttributes = { "otel.metric.overflow": true };
    _overflowHashCode;
    _aggregator;
    constructor(aggregator, aggregationCardinalityLimit) {
      this._aggregator = aggregator;
      this._cardinalityLimit = (aggregationCardinalityLimit ?? 2e3) - 1;
      this._overflowHashCode = hashAttributes(this._overflowAttributes);
    }
    record(value, attributes, _context, collectionTime) {
      let accumulation = this._activeCollectionStorage.get(attributes);
      if (!accumulation) {
        if (this._activeCollectionStorage.size >= this._cardinalityLimit) {
          const overflowAccumulation = this._activeCollectionStorage.getOrDefault(this._overflowAttributes, () => this._aggregator.createAccumulation(collectionTime));
          overflowAccumulation?.record(value);
          return;
        }
        accumulation = this._aggregator.createAccumulation(collectionTime);
        this._activeCollectionStorage.set(attributes, accumulation);
      }
      accumulation?.record(value);
    }
    batchCumulate(measurements, collectionTime) {
      for (const [originalAttributes, value, originalHashCode] of measurements.entries()) {
        let attributes = originalAttributes;
        let hashCode = originalHashCode;
        const accumulation = this._aggregator.createAccumulation(collectionTime);
        accumulation?.record(value);
        let delta = accumulation;
        if (this._cumulativeMemoStorage.has(attributes, hashCode)) {
          const previous = this._cumulativeMemoStorage.get(attributes, hashCode);
          delta = this._aggregator.diff(previous, accumulation);
        } else {
          if (this._cumulativeMemoStorage.size >= this._cardinalityLimit) {
            attributes = this._overflowAttributes;
            hashCode = this._overflowHashCode;
            if (this._cumulativeMemoStorage.has(attributes, hashCode)) {
              const previous = this._cumulativeMemoStorage.get(attributes, hashCode);
              delta = this._aggregator.diff(previous, accumulation);
            }
          }
        }
        if (this._activeCollectionStorage.has(attributes, hashCode)) {
          const active = this._activeCollectionStorage.get(attributes, hashCode);
          delta = this._aggregator.merge(active, delta);
        }
        this._cumulativeMemoStorage.set(attributes, accumulation, hashCode);
        this._activeCollectionStorage.set(attributes, delta, hashCode);
      }
    }
    /**
     * Returns a collection of delta metrics. Start time is the when first
     * time event collected.
     */
    collect() {
      const unreportedDelta = this._activeCollectionStorage;
      this._activeCollectionStorage = new AttributeHashMap();
      return unreportedDelta;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/TemporalMetricProcessor.js
  var TemporalMetricProcessor = class _TemporalMetricProcessor {
    _aggregator;
    _unreportedAccumulations = /* @__PURE__ */ new Map();
    _reportHistory = /* @__PURE__ */ new Map();
    constructor(aggregator, collectorHandles) {
      this._aggregator = aggregator;
      collectorHandles.forEach((handle) => {
        this._unreportedAccumulations.set(handle, []);
      });
    }
    /**
     * Builds the {@link MetricData} streams to report against a specific MetricCollector.
     * @param collector The information of the MetricCollector.
     * @param collectors The registered collectors.
     * @param instrumentDescriptor The instrumentation descriptor that these metrics generated with.
     * @param currentAccumulations The current accumulation of metric data from instruments.
     * @param collectionTime The current collection timestamp.
     * @returns The {@link MetricData} points or `null`.
     */
    buildMetrics(collector, instrumentDescriptor, currentAccumulations, collectionTime) {
      this._stashAccumulations(currentAccumulations);
      const unreportedAccumulations = this._getMergedUnreportedAccumulations(collector);
      let result = unreportedAccumulations;
      let aggregationTemporality;
      if (this._reportHistory.has(collector)) {
        const last = this._reportHistory.get(collector);
        const lastCollectionTime = last.collectionTime;
        aggregationTemporality = last.aggregationTemporality;
        if (aggregationTemporality === AggregationTemporality.CUMULATIVE) {
          result = _TemporalMetricProcessor.merge(last.accumulations, unreportedAccumulations, this._aggregator);
        } else {
          result = _TemporalMetricProcessor.calibrateStartTime(last.accumulations, unreportedAccumulations, lastCollectionTime);
        }
      } else {
        aggregationTemporality = collector.selectAggregationTemporality(instrumentDescriptor.type);
      }
      this._reportHistory.set(collector, {
        accumulations: result,
        collectionTime,
        aggregationTemporality
      });
      const accumulationRecords = AttributesMapToAccumulationRecords(result);
      if (accumulationRecords.length === 0) {
        return void 0;
      }
      return this._aggregator.toMetricData(
        instrumentDescriptor,
        aggregationTemporality,
        accumulationRecords,
        /* endTime */
        collectionTime
      );
    }
    _stashAccumulations(currentAccumulation) {
      const registeredCollectors = this._unreportedAccumulations.keys();
      for (const collector of registeredCollectors) {
        let stash = this._unreportedAccumulations.get(collector);
        if (stash === void 0) {
          stash = [];
          this._unreportedAccumulations.set(collector, stash);
        }
        stash.push(currentAccumulation);
      }
    }
    _getMergedUnreportedAccumulations(collector) {
      let result = new AttributeHashMap();
      const unreportedList = this._unreportedAccumulations.get(collector);
      this._unreportedAccumulations.set(collector, []);
      if (unreportedList === void 0) {
        return result;
      }
      for (const it of unreportedList) {
        result = _TemporalMetricProcessor.merge(result, it, this._aggregator);
      }
      return result;
    }
    static merge(last, current, aggregator) {
      const result = last;
      const iterator = current.entries();
      let next = iterator.next();
      while (next.done !== true) {
        const [key, record, hash] = next.value;
        if (last.has(key, hash)) {
          const lastAccumulation = last.get(key, hash);
          const accumulation = aggregator.merge(lastAccumulation, record);
          result.set(key, accumulation, hash);
        } else {
          result.set(key, record, hash);
        }
        next = iterator.next();
      }
      return result;
    }
    /**
     * Calibrate the reported metric streams' startTime to lastCollectionTime. Leaves
     * the new stream to be the initial observation time unchanged.
     */
    static calibrateStartTime(last, current, lastCollectionTime) {
      for (const [key, hash] of last.keys()) {
        const currentAccumulation = current.get(key, hash);
        currentAccumulation?.setStartTime(lastCollectionTime);
      }
      return current;
    }
  };
  function AttributesMapToAccumulationRecords(map) {
    return Array.from(map.entries());
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/AsyncMetricStorage.js
  var AsyncMetricStorage = class extends MetricStorage {
    _aggregationCardinalityLimit;
    _deltaMetricStorage;
    _temporalMetricStorage;
    _attributesProcessor;
    constructor(_instrumentDescriptor, aggregator, attributesProcessor, collectorHandles, aggregationCardinalityLimit) {
      super(_instrumentDescriptor);
      this._aggregationCardinalityLimit = aggregationCardinalityLimit;
      this._deltaMetricStorage = new DeltaMetricProcessor(aggregator, this._aggregationCardinalityLimit);
      this._temporalMetricStorage = new TemporalMetricProcessor(aggregator, collectorHandles);
      this._attributesProcessor = attributesProcessor;
    }
    record(measurements, observationTime) {
      const processed = new AttributeHashMap();
      for (const [attributes, value] of measurements.entries()) {
        processed.set(this._attributesProcessor.process(attributes), value);
      }
      this._deltaMetricStorage.batchCumulate(processed, observationTime);
    }
    /**
     * Collects the metrics from this storage. The ObservableCallback is invoked
     * during the collection.
     *
     * Note: This is a stateful operation and may reset any interval-related
     * state for the MetricCollector.
     */
    collect(collector, collectionTime) {
      const accumulations = this._deltaMetricStorage.collect();
      return this._temporalMetricStorage.buildMetrics(collector, this._instrumentDescriptor, accumulations, collectionTime);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/RegistrationConflicts.js
  function getIncompatibilityDetails(existing, otherDescriptor) {
    let incompatibility = "";
    if (existing.unit !== otherDescriptor.unit) {
      incompatibility += `	- Unit '${existing.unit}' does not match '${otherDescriptor.unit}'
`;
    }
    if (existing.type !== otherDescriptor.type) {
      incompatibility += `	- Type '${existing.type}' does not match '${otherDescriptor.type}'
`;
    }
    if (existing.valueType !== otherDescriptor.valueType) {
      incompatibility += `	- Value Type '${existing.valueType}' does not match '${otherDescriptor.valueType}'
`;
    }
    if (existing.description !== otherDescriptor.description) {
      incompatibility += `	- Description '${existing.description}' does not match '${otherDescriptor.description}'
`;
    }
    return incompatibility;
  }
  function getValueTypeConflictResolutionRecipe(existing, otherDescriptor) {
    return `	- use valueType '${existing.valueType}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
  }
  function getUnitConflictResolutionRecipe(existing, otherDescriptor) {
    return `	- use unit '${existing.unit}' on instrument creation or use an instrument name other than '${otherDescriptor.name}'`;
  }
  function getTypeConflictResolutionRecipe(existing, otherDescriptor) {
    const selector = {
      name: otherDescriptor.name,
      type: otherDescriptor.type,
      unit: otherDescriptor.unit
    };
    const selectorString = JSON.stringify(selector);
    return `	- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'`;
  }
  function getDescriptionResolutionRecipe(existing, otherDescriptor) {
    const selector = {
      name: otherDescriptor.name,
      type: otherDescriptor.type,
      unit: otherDescriptor.unit
    };
    const selectorString = JSON.stringify(selector);
    return `	- create a new view with a name other than '${existing.name}' and InstrumentSelector '${selectorString}'
    	- OR - create a new view with the name ${existing.name} and description '${existing.description}' and InstrumentSelector ${selectorString}
    	- OR - create a new view with the name ${otherDescriptor.name} and description '${existing.description}' and InstrumentSelector ${selectorString}`;
  }
  function getConflictResolutionRecipe(existing, otherDescriptor) {
    if (existing.valueType !== otherDescriptor.valueType) {
      return getValueTypeConflictResolutionRecipe(existing, otherDescriptor);
    }
    if (existing.unit !== otherDescriptor.unit) {
      return getUnitConflictResolutionRecipe(existing, otherDescriptor);
    }
    if (existing.type !== otherDescriptor.type) {
      return getTypeConflictResolutionRecipe(existing, otherDescriptor);
    }
    if (existing.description !== otherDescriptor.description) {
      return getDescriptionResolutionRecipe(existing, otherDescriptor);
    }
    return "";
  }

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MetricStorageRegistry.js
  var MetricStorageRegistry = class _MetricStorageRegistry {
    _sharedRegistry = /* @__PURE__ */ new Map();
    _perCollectorRegistry = /* @__PURE__ */ new Map();
    static create() {
      return new _MetricStorageRegistry();
    }
    getStorages(collector) {
      let storages = [];
      for (const metricStorages of this._sharedRegistry.values()) {
        storages = storages.concat(metricStorages);
      }
      const perCollectorStorages = this._perCollectorRegistry.get(collector);
      if (perCollectorStorages != null) {
        for (const metricStorages of perCollectorStorages.values()) {
          storages = storages.concat(metricStorages);
        }
      }
      return storages;
    }
    register(storage) {
      this._registerStorage(storage, this._sharedRegistry);
    }
    registerForCollector(collector, storage) {
      let storageMap = this._perCollectorRegistry.get(collector);
      if (storageMap == null) {
        storageMap = /* @__PURE__ */ new Map();
        this._perCollectorRegistry.set(collector, storageMap);
      }
      this._registerStorage(storage, storageMap);
    }
    findOrUpdateCompatibleStorage(expectedDescriptor) {
      const storages = this._sharedRegistry.get(expectedDescriptor.name);
      if (storages === void 0) {
        return null;
      }
      return this._findOrUpdateCompatibleStorage(expectedDescriptor, storages);
    }
    findOrUpdateCompatibleCollectorStorage(collector, expectedDescriptor) {
      const storageMap = this._perCollectorRegistry.get(collector);
      if (storageMap === void 0) {
        return null;
      }
      const storages = storageMap.get(expectedDescriptor.name);
      if (storages === void 0) {
        return null;
      }
      return this._findOrUpdateCompatibleStorage(expectedDescriptor, storages);
    }
    _registerStorage(storage, storageMap) {
      const descriptor = storage.getInstrumentDescriptor();
      const storages = storageMap.get(descriptor.name);
      if (storages === void 0) {
        storageMap.set(descriptor.name, [storage]);
        return;
      }
      storages.push(storage);
    }
    _findOrUpdateCompatibleStorage(expectedDescriptor, existingStorages) {
      let compatibleStorage = null;
      for (const existingStorage of existingStorages) {
        const existingDescriptor = existingStorage.getInstrumentDescriptor();
        if (isDescriptorCompatibleWith(existingDescriptor, expectedDescriptor)) {
          if (existingDescriptor.description !== expectedDescriptor.description) {
            if (expectedDescriptor.description.length > existingDescriptor.description.length) {
              existingStorage.updateDescription(expectedDescriptor.description);
            }
            diag2.warn("A view or instrument with the name ", expectedDescriptor.name, " has already been registered, but has a different description and is incompatible with another registered view.\n", "Details:\n", getIncompatibilityDetails(existingDescriptor, expectedDescriptor), "The longer description will be used.\nTo resolve the conflict:", getConflictResolutionRecipe(existingDescriptor, expectedDescriptor));
          }
          compatibleStorage = existingStorage;
        } else {
          diag2.warn("A view or instrument with the name ", expectedDescriptor.name, " has already been registered and is incompatible with another registered view.\n", "Details:\n", getIncompatibilityDetails(existingDescriptor, expectedDescriptor), "To resolve the conflict:\n", getConflictResolutionRecipe(existingDescriptor, expectedDescriptor));
        }
      }
      return compatibleStorage;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MultiWritableMetricStorage.js
  var MultiMetricStorage = class {
    _backingStorages;
    constructor(backingStorages) {
      this._backingStorages = backingStorages;
    }
    record(value, attributes, context2, recordTime) {
      const storages = this._backingStorages;
      for (let i2 = 0; i2 < storages.length; i2++) {
        storages[i2].record(value, attributes, context2, recordTime);
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/ObservableResult.js
  var ObservableResultImpl = class {
    /**
     * @internal
     */
    _buffer = new AttributeHashMap();
    _instrumentName;
    _valueType;
    constructor(instrumentName, valueType) {
      this._instrumentName = instrumentName;
      this._valueType = valueType;
    }
    /**
     * Observe a measurement of the value associated with the given attributes.
     */
    observe(value, attributes = {}) {
      if (typeof value !== "number") {
        diag2.warn(`non-number value provided to metric ${this._instrumentName}: ${value}`);
        return;
      }
      if (this._valueType === ValueType.INT && !Number.isInteger(value)) {
        diag2.warn(`INT value type cannot accept a floating-point value for ${this._instrumentName}, ignoring the fractional digits.`);
        value = Math.trunc(value);
        if (!Number.isInteger(value)) {
          return;
        }
      }
      this._buffer.set(attributes, value);
    }
  };
  var BatchObservableResultImpl = class {
    /**
     * @internal
     */
    _buffer = /* @__PURE__ */ new Map();
    /**
     * Observe a measurement of the value associated with the given attributes.
     */
    observe(metric, value, attributes = {}) {
      if (!isObservableInstrument(metric)) {
        return;
      }
      let map = this._buffer.get(metric);
      if (map == null) {
        map = new AttributeHashMap();
        this._buffer.set(metric, map);
      }
      if (typeof value !== "number") {
        diag2.warn(`non-number value provided to metric ${metric._descriptor.name}: ${value}`);
        return;
      }
      if (metric._descriptor.valueType === ValueType.INT && !Number.isInteger(value)) {
        diag2.warn(`INT value type cannot accept a floating-point value for ${metric._descriptor.name}, ignoring the fractional digits.`);
        value = Math.trunc(value);
        if (!Number.isInteger(value)) {
          return;
        }
      }
      map.set(attributes, value);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/ObservableRegistry.js
  var ObservableRegistry = class {
    _callbacks = [];
    _batchCallbacks = [];
    addCallback(callback, instrument) {
      const idx = this._findCallback(callback, instrument);
      if (idx >= 0) {
        return;
      }
      this._callbacks.push({ callback, instrument });
    }
    removeCallback(callback, instrument) {
      const idx = this._findCallback(callback, instrument);
      if (idx < 0) {
        return;
      }
      this._callbacks.splice(idx, 1);
    }
    addBatchCallback(callback, instruments) {
      const observableInstruments = new Set(instruments.filter(isObservableInstrument));
      if (observableInstruments.size === 0) {
        diag2.error("BatchObservableCallback is not associated with valid instruments", instruments);
        return;
      }
      const idx = this._findBatchCallback(callback, observableInstruments);
      if (idx >= 0) {
        return;
      }
      this._batchCallbacks.push({ callback, instruments: observableInstruments });
    }
    removeBatchCallback(callback, instruments) {
      const observableInstruments = new Set(instruments.filter(isObservableInstrument));
      const idx = this._findBatchCallback(callback, observableInstruments);
      if (idx < 0) {
        return;
      }
      this._batchCallbacks.splice(idx, 1);
    }
    /**
     * @returns a promise of rejected reasons for invoking callbacks.
     */
    async observe(collectionTime, timeoutMillis) {
      const callbackFutures = this._observeCallbacks(collectionTime, timeoutMillis);
      const batchCallbackFutures = this._observeBatchCallbacks(collectionTime, timeoutMillis);
      const results = await Promise.allSettled([
        ...callbackFutures,
        ...batchCallbackFutures
      ]);
      const rejections = results.filter((result) => result.status === "rejected").map((result) => result.reason);
      return rejections;
    }
    _observeCallbacks(observationTime, timeoutMillis) {
      return this._callbacks.map(async ({ callback, instrument }) => {
        const observableResult = new ObservableResultImpl(instrument._descriptor.name, instrument._descriptor.valueType);
        let callPromise = Promise.resolve(callback(observableResult));
        if (timeoutMillis != null) {
          callPromise = callWithTimeout(callPromise, timeoutMillis);
        }
        await callPromise;
        instrument._metricStorages.forEach((metricStorage) => {
          metricStorage.record(observableResult._buffer, observationTime);
        });
      });
    }
    _observeBatchCallbacks(observationTime, timeoutMillis) {
      return this._batchCallbacks.map(async ({ callback, instruments }) => {
        const observableResult = new BatchObservableResultImpl();
        let callPromise = Promise.resolve(callback(observableResult));
        if (timeoutMillis != null) {
          callPromise = callWithTimeout(callPromise, timeoutMillis);
        }
        await callPromise;
        instruments.forEach((instrument) => {
          const buffer = observableResult._buffer.get(instrument);
          if (buffer == null) {
            return;
          }
          instrument._metricStorages.forEach((metricStorage) => {
            metricStorage.record(buffer, observationTime);
          });
        });
      });
    }
    _findCallback(callback, instrument) {
      return this._callbacks.findIndex((record) => {
        return record.callback === callback && record.instrument === instrument;
      });
    }
    _findBatchCallback(callback, instruments) {
      return this._batchCallbacks.findIndex((record) => {
        return record.callback === callback && setEquals(record.instruments, instruments);
      });
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/SyncMetricStorage.js
  var SyncMetricStorage = class extends MetricStorage {
    _aggregationCardinalityLimit;
    _deltaMetricStorage;
    _temporalMetricStorage;
    _attributesProcessor;
    constructor(instrumentDescriptor, aggregator, attributesProcessor, collectorHandles, aggregationCardinalityLimit) {
      super(instrumentDescriptor);
      this._aggregationCardinalityLimit = aggregationCardinalityLimit;
      this._deltaMetricStorage = new DeltaMetricProcessor(aggregator, this._aggregationCardinalityLimit);
      this._temporalMetricStorage = new TemporalMetricProcessor(aggregator, collectorHandles);
      this._attributesProcessor = attributesProcessor;
    }
    record(value, attributes, context2, recordTime) {
      attributes = this._attributesProcessor.process(attributes, context2);
      this._deltaMetricStorage.record(value, attributes, context2, recordTime);
    }
    /**
     * Collects the metrics from this storage.
     *
     * Note: This is a stateful operation and may reset any interval-related
     * state for the MetricCollector.
     */
    collect(collector, collectionTime) {
      const accumulations = this._deltaMetricStorage.collect();
      return this._temporalMetricStorage.buildMetrics(collector, this._instrumentDescriptor, accumulations, collectionTime);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/AttributesProcessor.js
  var NoopAttributesProcessor = class {
    process(incoming, _context) {
      return incoming;
    }
  };
  var MultiAttributesProcessor = class {
    _processors;
    constructor(processors) {
      this._processors = processors;
    }
    process(incoming, context2) {
      let filteredAttributes = incoming;
      for (const processor of this._processors) {
        filteredAttributes = processor.process(filteredAttributes, context2);
      }
      return filteredAttributes;
    }
  };
  function createNoopAttributesProcessor() {
    return NOOP;
  }
  function createMultiAttributesProcessor(processors) {
    return new MultiAttributesProcessor(processors);
  }
  var NOOP = new NoopAttributesProcessor();

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MeterSharedState.js
  var MeterSharedState = class {
    metricStorageRegistry = new MetricStorageRegistry();
    observableRegistry = new ObservableRegistry();
    meter;
    _meterProviderSharedState;
    _instrumentationScope;
    constructor(meterProviderSharedState, instrumentationScope) {
      this.meter = new Meter(this);
      this._meterProviderSharedState = meterProviderSharedState;
      this._instrumentationScope = instrumentationScope;
    }
    registerMetricStorage(descriptor) {
      const storages = this._registerMetricStorage(descriptor, SyncMetricStorage);
      if (storages.length === 1) {
        return storages[0];
      }
      return new MultiMetricStorage(storages);
    }
    registerAsyncMetricStorage(descriptor) {
      const storages = this._registerMetricStorage(descriptor, AsyncMetricStorage);
      return storages;
    }
    /**
     * @param collector opaque handle of {@link MetricCollector} which initiated the collection.
     * @param collectionTime the HrTime at which the collection was initiated.
     * @param options options for collection.
     * @returns the list of metric data collected.
     */
    async collect(collector, collectionTime, options) {
      const errors = await this.observableRegistry.observe(collectionTime, options?.timeoutMillis);
      const storages = this.metricStorageRegistry.getStorages(collector);
      if (storages.length === 0) {
        return null;
      }
      const metricDataList = [];
      storages.forEach((metricStorage) => {
        const metricData = metricStorage.collect(collector, collectionTime);
        if (metricData != null) {
          metricDataList.push(metricData);
        }
      });
      if (metricDataList.length === 0) {
        return { errors };
      }
      return {
        scopeMetrics: {
          scope: this._instrumentationScope,
          metrics: metricDataList
        },
        errors
      };
    }
    _registerMetricStorage(descriptor, MetricStorageType) {
      const views = this._meterProviderSharedState.viewRegistry.findViews(descriptor, this._instrumentationScope);
      let storages = views.map((view) => {
        const viewDescriptor = createInstrumentDescriptorWithView(view, descriptor);
        const compatibleStorage = this.metricStorageRegistry.findOrUpdateCompatibleStorage(viewDescriptor);
        if (compatibleStorage != null) {
          return compatibleStorage;
        }
        const aggregator = view.aggregation.createAggregator(viewDescriptor);
        const viewStorage = new MetricStorageType(viewDescriptor, aggregator, view.attributesProcessor, this._meterProviderSharedState.metricCollectors, view.aggregationCardinalityLimit);
        this.metricStorageRegistry.register(viewStorage);
        return viewStorage;
      });
      if (storages.length === 0) {
        const perCollectorAggregations = this._meterProviderSharedState.selectAggregations(descriptor.type);
        const collectorStorages = perCollectorAggregations.map(([collector, aggregation]) => {
          const compatibleStorage = this.metricStorageRegistry.findOrUpdateCompatibleCollectorStorage(collector, descriptor);
          if (compatibleStorage != null) {
            return compatibleStorage;
          }
          const aggregator = aggregation.createAggregator(descriptor);
          const cardinalityLimit = collector.selectCardinalityLimit(descriptor.type);
          const storage = new MetricStorageType(descriptor, aggregator, createNoopAttributesProcessor(), [collector], cardinalityLimit);
          this.metricStorageRegistry.registerForCollector(collector, storage);
          return storage;
        });
        storages = storages.concat(collectorStorages);
      }
      return storages;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MeterProviderSharedState.js
  var MeterProviderSharedState = class {
    viewRegistry = new ViewRegistry();
    metricCollectors = [];
    meterSharedStates = /* @__PURE__ */ new Map();
    resource;
    constructor(resource) {
      this.resource = resource;
    }
    getMeterSharedState(instrumentationScope) {
      const id = instrumentationScopeId(instrumentationScope);
      let meterSharedState = this.meterSharedStates.get(id);
      if (meterSharedState == null) {
        meterSharedState = new MeterSharedState(this, instrumentationScope);
        this.meterSharedStates.set(id, meterSharedState);
      }
      return meterSharedState;
    }
    selectAggregations(instrumentType) {
      const result = [];
      for (const collector of this.metricCollectors) {
        result.push([
          collector,
          toAggregation(collector.selectAggregation(instrumentType))
        ]);
      }
      return result;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/state/MetricCollector.js
  var MetricCollector = class {
    _sharedState;
    _metricReader;
    constructor(sharedState, metricReader) {
      this._sharedState = sharedState;
      this._metricReader = metricReader;
    }
    async collect(options) {
      const collectionTime = millisToHrTime(Date.now());
      const scopeMetrics = [];
      const errors = [];
      const meterCollectionPromises = Array.from(this._sharedState.meterSharedStates.values()).map(async (meterSharedState) => {
        const current = await meterSharedState.collect(this, collectionTime, options);
        if (current?.scopeMetrics != null) {
          scopeMetrics.push(current.scopeMetrics);
        }
        if (current?.errors != null) {
          errors.push(...current.errors);
        }
      });
      await Promise.all(meterCollectionPromises);
      return {
        resourceMetrics: {
          resource: this._sharedState.resource,
          scopeMetrics
        },
        errors
      };
    }
    /**
     * Delegates for MetricReader.forceFlush.
     */
    async forceFlush(options) {
      await this._metricReader.forceFlush(options);
    }
    /**
     * Delegates for MetricReader.shutdown.
     */
    async shutdown(options) {
      await this._metricReader.shutdown(options);
    }
    selectAggregationTemporality(instrumentType) {
      return this._metricReader.selectAggregationTemporality(instrumentType);
    }
    selectAggregation(instrumentType) {
      return this._metricReader.selectAggregation(instrumentType);
    }
    /**
     * Select the cardinality limit for the given {@link InstrumentType} for this
     * collector.
     */
    selectCardinalityLimit(instrumentType) {
      return this._metricReader.selectCardinalityLimit?.(instrumentType) ?? 2e3;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/Predicate.js
  var ESCAPE = /[\^$\\.+?()[\]{}|]/g;
  var PatternPredicate = class _PatternPredicate {
    _matchAll;
    _regexp;
    constructor(pattern) {
      if (pattern === "*") {
        this._matchAll = true;
        this._regexp = /.*/;
      } else {
        this._matchAll = false;
        this._regexp = new RegExp(_PatternPredicate.escapePattern(pattern));
      }
    }
    match(str) {
      if (this._matchAll) {
        return true;
      }
      return this._regexp.test(str);
    }
    static escapePattern(pattern) {
      return `^${pattern.replace(ESCAPE, "\\$&").replace("*", ".*")}$`;
    }
    static hasWildcard(pattern) {
      return pattern.includes("*");
    }
  };
  var ExactPredicate = class {
    _matchAll;
    _pattern;
    constructor(pattern) {
      this._matchAll = pattern === void 0;
      this._pattern = pattern;
    }
    match(str) {
      if (this._matchAll) {
        return true;
      }
      if (str === this._pattern) {
        return true;
      }
      return false;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/InstrumentSelector.js
  var InstrumentSelector = class {
    _nameFilter;
    _type;
    _unitFilter;
    constructor(criteria) {
      this._nameFilter = new PatternPredicate(criteria?.name ?? "*");
      this._type = criteria?.type;
      this._unitFilter = new ExactPredicate(criteria?.unit);
    }
    getType() {
      return this._type;
    }
    getNameFilter() {
      return this._nameFilter;
    }
    getUnitFilter() {
      return this._unitFilter;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/MeterSelector.js
  var MeterSelector = class {
    _nameFilter;
    _versionFilter;
    _schemaUrlFilter;
    constructor(criteria) {
      this._nameFilter = new ExactPredicate(criteria?.name);
      this._versionFilter = new ExactPredicate(criteria?.version);
      this._schemaUrlFilter = new ExactPredicate(criteria?.schemaUrl);
    }
    getNameFilter() {
      return this._nameFilter;
    }
    /**
     * TODO: semver filter? no spec yet.
     */
    getVersionFilter() {
      return this._versionFilter;
    }
    getSchemaUrlFilter() {
      return this._schemaUrlFilter;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/view/View.js
  function isSelectorNotProvided(options) {
    return options.instrumentName == null && options.instrumentType == null && options.instrumentUnit == null && options.meterName == null && options.meterVersion == null && options.meterSchemaUrl == null;
  }
  function validateViewOptions(viewOptions) {
    if (isSelectorNotProvided(viewOptions)) {
      throw new Error("Cannot create view with no selector arguments supplied");
    }
    if (viewOptions.name != null && (viewOptions?.instrumentName == null || PatternPredicate.hasWildcard(viewOptions.instrumentName))) {
      throw new Error("Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.");
    }
  }
  var View = class {
    name;
    description;
    aggregation;
    attributesProcessor;
    instrumentSelector;
    meterSelector;
    aggregationCardinalityLimit;
    /**
     * Create a new {@link View} instance.
     *
     * Parameters can be categorized as two types:
     *  Instrument selection criteria: Used to describe the instrument(s) this view will be applied to.
     *  Will be treated as additive (the Instrument has to meet all the provided criteria to be selected).
     *
     *  Metric stream altering: Alter the metric stream of instruments selected by instrument selection criteria.
     *
     * @param viewOptions {@link ViewOptions} for altering the metric stream and instrument selection.
     * @param viewOptions.name
     * Alters the metric stream:
     *  This will be used as the name of the metrics stream.
     *  If not provided, the original Instrument name will be used.
     * @param viewOptions.description
     * Alters the metric stream:
     *  This will be used as the description of the metrics stream.
     *  If not provided, the original Instrument description will be used by default.
     * @param viewOptions.attributesProcessors
     * Alters the metric stream:
     *  If provided, the attributes will be modified as defined by the added processors.
     *  If not provided, all attribute keys will be used by default.
     * @param viewOptions.aggregationCardinalityLimit
     * Alters the metric stream:
     *  Sets a limit on the number of unique attribute combinations (cardinality) that can be aggregated.
     *  If not provided, the default limit of 2000 will be used.
     * @param viewOptions.aggregation
     * Alters the metric stream:
     *  Alters the {@link Aggregation} of the metric stream.
     * @param viewOptions.instrumentName
     * Instrument selection criteria:
     *  Original name of the Instrument(s) with wildcard support.
     * @param viewOptions.instrumentType
     * Instrument selection criteria:
     *  The original type of the Instrument(s).
     * @param viewOptions.instrumentUnit
     * Instrument selection criteria:
     *  The unit of the Instrument(s).
     * @param viewOptions.meterName
     * Instrument selection criteria:
     *  The name of the Meter. No wildcard support, name must match the meter exactly.
     * @param viewOptions.meterVersion
     * Instrument selection criteria:
     *  The version of the Meter. No wildcard support, version must match exactly.
     * @param viewOptions.meterSchemaUrl
     * Instrument selection criteria:
     *  The schema URL of the Meter. No wildcard support, schema URL must match exactly.
     *
     * @example
     * // Create a view that changes the Instrument 'my.instrument' to use to an
     * // ExplicitBucketHistogramAggregation with the boundaries [20, 30, 40]
     * new View({
     *   aggregation: new ExplicitBucketHistogramAggregation([20, 30, 40]),
     *   instrumentName: 'my.instrument'
     * })
     */
    constructor(viewOptions) {
      validateViewOptions(viewOptions);
      if (viewOptions.attributesProcessors != null) {
        this.attributesProcessor = createMultiAttributesProcessor(viewOptions.attributesProcessors);
      } else {
        this.attributesProcessor = createNoopAttributesProcessor();
      }
      this.name = viewOptions.name;
      this.description = viewOptions.description;
      this.aggregation = toAggregation(viewOptions.aggregation ?? { type: AggregationType.DEFAULT });
      this.instrumentSelector = new InstrumentSelector({
        name: viewOptions.instrumentName,
        type: viewOptions.instrumentType,
        unit: viewOptions.instrumentUnit
      });
      this.meterSelector = new MeterSelector({
        name: viewOptions.meterName,
        version: viewOptions.meterVersion,
        schemaUrl: viewOptions.meterSchemaUrl
      });
      this.aggregationCardinalityLimit = viewOptions.aggregationCardinalityLimit;
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+sdk-metrics@2.7.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/sdk-metrics/build/esm/MeterProvider.js
  var MeterProvider = class {
    _sharedState;
    _shutdown = false;
    constructor(options) {
      this._sharedState = new MeterProviderSharedState(options?.resource ?? defaultResource());
      if (options?.views != null && options.views.length > 0) {
        for (const viewOption of options.views) {
          this._sharedState.viewRegistry.addView(new View(viewOption));
        }
      }
      if (options?.readers != null && options.readers.length > 0) {
        for (const metricReader of options.readers) {
          const collector = new MetricCollector(this._sharedState, metricReader);
          metricReader.setMetricProducer(collector);
          this._sharedState.metricCollectors.push(collector);
        }
      }
    }
    /**
     * Get a meter with the configuration of the MeterProvider.
     */
    getMeter(name, version = "", options = {}) {
      if (this._shutdown) {
        diag2.warn("A shutdown MeterProvider cannot provide a Meter");
        return createNoopMeter();
      }
      return this._sharedState.getMeterSharedState({
        name,
        version,
        schemaUrl: options.schemaUrl
      }).meter;
    }
    /**
     * Shut down the MeterProvider and all registered
     * MetricReaders.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    async shutdown(options) {
      if (this._shutdown) {
        diag2.warn("shutdown may only be called once per MeterProvider");
        return;
      }
      this._shutdown = true;
      await Promise.all(this._sharedState.metricCollectors.map((collector) => {
        return collector.shutdown(options);
      }));
    }
    /**
     * Notifies all registered MetricReaders to flush any buffered data.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    async forceFlush(options) {
      if (this._shutdown) {
        diag2.warn("invalid attempt to force flush after MeterProvider shutdown");
        return;
      }
      await Promise.all(this._sharedState.metricCollectors.map((collector) => {
        return collector.forceFlush(options);
      }));
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/common/internal.js
  function createResource(resource, encoder) {
    const result = {
      attributes: toAttributes(resource.attributes, encoder),
      droppedAttributesCount: 0
    };
    const schemaUrl = resource.schemaUrl;
    if (schemaUrl && schemaUrl !== "")
      result.schemaUrl = schemaUrl;
    return result;
  }
  function createInstrumentationScope(scope) {
    return {
      name: scope.name,
      version: scope.version
    };
  }
  function toAttributes(attributes, encoder) {
    return Object.keys(attributes).map((key) => toKeyValue(key, attributes[key], encoder));
  }
  function toKeyValue(key, value, encoder) {
    return {
      key,
      value: toAnyValue(value, encoder)
    };
  }
  function toAnyValue(value, encoder) {
    const t2 = typeof value;
    if (t2 === "string")
      return { stringValue: value };
    if (t2 === "number") {
      if (!Number.isInteger(value))
        return { doubleValue: value };
      return { intValue: value };
    }
    if (t2 === "boolean")
      return { boolValue: value };
    if (value instanceof Uint8Array)
      return { bytesValue: encoder.encodeUint8Array(value) };
    if (Array.isArray(value)) {
      const values = new Array(value.length);
      for (let i2 = 0; i2 < value.length; i2++) {
        values[i2] = toAnyValue(value[i2], encoder);
      }
      return { arrayValue: { values } };
    }
    if (t2 === "object" && value != null) {
      const keys = Object.keys(value);
      const values = new Array(keys.length);
      for (let i2 = 0; i2 < keys.length; i2++) {
        values[i2] = {
          key: keys[i2],
          value: toAnyValue(value[keys[i2]], encoder)
        };
      }
      return { kvlistValue: { values } };
    }
    return {};
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/common/utils.js
  function hrTimeToNanos(hrTime2) {
    const NANOSECONDS = BigInt(1e9);
    return BigInt(Math.trunc(hrTime2[0])) * NANOSECONDS + BigInt(Math.trunc(hrTime2[1]));
  }
  function encodeAsString(hrTime2) {
    const nanos = hrTimeToNanos(hrTime2);
    return nanos.toString();
  }
  var encodeTimestamp = typeof BigInt !== "undefined" ? encodeAsString : hrTimeToNanoseconds;
  function identity(value) {
    return value;
  }
  var JSON_ENCODER = {
    encodeHrTime: encodeTimestamp,
    encodeSpanContext: identity,
    encodeOptionalSpanContext: identity,
    encodeUint8Array: (bytes) => {
      if (typeof Buffer !== "undefined") {
        return Buffer.from(bytes).toString("base64");
      }
      const chars = new Array(bytes.length);
      for (let i2 = 0; i2 < bytes.length; i2++) {
        chars[i2] = String.fromCharCode(bytes[i2]);
      }
      return btoa(chars.join(""));
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/metrics/internal-types.js
  var EAggregationTemporality;
  (function(EAggregationTemporality2) {
    EAggregationTemporality2[EAggregationTemporality2["AGGREGATION_TEMPORALITY_UNSPECIFIED"] = 0] = "AGGREGATION_TEMPORALITY_UNSPECIFIED";
    EAggregationTemporality2[EAggregationTemporality2["AGGREGATION_TEMPORALITY_DELTA"] = 1] = "AGGREGATION_TEMPORALITY_DELTA";
    EAggregationTemporality2[EAggregationTemporality2["AGGREGATION_TEMPORALITY_CUMULATIVE"] = 2] = "AGGREGATION_TEMPORALITY_CUMULATIVE";
  })(EAggregationTemporality || (EAggregationTemporality = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/metrics/internal.js
  function toResourceMetrics(resourceMetrics, encoder) {
    const processedResource = createResource(resourceMetrics.resource, encoder);
    return {
      resource: processedResource,
      schemaUrl: processedResource.schemaUrl,
      scopeMetrics: toScopeMetrics(resourceMetrics.scopeMetrics, encoder)
    };
  }
  function toScopeMetrics(scopeMetrics, encoder) {
    return Array.from(scopeMetrics.map((metrics2) => ({
      scope: createInstrumentationScope(metrics2.scope),
      metrics: metrics2.metrics.map((metricData) => toMetric(metricData, encoder)),
      schemaUrl: metrics2.scope.schemaUrl
    })));
  }
  function toMetric(metricData, encoder) {
    const out = {
      name: metricData.descriptor.name,
      description: metricData.descriptor.description,
      unit: metricData.descriptor.unit
    };
    const aggregationTemporality = toAggregationTemporality(metricData.aggregationTemporality);
    switch (metricData.dataPointType) {
      case DataPointType.SUM:
        out.sum = {
          aggregationTemporality,
          isMonotonic: metricData.isMonotonic,
          dataPoints: toSingularDataPoints(metricData, encoder)
        };
        break;
      case DataPointType.GAUGE:
        out.gauge = {
          dataPoints: toSingularDataPoints(metricData, encoder)
        };
        break;
      case DataPointType.HISTOGRAM:
        out.histogram = {
          aggregationTemporality,
          dataPoints: toHistogramDataPoints(metricData, encoder)
        };
        break;
      case DataPointType.EXPONENTIAL_HISTOGRAM:
        out.exponentialHistogram = {
          aggregationTemporality,
          dataPoints: toExponentialHistogramDataPoints(metricData, encoder)
        };
        break;
    }
    return out;
  }
  function toSingularDataPoint(dataPoint, valueType, encoder) {
    const out = {
      attributes: toAttributes(dataPoint.attributes, encoder),
      startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
      timeUnixNano: encoder.encodeHrTime(dataPoint.endTime)
    };
    switch (valueType) {
      case ValueType.INT:
        out.asInt = dataPoint.value;
        break;
      case ValueType.DOUBLE:
        out.asDouble = dataPoint.value;
        break;
    }
    return out;
  }
  function toSingularDataPoints(metricData, encoder) {
    return metricData.dataPoints.map((dataPoint) => {
      return toSingularDataPoint(dataPoint, metricData.descriptor.valueType, encoder);
    });
  }
  function toHistogramDataPoints(metricData, encoder) {
    return metricData.dataPoints.map((dataPoint) => {
      const histogram = dataPoint.value;
      return {
        attributes: toAttributes(dataPoint.attributes, encoder),
        bucketCounts: histogram.buckets.counts,
        explicitBounds: histogram.buckets.boundaries,
        count: histogram.count,
        sum: histogram.sum,
        min: histogram.min,
        max: histogram.max,
        startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
        timeUnixNano: encoder.encodeHrTime(dataPoint.endTime)
      };
    });
  }
  function toExponentialHistogramDataPoints(metricData, encoder) {
    return metricData.dataPoints.map((dataPoint) => {
      const histogram = dataPoint.value;
      return {
        attributes: toAttributes(dataPoint.attributes, encoder),
        count: histogram.count,
        min: histogram.min,
        max: histogram.max,
        sum: histogram.sum,
        positive: {
          offset: histogram.positive.offset,
          bucketCounts: histogram.positive.bucketCounts
        },
        negative: {
          offset: histogram.negative.offset,
          bucketCounts: histogram.negative.bucketCounts
        },
        scale: histogram.scale,
        zeroCount: histogram.zeroCount,
        startTimeUnixNano: encoder.encodeHrTime(dataPoint.startTime),
        timeUnixNano: encoder.encodeHrTime(dataPoint.endTime)
      };
    });
  }
  function toAggregationTemporality(temporality) {
    switch (temporality) {
      case AggregationTemporality.DELTA:
        return EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA;
      case AggregationTemporality.CUMULATIVE:
        return EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE;
    }
  }
  function createExportMetricsServiceRequest(resourceMetrics, encoder) {
    return {
      resourceMetrics: resourceMetrics.map((metrics2) => toResourceMetrics(metrics2, encoder))
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/metrics/json/metrics.js
  var JsonMetricsSerializer = {
    serializeRequest: (arg) => {
      const request = createExportMetricsServiceRequest([arg], JSON_ENCODER);
      const encoder = new TextEncoder();
      return encoder.encode(JSON.stringify(request));
    },
    deserializeResponse: (arg) => {
      if (arg.length === 0) {
        return {};
      }
      const decoder = new TextDecoder();
      try {
        return JSON.parse(decoder.decode(arg));
      } catch (err) {
        diag2.warn(`Failed to parse metrics export response: ${err.message}. Returning empty response`);
        return {};
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/trace/internal.js
  var SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK = 256;
  var SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK = 512;
  function buildSpanFlagsFrom(traceFlags, isRemote) {
    let flags = traceFlags & 255 | SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK;
    if (isRemote) {
      flags |= SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK;
    }
    return flags;
  }
  function sdkSpanToOtlpSpan(span, encoder) {
    const ctx = span.spanContext();
    const status = span.status;
    const parentSpanId = span.parentSpanContext?.spanId ? encoder.encodeSpanContext(span.parentSpanContext?.spanId) : void 0;
    return {
      traceId: encoder.encodeSpanContext(ctx.traceId),
      spanId: encoder.encodeSpanContext(ctx.spanId),
      parentSpanId,
      traceState: ctx.traceState?.serialize(),
      name: span.name,
      // Span kind is offset by 1 because the API does not define a value for unset
      kind: span.kind == null ? 0 : span.kind + 1,
      startTimeUnixNano: encoder.encodeHrTime(span.startTime),
      endTimeUnixNano: encoder.encodeHrTime(span.endTime),
      attributes: toAttributes(span.attributes, encoder),
      droppedAttributesCount: span.droppedAttributesCount,
      events: span.events.map((event) => toOtlpSpanEvent(event, encoder)),
      droppedEventsCount: span.droppedEventsCount,
      status: {
        // API and proto enums share the same values
        code: status.code,
        message: status.message
      },
      links: span.links.map((link) => toOtlpLink(link, encoder)),
      droppedLinksCount: span.droppedLinksCount,
      flags: buildSpanFlagsFrom(ctx.traceFlags, span.parentSpanContext?.isRemote)
    };
  }
  function toOtlpLink(link, encoder) {
    return {
      attributes: link.attributes ? toAttributes(link.attributes, encoder) : [],
      spanId: encoder.encodeSpanContext(link.context.spanId),
      traceId: encoder.encodeSpanContext(link.context.traceId),
      traceState: link.context.traceState?.serialize(),
      droppedAttributesCount: link.droppedAttributesCount || 0,
      flags: buildSpanFlagsFrom(link.context.traceFlags, link.context.isRemote)
    };
  }
  function toOtlpSpanEvent(timedEvent, encoder) {
    return {
      attributes: timedEvent.attributes ? toAttributes(timedEvent.attributes, encoder) : [],
      name: timedEvent.name,
      timeUnixNano: encoder.encodeHrTime(timedEvent.time),
      droppedAttributesCount: timedEvent.droppedAttributesCount || 0
    };
  }
  function createExportTraceServiceRequest(spans, encoder) {
    return {
      resourceSpans: spanRecordsToResourceSpans(spans, encoder)
    };
  }
  function createResourceMap(readableSpans) {
    const resourceMap = /* @__PURE__ */ new Map();
    for (const record of readableSpans) {
      let ilsMap = resourceMap.get(record.resource);
      if (!ilsMap) {
        ilsMap = /* @__PURE__ */ new Map();
        resourceMap.set(record.resource, ilsMap);
      }
      const instrumentationScopeKey = `${record.instrumentationScope.name}@${record.instrumentationScope.version || ""}:${record.instrumentationScope.schemaUrl || ""}`;
      let records = ilsMap.get(instrumentationScopeKey);
      if (!records) {
        records = [];
        ilsMap.set(instrumentationScopeKey, records);
      }
      records.push(record);
    }
    return resourceMap;
  }
  function spanRecordsToResourceSpans(readableSpans, encoder) {
    const resourceMap = createResourceMap(readableSpans);
    const out = [];
    const entryIterator = resourceMap.entries();
    let entry = entryIterator.next();
    while (!entry.done) {
      const [resource, ilmMap] = entry.value;
      const scopeResourceSpans = [];
      const ilmIterator = ilmMap.values();
      let ilmEntry = ilmIterator.next();
      while (!ilmEntry.done) {
        const scopeSpans = ilmEntry.value;
        if (scopeSpans.length > 0) {
          const spans = scopeSpans.map((readableSpan) => sdkSpanToOtlpSpan(readableSpan, encoder));
          scopeResourceSpans.push({
            scope: createInstrumentationScope(scopeSpans[0].instrumentationScope),
            spans,
            schemaUrl: scopeSpans[0].instrumentationScope.schemaUrl
          });
        }
        ilmEntry = ilmIterator.next();
      }
      const processedResource = createResource(resource, encoder);
      const transformedSpans = {
        resource: processedResource,
        scopeSpans: scopeResourceSpans,
        schemaUrl: processedResource.schemaUrl
      };
      out.push(transformedSpans);
      entry = entryIterator.next();
    }
    return out;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-transformer@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-transformer/build/esm/trace/json/trace.js
  var JsonTraceSerializer = {
    serializeRequest: (arg) => {
      const request = createExportTraceServiceRequest(arg, JSON_ENCODER);
      const encoder = new TextEncoder();
      return encoder.encode(JSON.stringify(request));
    },
    deserializeResponse: (arg) => {
      if (arg.length === 0) {
        return {};
      }
      const decoder = new TextDecoder();
      try {
        return JSON.parse(decoder.decode(arg));
      } catch (err) {
        diag2.warn(`Failed to parse trace export response: ${err.message}. Returning empty response`);
        return {};
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/retrying-transport.js
  var MAX_ATTEMPTS = 5;
  var INITIAL_BACKOFF = 1e3;
  var MAX_BACKOFF = 5e3;
  var BACKOFF_MULTIPLIER = 1.5;
  var JITTER = 0.2;
  function getJitter() {
    return Math.random() * (2 * JITTER) - JITTER;
  }
  var RetryingTransport = class {
    _transport;
    constructor(transport) {
      this._transport = transport;
    }
    retry(data, timeoutMillis, inMillis) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this._transport.send(data, timeoutMillis).then(resolve, reject);
        }, inMillis);
      });
    }
    async send(data, timeoutMillis) {
      let attempts = MAX_ATTEMPTS;
      let nextBackoff = INITIAL_BACKOFF;
      const deadline = Date.now() + timeoutMillis;
      let result = await this._transport.send(data, timeoutMillis);
      while (result.status === "retryable" && attempts > 0) {
        attempts--;
        const backoff = Math.max(Math.min(nextBackoff * (1 + getJitter()), MAX_BACKOFF), 0);
        nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
        const retryInMillis = result.retryInMillis ?? backoff;
        const remainingTimeoutMillis = deadline - Date.now();
        if (retryInMillis > remainingTimeoutMillis) {
          diag2.info(`Export retry time ${Math.round(retryInMillis)}ms exceeds remaining timeout ${Math.round(remainingTimeoutMillis)}ms, not retrying further.`);
          return result;
        }
        diag2.verbose(`Scheduling export retry in ${Math.round(retryInMillis)}ms`);
        result = await this.retry(data, remainingTimeoutMillis, retryInMillis);
      }
      if (result.status === "success") {
        diag2.verbose(`Export succeeded after ${MAX_ATTEMPTS - attempts} retry attempts.`);
      } else if (result.status === "retryable") {
        diag2.info(`Export failed after maximum retry attempts (${MAX_ATTEMPTS}).`);
      } else {
        diag2.info(`Export failed with non-retryable error: ${result.error}`);
      }
      return result;
    }
    shutdown() {
      return this._transport.shutdown();
    }
  };
  function createRetryingTransport(options) {
    return new RetryingTransport(options.transport);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/is-export-retryable.js
  function isExportHTTPErrorRetryable(statusCode) {
    return statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504;
  }
  function parseRetryAfterToMills(retryAfter) {
    if (retryAfter == null) {
      return void 0;
    }
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isInteger(seconds)) {
      return seconds > 0 ? seconds * 1e3 : -1;
    }
    const delay = new Date(retryAfter).getTime() - Date.now();
    if (delay >= 0) {
      return delay;
    }
    return 0;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/transport/fetch-transport.js
  var MAX_KEEPALIVE_BODY_SIZE = 60 * 1024;
  var MAX_KEEPALIVE_REQUESTS = 9;
  var pendingBodySize = 0;
  var pendingKeepaliveCount = 0;
  var FetchTransport = class {
    _parameters;
    constructor(parameters) {
      this._parameters = parameters;
    }
    async send(data, timeoutMillis) {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
      let fetchApi = globalThis.fetch;
      if (typeof fetchApi.__original === "function") {
        fetchApi = fetchApi.__original;
      }
      const requestSize = data.byteLength;
      const wouldExceedSize = pendingBodySize + requestSize > MAX_KEEPALIVE_BODY_SIZE;
      const wouldExceedCount = pendingKeepaliveCount >= MAX_KEEPALIVE_REQUESTS;
      const useKeepalive = !wouldExceedSize && !wouldExceedCount;
      if (useKeepalive) {
        pendingBodySize += requestSize;
        pendingKeepaliveCount++;
      } else {
        const reason = wouldExceedSize ? "size limit" : "count limit";
        diag2.debug(`keepalive disabled: ${(requestSize / 1024).toFixed(1)}KB payload, ${pendingKeepaliveCount} pending (${reason})`);
      }
      try {
        const url = new URL(this._parameters.url);
        const response = await fetchApi(url.href, {
          method: "POST",
          headers: await this._parameters.headers(),
          body: data,
          signal: abortController.signal,
          keepalive: useKeepalive,
          mode: globalThis.location ? globalThis.location.origin === url.origin ? "same-origin" : "cors" : "no-cors"
        });
        if (response.status >= 200 && response.status <= 299) {
          diag2.debug(`export response success (status: ${response.status})`);
          return { status: "success" };
        } else if (isExportHTTPErrorRetryable(response.status)) {
          diag2.warn(`export response retryable (status: ${response.status})`);
          const retryAfter = response.headers.get("Retry-After");
          const retryInMillis = parseRetryAfterToMills(retryAfter);
          return { status: "retryable", retryInMillis };
        }
        diag2.error(`export response failure (status: ${response.status})`);
        return {
          status: "failure",
          error: new Error(`Fetch request failed with non-retryable status ${response.status}`)
        };
      } catch (error) {
        if (isFetchNetworkErrorRetryable(error)) {
          diag2.warn(`export request retryable (network error: ${error})`);
          return {
            status: "retryable",
            error: new Error("Fetch request encountered a network error", {
              cause: error
            })
          };
        }
        diag2.error(`export request failure (error: ${error})`);
        return {
          status: "failure",
          error: new Error("Fetch request errored", { cause: error })
        };
      } finally {
        clearTimeout(timeout);
        if (useKeepalive) {
          pendingBodySize -= requestSize;
          pendingKeepaliveCount--;
        }
      }
    }
    shutdown() {
    }
  };
  function createFetchTransport(parameters) {
    return new FetchTransport(parameters);
  }
  function isFetchNetworkErrorRetryable(error) {
    return error instanceof TypeError && !error.cause;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-browser-http-export-delegate.js
  function createOtlpFetchExportDelegate(options, serializer) {
    return createOtlpNetworkExportDelegate(options, serializer, createRetryingTransport({
      transport: createFetchTransport(options)
    }));
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/util.js
  function validateAndNormalizeHeaders(partialHeaders) {
    const headers = {};
    Object.entries(partialHeaders ?? {}).forEach(([key, value]) => {
      if (typeof value !== "undefined") {
        headers[key] = String(value);
      } else {
        diag2.warn(`Header "${key}" has invalid value (${value}) and will be ignored`);
      }
    });
    return headers;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/otlp-http-configuration.js
  function mergeHeaders(userProvidedHeaders, fallbackHeaders, defaultHeaders) {
    return async () => {
      const requiredHeaders = {
        ...await defaultHeaders()
      };
      const headers = {};
      if (fallbackHeaders != null) {
        Object.assign(headers, await fallbackHeaders());
      }
      if (userProvidedHeaders != null) {
        Object.assign(headers, validateAndNormalizeHeaders(await userProvidedHeaders()));
      }
      return Object.assign(headers, requiredHeaders);
    };
  }
  function validateUserProvidedUrl(url) {
    if (url == null) {
      return void 0;
    }
    try {
      const base = globalThis.location?.href;
      return new URL(url, base).href;
    } catch {
      throw new Error(`Configuration: Could not parse user-provided export URL: '${url}'`);
    }
  }
  function mergeOtlpHttpConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
    return {
      ...mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration),
      headers: mergeHeaders(userProvidedConfiguration.headers, fallbackConfiguration.headers, defaultConfiguration.headers),
      url: validateUserProvidedUrl(userProvidedConfiguration.url) ?? fallbackConfiguration.url ?? defaultConfiguration.url
    };
  }
  function getHttpConfigurationDefaults(requiredHeaders, signalResourcePath) {
    return {
      ...getSharedConfigurationDefaults(),
      headers: async () => requiredHeaders,
      url: "http://localhost:4318/" + signalResourcePath
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-http-options.js
  function convertLegacyHeaders(config) {
    if (typeof config.headers === "function") {
      return config.headers;
    }
    return wrapStaticHeadersInFunction(config.headers);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-browser-http-options.js
  function convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders) {
    return mergeOtlpHttpConfigurationWithDefaults(
      {
        url: config.url,
        timeoutMillis: config.timeoutMillis,
        headers: convertLegacyHeaders(config),
        concurrencyLimit: config.concurrencyLimit
      },
      {},
      // no fallback for browser case
      getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
    );
  }

  // ../../../node_modules/.pnpm/@opentelemetry+otlp-exporter-base@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/create-legacy-browser-delegate.js
  function createLegacyOtlpBrowserExportDelegate(config, serializer, signalResourcePath, requiredHeaders) {
    const options = convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders);
    return createOtlpFetchExportDelegate(options, serializer);
  }

  // ../../../node_modules/.pnpm/@opentelemetry+exporter-trace-otlp-http@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/exporter-trace-otlp-http/build/esm/platform/browser/OTLPTraceExporter.js
  var OTLPTraceExporter = class extends OTLPExporterBase {
    constructor(config = {}) {
      super(createLegacyOtlpBrowserExportDelegate(config, JsonTraceSerializer, "v1/traces", { "Content-Type": "application/json" }));
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+exporter-metrics-otlp-http@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/exporter-metrics-otlp-http/build/esm/OTLPMetricExporterOptions.js
  var AggregationTemporalityPreference;
  (function(AggregationTemporalityPreference2) {
    AggregationTemporalityPreference2[AggregationTemporalityPreference2["DELTA"] = 0] = "DELTA";
    AggregationTemporalityPreference2[AggregationTemporalityPreference2["CUMULATIVE"] = 1] = "CUMULATIVE";
    AggregationTemporalityPreference2[AggregationTemporalityPreference2["LOWMEMORY"] = 2] = "LOWMEMORY";
  })(AggregationTemporalityPreference || (AggregationTemporalityPreference = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+exporter-metrics-otlp-http@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/exporter-metrics-otlp-http/build/esm/OTLPMetricExporterBase.js
  var CumulativeTemporalitySelector = () => AggregationTemporality.CUMULATIVE;
  var DeltaTemporalitySelector = (instrumentType) => {
    switch (instrumentType) {
      case InstrumentType.COUNTER:
      case InstrumentType.OBSERVABLE_COUNTER:
      case InstrumentType.GAUGE:
      case InstrumentType.HISTOGRAM:
      case InstrumentType.OBSERVABLE_GAUGE:
        return AggregationTemporality.DELTA;
      case InstrumentType.UP_DOWN_COUNTER:
      case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
        return AggregationTemporality.CUMULATIVE;
    }
  };
  var LowMemoryTemporalitySelector = (instrumentType) => {
    switch (instrumentType) {
      case InstrumentType.COUNTER:
      case InstrumentType.HISTOGRAM:
        return AggregationTemporality.DELTA;
      case InstrumentType.GAUGE:
      case InstrumentType.UP_DOWN_COUNTER:
      case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
      case InstrumentType.OBSERVABLE_COUNTER:
      case InstrumentType.OBSERVABLE_GAUGE:
        return AggregationTemporality.CUMULATIVE;
    }
  };
  function chooseTemporalitySelectorFromEnvironment() {
    const configuredTemporality = (getStringFromEnv("OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE") ?? "cumulative").toLowerCase();
    if (configuredTemporality === "cumulative") {
      return CumulativeTemporalitySelector;
    }
    if (configuredTemporality === "delta") {
      return DeltaTemporalitySelector;
    }
    if (configuredTemporality === "lowmemory") {
      return LowMemoryTemporalitySelector;
    }
    diag2.warn(`OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '${configuredTemporality}', but only 'cumulative' and 'delta' are allowed. Using default ('cumulative') instead.`);
    return CumulativeTemporalitySelector;
  }
  function chooseTemporalitySelector(temporalityPreference) {
    if (temporalityPreference != null) {
      if (temporalityPreference === AggregationTemporalityPreference.DELTA) {
        return DeltaTemporalitySelector;
      } else if (temporalityPreference === AggregationTemporalityPreference.LOWMEMORY) {
        return LowMemoryTemporalitySelector;
      }
      return CumulativeTemporalitySelector;
    }
    return chooseTemporalitySelectorFromEnvironment();
  }
  var DEFAULT_AGGREGATION2 = Object.freeze({
    type: AggregationType.DEFAULT
  });
  function chooseAggregationSelector(config) {
    return config?.aggregationPreference ?? (() => DEFAULT_AGGREGATION2);
  }
  var OTLPMetricExporterBase = class extends OTLPExporterBase {
    _aggregationTemporalitySelector;
    _aggregationSelector;
    constructor(delegate, config) {
      super(delegate);
      this._aggregationSelector = chooseAggregationSelector(config);
      this._aggregationTemporalitySelector = chooseTemporalitySelector(config?.temporalityPreference);
    }
    selectAggregation(instrumentType) {
      return this._aggregationSelector(instrumentType);
    }
    selectAggregationTemporality(instrumentType) {
      return this._aggregationTemporalitySelector(instrumentType);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+exporter-metrics-otlp-http@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/exporter-metrics-otlp-http/build/esm/platform/browser/OTLPMetricExporter.js
  var OTLPMetricExporter = class extends OTLPMetricExporterBase {
    constructor(config) {
      super(createLegacyOtlpBrowserExportDelegate(config ?? {}, JsonMetricsSerializer, "v1/metrics", { "Content-Type": "application/json" }), config);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/autoLoaderUtils.js
  function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
    for (let i2 = 0, j = instrumentations.length; i2 < j; i2++) {
      const instrumentation = instrumentations[i2];
      if (tracerProvider) {
        instrumentation.setTracerProvider(tracerProvider);
      }
      if (meterProvider) {
        instrumentation.setMeterProvider(meterProvider);
      }
      if (loggerProvider && instrumentation.setLoggerProvider) {
        instrumentation.setLoggerProvider(loggerProvider);
      }
      if (!instrumentation.getConfig().enabled) {
        instrumentation.enable();
      }
    }
  }
  function disableInstrumentations(instrumentations) {
    instrumentations.forEach((instrumentation) => instrumentation.disable());
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js
  function registerInstrumentations(options) {
    const tracerProvider = options.tracerProvider || trace.getTracerProvider();
    const meterProvider = options.meterProvider || metrics.getMeterProvider();
    const loggerProvider = options.loggerProvider || logs.getLoggerProvider();
    const instrumentations = options.instrumentations?.flat() ?? [];
    enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider);
    return () => {
      disableInstrumentations(instrumentations);
    };
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/shimmer.js
  var logger = console.error.bind(console);
  function defineProperty(obj, name, value) {
    const enumerable = !!obj[name] && Object.prototype.propertyIsEnumerable.call(obj, name);
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable,
      writable: true,
      value
    });
  }
  var wrap = (nodule, name, wrapper) => {
    if (!nodule || !nodule[name]) {
      logger("no original function " + String(name) + " to wrap");
      return;
    }
    if (!wrapper) {
      logger("no wrapper function");
      logger(new Error().stack);
      return;
    }
    const original = nodule[name];
    if (typeof original !== "function" || typeof wrapper !== "function") {
      logger("original object and wrapper must be functions");
      return;
    }
    const wrapped = wrapper(original, name);
    defineProperty(wrapped, "__original", original);
    defineProperty(wrapped, "__unwrap", () => {
      if (nodule[name] === wrapped) {
        defineProperty(nodule, name, original);
      }
    });
    defineProperty(wrapped, "__wrapped", true);
    defineProperty(nodule, name, wrapped);
    return wrapped;
  };
  var massWrap = (nodules, names, wrapper) => {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to wrap on modules");
      return;
    }
    nodules.forEach((nodule) => {
      names.forEach((name) => {
        wrap(nodule, name, wrapper);
      });
    });
  };
  var unwrap = (nodule, name) => {
    if (!nodule || !nodule[name]) {
      logger("no function to unwrap.");
      logger(new Error().stack);
      return;
    }
    const wrapped = nodule[name];
    if (!wrapped.__unwrap) {
      logger("no original to unwrap to -- has " + String(name) + " already been unwrapped?");
    } else {
      wrapped.__unwrap();
      return;
    }
  };
  var massUnwrap = (nodules, names) => {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to unwrap on modules");
      return;
    }
    nodules.forEach((nodule) => {
      names.forEach((name) => {
        unwrap(nodule, name);
      });
    });
  };
  function shimmer(options) {
    if (options && options.logger) {
      if (typeof options.logger !== "function") {
        logger("new logger isn't a function, not replacing");
      } else {
        logger = options.logger;
      }
    }
  }
  shimmer.wrap = wrap;
  shimmer.massWrap = massWrap;
  shimmer.unwrap = unwrap;
  shimmer.massUnwrap = massUnwrap;

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/instrumentation.js
  var InstrumentationAbstract = class {
    _config = {};
    _tracer;
    _meter;
    _logger;
    _diag;
    instrumentationName;
    instrumentationVersion;
    constructor(instrumentationName, instrumentationVersion, config) {
      this.instrumentationName = instrumentationName;
      this.instrumentationVersion = instrumentationVersion;
      this.setConfig(config);
      this._diag = diag2.createComponentLogger({
        namespace: instrumentationName
      });
      this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
      this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
      this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
      this._updateMetricInstruments();
    }
    /* Api to wrap instrumented method */
    _wrap = wrap;
    /* Api to unwrap instrumented methods */
    _unwrap = unwrap;
    /* Api to mass wrap instrumented method */
    _massWrap = massWrap;
    /* Api to mass unwrap instrumented methods */
    _massUnwrap = massUnwrap;
    /* Returns meter */
    get meter() {
      return this._meter;
    }
    /**
     * Sets MeterProvider to this plugin
     * @param meterProvider
     */
    setMeterProvider(meterProvider) {
      this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
      this._updateMetricInstruments();
    }
    /* Returns logger */
    get logger() {
      return this._logger;
    }
    /**
     * Sets LoggerProvider to this plugin
     * @param loggerProvider
     */
    setLoggerProvider(loggerProvider) {
      this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
    }
    /**
     * @experimental
     *
     * Get module definitions defined by {@link init}.
     * This can be used for experimental compile-time instrumentation.
     *
     * @returns an array of {@link InstrumentationModuleDefinition}
     */
    getModuleDefinitions() {
      const initResult = this.init() ?? [];
      if (!Array.isArray(initResult)) {
        return [initResult];
      }
      return initResult;
    }
    /**
     * Sets the new metric instruments with the current Meter.
     */
    _updateMetricInstruments() {
      return;
    }
    /* Returns InstrumentationConfig */
    getConfig() {
      return this._config;
    }
    /**
     * Sets InstrumentationConfig to this plugin
     * @param config
     */
    setConfig(config) {
      this._config = {
        enabled: true,
        ...config
      };
    }
    /**
     * Sets TraceProvider to this plugin
     * @param tracerProvider
     */
    setTracerProvider(tracerProvider) {
      this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
    }
    /* Returns tracer */
    get tracer() {
      return this._tracer;
    }
    /**
     * Execute span customization hook, if configured, and log any errors.
     * Any semantics of the trigger and info are defined by the specific instrumentation.
     * @param hookHandler The optional hook handler which the user has configured via instrumentation config
     * @param triggerName The name of the trigger for executing the hook for logging purposes
     * @param span The span to which the hook should be applied
     * @param info The info object to be passed to the hook, with useful data the hook may use
     */
    _runSpanCustomizationHook(hookHandler, triggerName, span, info) {
      if (!hookHandler) {
        return;
      }
      try {
        hookHandler(span, info);
      } catch (e2) {
        this._diag.error(`Error running span customization hook due to exception in handler`, { triggerName }, e2);
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/platform/browser/instrumentation.js
  var InstrumentationBase = class extends InstrumentationAbstract {
    constructor(instrumentationName, instrumentationVersion, config) {
      super(instrumentationName, instrumentationVersion, config);
      if (this._config.enabled) {
        this.enable();
      }
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/utils.js
  function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
    let error;
    let result;
    try {
      result = execute();
    } catch (e2) {
      error = e2;
    } finally {
      onFinish(error, result);
      if (error && !preventThrowingError) {
        throw error;
      }
      return result;
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation/build/esm/semconvStability.js
  var SemconvStability;
  (function(SemconvStability2) {
    SemconvStability2[SemconvStability2["STABLE"] = 1] = "STABLE";
    SemconvStability2[SemconvStability2["OLD"] = 2] = "OLD";
    SemconvStability2[SemconvStability2["DUPLICATE"] = 3] = "DUPLICATE";
  })(SemconvStability || (SemconvStability = {}));
  function semconvStabilityFromStr(namespace, str) {
    let semconvStability = SemconvStability.OLD;
    const entries = str?.split(",").map((v2) => v2.trim()).filter((s2) => s2 !== "");
    for (const entry of entries ?? []) {
      if (entry.toLowerCase() === namespace + "/dup") {
        semconvStability = SemconvStability.DUPLICATE;
        break;
      } else if (entry.toLowerCase() === namespace) {
        semconvStability = SemconvStability.STABLE;
      }
    }
    return semconvStability;
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/enums/AttributeNames.js
  var AttributeNames;
  (function(AttributeNames4) {
    AttributeNames4["DOCUMENT_LOAD"] = "documentLoad";
    AttributeNames4["DOCUMENT_FETCH"] = "documentFetch";
    AttributeNames4["RESOURCE_FETCH"] = "resourceFetch";
  })(AttributeNames || (AttributeNames = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/version.js
  var PACKAGE_VERSION = "0.63.0";
  var PACKAGE_NAME = "@opentelemetry/instrumentation-document-load";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/semconv.js
  var ATTR_HTTP_URL = "http.url";
  var ATTR_HTTP_USER_AGENT = "http.user_agent";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/enums/EventNames.js
  var EventNames;
  (function(EventNames3) {
    EventNames3["FIRST_PAINT"] = "firstPaint";
    EventNames3["FIRST_CONTENTFUL_PAINT"] = "firstContentfulPaint";
  })(EventNames || (EventNames = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/utils.js
  var getPerformanceNavigationEntries = () => {
    const entries = {};
    const performanceNavigationTiming = otperformance.getEntriesByType?.("navigation")[0];
    if (performanceNavigationTiming) {
      const keys = Object.values(PerformanceTimingNames);
      keys.forEach((key) => {
        if (hasKey(performanceNavigationTiming, key)) {
          const value = performanceNavigationTiming[key];
          if (typeof value === "number") {
            entries[key] = value;
          }
        }
      });
    } else {
      const perf = otperformance;
      const performanceTiming = perf.timing;
      if (performanceTiming) {
        const keys = Object.values(PerformanceTimingNames);
        keys.forEach((key) => {
          if (hasKey(performanceTiming, key)) {
            const value = performanceTiming[key];
            if (typeof value === "number") {
              entries[key] = value;
            }
          }
        });
      }
    }
    return entries;
  };
  var performancePaintNames = {
    "first-paint": EventNames.FIRST_PAINT,
    "first-contentful-paint": EventNames.FIRST_CONTENTFUL_PAINT
  };
  var addSpanPerformancePaintEvents = (span) => {
    const performancePaintTiming = otperformance.getEntriesByType?.("paint");
    if (performancePaintTiming) {
      performancePaintTiming.forEach(({ name, startTime }) => {
        if (hasKey(performancePaintNames, name)) {
          span.addEvent(performancePaintNames[name], startTime);
        }
      });
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-document-load@0.63.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-document-load/build/esm/instrumentation.js
  var DocumentLoadInstrumentation = class extends InstrumentationBase {
    component = "document-load";
    version = "1";
    moduleName = this.component;
    _semconvStability;
    constructor(config = {}) {
      super(PACKAGE_NAME, PACKAGE_VERSION, config);
      this._semconvStability = semconvStabilityFromStr("http", config?.semconvStabilityOptIn);
    }
    init() {
    }
    /**
     * callback to be executed when page is loaded
     */
    _onDocumentLoaded() {
      window.setTimeout(() => {
        this._collectPerformance();
      });
    }
    /**
     * Adds spans for all resources
     * @param rootSpan
     */
    _addResourcesSpans(rootSpan) {
      const resources = otperformance.getEntriesByType?.("resource");
      if (resources) {
        resources.forEach((resource) => {
          this._initResourceSpan(resource, rootSpan);
        });
      }
    }
    /**
     * Collects information about performance and creates appropriate spans
     */
    _collectPerformance() {
      const metaElement = Array.from(document.getElementsByTagName("meta")).find((e2) => e2.getAttribute("name") === TRACE_PARENT_HEADER);
      const entries = getPerformanceNavigationEntries();
      const traceparent = metaElement && metaElement.content || "";
      context.with(propagation.extract(ROOT_CONTEXT, { traceparent }), () => {
        const rootSpan = this._startSpan(AttributeNames.DOCUMENT_LOAD, PerformanceTimingNames.FETCH_START, entries);
        if (!rootSpan) {
          return;
        }
        context.with(trace.setSpan(context.active(), rootSpan), () => {
          const fetchSpan = this._startSpan(AttributeNames.DOCUMENT_FETCH, PerformanceTimingNames.FETCH_START, entries);
          if (fetchSpan) {
            if (this._semconvStability & SemconvStability.OLD) {
              fetchSpan.setAttribute(ATTR_HTTP_URL, location.href);
            }
            if (this._semconvStability & SemconvStability.STABLE) {
              fetchSpan.setAttribute(ATTR_URL_FULL, location.href);
            }
            context.with(trace.setSpan(context.active(), fetchSpan), () => {
              const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
              addSpanNetworkEvents(fetchSpan, entries, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
              this._addCustomAttributesOnSpan(fetchSpan, this.getConfig().applyCustomAttributesOnSpan?.documentFetch);
              this._endSpan(fetchSpan, PerformanceTimingNames.RESPONSE_END, entries);
            });
          }
        });
        if (this._semconvStability & SemconvStability.OLD) {
          rootSpan.setAttribute(ATTR_HTTP_URL, location.href);
          rootSpan.setAttribute(ATTR_HTTP_USER_AGENT, navigator.userAgent);
        }
        if (this._semconvStability & SemconvStability.STABLE) {
          rootSpan.setAttribute(ATTR_URL_FULL, location.href);
          rootSpan.setAttribute(ATTR_USER_AGENT_ORIGINAL, navigator.userAgent);
        }
        this._addResourcesSpans(rootSpan);
        if (!this.getConfig().ignoreNetworkEvents) {
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.FETCH_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.UNLOAD_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.UNLOAD_EVENT_END, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_INTERACTIVE, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_END, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_COMPLETE, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.LOAD_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.LOAD_EVENT_END, entries);
        }
        if (!this.getConfig().ignorePerformancePaintEvents) {
          addSpanPerformancePaintEvents(rootSpan);
        }
        this._addCustomAttributesOnSpan(rootSpan, this.getConfig().applyCustomAttributesOnSpan?.documentLoad);
        this._endSpan(rootSpan, PerformanceTimingNames.LOAD_EVENT_END, entries);
      });
    }
    /**
     * Helper function for ending span
     * @param span
     * @param performanceName name of performance entry for time end
     * @param entries
     */
    _endSpan(span, performanceName, entries) {
      if (span) {
        if (hasKey(entries, performanceName)) {
          span.end(entries[performanceName]);
        } else {
          span.end();
        }
      }
    }
    /**
     * Creates and ends a span with network information about resource added as timed events
     * @param resource
     * @param parentSpan
     */
    _initResourceSpan(resource, parentSpan) {
      const span = this._startSpan(AttributeNames.RESOURCE_FETCH, PerformanceTimingNames.FETCH_START, resource, parentSpan);
      if (span) {
        if (this._semconvStability & SemconvStability.OLD) {
          span.setAttribute(ATTR_HTTP_URL, resource.name);
        }
        if (this._semconvStability & SemconvStability.STABLE) {
          span.setAttribute(ATTR_URL_FULL, resource.name);
        }
        const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
        addSpanNetworkEvents(span, resource, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
        this._addCustomAttributesOnResourceSpan(span, resource, this.getConfig().applyCustomAttributesOnSpan?.resourceFetch);
        this._endSpan(span, PerformanceTimingNames.RESPONSE_END, resource);
      }
    }
    /**
     * Helper function for starting a span
     * @param spanName name of span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param parentSpan
     */
    _startSpan(spanName, performanceName, entries, parentSpan) {
      if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number") {
        const span = this.tracer.startSpan(spanName, {
          startTime: entries[performanceName]
        }, parentSpan ? trace.setSpan(context.active(), parentSpan) : void 0);
        return span;
      }
      return void 0;
    }
    /**
     * executes callback {_onDocumentLoaded} when the page is loaded
     */
    _waitForPageLoad() {
      if (window.document.readyState === "complete") {
        this._onDocumentLoaded();
      } else {
        this._onDocumentLoaded = this._onDocumentLoaded.bind(this);
        window.addEventListener("load", this._onDocumentLoaded);
      }
    }
    /**
     * adds custom attributes to root span if configured
     */
    _addCustomAttributesOnSpan(span, applyCustomAttributesOnSpan) {
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("addCustomAttributesOnSpan", error);
        }, true);
      }
    }
    /**
     * adds custom attributes to span if configured
     */
    _addCustomAttributesOnResourceSpan(span, resource, applyCustomAttributesOnSpan) {
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, resource), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("addCustomAttributesOnResourceSpan", error);
        }, true);
      }
    }
    /**
     * implements enable function
     */
    enable() {
      window.removeEventListener("load", this._onDocumentLoaded);
      this._waitForPageLoad();
    }
    /**
     * implements disable function
     */
    disable() {
      window.removeEventListener("load", this._onDocumentLoaded);
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-fetch@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-fetch/build/esm/enums/AttributeNames.js
  var AttributeNames2;
  (function(AttributeNames4) {
    AttributeNames4["COMPONENT"] = "component";
    AttributeNames4["HTTP_STATUS_TEXT"] = "http.status_text";
  })(AttributeNames2 || (AttributeNames2 = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-fetch@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-fetch/build/esm/semconv.js
  var ATTR_HTTP_HOST = "http.host";
  var ATTR_HTTP_METHOD = "http.method";
  var ATTR_HTTP_REQUEST_BODY_SIZE = "http.request.body.size";
  var ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED = "http.request_content_length_uncompressed";
  var ATTR_HTTP_SCHEME = "http.scheme";
  var ATTR_HTTP_STATUS_CODE = "http.status_code";
  var ATTR_HTTP_URL2 = "http.url";
  var ATTR_HTTP_USER_AGENT2 = "http.user_agent";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-fetch@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-fetch/build/esm/utils.js
  var DIAG_LOGGER = diag2.createComponentLogger({
    namespace: "@opentelemetry/opentelemetry-instrumentation-fetch/utils"
  });
  function getFetchBodyLength(...args) {
    if (args[0] instanceof URL || typeof args[0] === "string") {
      const requestInit = args[1];
      if (!requestInit?.body) {
        return Promise.resolve();
      }
      if (requestInit.body instanceof ReadableStream) {
        const { body, length } = _getBodyNonDestructively(requestInit.body);
        requestInit.body = body;
        return length;
      } else {
        return Promise.resolve(getXHRBodyLength(requestInit.body));
      }
    } else {
      const info = args[0];
      if (!info?.body) {
        return Promise.resolve();
      }
      return info.clone().text().then((t2) => getByteLength(t2));
    }
  }
  function _getBodyNonDestructively(body) {
    if (!body.pipeThrough) {
      DIAG_LOGGER.warn("Platform has ReadableStream but not pipeThrough!");
      return {
        body,
        length: Promise.resolve(void 0)
      };
    }
    let length = 0;
    let resolveLength;
    const lengthPromise = new Promise((resolve) => {
      resolveLength = resolve;
    });
    const transform = new TransformStream({
      start() {
      },
      async transform(chunk, controller) {
        const bytearray = await chunk;
        length += bytearray.byteLength;
        controller.enqueue(chunk);
      },
      flush() {
        resolveLength(length);
      }
    });
    return {
      body: body.pipeThrough(transform),
      length: lengthPromise
    };
  }
  function isDocument(value) {
    return typeof Document !== "undefined" && value instanceof Document;
  }
  function getXHRBodyLength(body) {
    if (isDocument(body)) {
      return new XMLSerializer().serializeToString(document).length;
    }
    if (typeof body === "string") {
      return getByteLength(body);
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof FormData) {
      return getFormDataSize(body);
    }
    if (body instanceof URLSearchParams) {
      return getByteLength(body.toString());
    }
    if (body.byteLength !== void 0) {
      return body.byteLength;
    }
    DIAG_LOGGER.warn("unknown body type");
    return void 0;
  }
  var TEXT_ENCODER = new TextEncoder();
  function getByteLength(s2) {
    return TEXT_ENCODER.encode(s2).byteLength;
  }
  function getFormDataSize(formData) {
    let size = 0;
    for (const [key, value] of formData.entries()) {
      size += key.length;
      if (value instanceof Blob) {
        size += value.size;
      } else {
        size += value.length;
      }
    }
    return size;
  }
  function normalizeHttpRequestMethod(method) {
    const knownMethods3 = getKnownMethods();
    const methUpper = method.toUpperCase();
    if (methUpper in knownMethods3) {
      return methUpper;
    } else {
      return "_OTHER";
    }
  }
  var DEFAULT_KNOWN_METHODS = {
    CONNECT: true,
    DELETE: true,
    GET: true,
    HEAD: true,
    OPTIONS: true,
    PATCH: true,
    POST: true,
    PUT: true,
    TRACE: true,
    // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
    QUERY: true
  };
  var knownMethods;
  function getKnownMethods() {
    if (knownMethods === void 0) {
      const cfgMethods = getStringListFromEnv("OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS");
      if (cfgMethods && cfgMethods.length > 0) {
        knownMethods = {};
        cfgMethods.forEach((m2) => {
          knownMethods[m2] = true;
        });
      } else {
        knownMethods = DEFAULT_KNOWN_METHODS;
      }
    }
    return knownMethods;
  }
  var HTTP_PORT_FROM_PROTOCOL = {
    "https:": "443",
    "http:": "80"
  };
  function serverPortFromUrl(url) {
    const serverPort = Number(url.port || HTTP_PORT_FROM_PROTOCOL[url.protocol]);
    if (serverPort && !isNaN(serverPort)) {
      return serverPort;
    } else {
      return void 0;
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-fetch@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-fetch/build/esm/version.js
  var VERSION5 = "0.218.0";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-fetch@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-fetch/build/esm/fetch.js
  var OBSERVER_WAIT_TIME_MS = 300;
  var hasBrowserPerformanceAPI = typeof PerformanceObserver !== "undefined";
  var FetchInstrumentation = class extends InstrumentationBase {
    component = "fetch";
    version = VERSION5;
    moduleName = this.component;
    _usedResources = /* @__PURE__ */ new WeakSet();
    _tasksCount = 0;
    _semconvStability;
    constructor(config = {}) {
      super("@opentelemetry/instrumentation-fetch", VERSION5, config);
      this._semconvStability = semconvStabilityFromStr("http", config?.semconvStabilityOptIn);
    }
    init() {
    }
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     */
    _addChildSpan(span, corsPreFlightRequest) {
      const childSpan = this.tracer.startSpan("CORS Preflight", {
        startTime: corsPreFlightRequest[PerformanceTimingNames.FETCH_START]
      }, trace.setSpan(context.active(), span));
      const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
      addSpanNetworkEvents(childSpan, corsPreFlightRequest, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
      childSpan.end(corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END]);
    }
    /**
     * Adds more attributes to span just before ending it
     * @param span
     * @param response
     */
    _addFinalSpanAttributes(span, response) {
      const parsedUrl = parseUrl(response.url);
      if (this._semconvStability & SemconvStability.OLD) {
        span.setAttribute(ATTR_HTTP_STATUS_CODE, response.status);
        if (response.statusText != null) {
          span.setAttribute(AttributeNames2.HTTP_STATUS_TEXT, response.statusText);
        }
        span.setAttribute(ATTR_HTTP_HOST, parsedUrl.host);
        span.setAttribute(ATTR_HTTP_SCHEME, parsedUrl.protocol.replace(":", ""));
        if (typeof navigator !== "undefined") {
          span.setAttribute(ATTR_HTTP_USER_AGENT2, navigator.userAgent);
        }
      }
      if (this._semconvStability & SemconvStability.STABLE) {
        span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
        span.setAttribute(ATTR_SERVER_ADDRESS, parsedUrl.hostname);
        const serverPort = serverPortFromUrl(parsedUrl);
        if (serverPort) {
          span.setAttribute(ATTR_SERVER_PORT, serverPort);
        }
      }
    }
    /**
     * Add headers
     * @param options
     * @param spanUrl
     */
    _addHeaders(options, spanUrl) {
      if (!shouldPropagateTraceHeaders(spanUrl, this.getConfig().propagateTraceHeaderCorsUrls)) {
        const headers = {};
        propagation.inject(context.active(), headers);
        if (Object.keys(headers).length > 0) {
          this._diag.debug("headers inject skipped due to CORS policy");
        }
        return;
      }
      if (options instanceof Request) {
        propagation.inject(context.active(), options.headers, {
          set: (h2, k2, v2) => h2.set(k2, typeof v2 === "string" ? v2 : String(v2))
        });
      } else {
        const headers = new Headers(options.headers);
        propagation.inject(context.active(), headers, {
          set: (h2, k2, v2) => h2.set(k2, typeof v2 === "string" ? v2 : String(v2))
        });
        options.headers = headers;
      }
    }
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link FetchPluginConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    _clearResources() {
      if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
        performance.clearResourceTimings();
        this._usedResources = /* @__PURE__ */ new WeakSet();
      }
    }
    /**
     * Creates a new span
     * @param url
     * @param options
     */
    _createSpan(url, options = {}) {
      if (isUrlIgnored(url, this.getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      let name = "";
      const attributes = {};
      if (this._semconvStability & SemconvStability.OLD) {
        const method = (options.method || "GET").toUpperCase();
        name = `HTTP ${method}`;
        attributes[AttributeNames2.COMPONENT] = this.moduleName;
        attributes[ATTR_HTTP_METHOD] = method;
        attributes[ATTR_HTTP_URL2] = url;
      }
      if (this._semconvStability & SemconvStability.STABLE) {
        const origMethod = options.method;
        const normMethod = normalizeHttpRequestMethod(options.method || "GET");
        if (!name) {
          name = normMethod;
        }
        attributes[ATTR_HTTP_REQUEST_METHOD] = normMethod;
        if (normMethod !== origMethod) {
          attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = origMethod;
        }
        attributes[ATTR_URL_FULL] = url;
      }
      return this.tracer.startSpan(name, {
        kind: SpanKind.CLIENT,
        attributes
      });
    }
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     * @param resourcesObserver
     * @param endTime
     */
    _findResourceAndAddNetworkEvents(span, resourcesObserver, endTime) {
      let resources = resourcesObserver.entries;
      if (!resources.length) {
        if (!performance.getEntriesByType) {
          return;
        }
        resources = performance.getEntriesByType("resource");
      }
      const resource = getResource(resourcesObserver.spanUrl, resourcesObserver.startTime, endTime, resources, this._usedResources, "fetch");
      if (resource.mainRequest) {
        const mainRequest = resource.mainRequest;
        this._markResourceAsUsed(mainRequest);
        const corsPreFlightRequest = resource.corsPreFlightRequest;
        if (corsPreFlightRequest) {
          this._addChildSpan(span, corsPreFlightRequest);
          this._markResourceAsUsed(corsPreFlightRequest);
        }
        const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
        addSpanNetworkEvents(span, mainRequest, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
      }
    }
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     */
    _markResourceAsUsed(resource) {
      this._usedResources.add(resource);
    }
    /**
     * Finish span, add attributes, network events etc.
     * @param span
     * @param spanData
     * @param response
     */
    _endSpan(span, spanData, response) {
      const endTime = millisToHrTime(Date.now());
      const performanceEndTime = hrTime();
      this._addFinalSpanAttributes(span, response);
      if (this._semconvStability & SemconvStability.STABLE) {
        if (response.status >= 400) {
          span.setStatus({ code: SpanStatusCode.ERROR });
          span.setAttribute(ATTR_ERROR_TYPE, String(response.status));
        }
      }
      setTimeout(() => {
        spanData.observer?.disconnect();
        this._findResourceAndAddNetworkEvents(span, spanData, performanceEndTime);
        this._tasksCount--;
        this._clearResources();
        span.end(endTime);
      }, OBSERVER_WAIT_TIME_MS);
    }
    /**
     * Patches the constructor of fetch
     */
    _patchConstructor() {
      return (original) => {
        const plugin = this;
        return function patchConstructor(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const self2 = this;
          const url = parseUrl(args[0] instanceof Request ? args[0].url : String(args[0])).href;
          let options;
          if (args[0] instanceof Request) {
            options = args[1] != null ? new Request(args[0], args[1]) : args[0];
          } else {
            options = args[1] || {};
          }
          const createdSpan = plugin._createSpan(url, options);
          if (!createdSpan) {
            return original.apply(this, args);
          }
          const spanData = plugin._prepareSpanData(url);
          if (plugin.getConfig().measureRequestSize) {
            getFetchBodyLength(...args).then((bodyLength) => {
              if (!bodyLength)
                return;
              if (plugin._semconvStability & SemconvStability.OLD) {
                createdSpan.setAttribute(ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED, bodyLength);
              }
              if (plugin._semconvStability & SemconvStability.STABLE) {
                createdSpan.setAttribute(ATTR_HTTP_REQUEST_BODY_SIZE, bodyLength);
              }
            }).catch((error) => {
              plugin._diag.warn("getFetchBodyLength", error);
            });
          }
          function endSpanOnError(span, error) {
            plugin._applyAttributesAfterFetch(span, options, error);
            plugin._endSpan(span, spanData, {
              status: error.status || 0,
              statusText: error.message,
              url
            });
          }
          function endSpanOnSuccess(span, response) {
            plugin._applyAttributesAfterFetch(span, options, response);
            if (response.status >= 200 && response.status < 400) {
              plugin._endSpan(span, spanData, response);
            } else {
              plugin._endSpan(span, spanData, {
                status: response.status,
                statusText: response.statusText,
                url
              });
            }
          }
          function onSuccess(span, response) {
            try {
              const resClone = response.clone();
              const body = resClone.body;
              if (body) {
                const reader = body.getReader();
                const read = () => {
                  reader.read().then(({ done }) => {
                    if (done) {
                      endSpanOnSuccess(span, response);
                    } else {
                      read();
                    }
                  }, (error) => {
                    endSpanOnError(span, error);
                  });
                };
                read();
              } else {
                endSpanOnSuccess(span, response);
              }
            } catch (error) {
              plugin._diag.error("Failed to read fetch response body", error);
              plugin._endSpan(span, spanData, {
                status: 0,
                url
              });
            }
            return response;
          }
          function onError(span, error) {
            try {
              endSpanOnError(span, error);
            } catch (e2) {
              plugin._diag.error("Failed to end span on fetch error", e2);
              plugin._endSpan(span, spanData, {
                status: error.status || 0,
                url
              });
            }
            throw error;
          }
          return context.with(trace.setSpan(context.active(), createdSpan), () => {
            plugin._callRequestHook(createdSpan, options);
            plugin._addHeaders(options, url);
            plugin._tasksCount++;
            return original.apply(self2, options instanceof Request ? [options] : [url, options]).then(onSuccess.bind(self2, createdSpan), onError.bind(self2, createdSpan));
          });
        };
      };
    }
    _applyAttributesAfterFetch(span, request, result) {
      const applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, request, result), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("applyCustomAttributesOnSpan", error);
        }, true);
      }
    }
    _callRequestHook(span, request) {
      const requestHook = this.getConfig().requestHook;
      if (requestHook) {
        safeExecuteInTheMiddle(() => requestHook(span, request), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("requestHook", error);
        }, true);
      }
    }
    /**
     * Prepares a span data - needed later for matching appropriate network
     *     resources
     * @param spanUrl
     */
    _prepareSpanData(spanUrl) {
      const startTime = hrTime();
      const entries = [];
      if (typeof PerformanceObserver !== "function") {
        return { entries, startTime, spanUrl };
      }
      const observer = new PerformanceObserver((list) => {
        const perfObsEntries = list.getEntries();
        perfObsEntries.forEach((entry) => {
          if (entry.initiatorType === "fetch" && entry.name === spanUrl) {
            entries.push(entry);
          }
        });
      });
      observer.observe({
        entryTypes: ["resource"]
      });
      return { entries, observer, startTime, spanUrl };
    }
    /**
     * implements enable function
     */
    enable() {
      if (!hasBrowserPerformanceAPI) {
        this._diag.warn("this instrumentation is intended for web usage only, it does not instrument server-side fetch()");
        return;
      }
      if (this._isEnabled) {
        return;
      }
      if (this._isFetchPatched) {
        this._diag.debug("fetch constructor already patched");
        this._isEnabled = true;
        return;
      }
      try {
        this._wrap(globalThis, "fetch", this._patchConstructor());
        this._isFetchPatched = true;
        this._isEnabled = true;
      } catch (err) {
        this._diag.warn("Failed to patch globalThis.fetch; instrumentation will not be enabled. Another script may have locked globalThis.fetch via Object.defineProperty.", err);
      }
    }
    /**
     * deactivates fetch instrumentation
     */
    disable() {
      if (!hasBrowserPerformanceAPI) {
        return;
      }
      if (!this._isEnabled) {
        return;
      }
      this._isEnabled = false;
      this._usedResources = /* @__PURE__ */ new WeakSet();
    }
  };

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/semconv.js
  var ATTR_HTTP_HOST2 = "http.host";
  var ATTR_HTTP_METHOD2 = "http.method";
  var ATTR_HTTP_REQUEST_BODY_SIZE2 = "http.request.body.size";
  var ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED2 = "http.request_content_length_uncompressed";
  var ATTR_HTTP_SCHEME2 = "http.scheme";
  var ATTR_HTTP_STATUS_CODE2 = "http.status_code";
  var ATTR_HTTP_URL3 = "http.url";
  var ATTR_HTTP_USER_AGENT3 = "http.user_agent";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/enums/EventNames.js
  var EventNames2;
  (function(EventNames3) {
    EventNames3["METHOD_OPEN"] = "open";
    EventNames3["METHOD_SEND"] = "send";
    EventNames3["EVENT_ABORT"] = "abort";
    EventNames3["EVENT_ERROR"] = "error";
    EventNames3["EVENT_LOAD"] = "loaded";
    EventNames3["EVENT_TIMEOUT"] = "timeout";
  })(EventNames2 || (EventNames2 = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/utils.js
  var DIAG_LOGGER2 = diag2.createComponentLogger({
    namespace: "@opentelemetry/opentelemetry-instrumentation-xml-http-request/utils"
  });
  function isDocument2(value) {
    return typeof Document !== "undefined" && value instanceof Document;
  }
  function getXHRBodyLength2(body) {
    if (isDocument2(body)) {
      return new XMLSerializer().serializeToString(document).length;
    }
    if (typeof body === "string") {
      return getByteLength2(body);
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof FormData) {
      return getFormDataSize2(body);
    }
    if (body instanceof URLSearchParams) {
      return getByteLength2(body.toString());
    }
    if (body.byteLength !== void 0) {
      return body.byteLength;
    }
    DIAG_LOGGER2.warn("unknown body type");
    return void 0;
  }
  var TEXT_ENCODER2 = new TextEncoder();
  function getByteLength2(s2) {
    return TEXT_ENCODER2.encode(s2).byteLength;
  }
  function getFormDataSize2(formData) {
    let size = 0;
    for (const [key, value] of formData.entries()) {
      size += key.length;
      if (value instanceof Blob) {
        size += value.size;
      } else {
        size += value.length;
      }
    }
    return size;
  }
  function normalizeHttpRequestMethod2(method) {
    const knownMethods3 = getKnownMethods2();
    const methUpper = method.toUpperCase();
    if (methUpper in knownMethods3) {
      return methUpper;
    } else {
      return "_OTHER";
    }
  }
  var DEFAULT_KNOWN_METHODS2 = {
    CONNECT: true,
    DELETE: true,
    GET: true,
    HEAD: true,
    OPTIONS: true,
    PATCH: true,
    POST: true,
    PUT: true,
    TRACE: true,
    // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
    QUERY: true
  };
  var knownMethods2;
  function getKnownMethods2() {
    if (knownMethods2 === void 0) {
      const cfgMethods = getStringListFromEnv("OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS");
      if (cfgMethods && cfgMethods.length > 0) {
        knownMethods2 = {};
        cfgMethods.forEach((m2) => {
          knownMethods2[m2] = true;
        });
      } else {
        knownMethods2 = DEFAULT_KNOWN_METHODS2;
      }
    }
    return knownMethods2;
  }
  var HTTP_PORT_FROM_PROTOCOL2 = {
    "https:": "443",
    "http:": "80"
  };
  function serverPortFromUrl2(url) {
    const serverPort = Number(url.port || HTTP_PORT_FROM_PROTOCOL2[url.protocol]);
    if (serverPort && !isNaN(serverPort)) {
      return serverPort;
    } else {
      return void 0;
    }
  }

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/version.js
  var VERSION6 = "0.218.0";

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/enums/AttributeNames.js
  var AttributeNames3;
  (function(AttributeNames4) {
    AttributeNames4["HTTP_STATUS_TEXT"] = "http.status_text";
  })(AttributeNames3 || (AttributeNames3 = {}));

  // ../../../node_modules/.pnpm/@opentelemetry+instrumentation-xml-http-request@0.218.0_@opentelemetry+api@1.9.1/node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/xhr.js
  var OBSERVER_WAIT_TIME_MS2 = 300;
  var XMLHttpRequestInstrumentation = class extends InstrumentationBase {
    component = "xml-http-request";
    version = VERSION6;
    moduleName = this.component;
    _tasksCount = 0;
    _xhrMem = /* @__PURE__ */ new WeakMap();
    _usedResources = /* @__PURE__ */ new WeakSet();
    _semconvStability;
    constructor(config = {}) {
      super("@opentelemetry/instrumentation-xml-http-request", VERSION6, config);
      this._semconvStability = semconvStabilityFromStr("http", config?.semconvStabilityOptIn);
    }
    init() {
    }
    /**
     * Adds custom headers to XMLHttpRequest
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addHeaders(xhr, spanUrl) {
      const url = parseUrl(spanUrl).href;
      if (!shouldPropagateTraceHeaders(url, this.getConfig().propagateTraceHeaderCorsUrls)) {
        const headers2 = {};
        propagation.inject(context.active(), headers2);
        if (Object.keys(headers2).length > 0) {
          this._diag.debug("headers inject skipped due to CORS policy");
        }
        return;
      }
      const headers = {};
      propagation.inject(context.active(), headers);
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, String(headers[key]));
      });
    }
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     * @private
     */
    _addChildSpan(span, corsPreFlightRequest) {
      context.with(trace.setSpan(context.active(), span), () => {
        const childSpan = this.tracer.startSpan("CORS Preflight", {
          startTime: corsPreFlightRequest[PerformanceTimingNames.FETCH_START]
        });
        const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
        addSpanNetworkEvents(childSpan, corsPreFlightRequest, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
        childSpan.end(corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END]);
      });
    }
    /**
     * Add attributes when span is going to end
     * @param span
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addFinalSpanAttributes(span, xhrMem, spanUrl) {
      if (this._semconvStability & SemconvStability.OLD) {
        if (xhrMem.status !== void 0) {
          span.setAttribute(ATTR_HTTP_STATUS_CODE2, xhrMem.status);
        }
        if (xhrMem.statusText !== void 0) {
          span.setAttribute(AttributeNames3.HTTP_STATUS_TEXT, xhrMem.statusText);
        }
        if (typeof spanUrl === "string") {
          const parsedUrl = parseUrl(spanUrl);
          span.setAttribute(ATTR_HTTP_HOST2, parsedUrl.host);
          span.setAttribute(ATTR_HTTP_SCHEME2, parsedUrl.protocol.replace(":", ""));
        }
        span.setAttribute(ATTR_HTTP_USER_AGENT3, navigator.userAgent);
      }
      if (this._semconvStability & SemconvStability.STABLE) {
        if (xhrMem.status) {
          span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, xhrMem.status);
        }
      }
    }
    _applyAttributesAfterXHR(span, xhr) {
      const applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
      if (typeof applyCustomAttributesOnSpan === "function") {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, xhr), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("applyCustomAttributesOnSpan", error);
        }, true);
      }
    }
    /**
     * will collect information about all resources created
     * between "send" and "end" with additional waiting for main resource
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addResourceObserver(xhr, spanUrl) {
      const xhrMem = this._xhrMem.get(xhr);
      if (!xhrMem || typeof PerformanceObserver !== "function" || typeof PerformanceResourceTiming !== "function") {
        return;
      }
      xhrMem.createdResources = {
        observer: new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const parsedUrl = parseUrl(spanUrl);
          entries.forEach((entry) => {
            if (entry.initiatorType === "xmlhttprequest" && entry.name === parsedUrl.href) {
              if (xhrMem.createdResources) {
                xhrMem.createdResources.entries.push(entry);
              }
            }
          });
        }),
        entries: []
      };
      xhrMem.createdResources.observer.observe({
        entryTypes: ["resource"]
      });
    }
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link XMLHttpRequestInstrumentationConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    _clearResources() {
      if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
        otperformance.clearResourceTimings();
        this._xhrMem = /* @__PURE__ */ new WeakMap();
        this._usedResources = /* @__PURE__ */ new WeakSet();
      }
    }
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     */
    _findResourceAndAddNetworkEvents(xhrMem, span, spanUrl, startTime, endTime) {
      if (!spanUrl || !startTime || !endTime || !xhrMem.createdResources) {
        return;
      }
      let resources = xhrMem.createdResources.entries;
      if (!resources || !resources.length) {
        resources = otperformance.getEntriesByType("resource");
      }
      const resource = getResource(parseUrl(spanUrl).href, startTime, endTime, resources, this._usedResources);
      if (resource.mainRequest) {
        const mainRequest = resource.mainRequest;
        this._markResourceAsUsed(mainRequest);
        const corsPreFlightRequest = resource.corsPreFlightRequest;
        if (corsPreFlightRequest) {
          this._addChildSpan(span, corsPreFlightRequest);
          this._markResourceAsUsed(corsPreFlightRequest);
        }
        const skipOldSemconvContentLengthAttrs = !(this._semconvStability & SemconvStability.OLD);
        addSpanNetworkEvents(span, mainRequest, this.getConfig().ignoreNetworkEvents, void 0, skipOldSemconvContentLengthAttrs);
      }
    }
    /**
     * Removes the previous information about span.
     * This might happened when the same xhr is used again.
     * @param xhr
     * @private
     */
    _cleanPreviousSpanInformation(xhr) {
      const xhrMem = this._xhrMem.get(xhr);
      if (xhrMem) {
        const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
        if (callbackToRemoveEvents) {
          callbackToRemoveEvents();
        }
        this._xhrMem.delete(xhr);
      }
    }
    /**
     * Creates a new span when method "open" is called
     * @param xhr
     * @param url
     * @param method
     * @private
     */
    _createSpan(xhr, url, method) {
      const parsedUrl = parseUrl(url);
      if (isUrlIgnored(parsedUrl.href, this.getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      let name = "";
      const attributes = {};
      if (this._semconvStability & SemconvStability.OLD) {
        name = method.toUpperCase();
        attributes[ATTR_HTTP_METHOD2] = method;
        attributes[ATTR_HTTP_URL3] = parsedUrl.toString();
      }
      if (this._semconvStability & SemconvStability.STABLE) {
        const origMethod = method;
        const normMethod = normalizeHttpRequestMethod2(method);
        if (!name) {
          name = normMethod;
        }
        attributes[ATTR_HTTP_REQUEST_METHOD] = normMethod;
        if (normMethod !== origMethod) {
          attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = origMethod;
        }
        attributes[ATTR_URL_FULL] = parsedUrl.toString();
        attributes[ATTR_SERVER_ADDRESS] = parsedUrl.hostname;
        const serverPort = serverPortFromUrl2(parsedUrl);
        if (serverPort) {
          attributes[ATTR_SERVER_PORT] = serverPort;
        }
      }
      const currentSpan = this.tracer.startSpan(name, {
        kind: SpanKind.CLIENT,
        attributes
      });
      currentSpan.addEvent(EventNames2.METHOD_OPEN);
      this._cleanPreviousSpanInformation(xhr);
      this._xhrMem.set(xhr, {
        span: currentSpan,
        spanUrl: url
      });
      return currentSpan;
    }
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     * @private
     */
    _markResourceAsUsed(resource) {
      this._usedResources.add(resource);
    }
    /**
     * Patches the method open
     * @private
     */
    _patchOpen() {
      return (original) => {
        const plugin = this;
        return function patchOpen(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const method = args[0];
          const url = args[1];
          plugin._createSpan(this, url, method);
          return original.apply(this, args);
        };
      };
    }
    /**
     * Patches the method send
     * @private
     */
    _patchSend() {
      const plugin = this;
      function endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime) {
        const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
        if (typeof callbackToRemoveEvents === "function") {
          callbackToRemoveEvents();
        }
        const { span, spanUrl, sendStartTime } = xhrMem;
        if (span) {
          plugin._findResourceAndAddNetworkEvents(xhrMem, span, spanUrl, sendStartTime, performanceEndTime);
          span.addEvent(eventName, endTime);
          plugin._addFinalSpanAttributes(span, xhrMem, spanUrl);
          span.end(endTime);
          plugin._tasksCount--;
        }
        plugin._clearResources();
      }
      function endSpan(eventName, xhr, isError, errorType) {
        const xhrMem = plugin._xhrMem.get(xhr);
        if (!xhrMem) {
          return;
        }
        xhrMem.status = xhr.status;
        xhrMem.statusText = xhr.statusText;
        plugin._xhrMem.delete(xhr);
        if (xhrMem.span) {
          const span = xhrMem.span;
          plugin._applyAttributesAfterXHR(span, xhr);
          if (plugin._semconvStability & SemconvStability.STABLE) {
            if (isError) {
              if (errorType) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: errorType
                });
                span.setAttribute(ATTR_ERROR_TYPE, errorType);
              }
            } else if (xhrMem.status && xhrMem.status >= 400) {
              span.setStatus({ code: SpanStatusCode.ERROR });
              span.setAttribute(ATTR_ERROR_TYPE, String(xhrMem.status));
            }
          }
        }
        const performanceEndTime = hrTime();
        const endTime = Date.now();
        setTimeout(() => {
          endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime);
        }, OBSERVER_WAIT_TIME_MS2);
      }
      function onError() {
        endSpan(EventNames2.EVENT_ERROR, this, true, "error");
      }
      function onAbort() {
        endSpan(EventNames2.EVENT_ABORT, this, false);
      }
      function onTimeout() {
        endSpan(EventNames2.EVENT_TIMEOUT, this, true, "timeout");
      }
      function onLoad() {
        if (this.status < 299) {
          endSpan(EventNames2.EVENT_LOAD, this, false);
        } else {
          endSpan(EventNames2.EVENT_ERROR, this, false);
        }
      }
      function unregister(xhr) {
        xhr.removeEventListener("abort", onAbort);
        xhr.removeEventListener("error", onError);
        xhr.removeEventListener("load", onLoad);
        xhr.removeEventListener("timeout", onTimeout);
        const xhrMem = plugin._xhrMem.get(xhr);
        if (xhrMem) {
          xhrMem.callbackToRemoveEvents = void 0;
        }
      }
      return (original) => {
        return function patchSend(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const xhrMem = plugin._xhrMem.get(this);
          if (!xhrMem) {
            return original.apply(this, args);
          }
          const currentSpan = xhrMem.span;
          const spanUrl = xhrMem.spanUrl;
          if (currentSpan && spanUrl) {
            if (plugin.getConfig().measureRequestSize && args?.[0]) {
              const body = args[0];
              const bodyLength = getXHRBodyLength2(body);
              if (bodyLength !== void 0) {
                if (plugin._semconvStability & SemconvStability.OLD) {
                  currentSpan.setAttribute(ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED2, bodyLength);
                }
                if (plugin._semconvStability & SemconvStability.STABLE) {
                  currentSpan.setAttribute(ATTR_HTTP_REQUEST_BODY_SIZE2, bodyLength);
                }
              }
            }
            context.with(trace.setSpan(context.active(), currentSpan), () => {
              plugin._tasksCount++;
              xhrMem.sendStartTime = hrTime();
              currentSpan.addEvent(EventNames2.METHOD_SEND);
              this.addEventListener("abort", onAbort);
              this.addEventListener("error", onError);
              this.addEventListener("load", onLoad);
              this.addEventListener("timeout", onTimeout);
              xhrMem.callbackToRemoveEvents = () => {
                unregister(this);
                if (xhrMem.createdResources) {
                  xhrMem.createdResources.observer.disconnect();
                }
              };
              plugin._addHeaders(this, spanUrl);
              plugin._addResourceObserver(this, spanUrl);
            });
          }
          return original.apply(this, args);
        };
      };
    }
    /**
     * implements enable function
     */
    enable() {
      if (this._isEnabled) {
        return;
      }
      if (this._isXhrPatched) {
        this._diag.debug("reactivating existing patch on", this.moduleName, this.version);
        this._isEnabled = true;
        return;
      }
      try {
        this._diag.debug("applying patch to", this.moduleName, this.version);
        this._wrap(XMLHttpRequest.prototype, "open", this._patchOpen());
        this._wrap(XMLHttpRequest.prototype, "send", this._patchSend());
        this._isXhrPatched = true;
        this._isEnabled = true;
      } catch (err) {
        this._unwrap(XMLHttpRequest.prototype, "open");
        this._unwrap(XMLHttpRequest.prototype, "send");
        this._diag.warn("Failed to patch globalThis.XMLHttpRequest; instrumentation will not be enabled. Another script may have locked globalThis.XMLHttpRequest via Object.defineProperty.", err);
      }
    }
    /**
     * implements disable function
     */
    disable() {
      if (!this._isEnabled) {
        return;
      }
      this._isEnabled = false;
      this._tasksCount = 0;
      this._xhrMem = /* @__PURE__ */ new WeakMap();
      this._usedResources = /* @__PURE__ */ new WeakSet();
    }
  };

  // src/session.ts
  var SESSION_STORAGE_KEY = "otelverse_session_id";
  function generateUUID() {
    const chars = "0123456789abcdef";
    const sections = [8, 4, 4, 4, 12];
    return sections.map((len) => {
      let section = "";
      for (let i2 = 0; i2 < len; i2++) {
        section += chars[Math.floor(Math.random() * 16)];
      }
      return section;
    }).join("-");
  }
  var cachedSessionId = null;
  function getSessionId() {
    if (cachedSessionId) return cachedSessionId;
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        cachedSessionId = stored;
        return cachedSessionId;
      }
    } catch {
    }
    cachedSessionId = generateUUID();
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, cachedSessionId);
    } catch {
    }
    return cachedSessionId;
  }

  // ../../../node_modules/.pnpm/web-vitals@5.2.0/node_modules/web-vitals/dist/web-vitals.js
  var e = -1;
  var t = (t2) => {
    addEventListener("pageshow", (n2) => {
      n2.persisted && (e = n2.timeStamp, t2(n2));
    }, true);
  };
  var n = (e2, t2, n2, i2) => {
    let s2, o2;
    return (r2) => {
      t2.value >= 0 && (r2 || i2) && (o2 = t2.value - (s2 ?? 0), (o2 || void 0 === s2) && (s2 = t2.value, t2.delta = o2, t2.rating = ((e3, t3) => e3 > t3[1] ? "poor" : e3 > t3[0] ? "needs-improvement" : "good")(t2.value, n2), e2(t2)));
    };
  };
  var i = (e2) => {
    requestAnimationFrame(() => requestAnimationFrame(e2));
  };
  var s = () => {
    const e2 = performance.getEntriesByType("navigation")[0];
    if (e2 && e2.responseStart > 0 && e2.responseStart < performance.now()) return e2;
  };
  var o = () => s()?.activationStart ?? 0;
  var r = (t2, n2 = -1) => {
    const i2 = s();
    let r2 = "navigate";
    e >= 0 ? r2 = "back-forward-cache" : i2 && (document.prerendering || o() > 0 ? r2 = "prerender" : document.wasDiscarded ? r2 = "restore" : i2.type && (r2 = i2.type.replace(/_/g, "-")));
    return { name: t2, value: n2, rating: "good", delta: 0, entries: [], id: `v5-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`, navigationType: r2 };
  };
  var c = /* @__PURE__ */ new WeakMap();
  function a(e2, t2) {
    return c.get(e2) || c.set(e2, new t2()), c.get(e2);
  }
  var d = class {
    t;
    i = 0;
    o = [];
    h(e2) {
      if (e2.hadRecentInput) return;
      const t2 = this.o[0], n2 = this.o.at(-1);
      this.i && t2 && n2 && e2.startTime - n2.startTime < 1e3 && e2.startTime - t2.startTime < 5e3 ? (this.i += e2.value, this.o.push(e2)) : (this.i = e2.value, this.o = [e2]), this.t?.(e2);
    }
  };
  var h = (e2, t2, n2 = {}) => {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes(e2)) {
        const i2 = new PerformanceObserver((e3) => {
          queueMicrotask(() => {
            t2(e3.getEntries());
          });
        });
        return i2.observe({ type: e2, buffered: true, ...n2 }), i2;
      }
    } catch {
    }
  };
  var f = (e2) => {
    let t2 = false;
    return () => {
      t2 || (e2(), t2 = true);
    };
  };
  var l = -1;
  var u = /* @__PURE__ */ new Set();
  var m = () => "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
  var g = (e2) => {
    if ("hidden" === document.visibilityState) {
      if ("visibilitychange" === e2.type) for (const e3 of u) e3();
      isFinite(l) || (l = "visibilitychange" === e2.type ? e2.timeStamp : 0, removeEventListener("prerenderingchange", g, true));
    }
  };
  var p = () => {
    if (l < 0) {
      const e2 = o(), n2 = document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").find((t2) => "hidden" === t2.name && t2.startTime >= e2)?.startTime;
      l = n2 ?? m(), addEventListener("visibilitychange", g, true), addEventListener("prerenderingchange", g, true), t(() => {
        setTimeout(() => {
          l = m();
        });
      });
    }
    return { get firstHiddenTime() {
      return l;
    }, onHidden(e2) {
      u.add(e2);
    } };
  };
  var v = (e2) => {
    document.prerendering ? addEventListener("prerenderingchange", e2, true) : e2();
  };
  var y = [1800, 3e3];
  var T = (e2, s2 = {}) => {
    v(() => {
      const c2 = p();
      let a2, d2 = r("FCP");
      const f2 = h("paint", (e3) => {
        for (const t2 of e3) "first-contentful-paint" === t2.name && (f2.disconnect(), t2.startTime < c2.firstHiddenTime && (d2.value = Math.max(t2.startTime - o(), 0), d2.entries.push(t2), a2(true)));
      });
      f2 && (a2 = n(e2, d2, y, s2.reportAllChanges), t((t2) => {
        d2 = r("FCP"), a2 = n(e2, d2, y, s2.reportAllChanges), i(() => {
          d2.value = performance.now() - t2.timeStamp, a2(true);
        });
      }));
    });
  };
  var E = [0.1, 0.25];
  var b = (e2, s2 = {}) => {
    const o2 = p();
    T(f(() => {
      let c2, f2 = r("CLS", 0);
      const l2 = a(s2, d), u2 = (e3) => {
        for (const t2 of e3) l2.h(t2);
        l2.i > f2.value && (f2.value = l2.i, f2.entries = l2.o, c2());
      }, m2 = h("layout-shift", u2);
      m2 && (c2 = n(e2, f2, E, s2.reportAllChanges), o2.onHidden(() => {
        u2(m2.takeRecords()), c2(true);
      }), t(() => {
        l2.i = 0, f2 = r("CLS", 0), c2 = n(e2, f2, E, s2.reportAllChanges), i(c2);
      }), setTimeout(c2));
    }));
  };
  var L = 0;
  var P = 1 / 0;
  var _ = 0;
  var M = (e2) => {
    for (const t2 of e2) t2.interactionId && (P = Math.min(P, t2.interactionId), _ = Math.max(_, t2.interactionId), L = _ ? (_ - P) / 7 + 1 : 0);
  };
  var w;
  var C = () => w ? L : performance.interactionCount ?? 0;
  var I = () => {
    "interactionCount" in performance || w || (w = h("event", M, { durationThreshold: 0 }));
  };
  var F = 0;
  var k = class {
    l = [];
    u = /* @__PURE__ */ new Map();
    m;
    p;
    v() {
      F = C(), this.l.length = 0, this.u.clear();
    }
    T() {
      const e2 = Math.min(this.l.length - 1, Math.floor((C() - F) / 50));
      return this.l[e2];
    }
    h(e2) {
      if (this.m?.(e2), !e2.interactionId && "first-input" !== e2.entryType) return;
      const t2 = this.l.at(-1);
      let n2 = this.u.get(e2.interactionId);
      if (n2 || this.l.length < 10 || e2.duration > t2.L) {
        if (n2 ? e2.duration > n2.L ? (n2.entries = [e2], n2.L = e2.duration) : e2.duration === n2.L && e2.startTime === n2.entries[0].startTime && n2.entries.push(e2) : (n2 = { id: e2.interactionId, entries: [e2], L: e2.duration }, this.u.set(n2.id, n2), this.l.push(n2)), this.l.sort((e3, t3) => t3.L - e3.L), this.l.length > 10) {
          const e3 = this.l.splice(10);
          for (const t3 of e3) this.u.delete(t3.id);
        }
        this.p?.(n2);
      }
    }
  };
  var A = (e2) => {
    const t2 = globalThis.requestIdleCallback || setTimeout, n2 = globalThis.cancelIdleCallback || clearTimeout;
    if ("hidden" === document.visibilityState) e2();
    else {
      const i2 = f(e2);
      let s2 = -1;
      const o2 = () => {
        n2(s2), i2();
      };
      addEventListener("visibilitychange", o2, { once: true, capture: true }), s2 = t2(() => {
        removeEventListener("visibilitychange", o2, { capture: true }), i2();
      });
    }
  };
  var B = [200, 500];
  var S = (e2, i2 = {}) => {
    if (!globalThis.PerformanceEventTiming || !("interactionId" in PerformanceEventTiming.prototype)) return;
    const s2 = p();
    v(() => {
      I();
      let o2, c2 = r("INP");
      const d2 = a(i2, k), f2 = (e3) => {
        A(() => {
          for (const t3 of e3) d2.h(t3);
          const t2 = d2.T();
          t2 && t2.L !== c2.value && (c2.value = t2.L, c2.entries = t2.entries, o2());
        });
      }, l2 = h("event", f2, { durationThreshold: i2.durationThreshold ?? 40 });
      o2 = n(e2, c2, B, i2.reportAllChanges), l2 && (l2.observe({ type: "first-input", buffered: true }), s2.onHidden(() => {
        f2(l2.takeRecords()), o2(true);
      }), t(() => {
        d2.v(), c2 = r("INP"), o2 = n(e2, c2, B, i2.reportAllChanges);
      }));
    });
  };
  var q = class {
    m;
    h(e2) {
      this.m?.(e2);
    }
  };
  var N = [2500, 4e3];
  var x = (e2, s2 = {}) => {
    v(() => {
      const c2 = p();
      let d2, l2 = r("LCP");
      const u2 = a(s2, q), m2 = (e3) => {
        s2.reportAllChanges || (e3 = e3.slice(-1));
        for (const t2 of e3) u2.h(t2), t2.startTime < c2.firstHiddenTime && (l2.value = Math.max(t2.startTime - o(), 0), l2.entries = [t2], d2());
      }, g2 = h("largest-contentful-paint", m2);
      if (g2) {
        d2 = n(e2, l2, N, s2.reportAllChanges);
        const o2 = f(() => {
          m2(g2.takeRecords()), g2.disconnect(), d2(true);
        }), c3 = (e3) => {
          e3.isTrusted && (A(o2), removeEventListener(e3.type, c3, { capture: true }));
        };
        for (const e3 of ["keydown", "click", "visibilitychange"]) addEventListener(e3, c3, { capture: true });
        t((t2) => {
          l2 = r("LCP"), d2 = n(e2, l2, N, s2.reportAllChanges), i(() => {
            l2.value = performance.now() - t2.timeStamp, d2(true);
          });
        });
      }
    });
  };
  var H = [800, 1800];
  var O = (e2) => {
    document.prerendering ? v(() => O(e2)) : "complete" !== document.readyState ? addEventListener("load", () => O(e2), true) : setTimeout(e2);
  };
  var $ = (e2, i2 = {}) => {
    let c2 = r("TTFB"), a2 = n(e2, c2, H, i2.reportAllChanges);
    O(() => {
      const d2 = s();
      d2 && (c2.value = Math.max(d2.responseStart - o(), 0), c2.entries = [d2], a2(true), t(() => {
        c2 = r("TTFB", 0), a2 = n(e2, c2, H, i2.reportAllChanges), a2(true);
      }));
    });
  };

  // src/vitals.ts
  function trackWebVitals(meter) {
    const lcpHistogram = meter.createHistogram("webvitals.lcp", {
      description: "Largest Contentful Paint",
      unit: "ms"
    });
    const clsGauge = meter.createGauge("webvitals.cls", {
      description: "Cumulative Layout Shift",
      unit: "1"
    });
    const fcpHistogram = meter.createHistogram("webvitals.fcp", {
      description: "First Contentful Paint",
      unit: "ms"
    });
    const ttfbHistogram = meter.createHistogram("webvitals.ttfb", {
      description: "Time to First Byte",
      unit: "ms"
    });
    const inpHistogram = meter.createHistogram("webvitals.inp", {
      description: "Interaction to Next Paint",
      unit: "ms"
    });
    x((metric) => {
      lcpHistogram.record(metric.value);
    });
    b((metric) => {
      clsGauge.record(metric.value);
    });
    T((metric) => {
      fcpHistogram.record(metric.value);
    });
    $((metric) => {
      ttfbHistogram.record(metric.value);
    });
    S((metric) => {
      inpHistogram.record(metric.value);
    });
  }

  // src/errors.ts
  function setupErrorTracking(tracerProvider) {
    const tracer = tracerProvider.getTracer("otelverse-web");
    window.addEventListener("error", (event) => {
      const span = tracer.startSpan("window.error", {
        attributes: {
          "error.type": event.type,
          "error.message": event.message,
          "error.filename": event.filename,
          "error.lineno": event.lineno,
          "error.colno": event.colno
        }
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
      span.end();
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
      const span = tracer.startSpan("window.unhandledrejection", {
        attributes: {
          "error.type": "unhandledrejection",
          "error.message": reason
        }
      });
      span.setStatus({ code: SpanStatusCode.ERROR, message: reason });
      span.end();
    });
  }

  // src/init.ts
  var initialized = false;
  function initOtel(config) {
    if (initialized) {
      return { shutdown: async () => {
      } };
    }
    initialized = true;
    const collectorUrl = config?.collectorUrl ?? "http://localhost:4318";
    const serviceName2 = config?.serviceName ?? "web";
    const sessionId = getSessionId();
    const resource = defaultResource().merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName2,
        "session.id": sessionId
      })
    );
    const traceExporter = new OTLPTraceExporter({
      url: `${collectorUrl}/v1/traces`
    });
    const traceProvider = new WebTracerProvider({
      resource,
      spanProcessors: [new BatchSpanProcessor(traceExporter)]
    });
    traceProvider.register();
    const metricExporter = new OTLPMetricExporter({
      url: `${collectorUrl}/v1/metrics`
    });
    const meterProvider = new MeterProvider({
      resource,
      readers: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 5e3
        })
      ]
    });
    metrics.setGlobalMeterProvider(meterProvider);
    registerInstrumentations({
      tracerProvider: traceProvider,
      instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation(),
        new XMLHttpRequestInstrumentation()
      ]
    });
    const meter = meterProvider.getMeter("otelverse-web");
    trackWebVitals(meter);
    setupErrorTracking(traceProvider);
    return {
      shutdown: async () => {
        await traceProvider.shutdown();
        await meterProvider.shutdown();
      }
    };
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=otelverse-web.iife.js.map
