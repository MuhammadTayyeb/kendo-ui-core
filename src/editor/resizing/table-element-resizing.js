(function(f, define) {
    define(["../main", "../../kendo.resizable", "./resizing-utils"], f);
})(function() {

(function(kendo, undefined) {
    var $ = kendo.jQuery;
    var extend = $.extend;
    var noop = $.noop;
    var proxy = $.proxy;

    var Editor = kendo.ui.editor;
    var Class = kendo.Class;
    var ResizingUtils = Editor.ResizingUtils;
    var setContentEditable = ResizingUtils.setContentEditable;

    var MOUSE_DOWN = "mousedown";
    var MOUSE_ENTER = "mouseenter";
    var MOUSE_LEAVE = "mouseleave";
    var MOUSE_MOVE = "mousemove";
    var MOUSE_UP = "mouseup";

    var COMMA = ",";
    var DOT = ".";
    var LAST_CHILD = ":last-child";
    var OUTER = "outer";
    var SCROLL = "scroll";

    var TABLE = "table";

    var TRUE = "true";
    var FALSE = "false";

    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
    }

    var TableElementResizing = Class.extend({
        init: function(element, options) {
            var that = this;

            that.options = extend({}, that.options, options);

            that.options.tags = $.isArray(that.options.tags) ? that.options.tags : [that.options.tags];

            if ($(element).is(TABLE)) {
                that.element = element;
                $(element).on(MOUSE_MOVE + that.options.eventNamespace, that.options.tags.join(COMMA), proxy(that.detectElementBorderHovering, that));
            }
        },
        
        destroy: function() {
            var that = this;

            if (that.element) {
                $(that.element).off(that.options.eventNamespace);
                that.element = null;
            }

            that._destroyResizeHandle();
        },

        options: {
            tags: [],
            min: 0,
            rootElement: null,
            eventNamespace: "",
            rtl: false,
            handle: {
                axis: "",
                dataAttribute: "",
                resizeDimension: "",
                offset: "",
                scrollOffset: "",
                eventCoordinate: "",
                height: 0,
                classNames: {},
                template: ""
            }
        },

        resizingInProgress: function() {
            var that = this;
            var resizable = that._resizable;

            if (resizable) {
                return !!resizable.resizing;
            }

            return false;
        },

        resize: noop,

        detectElementBorderHovering: function(e) {
            var that = this;
            var options = that.options;
            var handleOptions = options.handle;
            var tableElement = $(e.currentTarget);
            var resizeHandle = that.resizeHandle;
            var rootElement = options.rootElement;
            var dataAttribute = handleOptions.dataAttribute;

            if (!that.resizingInProgress()) {
                if (!tableElement.is(LAST_CHILD) && that.elementBorderHovered(tableElement, e)) {
                    setContentEditable(rootElement, FALSE);

                    if (resizeHandle) {
                        if (resizeHandle.data(dataAttribute) && resizeHandle.data(dataAttribute) !== tableElement[0]) {
                            that.showResizeHandle(tableElement);
                        }
                    }
                    else {
                        that.showResizeHandle(tableElement);
                    }
                }
                else {
                    if (resizeHandle) {
                        setContentEditable(rootElement, TRUE);
                        that._destroyResizeHandle();
                    }
                }
            }
        },

        elementBorderHovered: function(tableElement, e) {
            var that = this;
            var handleOptions = that.options.handle;
            var handleDimension = handleOptions[handleOptions.resizeDimension];
            var bordertOffset = tableElement.offset()[handleOptions.offset] + tableElement[OUTER + capitalize(handleOptions.resizeDimension)]();
            var mousePosition = e[handleOptions.eventCoordinate] + $(tableElement[0].ownerDocument)[SCROLL + capitalize(handleOptions.scrollOffset)]();

            if ((mousePosition > (bordertOffset - handleDimension)) && (mousePosition < (bordertOffset + handleDimension))) {
                return true;
            }
            else {
                return false;
            }
        },

        showResizeHandle: function(tableElement) {
            var that = this;

            that._initResizeHandle(tableElement);
            that._initResizable(tableElement);
            that.resizeHandle.show();
        },

        _initResizeHandle: function(tableElement) {
            var that = this;
            var options = that.options;

            that._destroyResizeHandle();

            that.resizeHandle = $(options.handle.template).appendTo(options.rootElement);

            that.setResizeHandlePosition(tableElement);
            that.setResizeHandleDimensions();
            that.setResizeHandleDataAttributes(tableElement[0]);
            that.attachResizeHandleEventHandlers();
            that._hideResizeMarker();
        },

        setResizeHandlePosition: noop,

        setResizeHandleDimensions: noop,

        setResizeHandleDataAttributes: function(tableElement) {
            var that = this;

            that.resizeHandle.data(that.options.handle.dataAttribute, tableElement);
        },

        attachResizeHandleEventHandlers: function() {
            var that = this;
            var options = that.options;
            var eventNamespace = options.eventNamespace;
            var markerClass = options.handle.classNames.marker;
            var resizeHandle = that.resizeHandle;

            that.resizeHandle
                .on(MOUSE_DOWN + eventNamespace, function() {
                    resizeHandle.find(DOT + markerClass).show();
                })
                .on(MOUSE_UP + eventNamespace, function() {
                    resizeHandle.find(DOT + markerClass).hide();
                });
        },

        _hideResizeMarker: function() {
            var that = this;
        
            that.resizeHandle.find(DOT + that.options.handle.classNames.marker).hide();
        },

        _destroyResizeHandle: function() {
            var that = this;

            if (that.resizeHandle) {
                that._destroyResizable();
                that.resizeHandle.off(that.options.eventNamespace).remove();
                that.resizeHandle = null;
            }
        },

        _initResizable: function(tableElement) {
            var that = this;

            if (!that.resizeHandle) {
                return;
            }

            that._destroyResizable();

            that._resizable = new kendo.ui.Resizable(tableElement, {
                draggableElement: that.resizeHandle[0],
                resize: proxy(that.onResize, that),
                resizeend: proxy(that.onResizeEnd, that)
            });
        },

        _destroyResizable: function() {
            var that = this;

            if (that._resizable) {
                that._resizable.destroy();
                that._resizable = null;
            }
        },

        onResize: function(e) {
            var that = this;

            that.draggingInProgress = true;
            that.setResizeHandleDragPosition(e);
        },

        setResizeHandleDragPosition: noop,

        onResizeEnd: function(e) {
            var that = this;

            that.resize(e);
            that._destroyResizeHandle();
            setContentEditable(that.options.rootElement, TRUE);
            that.draggingInProgress = false;
        }
    });

    var ResizingFactory = Class.extend({
        init: function() {
        },

        create: function(editor, options) {
            var that = this;
            var resizingName = options.name;
            var NS = options.eventNamespace;

            $(editor.body)
                .on(MOUSE_ENTER + NS, TABLE, function(e) {
                    var table = e.currentTarget;
                    var resizing =  editor[resizingName];

                    e.stopPropagation();

                    if (resizing) {
                        if (resizing.element !== table && !resizing.resizingInProgress()) {
                            that._destroyResizing(editor, options);
                            that._initResizing(editor, table, options);
                        }
                    }
                    else {
                        that._initResizing(editor, table, options);
                    }
                })
                .on(MOUSE_LEAVE + NS, TABLE, function(e) {
                    var parentTable;
                    var resizing = editor[resizingName];

                    e.stopPropagation();

                    if (resizing && !resizing.resizingInProgress()) {
                        parentTable = $(resizing.element).parents(TABLE)[0];

                        if (parentTable && !$.contains(resizing.element, e.target)) {
                            that._destroyResizing(editor, options);
                            that._initResizing(editor, parentTable, options);
                        }
                    }
                })
                .on(MOUSE_LEAVE + NS, function() {
                    var resizing = editor[resizingName];

                    if (resizing && !resizing.resizingInProgress()) {
                        that._destroyResizing(editor, options);
                    }
                });
        },

        _initResizing: function(editor, tableElement, options) {
            var resizingName = options.name;
            var resizingType = options.type;

            editor[resizingName] = new resizingType(tableElement, {
                rtl: kendo.support.isRtl(editor.element),
                rootElement: editor.body
            });
        },

        _destroyResizing: function(editor, options) {
            var resizingName = options.name;

            if (editor[resizingName]) {
                editor[resizingName].destroy();
                editor[resizingName] = null;
            }
        }
    });
    ResizingFactory.current = new ResizingFactory();

    TableElementResizing.initResizing = function(editor, options) {
        return ResizingFactory.current.create(editor, options);
    };

    extend(Editor, {
        TableElementResizing: TableElementResizing
    });

})(window.kendo);

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
