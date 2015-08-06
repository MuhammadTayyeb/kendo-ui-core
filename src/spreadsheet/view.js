(function(f, define){
    define([ "../kendo.core" ], f);
})(function(){

(function(kendo) {
    var CellRef = kendo.spreadsheet.CellRef;
    var RangeRef = kendo.spreadsheet.RangeRef;

    function hasChanged(e, name) {
           return !e || e.changed == name;
    }

    function selectElementContents(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    var HtmlTable = kendo.Class.extend({
        init: function(rowHeight, columnWidth) {
            this.rowHeight = rowHeight;
            this.columnWidth = columnWidth;
            this.cols = [];
            this.trs = [];
            this._height = 0;
            this._width = 0;
        },

        addColumn: function(width) {
            this._width += width;

            var col = kendo.dom.element("col", { style: { width: width + "px" } });

            col.visible = width > 0;

            this.cols.push(col);
        },

        addRow: function(height) {
            var attr = null;

            attr = { style: { height: height + "px" } };

            this._height += height;

            var tr = kendo.dom.element("tr", attr);

            tr.visible = height > 0;

            this.trs.push(tr);
        },

        addCell: function(rowIndex, text, style, className) {
            if (!text) {
                text = "";
            }

            var td = kendo.dom.element("td", { style: style, className: className }, [ kendo.dom.text(text) ]);
            this.trs[rowIndex].children.push(td);
            return td;
        },

        toDomTree: function(x, y, className) {
            this.trs = this.trs.filter(function(tr) {
                return tr.visible;
            });

            this.cols = this.cols.filter(function(col, ci) {
                if (!col.visible) {
                    this.trs.forEach(function(tr) {
                        tr.children.splice(ci, 1);
                    });
                }

                return col.visible;
            }, this);

            return kendo.dom.element("table", { style: { left: x + "px", top: y + "px", height: this._height + "px", width: this._width + "px" }, className: className },
                [
                    kendo.dom.element("colgroup", null, this.cols),
                    kendo.dom.element("tbody", null, this.trs)
                ]);
        }
    });

    var VIEW_CONTENTS = '<div class=k-spreadsheet-fixed-container></div><div class=k-spreadsheet-scroller><div class=k-spreadsheet-view-size></div></div><div tabindex="0" class="k-spreadsheet-clipboard" contenteditable=true></div><div class="k-spreadsheet-cell-editor"></div>';

    function within(value, min, max) {
        return value >= min && value <= max;
    }

    var View = kendo.Class.extend({
        init: function(element, options) {
            this.element = element;
            this.options = options;

            var viewElement = this._viewElement();

            this._chrome();

            viewElement.append(VIEW_CONTENTS);

            this.container = viewElement.find(".k-spreadsheet-fixed-container")[0];
            this.scroller = viewElement.find(".k-spreadsheet-scroller")[0];
            this.clipboard = viewElement.find(".k-spreadsheet-clipboard");
            this.editor = viewElement.find(".k-spreadsheet-editor");

            this.viewSize = $(this.scroller.firstChild);
            this._formulaInput(element);

            this.tree = new kendo.dom.Tree(this.container);
            this.eventHandler = new kendo.spreadsheet.ViewEventHandler(this);

            var scrollbar = kendo.support.scrollbar();

            $(this.container).css({
                width: viewElement[0].clientWidth - scrollbar,
                height: viewElement[0].clientHeight - scrollbar
            });
        },

        _resize: function() {
            var toolbarHeight = this.toolbar ? this.toolbar.element.outerHeight() : 0;
            var formulaBarHeight = this.formulaBar ? this.formulaBar.element.outerHeight() : 0;

            this._viewElement().height(this.element.height() - toolbarHeight - formulaBarHeight);
        },

        _viewElement: function() {
            var view = this.element.children(".k-spreadsheet-view");

            if (!view.length) {
                view = $("<div class='k-spreadsheet-view' />").appendTo(this.element);
            }

            return view;
        },

        _chrome: function() {
            var formulaBar = $("<div />").prependTo(this.element);
            this.formulaBar = new kendo.spreadsheet.FormulaBar(formulaBar, {
                change: function(e) {
                    this._workbook.execute(new kendo.spreadsheet.EditCommand({
                        value: e.value
                    }));
                }.bind(this)
            });

            this._toolbar();
        },

        _toolbar: function() {
            var element;

            function apply(options) {
                var className = options.text[0].toLowerCase() + options.text.substr(1);
                return {
                    spriteCssClass: "k-icon k-i-" + className,
                    attributes: {
                        "data-command": "PropertyChangeCommand",
                        "data-property": options.property,
                        "data-value": options.value
                    },
                    text: options.text,
                    showText: "overflow"
                };
            }

            function toggle(options) {
                var button = apply(options);
                button.toggleable = true;
                return button;
            }

            if (this.toolbar) {
                this.toolbar.destroy();
                this.element.children(".k-toolbar").remove();
            }

            if (this.options.toolbar) {
                element = $("<div />").prependTo(this.element);
                this.toolbar = new kendo.spreadsheet.ToolBar(element, {
                    execute: function(e) {
                        this._workbook.execute(new kendo.spreadsheet[e.commandType](e));
                    }.bind(this),
                    resizable: false,
                    items: [
                        { type: "formatPopup", text: "Format..." },
                        { type: "buttonGroup", buttons: [
                            toggle({ text: "Bold", property: "bold", value: true }),
                            toggle({ text: "Italic", property: "italic", value: true }),
                            toggle({ text: "Underline", property: "underline", value: true })
                        ] },
                        { type: "buttonGroup", buttons: [
                            toggle({ text: "Justify-left", property: "textAlign", value: "left" }),
                            toggle({ text: "Justify-center", property: "textAlign", value: "center" }),
                            toggle({ text: "Justify-right", property: "textAlign", value: "right" })
                        ] },
                        { type: "buttonGroup", buttons: [
                            toggle({ text: "Align-top", property: "verticalAlign", value: "top" }),
                            toggle({ text: "Align-middle", property: "verticalAlign", value: "middle" }),
                            toggle({ text: "Align-bottom", property: "verticalAlign", value: "bottom" })
                        ] },
                        { type: "buttonGroup", buttons: [
                            apply({ text: "Currency", property: "format", value: "$?" }),
                            apply({ text: "Percentage", property: "format", value: "?.00%" })
                        ] },
                        { type: "format", property: "format", width: 100, overflow: "never" },
                        { type: "borders", overflow: "never" },
                        { type: "fontFamily", property: "fontFamily", width: 130, overflow: "never" },
                        { type: "fontSize", property: "fontSize", width: 60, overflow: "never" },
                        { type: "colorPicker", property: "background", toolIcon: "k-backColor", overflow: "never" },
                        { type: "colorPicker", property: "color", toolIcon: "k-foreColor", overflow: "never" }
                    ]
                });

                this.toolbar.bindTo(this);
            }
        },

        workbook: function(workbook) {
            this._workbook = workbook;

            this.sheet(workbook.activeSheet());

            workbook.bind("change", (function(e) {
                this.formulaBar.value(this._workbook._editableValueForRef(e.sender.activeSheet().activeCell()));

                this.toolbar.refresh();
            }).bind(this));
        },

        sheet: function(sheet) {
            this._sheet = sheet;
            this.eventHandler.sheet(sheet);
            this.refresh(kendo.spreadsheet.ALL_REASONS);
        },

        objectAt: function(x, y) {
            var grid = this._sheet._grid;

            var object, pane;

            if (x < 0 || y < 0 || x > this.scroller.clientWidth || y > this.scroller.clientHeight) {
                object = { type: "outside" };
            } else if (x < grid._headerWidth && y < grid._headerHeight) {
                object = { type: "topcorner" };
            } else {
                pane = this.paneAt(x, y);

                var row = pane._grid.rows.index(y, this.scroller.scrollTop);
                var column = pane._grid.columns.index(x, this.scroller.scrollLeft);

                if (x < grid._headerWidth) {
                    object = { type: "rowheader", ref: new CellRef(row, -Infinity) };
                } else if (y < grid._headerHeight) {
                    object = { type: "columnheader", ref: new CellRef(-Infinity, column) };
                } else {
                    object = { type: "cell", ref: new CellRef(row, column) };
                }
            }

            object.pane = pane;
            object.x = x;
            object.y = y;
            return object;
        },

        paneAt: function(x, y) {
            return this.panes.filter(function paneLocationWithin(pane) {
                var grid = pane._grid;
                return within(y, grid.top, grid.bottom) && within(x, grid.left, grid.right);
            })[0];
        },

        containingPane: function(cell) {
            return this.panes.filter(function(pane) {
                if (pane._grid.contains(cell)) {
                    return true;
                }
                return false;
            })[0];
        },

        cellRectangle: function(cell) {
            var theGrid = this.containingPane(cell)._grid;
            var rectangle = this._sheet._grid.rectangle(cell);

            return rectangle.offset(
                theGrid.headerWidth - this.scroller.scrollLeft,
                theGrid.headerHeight - this.scroller.scrollTop
            );
        },

        refresh: function(reason) {
            var sheet = this._sheet;
            this.eventHandler.refresh();
            this.viewSize[0].style.height = sheet._grid.totalHeight() + "px";
            this.viewSize[0].style.width = sheet._grid.totalWidth() + "px";

            if (reason.layout) {
                var frozenColumns = sheet.frozenColumns();
                var frozenRows = sheet.frozenRows();

                // main or bottom or right pane
                this.panes = [ this._pane(frozenRows, frozenColumns) ];

                // left pane
                if (frozenColumns > 0) {
                    this.panes.push(this._pane(frozenRows, 0, null, frozenColumns));
                }

                // top pane
                if (frozenRows > 0) {
                    this.panes.push(this._pane(0, frozenColumns, frozenRows, null));
                }

                // left-top "fixed" pane
                if (frozenRows > 0 && frozenColumns > 0) {
                    this.panes.push(this._pane(0, 0, frozenRows, frozenColumns));
                }
            }

            if (reason.selection) {
                // TODO: uncomment this, it breaks the union
                var text = sheet.selection().values().map(function(row) {
                    return row.join("\t");
                }).join("\r\n");


                this.clipboard.html(text);
                var that = this;
                this.selectClipBoardContents();
            }

            if (reason.activeCell) {
                this._focus = sheet.activeCell().toRangeRef();
            }
        },

        selectClipBoardContents: function() {
            selectElementContents(this.clipboard[0]);
            this.clipboard.focus();
        },

        scrollIntoView: function(cell) {
            var willScroll = false;
            var theGrid = this.containingPane(cell)._grid;

            var boundaries = theGrid.scrollBoundaries(cell);

            var scroller = this.scroller;
            var scrollTop = theGrid.rows.frozen ? 0 : scroller.scrollTop;
            var scrollLeft = theGrid.columns.frozen ? 0 : scroller.scrollLeft;

            if (boundaries.top < scrollTop) {
                willScroll = true;
                scroller.scrollTop = boundaries.scrollTop;
            }

            if (boundaries.bottom > scrollTop) {
                willScroll = true;
                scroller.scrollTop = boundaries.scrollBottom;
            }

            if (boundaries.left < scrollLeft) {
                willScroll = true;
                scroller.scrollLeft = boundaries.scrollLeft;
            }

            if (boundaries.right > scrollLeft) {
                willScroll = true;
                scroller.scrollLeft = boundaries.scrollRight;
            }

            return willScroll;
        },

        render: function() {
            var sheet = this._sheet;
            var focus = sheet.focus();

            if (focus && this.scrollIntoView(focus)) {
                return;
            }

            var grid = sheet._grid;

            var scrollTop = this.scroller.scrollTop;
            var scrollLeft = this.scroller.scrollLeft;

            if (scrollTop < 0) {
                scrollTop = 0;
            }

            if (scrollLeft < 0) {
                scrollLeft = 0;
            }

            var result = this.panes.map(function(pane) {
                return pane.render(scrollLeft, scrollTop);
            }, this);

            var merged = [];
            merged = Array.prototype.concat.apply(merged, result);

            var topCorner = kendo.dom.element("div", { style: { width: grid._headerWidth + "px", height: grid._headerHeight + "px" }, className: "k-spreadsheet-top-corner" });
            merged.push(topCorner);

            this.tree.render(merged);
        },

        _formulaInput: function(element) {
            var editor = element.find(".k-spreadsheet-cell-editor");

            this.formulaInput = new kendo.spreadsheet.FormulaInput(editor, {
                position: "absolute",
                change: (function(e) {
                    this._workbook.execute(new kendo.spreadsheet.EditCommand({
                        value: e.value
                    }));
                }).bind(this)
            });
        },

        _pane: function(row, column, rowCount, columnCount) {
            var pane = new Pane(this._sheet, this._sheet._grid.pane({ row: row, column: column, rowCount: rowCount, columnCount: columnCount }));
            pane.refresh(this.scroller.clientWidth, this.scroller.clientHeight);
            return pane;
        }
    });

    function orientedClass(defaultClass, left, top, right, bottom) {
        var classes = [defaultClass];

        if (top) {
            classes.push("k-top");
        }

        if (right) {
            classes.push("k-right");
        }

        if (bottom) {
            classes.push("k-bottom");
        }

        if (left) {
            classes.push("k-left");
        }

        return classes.join(" ");
    }

    var Pane = kendo.Class.extend({
        init: function(sheet, grid) {
            this._sheet = sheet;
            this._grid = grid;
        },

        refresh: function(width, height) {
            this._grid.refresh(width, height);
        },

        isVisible: function(scrollLeft, scrollTop, ref) {
            return this._grid.view(scrollLeft, scrollTop).ref.intersects(ref);
        },

        render: function(scrollLeft, scrollTop) {
            var sheet = this._sheet;
            var grid = this._grid;

            var view = grid.view(scrollLeft, scrollTop);
            this._currentView = view;
            this._selectedHeaders = sheet.selectedHeaders();

            var children = [];

            children.push(this.renderData());

            children.push(this.renderMergedCells());

            children.push(this.renderSelection());

            var selectedHeaders = sheet.selectedHeaders();

            if (grid.hasRowHeader) {
                var rowHeader = new HtmlTable(this.rowHeight, grid.headerWidth);
                rowHeader.addColumn(grid.headerWidth);

                view.rows.values.forEach(function(height) {
                    rowHeader.addRow(height);
                });

                sheet.forEach(view.ref.leftColumn(), function(row, col, cell) {
                    var text = row + 1;
                    rowHeader.addCell(row - view.ref.topLeft.row, text, {}, this.headerClassName(row, "row"));
                }.bind(this));

                children.push(rowHeader.toDomTree(0, view.rowOffset, "k-spreadsheet-row-header"));
            }

            if (grid.hasColumnHeader) {
                var columnHeader = new HtmlTable(grid.headerHeight, this.columnWidth);

                view.columns.values.forEach(function(width) {
                    columnHeader.addColumn(width);
                });

                columnHeader.addRow(grid.headerHeight);

                sheet.forEach(view.ref.topRow(), function(row, col, cell) {
                    var text = kendo.spreadsheet.Ref.display(null, Infinity, col);
                    columnHeader.addCell(0, text, {}, this.headerClassName(col, "col"));
                }.bind(this));

                children.push(columnHeader.toDomTree(view.columnOffset, 0, "k-spreadsheet-column-header"));
            }

            return kendo.dom.element("div", {
                style: grid.style,
                className: orientedClass("k-spreadsheet-pane", grid.hasRowHeader, grid.hasColumnHeader)
            }, children);
        },

        headerClassName: function(index, type) {
            var selectedHeaders = this._selectedHeaders;

            var itemSelection;
            var allHeaders;

            if (type === "row") {
                itemSelection = selectedHeaders.rows[index];
                allHeaders = selectedHeaders.allRows;
            } else {
                itemSelection = selectedHeaders.cols[index];
                allHeaders = selectedHeaders.allCols;
            }

            var className = itemSelection || (selectedHeaders.all ? "full" : (allHeaders ? "partial" : "none"));

            if (className) {
                className = "k-selection-" + className;
            }

            return className;
        },

        renderData: function() {
            var table = new HtmlTable(this.rowHeight, this.columnWidth);
            var view = this._currentView;

            view.rows.values.forEach(function(height) {
                table.addRow(height);
            });

            view.columns.values.forEach(function(width) {
                table.addColumn(width);
            });

            this._sheet.forEach(view.ref, function(row, col, cell) {
                this.addCell(table, row - view.ref.topLeft.row, cell);
            }.bind(this));

            return table.toDomTree(view.columnOffset, view.rowOffset, "k-spreadsheet-data");
        },

        _border: function(value) {
            var json = JSON.parse(value);

            if (json === null) {
                return undefined;
            }

            return [
                "solid",
                json && json.size || "1px",
                json && json.color || "#000"
            ].join(" ");
        },

        addCell: function(table, row, cell) {
            var style = {};

            if (cell.background) {
                style.backgroundColor = cell.background;
            }

            if (cell.color) {
                style.color = cell.color;
            }

            if (cell.fontFamily) {
                style.fontFamily = cell.fontFamily;
            }

            if (cell.underline) {
                style.textDecoration = "underline";
            }

            if (cell.italic) {
                style.fontStyle = "italic";
            }

            if (cell.textAlign) {
                style.textAlign = cell.textAlign;
            }

            if (cell.verticalAlign) {
                style.verticalAlign = cell.verticalAlign;
            }

            if (cell.bold) {
                style.fontWeight = "bold";
            }

            if (cell.fontSize) {
                style.fontSize = cell.fontSize;
            }

            if (cell.wrap === false) {
                style.whiteSpace = "nowrap";
            }

            if (cell.borderRight) {
                style.borderRight = this._border(cell.borderRight);
            }

            if (cell.borderBottom) {
                style.borderBottom = this._border(cell.borderBottom);
            }

            if (!style.textAlign) {
                switch (cell.type) {
                   case "number":
                   case "date":
                       style.textAlign = "right";
                   break;
                   case "boolean":
                       style.textAlign = "center";
                   break;
                }
            }

            var td = table.addCell(row, cell.value, style);

            var border, sibling;

            if (cell.borderLeft) {
                sibling = this._cellBefore(table, row);
                border = this._border(cell.borderLeft);
                if (sibling && border) {
                    sibling.attr.style.borderRight = border;
                }
            }

            if (cell.borderTop) {
                sibling = this._cellAbove(table, row);
                border = this._border(cell.borderTop);
                if (sibling && border) {
                    sibling.attr.style.borderBottom = border;
                }
            }

            if (cell.format && cell.value !== null) {
                var formatter = kendo.spreadsheet.formatting.compile(cell.format);
                td.children[0] = formatter(cell.value);
            }
        },

        _cellBefore: function(table, row) {
            var cells = table.trs[row].children;
            return cells[cells.length - 2];
        },

        _cellAbove: function(table, row) {
            var prevRow = table.trs[row-1];
            var index = table.trs[row].children.length-1;

            if (prevRow && index >= 0) {
                return prevRow.children[index];
            }
        },

        renderMergedCells: function() {
            var mergedCells = [];
            var sheet = this._sheet;
            var view = this._currentView;

            sheet.forEachMergedCell(function(ref) {
                this._addTable(mergedCells, ref, "k-spreadsheet-merged-cell");
            }.bind(this));

            return kendo.dom.element("div", { className: "k-merged-cells-wrapper" }, mergedCells);
        },

        renderSelection: function() {
            var selections = [];
            var grid = this._grid;
            var sheet = this._sheet;
            var view = this._currentView;
            var activeCell = sheet.activeCell().toRangeRef();
            var className = orientedClass(
                 "k-spreadsheet-active-cell",
                !activeCell.move(0, -1).intersects(view.ref),
                !activeCell.move(-1, 0).intersects(view.ref),
                !activeCell.move(0, 1).intersects(view.ref),
                !activeCell.move(1, 0).intersects(view.ref)
            );

            if (sheet.select().eq(activeCell)) {
                className += " k-single";
            }

            sheet.select().forEach(function(ref) {
                if (ref === kendo.spreadsheet.NULLREF) {
                    return;
                }

                this._addDiv(selections, ref, "k-spreadsheet-selection");
            }.bind(this));

            this._addTable(selections, activeCell, className);

            return kendo.dom.element("div", { className: "k-selection-wrapper" }, selections);
        },

        _addDiv: function(collection, ref, className) {
            var view = this._currentView;

            if (view.ref.intersects(ref)) {
                var div = this._rectangle(ref).resize(1, 1).toDiv(className);
                collection.push(div);
            }
        },

        _addTable: function(collection, ref, className) {
            var sheet = this._sheet;
            var view = this._currentView;

            if (view.ref.intersects(ref)) {
                sheet.forEach(ref.collapse(), function(row, col, cell) {
                    var rectangle = this._rectangle(ref);

                    var table = new HtmlTable(this.rowHeight, this.columnWidth);
                    table.addColumn(rectangle.width);
                    table.addRow(rectangle.height);
                    this.addCell(table, 0, cell);

                    collection.push(table.toDomTree(rectangle.left, rectangle.top, className));
                }.bind(this));
            }
        },

        _rectangle: function(ref) {
            return this._grid.boundingRectangle(ref.toRangeRef()).offset(-this._currentView.mergedCellLeft, -this._currentView.mergedCellTop);
        }
    });

    kendo.spreadsheet.View = View;
    kendo.spreadsheet.Pane = Pane;
})(kendo);
}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });
