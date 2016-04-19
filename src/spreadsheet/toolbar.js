(function(f, define){
    define([ "../kendo.toolbar", "../kendo.colorpicker", "../kendo.combobox", "../kendo.dropdownlist", "../kendo.popup", "./borderpalette" ], f);
})(function(){

(function(kendo) {
    if (kendo.support.browser.msie && kendo.support.browser.version < 9) {
        return;
    }

    var $ = kendo.jQuery;

    var ToolBar = kendo.ui.ToolBar;

    var MESSAGES = kendo.spreadsheet.messages.toolbar = {
        addColumnLeft: "Add column left",
        addColumnRight: "Add column right",
        addRowAbove: "Add row above",
        addRowBelow: "Add row below",
        alignment: "Alignment",
        alignmentButtons: {
            justtifyLeft: "Align left",
            justifyCenter: "Center",
            justifyRight: "Align right",
            justifyFull: "Justify",
            alignTop: "Align top",
            alignMiddle: "Align middle",
            alignBottom: "Align bottom"
        },
        backgroundColor: "Background",
        bold: "Bold",
        borders: "Borders",
        colorPicker: {
            reset: "Reset color",
            customColor: "Custom color..."
        },
        copy: "Copy",
        cut: "Cut",
        deleteColumn: "Delete column",
        deleteRow: "Delete row",
        filter: "Filter",
        fontFamily: "Font",
        fontSize: "Font size",
        format: "Custom format...",
        formatTypes: {
            automatic: "Automatic",
            number: "Number",
            percent: "Percent",
            financial: "Financial",
            currency: "Currency",
            date: "Date",
            time: "Time",
            dateTime: "Date time",
            duration: "Duration",
            moreFormats: "More formats..."
        },
        formatDecreaseDecimal: "Decrease decimal",
        formatIncreaseDecimal: "Increase decimal",
        freeze: "Freeze panes",
        freezeButtons: {
            freezePanes: "Freeze panes",
            freezeRows: "Freeze rows",
            freezeColumns: "Freeze columns",
            unfreeze: "Unfreeze panes"
        },
        italic: "Italic",
        merge: "Merge cells",
        mergeButtons: {
            mergeCells: "Merge all",
            mergeHorizontally: "Merge horizontally",
            mergeVertically: "Merge vertically",
            unmerge: "Unmerge"
        },
        open: "Open...",
        paste: "Paste",
        quickAccess: {
            redo: "Redo",
            undo: "Undo"
        },
        exportAs: "Export...",
        sortAsc: "Sort ascending",
        sortDesc: "Sort descending",
        sortButtons: {
            sortSheetAsc: "Sort sheet A to Z",
            sortSheetDesc: "Sort sheet Z to A",
            sortRangeAsc: "Sort range A to Z",
            sortRangeDesc: "Sort range Z to A"
        },
        textColor: "Text Color",
        textWrap: "Wrap text",
        underline: "Underline",
        validation: "Data validation...",
        hyperlink: "Link"
    };

    var defaultTools = {
        home: [
            "open",
            "exportAs",
            [ "cut", "copy", "paste" ],
            [ "bold", "italic", "underline" ], "hyperlink",
            "backgroundColor", "textColor",
            "borders",
            "fontSize", "fontFamily",
            "alignment",
            "textWrap",
            [ "formatDecreaseDecimal", "formatIncreaseDecimal" ],
            "format",
            "merge",
            "freeze",
            "filter"
        ],
        insert: [
            [ "addColumnLeft", "addColumnRight", "addRowBelow", "addRowAbove" ],
            [ "deleteColumn", "deleteRow" ]
        ],
        data: [
            "sort",
            "filter",
            "validation"
        ]
    };

    var toolDefaults = {
        //home tab
        open:                  { type: "open",                                     overflow: "never",                          iconClass: "xlsa" },
        exportAs:              { type: "exportAsDialog", dialogName: "exportAs",   overflow: "never",       text: "",        iconClass: "xlsa" },
        bold:                  { type: "button", command: "PropertyChangeCommand", property: "bold",          value: true,     iconClass: "bold", togglable: true },
        italic:                { type: "button", command: "PropertyChangeCommand", property: "italic",        value: true,     iconClass: "italic", togglable: true },
        underline:             { type: "button", command: "PropertyChangeCommand", property: "underline",     value: true,     iconClass: "underline", togglable: true },
        formatDecreaseDecimal: { type: "button", command: "AdjustDecimalsCommand",                            value: -1,       iconClass: "decrease-decimal" },
        formatIncreaseDecimal: { type: "button", command: "AdjustDecimalsCommand",                            value: +1,       iconClass: "increase-decimal" },
        textWrap:              { type: "button", command: "TextWrapCommand",       property: "wrap",          value: true,     iconClass: "text-wrap", togglable: true },
        cut:                   { type: "button", command: "ToolbarCutCommand",                                                 iconClass: "cut" },
        copy:                  { type: "button", command: "ToolbarCopyCommand",                                                iconClass: "copy" },
        paste:                 { type: "button", command: "ToolbarPasteCommand",                                               iconClass: "paste" },
        separator:             { type: "separator" },
        alignment:             { type: "alignment",                           iconClass: "justify-left" },
        backgroundColor:       { type: "colorPicker", property: "background", iconClass: "background" },
        textColor:             { type: "colorPicker", property: "color",      iconClass: "text" },
        fontFamily:            { type: "fontFamily",  property: "fontFamily", iconClass: "text" },
        fontSize:              { type: "fontSize",    property: "fontSize",   iconClass: "font-size" },
        format:                { type: "format",      property: "format",     iconClass: "format-number" },
        filter:                { type: "filter",      property: "hasFilter",  iconClass: "filter" },
        merge:                 { type: "merge",                               iconClass: "merge-cells" },
        freeze:                { type: "freeze",                              iconClass: "freeze-panes" },
        borders:               { type: "borders",                             iconClass: "all-borders" },
        formatCells:           { type: "dialog", dialogName: "formatCells", overflow: "never" },
        hyperlink:             { type: "dialog", dialogName: "hyperlink", iconClass: "hyperlink", overflow: "never", text: "" },

        //insert tab
        addColumnLeft:         { type: "button", command: "AddColumnCommand",    value: "left",  iconClass: "add-column-left"  },
        addColumnRight:        { type: "button", command: "AddColumnCommand",    value: "right", iconClass: "add-column-right" },
        addRowBelow:           { type: "button", command: "AddRowCommand",       value: "below", iconClass: "add-row-below"    },
        addRowAbove:           { type: "button", command: "AddRowCommand",       value: "above", iconClass: "add-row-above"    },
        deleteColumn:          { type: "button", command: "DeleteColumnCommand",                 iconClass: "delete-column"    },
        deleteRow:             { type: "button", command: "DeleteRowCommand",                    iconClass: "delete-row"       },

        //data tab
        sort:                  { type: "sort", iconClass: "sort-desc" },
        validation:            { type: "dialog", dialogName: "validation", iconClass: "exception", overflow: "never" }
    };

    var SpreadsheetToolBar = ToolBar.extend({
        init: function(element, options) {
            options.items = this._expandTools(options.tools || SpreadsheetToolBar.prototype.options.tools[options.toolbarName]);

            ToolBar.fn.init.call(this, element, options);
            var handleClick = this._click.bind(this);

            this.element.addClass("k-spreadsheet-toolbar");

            this._addSeparators(this.element);

            this.bind({
                click: handleClick,
                toggle: handleClick
            });
        },
        _addSeparators: function(element) {
            var groups = element.children(".k-widget, a.k-button, .k-button-group");

            groups.before("<span class='k-separator' />");
        },
        _expandTools: function(tools) {
            function expandTool(toolName) {
                // expand string to object, add missing tool properties
                var options = $.isPlainObject(toolName) ? toolName : toolDefaults[toolName] || {};
                var spriteCssClass = "k-icon k-font-icon k-i-" + options.iconClass;
                var type = options.type;
                var typeDefaults = {
                    splitButton: { spriteCssClass: spriteCssClass },
                    button: {
                        showText: "overflow"
                    },
                    colorPicker: {
                        toolIcon: spriteCssClass
                    }
                };

                var tool = $.extend({
                    name: options.name || toolName,
                    text: MESSAGES[options.name || toolName],
                    spriteCssClass: spriteCssClass,
                    attributes: { title: MESSAGES[options.name || toolName] }
                }, typeDefaults[type], options);

                if (type == "splitButton") {
                    tool.menuButtons = tool.menuButtons.map(expandTool);
                }

                tool.attributes["data-tool"] = toolName;

                if (options.property) {
                    tool.attributes["data-property"] = options.property;
                }

                return tool;
            }

            return tools.reduce(function(tools, tool) {
                if ($.isArray(tool)) {
                    tools.push({ type: "buttonGroup", buttons: tool.map(expandTool) });
                } else {
                    tools.push(expandTool.call(this, tool));
                }

                return tools;
            }, []);
        },
        _click: function(e) {
            var toolName = e.target.attr("data-tool");
            var tool = toolDefaults[toolName] || {};
            var commandType = tool.command;

            if (!commandType) {
                return;
            }

            var args = {
                command: commandType,
                options: {
                    property: tool.property || null,
                    value: tool.value || null
                }
            };

            if (typeof args.options.value === "boolean") {
                args.options.value = e.checked ? true : null;
            }

            this.action(args);
        },
        events: [
            "click",
            "toggle",
            "open",
            "close",
            "overflowOpen",
            "overflowClose",

            "action",
            "dialog"
        ],
        options: {
            name: "SpreadsheetToolBar",
            resizable: true,
            tools: defaultTools
        },
        action: function(args) {
            this.trigger("action", args);
        },
        dialog: function(args) {
            this.trigger("dialog", args);
        },
        refresh: function(activeCell) {
            var range = activeCell;
            var tools = this._tools();

            function setToggle(tool, value) {
                var toolbar = tool.toolbar;
                var overflow = tool.overflow;
                var togglable = (toolbar && toolbar.options.togglable) ||
                                 (overflow && overflow.options.togglable);

                if (!togglable) {
                    return;
                }

                var toggle = false;

                if (typeof value === "boolean") {
                    toggle = value;
                } else if (typeof value === "string") {
                    toggle = toolbar.options.value === value;
                }

                toolbar.toggle(toggle);

                if (overflow) {
                    overflow.toggle(toggle);
                }
            }

            function update(tool, value) {
                var toolbar = tool.toolbar;
                var overflow = tool.overflow;

                if (toolbar && toolbar.update) {
                    toolbar.update(value);
                }

                if (overflow && overflow.update) {
                    overflow.update(value);
                }
            }

            for (var i = 0; i < tools.length; i++) {
                var property = tools[i].property;
                var tool = tools[i].tool;
                var value = kendo.isFunction(range[property]) ? range[property]() : range;

                if (tool.type === "button") {
                    setToggle(tool, value);
                } else {
                    update(tool, value);
                }
            }
        },
        _tools: function() {
            return this.element.find("[data-property]").toArray().reduce(function(tools, element) {
                element = $(element);
                var property = element.attr("data-property");

                tools.push({
                    property: property,
                    tool: this._getItem(element)
                });

                return tools;
            }.bind(this), []);
        },
        destroy: function() {
            // TODO: move to ToolBar.destroy to take care of these
            this.element.find("[data-command],.k-button").each(function() {
                var element = $(this);
                var instance = element.data("instance");
                if (instance && instance.destroy) {
                    instance.destroy();
                }
            });

            ToolBar.fn.destroy.call(this);
        }
    });
    kendo.spreadsheet.ToolBar = SpreadsheetToolBar;

    var DropDownTool = kendo.toolbar.Item.extend({
        init: function(options, toolbar) {
            var dropDownList = $("<select />").kendoDropDownList({
                height: "auto"
            }).data("kendoDropDownList");

            this.dropDownList = dropDownList;
            this.element = dropDownList.wrapper;
            this.options = options;
            this.toolbar = toolbar;

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();

            dropDownList.bind("open", this._open.bind(this));
            dropDownList.bind("change", this._change.bind(this));

            this.element.width(options.width).attr({
                "data-command": "PropertyChangeCommand",
                "data-property": options.property
            });
        },
        _open: function() {
            var ddl = this.dropDownList;
            var list = ddl.list;
            var listWidth;

            list.css({
                whiteSpace: "nowrap",
                width: "auto"
            });

            listWidth = list.width();

            if (listWidth) {
                listWidth += 20;
            } else {
                listWidth = ddl._listWidth;
            }

            list.css("width", listWidth + kendo.support.scrollbar());

            ddl._listWidth = listWidth;
        },
        _change: function(e) {
            var instance = e.sender;
            var value = instance.value();
            var dataItem = instance.dataItem();
            var popupName = dataItem ? dataItem.popup : undefined;

            if (popupName) {
                this.toolbar.dialog({ name: popupName });
            } else {
                this.toolbar.action({
                    command: "PropertyChangeCommand",
                    options: {
                        property: this.options.property,
                        value: value == "null" ? null : value
                    }
                });
            }
        },
        value: function(value) {
            if (value !== undefined) {
                this.dropDownList.value(value);
            } else {
                return this.dropDownList.value();
            }
        }
    });

    var PopupTool = kendo.toolbar.Item.extend({
        init: function(options, toolbar) {
            this.element = $("<a href='#' class='k-button k-button-icon'>" +
                                "<span class='" + options.spriteCssClass + "'>" +
                                "</span><span class='k-icon k-i-arrow-s'></span>" +
                            "</a>");

            this.element
                .on("click", this.open.bind(this))
                .attr("data-command", options.command);

            this.options = options;
            this.toolbar = toolbar;

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();

            this._popup();
        },
        destroy: function() {
            this.popup.destroy();
        },
        open: function() {
            this.popup.toggle();
        },
        _popup: function() {
            var element = this.element;

            this.popup = $("<div class='k-spreadsheet-popup' />").appendTo(element).kendoPopup({
                anchor: element
            }).data("kendoPopup");
        }
    });

    kendo.toolbar.registerComponent("dialog", kendo.toolbar.ToolBarButton.extend({
        init: function(options, toolbar) {
            kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);

            this._dialogName = options.dialogName;

            this.element.bind("click", this.open.bind(this))
                        .data("instance", this);
        },
        open: function() {
            this.toolbar.dialog({ name: this._dialogName });
        }
    }));

    kendo.toolbar.registerComponent("exportAsDialog", kendo.toolbar.Item.extend({
        init: function(options, toolbar) {
            this._dialogName = options.dialogName;

            this.toolbar = toolbar;
            this.element = $("<button class='k-button k-button-icon' title='" + options.attributes.title + "'>" +
                                 "<span class='k-icon k-font-icon k-i-xls' />" +
                             "</button>").data("instance", this);

            this.element.bind("click", this.open.bind(this))
                        .data("instance", this);
        },
        open: function() {
            this.toolbar.dialog({ name: this._dialogName });
        }
    }));

    var OverflowDialogButton = kendo.toolbar.OverflowButton.extend({
        init: function(options, toolbar) {
            kendo.toolbar.OverflowButton.fn.init.call(this, options, toolbar);

            this.element.on("click", this._click.bind(this));

            this.message = this.options.text;

            var instance = this.element.data("button");
            this.element.data(this.options.type, instance);
        },
        _click: $.noop
    });

    var ColorPicker = PopupTool.extend({
        init: function(options, toolbar) {
            PopupTool.fn.init.call(this, options, toolbar);
            this.popup.element.addClass("k-spreadsheet-colorpicker");

            this.colorChooser = new kendo.spreadsheet.ColorChooser(this.popup.element, {
                change: this._colorChange.bind(this)
            });

            this.element.attr({
                "data-property": options.property
            });

            this.element.data({
                type: "colorPicker",
                colorPicker: this,
                instance: this
            });
        },
        destroy: function() {
            this.colorChooser.destroy();
            PopupTool.fn.destroy.call(this);
        },
        update: function(value) {
            this.value(value);
        },
        value: function(value) {
            this.colorChooser.value(value);
        },
        _colorChange: function(e) {
            this.toolbar.action({
                command: "PropertyChangeCommand",
                options: {
                    property: this.options.property,
                    value: e.sender.value()
                }
            });
            this.popup.close();
        }
    });

    var ColorPickerButton = OverflowDialogButton.extend({
        init: function(options, toolbar) {
            options.iconName = "text";
            OverflowDialogButton.fn.init.call(this, options, toolbar);
        },
        _click: function() {
            this.toolbar.dialog({
                name: "colorPicker",
                options: {
                    title: this.options.property, property: this.options.property
                }
            });
        }
    });

    kendo.toolbar.registerComponent("colorPicker", ColorPicker, ColorPickerButton);

    var FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
    var DEFAULT_FONT_SIZE = 12;

    var FontSize = kendo.toolbar.Item.extend({
        init: function(options, toolbar) {
            var comboBox = $("<input />").kendoComboBox({
                change: this._valueChange.bind(this),
                dataSource: options.fontSizes || FONT_SIZES,
                value: DEFAULT_FONT_SIZE
            }).data("kendoComboBox");

            this.comboBox = comboBox;
            this.element = comboBox.wrapper;
            this.options = options;
            this.toolbar = toolbar;

            this.attributes();
            this.addUidAttr();
            this.addOverflowAttr();

            this.element.width(options.width).attr({
                "data-command": "PropertyChangeCommand",
                "data-property": options.property
            });

            this.element.data({
                type: "fontSize",
                fontSize: this
            });
        },

        _valueChange: function(e) {
            this.toolbar.action({
                command: "PropertyChangeCommand",
                options: {
                    property: this.options.property,
                    value: kendo.parseInt(e.sender.value())
                }
            });
        },

        update: function(value) {
            this.value(kendo.parseInt(value) || DEFAULT_FONT_SIZE);
        },

        value: function(value) {
            if (value !== undefined) {
                this.comboBox.value(value);
            } else {
                return this.comboBox.value();
            }
        }
    });

    var FontSizeButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({
                name: "fontSize",
                options: {
                    sizes: FONT_SIZES,
                    defaultSize: DEFAULT_FONT_SIZE
                }
            });
        },
        update: function(value) {
            this._value = value || DEFAULT_FONT_SIZE;
            this.element.find(".k-text").text(this.message + " (" + this._value + ") ...");
        }
    });

    kendo.toolbar.registerComponent("fontSize", FontSize, FontSizeButton);

    var FONT_FAMILIES = ["Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana"];
    var DEFAULT_FONT_FAMILY = "Arial";

    var FontFamily = DropDownTool.extend({
        init: function(options, toolbar) {
            DropDownTool.fn.init.call(this, options, toolbar);

            var ddl = this.dropDownList;
            ddl.setDataSource(options.fontFamilies || FONT_FAMILIES);
            ddl.value(DEFAULT_FONT_FAMILY);

            this.element.data({
                type: "fontFamily",
                fontFamily: this
            });
        },
        update: function(value) {
            this.value(value || DEFAULT_FONT_FAMILY);
        }
    });

    var FontFamilyButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({
                name: "fontFamily",
                options: {
                    fonts: FONT_FAMILIES,
                    defaultFont: DEFAULT_FONT_FAMILY
                }
            });
        },
        update: function(value) {
            this._value = value || DEFAULT_FONT_FAMILY;
            this.element.find(".k-text").text(this.message + " (" + this._value + ") ...");
        }
    });

    kendo.toolbar.registerComponent("fontFamily", FontFamily, FontFamilyButton);

    var defaultFormats = kendo.spreadsheet.formats = {
        automatic: null,
        number: "#,0.00",
        percent: "0.00%",
        financial: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
        currency: "$#,##0.00;[Red]$#,##0.00",
        date: "m/d/yyyy",
        time: "h:mm:ss AM/PM",
        dateTime: "m/d/yyyy h:mm",
        duration: "[h]:mm:ss"
    };

    var Format = DropDownTool.extend({
        _revertTitle: function(e) {
            e.sender.value("");
            e.sender.wrapper.width("auto");
        },
        init: function(options, toolbar) {
            DropDownTool.fn.init.call(this, options, toolbar);

            var ddl = this.dropDownList;
            var icon = "<span class='k-icon k-font-icon k-i-" + options.iconClass + "' style='line-height: 1em; width: 1.35em;'></span>";
            ddl.bind("change", this._revertTitle.bind(this));
            ddl.bind("dataBound", this._revertTitle.bind(this));
            ddl.setOptions({
                dataValueField: "format",
                dataTextField: "name",
                dataValuePrimitive: true,
                valueTemplate: icon,
                template:
                    "# if (data.sample) { #" +
                        "<span class='k-spreadsheet-sample'>#: data.sample #</span>" +
                    "# } #" +
                    "#: data.name #"
            });
            ddl.text(icon);
            ddl.setDataSource([
                { format: defaultFormats.automatic, name: MESSAGES.formatTypes.automatic },
                { format: defaultFormats.number, name: MESSAGES.formatTypes.number , sample: "1,499.99" },
                { format: defaultFormats.percent, name: MESSAGES.formatTypes.percent , sample: "14.50%" },
                { format: defaultFormats.financial, name: MESSAGES.formatTypes.financial , sample: "(1,000.12)" },
                { format: defaultFormats.currency, name: MESSAGES.formatTypes.currency , sample: "$1,499.99" },
                { format: defaultFormats.date, name: MESSAGES.formatTypes.date , sample: "4/21/2012" },
                { format: defaultFormats.time, name: MESSAGES.formatTypes.time , sample: "5:49:00 PM" },
                { format: defaultFormats.dateTime, name: MESSAGES.formatTypes.dateTime , sample: "4/21/2012 5:49:00" },
                { format: defaultFormats.duration, name: MESSAGES.formatTypes.duration , sample: "168:05:00" },
                { popup: "formatCells", name: MESSAGES.formatTypes.moreFormats }
            ]);

            this.element.data({
                type: "format",
                format: this
            });
        }
    });

    var FormatButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "formatCells" });
        }
    });

    kendo.toolbar.registerComponent("format", Format, FormatButton);

    var BorderChangeTool = PopupTool.extend({
        init: function(options, toolbar) {
            PopupTool.fn.init.call(this, options, toolbar);
            this._borderPalette();

            this.element.data({
                type: "borders",
                instance: this
            });
        },
        destroy: function() {
            this.borderPalette.destroy();
            PopupTool.fn.destroy.call(this);
        },
        _borderPalette: function() {
            var element = $("<div />").appendTo(this.popup.element);
            this.borderPalette = new kendo.spreadsheet.BorderPalette(element, {
                change: this._action.bind(this)
            });
        },
        _action: function(e) {
            this.toolbar.action({
                command: "BorderChangeCommand",
                options: {
                    border: e.type,
                    style: { size: 1, color: e.color }
                }
            });
        }
    });

    var BorderChangeButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "borders" });
        }
    });

    kendo.toolbar.registerComponent("borders", BorderChangeTool, BorderChangeButton);

    var AlignmentTool = PopupTool.extend({
        init: function(options, toolbar) {
            PopupTool.fn.init.call(this, options, toolbar);

            this.element.attr({ "data-property": "alignment" });

            this._commandPalette();
            this.popup.element.on("click", ".k-button", function(e) {
                this._action($(e.currentTarget));
            }.bind(this));

            this.element.data({
                type: "alignment",
                alignment: this,
                instance: this
            });
        },
        buttons: [
            { property: "textAlign",     value: "left",    iconClass: "justify-left",   text: MESSAGES.alignmentButtons.justtifyLeft },
            { property: "textAlign",     value: "center",  iconClass: "justify-center", text: MESSAGES.alignmentButtons.justifyCenter },
            { property: "textAlign",     value: "right",   iconClass: "justify-right",  text: MESSAGES.alignmentButtons.justifyRight },
            { property: "textAlign",     value: "justify", iconClass: "justify-full",   text: MESSAGES.alignmentButtons.justifyFull },
            { property: "verticalAlign", value: "top",     iconClass: "align-top",      text: MESSAGES.alignmentButtons.alignTop },
            { property: "verticalAlign", value: "center",  iconClass: "align-middle",   text: MESSAGES.alignmentButtons.alignMiddle },
            { property: "verticalAlign", value: "bottom",  iconClass: "align-bottom",   text: MESSAGES.alignmentButtons.alignBottom }
        ],
        destroy: function() {
            this.popup.element.off();
            PopupTool.fn.destroy.call(this);
        },
        update: function(range) {
            var textAlign = range.textAlign();
            var verticalAlign = range.verticalAlign();

            this.popup.element.find(".k-button").removeClass("k-state-active");

            if (textAlign) {
                this.popup.element.find(".k-button[data-value=" + textAlign + "]").addClass("k-state-active");
            }

            if (verticalAlign) {
                this.popup.element.find(".k-button[data-value=" + verticalAlign + "]").addClass("k-state-active");
            }
        },
        _commandPalette: function() {
            var buttons = this.buttons;
            var element = $("<div />").appendTo(this.popup.element);
            buttons.forEach(function(options, index) {
                var button = "<a title='" + options.text + "' data-property='" + options.property + "' data-value='" + options.value + "' class='k-button k-button-icon'>" +
                                "<span class='k-icon k-font-icon k-i-" + options.iconClass + "'></span>" +
                             "</a>";
                if (index !== 0 && buttons[index - 1].property !== options.property) {
                    element.append($("<span class='k-separator' />"));
                }
                element.append(button);
            });
        },
        _action: function(button) {
            var property = button.attr("data-property");
            var value = button.attr("data-value");

            this.toolbar.action({
                command: "PropertyChangeCommand",
                options: {
                    property: property,
                    value: value
                }
            });
        }
    });

    var AlignmentButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "alignment" });
        }
    });

    kendo.toolbar.registerComponent("alignment", AlignmentTool, AlignmentButton);

    var MergeTool = PopupTool.extend({
        init: function(options, toolbar) {
            PopupTool.fn.init.call(this, options, toolbar);

            this._commandPalette();
            this.popup.element.on("click", ".k-button", function(e) {
                this._action($(e.currentTarget));
            }.bind(this));

            this.element.data({
                type: "merge",
                merge: this,
                instance: this
            });
        },
        buttons: [
            { value: "cells",        iconClass: "merge-cells",        text: MESSAGES.mergeButtons.mergeCells },
            { value: "horizontally", iconClass: "merge-horizontally", text: MESSAGES.mergeButtons.mergeHorizontally },
            { value: "vertically",   iconClass: "merge-vertically",   text: MESSAGES.mergeButtons.mergeVertically },
            { value: "unmerge",      iconClass: "normal-layout",      text: MESSAGES.mergeButtons.unmerge }
        ],
        destroy: function() {
            this.popup.element.off();
            PopupTool.fn.destroy.call(this);
        },
        _commandPalette: function() {
            var element = $("<div />").appendTo(this.popup.element);
            this.buttons.forEach(function(options) {
                var button = "<a title='" + options.text + "' data-value='" + options.value + "' class='k-button k-button-icontext'>" +
                                "<span class='k-icon k-font-icon k-i-" + options.iconClass + "'></span>" + options.text +
                             "</a>";
                element.append(button);
            });
        },
        _action: function(button) {
            var value = button.attr("data-value");

            this.toolbar.action({
                command: "MergeCellCommand",
                options: {
                    value: value
                }
            });
        }
    });

    var MergeButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "merge" });
        }
    });

    kendo.toolbar.registerComponent("merge", MergeTool, MergeButton);

    var FreezeTool = PopupTool.extend({
        init: function(options, toolbar) {
            PopupTool.fn.init.call(this, options, toolbar);

            this._commandPalette();
            this.popup.element.on("click", ".k-button", function(e) {
                this._action($(e.currentTarget));
            }.bind(this));

            this.element.data({
                type: "freeze",
                freeze: this,
                instance: this
            });
        },
        buttons: [
            { value: "panes",    iconClass: "freeze-panes",  text: MESSAGES.freezeButtons.freezePanes },
            { value: "rows",     iconClass: "freeze-row",    text: MESSAGES.freezeButtons.freezeRows },
            { value: "columns",  iconClass: "freeze-col",    text: MESSAGES.freezeButtons.freezeColumns },
            { value: "unfreeze", iconClass: "normal-layout", text: MESSAGES.freezeButtons.unfreeze }
        ],
        destroy: function() {
            this.popup.element.off();
            PopupTool.fn.destroy.call(this);
        },
        _commandPalette: function() {
            var element = $("<div />").appendTo(this.popup.element);
            this.buttons.forEach(function(options) {
                var button = "<a title='" + options.text + "' data-value='" + options.value + "' class='k-button k-button-icontext'>" +
                                "<span class='k-icon k-font-icon k-i-" + options.iconClass + "'></span>" + options.text +
                             "</a>";
                element.append(button);
            });
        },
        _action: function(button) {
            var value = button.attr("data-value");

            this.toolbar.action({
                command: "FreezePanesCommand",
                options: {
                    value: value
                }
            });
        }
    });

    var FreezeButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "freeze" });
        }
    });

    kendo.toolbar.registerComponent("freeze", FreezeTool, FreezeButton);

    var Sort = DropDownTool.extend({
        _revertTitle: function(e) {
            e.sender.value("");
            e.sender.wrapper.width("auto");
        },
        init: function(options, toolbar) {
            DropDownTool.fn.init.call(this, options, toolbar);

            var ddl = this.dropDownList;
            ddl.bind("change", this._revertTitle.bind(this));
            ddl.bind("dataBound", this._revertTitle.bind(this));
            ddl.setOptions({
                valueTemplate: "<span class='k-icon k-font-icon k-i-" + options.iconClass + "' style='line-height: 1em; width: 1.35em;'></span>",
                template: "<span class='k-icon k-font-icon k-i-#= iconClass #' style='line-height: 1em; width: 1.35em;'></span>#=text#",
                dataTextField: "text",
                dataValueField: "value"
            });
            ddl.setDataSource([
                // { value: "asc", sheet: true, asc: true,  text: MESSAGES.sortButtons.sortSheetAsc,  iconClass: "sort-asc" },
                // { value: "desc", sheet: true, asc: false, text: MESSAGES.sortButtons.sortSheetDesc,  , iconClass: "sort-desc" },
                { value: "asc", sheet: false, text: MESSAGES.sortButtons.sortRangeAsc, iconClass: "sort-asc" },
                { value: "desc", sheet: false, text: MESSAGES.sortButtons.sortRangeDesc, iconClass: "sort-desc" }
            ]);
            ddl.select(0);

            this.element.data({
                type: "sort",
                sort: this
            });
        },
        _change: function(e) {
            var instance = e.sender;
            var dataItem = instance.dataItem();

            if (dataItem) {
                this.toolbar.action({
                    command: "SortCommand",
                    options: {
                        value: dataItem.value,
                        sheet: dataItem.sheet
                    }
                });
            }
        },
        value: $.noop
    });

    var SortButton = OverflowDialogButton.extend({
        _click: function() {
            this.toolbar.dialog({ name: "sort" });
        }
    });

    kendo.toolbar.registerComponent("sort", Sort, SortButton);

    var Filter = kendo.toolbar.ToolBarButton.extend({
        init: function(options, toolbar) {
            options.showText = "overflow";
            kendo.toolbar.ToolBarButton.fn.init.call(this, options, toolbar);

            this.element.on("click", this._click.bind(this));

            this.element.data({
                type: "filter",
                filter: this
            });
        },
        _click: function() {
            this.toolbar.action({ command: "FilterCommand" });
        },
        update: function(value) {
            this.toggle(value);
        }
    });

    var FilterButton = OverflowDialogButton.extend({
        init: function(options, toolbar) {
            OverflowDialogButton.fn.init.call(this, options, toolbar);

            this.element.data({
                type: "filter",
                filter: this
            });
        },
        _click: function() {
            this.toolbar.action({ command: "FilterCommand" });
        },
        update: function(value) {
            this.toggle(value);
        }
    });

    kendo.toolbar.registerComponent("filter", Filter, FilterButton);

    var Open = kendo.toolbar.Item.extend({
        init: function(options, toolbar) {
            this.toolbar = toolbar;
            this.element = $("<div class='k-button k-upload-button k-button-icon'>" +
                                 "<span class='k-icon k-font-icon k-i-folder-open' />" +
                             "</div>").data("instance", this);

            this._title = options.attributes.title;
            this._reset();
        },
        _reset: function() {
            this.element.remove("input");

            $("<input type='file' autocomplete='off' accept='.xlsx'/>")
                .attr("title", this._title)
                .one("change", this._change.bind(this))
                .appendTo(this.element);
        },
        _change: function(e) {
            this.toolbar.action({
                command: "OpenCommand",
                options: {
                    file: e.target.files[0]
                }
            });

            this._reset();
        }
    });
    kendo.toolbar.registerComponent("open", Open);

    kendo.spreadsheet.TabStrip = kendo.ui.TabStrip.extend({
        init: function(element, options) {
            kendo.ui.TabStrip.fn.init.call(this, element, options);
            element.addClass("k-spreadsheet-tabstrip");
            this._quickAccessButtons();

            this.quickAccessToolBar.on("click", ".k-button", function(e) {
                var action = $(e.currentTarget).attr("title").toLowerCase();

                this.trigger("action", { action: action });
            }.bind(this));

            this.toolbars = {};

            var tabs = options.dataSource;

            this.contentElements.each(function(idx, element) {
                this._toolbar($(element), tabs[idx].id, options.toolbarOptions[tabs[idx].id]);
            }.bind(this));

            this.one("activate", function() { //force resize of the tabstrip after TabStrip tab is opened
                this.toolbars[this.options.dataSource[0].id].resize();
            });
        },

        events: kendo.ui.TabStrip.fn.events.concat([ "action", "dialog" ]),

        destroy: function() {
            this.quickAccessToolBar.off("click");
            kendo.ui.TabStrip.fn.destroy.call(this);
            for (var name in this.toolbars) {
                this.toolbars[name].destroy();
            }
        },

        action: function(args) {
            this.trigger("action", args);
        },

        dialog: function(args) {
            this.trigger("dialog", args);
        },

        refreshTools: function(range) {
            var toolbars = this.toolbars;
            for (var name in toolbars) {
                if (toolbars.hasOwnProperty(name)) {
                    toolbars[name].refresh(range);
                }
            }
        },

        _quickAccessButtons: function() {
            var buttons = [
                { title: MESSAGES.quickAccess.undo, iconClass: "undo-large", action: "undo" },
                { title: MESSAGES.quickAccess.redo, iconClass: "redo-large", action: "redo" }
            ];
            var buttonTemplate = kendo.template("<a href='\\#' title='#= title #' data-action='#= action #' class='k-button k-button-icon'><span class='k-icon k-font-icon k-i-#=iconClass#'></span></a>");

            this.quickAccessToolBar = $("<div />", {
                "class": "k-spreadsheet-quick-access-toolbar",
                "html": kendo.render(buttonTemplate, buttons)
            }).insertBefore(this.wrapper);

            this.quickAccessToolBar.on("click", ".k-button", function(e) {
                e.preventDefault();

                var action = $(e.currentTarget).attr("title").toLowerCase();
                this.action({ action: action });
            }.bind(this));

            this.quickAccessAdjust();
        },

        quickAccessAdjust: function() {
            this.tabGroup.css("padding-left", this.quickAccessToolBar.outerWidth());
        },

        _toolbar: function(container, name, tools) {
            var element;
            var options;

            if (this.toolbars[name]) {
                this.toolbars[name].destroy();
                container.children(".k-toolbar").remove();
            }

            if (tools) {
                element = container.html("<div />").children("div");

                options = {
                    tools: typeof tools === "boolean" ? undefined : tools,
                    toolbarName: name,
                    action: this.action.bind(this),
                    dialog: this.dialog.bind(this)
                };

                this.toolbars[name] = new kendo.spreadsheet.ToolBar(element, options);
            }
        }

    });

})(window.kendo);

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });