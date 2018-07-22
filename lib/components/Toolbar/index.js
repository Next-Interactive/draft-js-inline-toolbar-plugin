"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _draftJs = require("draft-js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable react/no-array-index-key */


var getRelativeParent = function getRelativeParent(element) {
  if (!element) {
    return null;
  }

  var position = window.getComputedStyle(element).getPropertyValue("position");
  if (position !== "static") {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

var getMargin = function getMargin(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "left";

  var elementStyles = window.getComputedStyle ? getComputedStyle(element, null) : element.currentStyle;
  return parseInt(elementStyles["margin" + ("" + side.charAt(0).toUpperCase() + side.slice(1))], 10);
};

var Toolbar = function (_React$Component) {
  _inherits(Toolbar, _React$Component);

  function Toolbar() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Toolbar);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isVisible: false,
      position: undefined,
      /**
       * If this is set, the toolbar will render this instead of the regular
       * structure and will also be shown when the editor loses focus.
       * @type {Component}
       */
      overrideContent: undefined,
      /**
       * We are holding default toolbar width to prevent geometry changing, that
       * happens very often
       */
      width: null,
      /**
       * pointerClassName internals here. It could look like: "{ left: 1px; }"
       * @type {string}
       */
      pointerCSS: null
    }, _this.onOverrideContent = function (overrideContent) {
      _this.setState({ overrideContent: overrideContent });
    }, _this.onSelectionChanged = function () {
      // need to wait a tick for window.getSelection() to be accurate
      // when focusing editor with already present selection
      setTimeout(function () {
        if (!_this.toolbar) return;

        if (typeof _this.state.width !== "number") {
          _this.setState({ width: _this.toolbar.offsetWidth });
        }

        var alignment = null;
        var horizontalOffset = 0;

        // boundings of the selected text
        var selectionRect = (0, _draftJs.getVisibleSelectionRect)(window);
        var selection = _this.props.store.getItem("getEditorState")().getSelection();
        if (selection.isCollapsed()) return;

        var relativeParent = getRelativeParent(_this.toolbar.parentElement);
        var relativeRect = (relativeParent || document.body).getBoundingClientRect();
        var windowWidth = relativeParent ? relativeRect.right : document.documentElement.clientWidth;
        // we should take into account a case when we don't have relative parent,
        // but our body has a margin
        var bodyMargin = relativeParent ? 0 : getMargin(document.body);

        var toolbarHalfWidth = _this.toolbar.offsetWidth / 2;
        // calculating the middle of the text selection
        var fromBeginningToMiddle = selectionRect.left + selectionRect.width / 2 - (relativeParent ? relativeRect.left : 0);
        // the same but against editor right side
        var beforeWindowEnd = windowWidth - fromBeginningToMiddle - (relativeParent ? relativeRect.left : 0);
        var leftToolbarMargin = getMargin(_this.toolbar);
        var rightToolbarMargin = getMargin(_this.toolbar, "right");

        // the selection is closer to parent beginning than half of the toolbar
        // +-----------------------------------------------+
        // |          vv toolbar                           |
        // | +------------------+                          |
        // | +------------------+                          |
        // |                                               |
        // |  +--+                                         |
        // |   ^^ selection                                |
        // +-----------------------------------------------+
        if (fromBeginningToMiddle < toolbarHalfWidth + 2 * leftToolbarMargin) {
          // shift computations are different for relative editor and body
          var leftShift = relativeParent ? relativeRect.left : 0;
          horizontalOffset = toolbarHalfWidth - leftShift + leftToolbarMargin + (relativeParent ? relativeRect.left : 0);
          alignment = "left";
        } else if (beforeWindowEnd < toolbarHalfWidth * 2 + 2 * rightToolbarMargin) {
          // the same, but relative to the parent end
          // +-----------------------------------------------+
          // |                                 vvv toolbar   |
          // |                            +---------------+  |
          // |                            +---------------+  |
          // |                                               |
          // |                                      +--+     |
          // |                             selection ^^      |
          // |                                               |
          // +-----------------------------------------------+
          // shift computations are different for relative editor and body
          var rightShift = relativeParent ? windowWidth - relativeRect.right : 0;
          horizontalOffset = -toolbarHalfWidth - rightShift + rightToolbarMargin;
          alignment = "right";
        } else {
          // selection somewhere in the middle within the parent and there is a
          // free place for toolbar
          horizontalOffset = selectionRect.left - relativeRect.left + (selectionRect.width / 2 + bodyMargin - leftToolbarMargin);
        }

        var position = _defineProperty({
          top: selectionRect.top - relativeRect.top - _this.toolbar.offsetHeight - 5
        }, alignment || "left", horizontalOffset);
        _this.setState({
          position: position,
          pointerCSS: _this.calculatePointerPosition(alignment, selectionRect, fromBeginningToMiddle, windowWidth)
        });
      });
    }, _this.calculatePointerPosition = function (alignment, selectionRect, fromBeginningToMiddle, windowWidth) {
      if (typeof alignment === "string") {
        if (alignment === "left") {
          return "{ left: " + (fromBeginningToMiddle - 2 * getMargin(_this.toolbar)) + "px; }";
        }

        return "{ left: " + (_this.toolbar.offsetWidth - (windowWidth - (selectionRect.right - selectionRect.width / 2) - 2 * getMargin(_this.toolbar, "right"))) + "px; }";
      }

      return null;
    }, _this.handleToolbarRef = function (node) {
      _this.toolbar = node;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Toolbar, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.store.subscribeToItem("selection", this.onSelectionChanged);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.props.store.unsubscribeFromItem("selection", this.onSelectionChanged);
    }

    /**
     * This can be called by a child in order to render custom content instead
     * of the regular structure. It's the responsibility of the callee to call
     * this function again with `undefined` in order to reset `overrideContent`.
     * @param {Component} overrideContent
     */

  }, {
    key: "getStyle",
    value: function getStyle() {
      var store = this.props.store;
      var _state = this.state,
          overrideContent = _state.overrideContent,
          position = _state.position;

      var selection = store.getItem("getEditorState")().getSelection();
      // overrideContent could for example contain a text input, hence we always show overrideContent
      // TODO: Test readonly mode and possibly set isVisible to false if the editor is readonly
      var isVisible = !selection.isCollapsed() && selection.getHasFocus() || overrideContent;
      var style = _extends({}, position);

      if (isVisible) {
        style.visibility = "visible";
        style.transform = "translate(-50%) scale(1)";
        style.transition = "transform 0.15s cubic-bezier(.3,1.2,.2,1)";
        // toolbar width must forcibly overwritten to prevent unexpected geometry
        // changes
        style.width = this.state.width;
      } else {
        style.transform = "translate(-50%) scale(0)";
        style.visibility = "hidden";
      }

      return style;
    }

    /**
     * calculate toolbar pointer (css arrow) position
     * @param alignment
     * @param selectionRect
     * @param fromBeginningToMiddle
     * @param windowWidth
     * @returns {string|number}
     */

  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          theme = _props.theme,
          store = _props.store,
          structure = _props.structure;
      var _state2 = this.state,
          OverrideContent = _state2.overrideContent,
          pointerCSS = _state2.pointerCSS;

      var childrenProps = {
        theme: theme.buttonStyles,
        getEditorState: store.getItem("getEditorState"),
        setEditorState: store.getItem("setEditorState"),
        onOverrideContent: this.onOverrideContent
      };

      return _react2.default.createElement(
        "div",
        {
          className: theme.toolbarStyles.toolbar,
          style: this.getStyle(),
          ref: this.handleToolbarRef
        },
        typeof pointerCSS === "string" && _react2.default.createElement(
          "style",
          null,
          "." + theme.toolbarStyles.toolbar + "::before, ." + theme.toolbarStyles.toolbar + "::after" + pointerCSS + ";"
        ),
        OverrideContent ? _react2.default.createElement(OverrideContent, childrenProps) : structure.map(function (Component, index) {
          return _react2.default.createElement(Component, _extends({ key: index }, childrenProps));
        })
      );
    }
  }]);

  return Toolbar;
}(_react2.default.Component);

exports.default = Toolbar;