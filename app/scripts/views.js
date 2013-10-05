var CanvasDisplayView = Backbone.View.extend({
    _backgroundColor: '#000',
    _CELL_PADDING: 2,
    resizeTimeout: null,
    events: {
        'click': '_clickHandler'
    },
    initialize: function(options) {
		var that = this;
        this.subclassPreInitialize(options);

        this.listenTo(dispatcher, 'preNewGame', this.newGameHandler);
        $(window).resize(_.debounce(function() {that.resizeHandler();}, 100));

        // configure canvas and draw
        this._initializeCanvas();
        this.draw();
        this.subclassPostInitialize(options);
    },
    subclassPreInitialize: function() {},
    subclassPostInitialize: function() {},
    _clickHandler: function(e) {
        var pos = getMousePos(this.el, e);
        var cellAddr = this.getCellAddressFromXY(pos.x, pos.y);
        if( cellAddr ) {

            this.options.dispatcher.trigger('cellClicked',{ 
				x: pos.x, y: pos.y,
                row: cellAddr.row, col: cellAddr.col
            });
        }
    },
    resizeHandler: function() {
		this._initializeCanvas();
        this.draw();
    },
    _initializeCanvas: function() {
        // determine cell size based on canvas size
        this.$el[0].height = this.$el.parent().height();
        this.$el[0].width = this.$el.parent().width();
        var canvasHeight = this.$el.height();
        var canvasWidth = this.$el.width();
        var cheight = this._calculateInitialCellHeight(canvasHeight);
        var cwidth = this._calculateInitialCellWidth(canvasWidth);
        var csize = Math.min(cheight, cwidth);
        this._CELL_HEIGHT = csize;
        this._CELL_WIDTH = csize;
        var size = this._calculateCanvasSize(); // h, w
        var padh = Math.round((canvasHeight - size[0]) / 2);
        var padw = Math.round((canvasWidth - size[1]) / 2);

        // set canvas offsets for where to start looking for click events (BBOX)
        this.BBOX = {
            miny: canvasHeight - size[0],
            maxy: this.$el.height(),
            minx: padw,
            maxx: this.$el.width() - padw
        }
    },
    draw: function() {
        this._drawBackground();
        this._drawGameMatrix();
    },
    _calculateCanvasSize: function() {
        var height = this.options.rows*this._calculateCellHeight();
        var width = this.options.cols*this._calculateCellWidth();
        return [height, width];
    },
    _calculateCellHeight: function() { return this._CELL_HEIGHT + 2*this._CELL_PADDING; },
    _calculateCellWidth: function() { return this._CELL_WIDTH + 2*this._CELL_PADDING; },
    _drawBackground: function() {
        this.$el.drawRect({
          fillStyle: this._backgroundColor,
          x: 0, y: 0,
          width: this.$el.width(),
          height: this.$el.height(),
          fromCenter: false
        });
    },
    _calculateInitialCellHeight: function(height) {
        // solve for cell height based on number of cells and padding size
        // h/rows - 2p
        return Math.floor( (height / this.options.rows) - 2*this._CELL_PADDING);
    },
    _calculateInitialCellWidth: function(width) {
        // solve for cell height based on number of cells and padding size
        // h/rows - 2p
        return Math.floor( (width / this.options.cols) - 2*this._CELL_PADDING);
    },
    getCellAddressFromXY: function(x, y) {
        if( this._withinBBOX(x, y) ) {
            return {
                col: Math.floor((x-this.BBOX.minx) / (this._calculateCellWidth())),
                row: Math.floor((y-this.BBOX.miny) / (this._calculateCellHeight()))
            }
        }
        return null;
    },
    _withinBBOX: function(x, y) {
        if( x > this.BBOX.minx &&
            x < this.BBOX.maxx &&
            y > this.BBOX.miny &&
            y < this.BBOX.maxy ) {

            return true;
        }
        return false;
    },
    _drawGameMatrix: function() {
        for(var i=0; i<this.options.rows; i++) {
            for(var j=0; j<this.options.cols; j++) {
                var y = i*this._calculateCellHeight() + this.BBOX.miny;
                var x = j*this._calculateCellWidth() + this.BBOX.minx;
                this._drawCell(y, x, this.collection.at(i, j));
            }
        }
    },
    _drawCell: function(y, x, cell) {
        if( cell ){
			this.options.drawCellCallback(x, y, cell, this)
			
            // this.$el.drawRect({
//                 fillStyle: '#FFF',
//                 x: x+this._CELL_PADDING, y: y+this._CELL_PADDING,
//                 width: this._CELL_WIDTH, height: this._CELL_HEIGHT,
//                 fromCenter: false
//             });
        } else {
        	if(this.options.drawEmptyCellCallback) {
        		this.options.drawEmptyCellCallback(x, y, this)
        	}
        }
    },
});