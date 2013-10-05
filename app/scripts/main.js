/**
 * Event Dispatcher
 *
 * Events:
 *     * moveMade returns number removed
 *     * gameOver
 *     * preGameOver
 *     * postGameOver
 *     * newGame
 *     * preNewGame
 *
 */
dispatcher = _.extend({}, Backbone.Events);

var SliderGameCollection = MatrixCollection.extend({
    modelClass: CellModel,
    generateRandomMatrix: function() {
        var nums = _.shuffle(_.range(0,this.getHeight()*this.getWidth()));
        var mat = new Array(this.getHeight());
        for(var i=0; i<this.getHeight(); i++) {
            mat[i] = new Array(this.getWidth());
            for(var j=0; j<this.getWidth(); j++) {
                var num = nums[i*this.getWidth() + j]
                if(num != 0) {
                    mat[i][j] = new this.modelClass({
                        row: i, col: j,
                        value: num
                    });
                } else {
                    mat[i][j] = null;
                }
            }
        }
        this.models = mat;
    },
	generateOrderedMatrix: function() {
		var num = 1;
        var mat = new Array(this.getHeight());
        for(var i=0; i<this.getHeight(); i++) {
            mat[i] = new Array(this.getWidth());
            for(var j=0; j<this.getWidth(); j++) {
                if(num != this.getHeight()*this.getWidth()) {
                    mat[i][j] = new this.modelClass({
                        row: i, col: j,
                        value: num
                    });
                } else {
                    mat[i][j] = null;
                }
				num++;
            }
        }
        this.models = mat;
	}
});


var NewGameBtnView = Backbone.View.extend({
    events: {
        'click': 'btnClicked'
    },
    btnClicked: function(e) {
        this.options.dispatcher.trigger('preNewGame');
    }
});






var SliderGameApp = Backbone.View.extend({
    rows: 4, cols: 4,
    initialize: function(options) {
        this.collection = new SliderGameCollection({height: this.rows, width: this.cols})
        this.collection.generateRandomMatrix();

        this.display = new CanvasDisplayView({
			el: this.el,
            collection: this.collection,
			dispatcher: this.options.dispatcher,
            rows: this.rows, cols: this.cols,
			drawCellCallback: _.bind(this.drawCell, this),
        });
		
		this.listenTo(this.options.dispatcher, 'preNewGame', this.newGameHandler);
		this.listenTo(this.options.dispatcher, 'cellClicked', this.clickHandler);
    },
	shiftCell: function(cell) {
		var emptyAddr = this.collection.findFirstEmptyCell().addr;
		if(cell.get('row') == emptyAddr[0]) {
			this.shiftHorizontal(cell.get('row'), cell.get('col'), emptyAddr[1]);
		} else if(cell.get('col') == emptyAddr[1]) {
			this.shiftVertical(cell, emptyAddr[0]);
		}
	},
	shiftHorizontal: function(row, targetCol, emptyCol) {
		if(targetCol < emptyCol) {
			// shift cells right (empty cell left)
			for(var i=emptyCol; i>targetCol; i--) {
				var tmp = this.collection.at(row, i-1);
				tmp.set('col', i);
				this.collection.setAddr(row, i, tmp);
				this.collection.setAddr(row, i-1, null);
			}
		} else {
			// shift cells left (empty cell right)
			for(var i=emptyCol; i<targetCol; i++) {
				var tmp = this.collection.at(row, i+1);
				tmp.set('col', i);
				this.collection.setAddr(row, i, tmp);
				this.collection.setAddr(row, i+1, null);
			}
		}
	},
	shiftVertical: function(cell, emptyAddr) {
		
	},
	clickHandler: function(click) {
		var cell = this.collection.at(click.row, click.col);
		if(cell != null) {
			this.shiftCell(cell);
		}
		this.display.draw();
	},
	newGameHandler: function() {
		this.collection.generateRandomMatrix();
		this.display._initializeCanvas();
		this.display.draw();
		
		this.options.dispatcher.trigger('newGame');
	},
	drawCell: function(x, y, cell, d) {
		d.$el.drawRect({
			fillStyle: '#FFF',
			x: x+d._CELL_PADDING, y: y+d._CELL_PADDING,
            width: d._CELL_WIDTH, height: d._CELL_HEIGHT,
            fromCenter: false
		});
		d.$el.drawText({
			fillStyle: "#9cf",
			strokeStyle: "#25a",
			strokeWidth: 2,
			x: x+d._calculateCellWidth()/2, y: y+d._calculateCellHeight()/2,
			fontSize: d._CELL_HEIGHT/2,
			fontFamily: "Verdana, sans-serif",
			fromCenter: true,
			text: cell.get('value').toString()
		});
	}
});



game = new SliderGameApp({el: '#game_canvas', dispatcher: dispatcher});
newGameBtnView = new NewGameBtnView({el: '.new-game', dispatcher: dispatcher});