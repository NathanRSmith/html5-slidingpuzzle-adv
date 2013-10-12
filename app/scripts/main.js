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
	barriers: new Backbone.Collection(),
	shiftCell: function(cell) {
		var emptyAddr = this.findFirstEmptyCell().addr;
		if(cell.get('row') == emptyAddr[0]) {
			this.shiftHorizontal(cell.get('row'), cell.get('col'), emptyAddr[1]);
		} else if(cell.get('col') == emptyAddr[1]) {
			this.shiftVertical(cell.get('col'), cell.get('row'), emptyAddr[0]);
		}
	},
	shiftHorizontal: function(idx, targetIdx, emptyIdx) {
		var sign = targetIdx < emptyIdx ? -1 : 1;
		
		for(var i=0; i<Math.abs(targetIdx-emptyIdx); i++) {
			iIdx = emptyIdx+i*sign;
			
			this._processVerticalBarriers(this.at(idx, iIdx+sign), iIdx+sign, iIdx);
			
			var tmp = this.at(idx, iIdx+sign);
			tmp.set('col', iIdx);
			this.setAddr(idx, iIdx, tmp);
			this.setAddr(idx, iIdx+sign, null);
		}
	},
	_processVerticalBarriers: function(cell, fromCol, toCol) {
		// Check if the cell being moved crosses a barrier
		var barrier = this.barriers.find(function(barrier) {
			// only processing vertical barriers currently
			if(barrier.get('orientation') != 'v') return false;
			// only if rows match
			if(barrier.get('row') != cell.get('row')) return false;
			
			// if moving to right
			if( toCol>fromCol && fromCol==barrier.get('col') ) return true;
			// if moving to left
			if( toCol<fromCol && toCol==barrier.get('col') ) return true;
		});
		if(barrier) {
			// flip the state since there is currently only one type of barrier
			// TODO: Fix for multiple barrier types
			cell.set('state', (!cell.get('state'))*1);
		}
	},
	shiftVertical: function(idx, targetIdx, emptyIdx) {
		var sign = targetIdx < emptyIdx ? -1 : 1;
		
		for(var i=0; i<Math.abs(targetIdx-emptyIdx); i++) {
			iIdx = emptyIdx+i*sign;
			
			this._processHorizontalBarriers(this.at(iIdx+sign, idx), iIdx+sign, iIdx);
			
			var tmp = this.at(iIdx+sign, idx);
			tmp.set('row', iIdx);
			this.setAddr(iIdx, idx, tmp);
			this.setAddr(iIdx+sign, idx, null);
		}
	},
	_processHorizontalBarriers: function(cell, fromRow, toRow) {
		// Check if the cell being moved crosses a barrier
		var barrier = this.barriers.find(function(barrier) {
			// only processing vertical barriers currently
			if(barrier.get('orientation') != 'h') return false;
			// only if rows match
			if(barrier.get('col') != cell.get('col')) return false;
			
			// if moving to right
			if( toRow>fromRow && fromRow==barrier.get('row') ) return true;
			// if moving to left
			if( toRow<fromRow && toRow==barrier.get('row') ) return true;
		});
		if(barrier) {
			// flip the state since there is currently only one type of barrier
			// TODO: Fix for multiple barrier types
			cell.set('state', (!cell.get('state'))*1);
		}
	},
	shiftEmptyUp: function() {
		var emptyAddr = this.findFirstEmptyCell().addr;
		var cell = this.at(emptyAddr[0]-1, emptyAddr[1]);
		if(cell !== undefined) {
			this.shiftVertical(emptyAddr[1], cell.get('row'), emptyAddr[0]);
		}
	},
	shiftEmptyDown: function() {
		var emptyAddr = this.findFirstEmptyCell().addr;
		var cell = this.at(emptyAddr[0]+1, emptyAddr[1]);
		if(cell !== undefined) {
			this.shiftVertical(emptyAddr[1], cell.get('row'), emptyAddr[0]);
		}
	},
	shiftEmptyLeft: function() {
		var emptyAddr = this.findFirstEmptyCell().addr;
		var cell = this.at(emptyAddr[0], emptyAddr[1]-1);
		if(cell !== undefined) {
			this.shiftHorizontal(emptyAddr[0], cell.get('col'), emptyAddr[1]);
		}
	},
	shiftEmptyRight: function() {
		var emptyAddr = this.findFirstEmptyCell().addr;
		var cell = this.at(emptyAddr[0], emptyAddr[1]+1);
		if(cell !== undefined) {
			this.shiftHorizontal(emptyAddr[0], cell.get('col'), emptyAddr[1]);
		}
	},
	
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
                        value: num,
						state: 0,
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
                        value: num,
						state: 0,
                    });
                } else {
                    mat[i][j] = null;
                }
				num++;
            }
        }
        this.models = mat;
	},
	generateSolvableMatrix: function() {
		var that = this;
		this.generateOrderedMatrix();
		
		// move empty cell to middle(ish)
		this.shiftCell(this.at(this.getHeight()-1, Math.round(this.getWidth()/2)));
		this.shiftCell(this.at(Math.round(this.getHeight()/2), Math.round(this.getWidth()/2)));
		
		// do 250 moves
		_.times(500, function(n) {
			var rand = _.random(0, 3);
			switch(rand) {
			case 0:
				that.shiftEmptyUp();
				break;
			case 1:
				that.shiftEmptyDown();
				break;
			case 2:
				that.shiftEmptyLeft();
				break;
			case 3:
				that.shiftEmptyRight();
				break;
			}
		});
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
		var that = this;
		
        this.collection = new SliderGameCollection({height: this.rows, width: this.cols});
		
		// initiate barriers
		this.collection.barriers.add({row: 0, col: 1, orientation: 'v', type: 1});
		this.collection.barriers.add({row: 1, col: 0, orientation: 'h', type: 1});
		
		
		
        this.collection.generateSolvableMatrix();

        this.display = new CanvasDisplayView({
			el: this.el,
            collection: this.collection,
			dispatcher: this.options.dispatcher,
            rows: this.rows, cols: this.cols,
			drawCellCallback: _.bind(this.drawCell, this),
			drawExtraCallback: _.bind(this.drawExtra, this),
        });
		
		$(document).keydown(function(e) {return that.arrowHandler(e);})
		
		this.listenTo(this.options.dispatcher, 'preNewGame', this.newGameHandler);
		this.listenTo(this.options.dispatcher, 'cellClicked', this.clickHandler);
		this.listenTo(this.options.dispatcher, 'moveMade', this.moveMadeHandler);
    },
	arrowHandler: function(e) {
		// check if key pressed is an arrow key
		if(_.contains([37, 38, 39, 40], e.keyCode)) {
			switch(e.keyCode) {
			// left
			case 37:
				this.collection.shiftEmptyRight();
				break;
			// up
			case 38:
				this.collection.shiftEmptyDown();
				break;
			// right
			case 39:
				this.collection.shiftEmptyLeft();
				break;
			// down
			case 40:
				this.collection.shiftEmptyUp();
				break;
			}
			
			this.display.draw();
			this.options.dispatcher.trigger('moveMade');
		}
	},
	clickHandler: function(click) {
		var cell = this.collection.at(click.row, click.col);
		if(cell != null) {
			this.collection.shiftCell(cell);
			this.display.draw();
			this.options.dispatcher.trigger('moveMade');
		}
	},
	checkGameComplete: function() {
		var that = this;
		var n = 1;
		var matches = true;
		// bails out early if finds non-matching cell
		this.collection.find(function(cell) {
			if(n < that.rows*that.cols) {
				if(cell == null) {
					matches = false;
					return true;
				} else if(n != cell.get('value')) {
					matches = false;
					return true;
				} else if(0 != cell.get('state')) {
					matches = false;
					return true;
				}
			}
			n++;
		});
		return matches;
	},
	moveMadeHandler: function() {
		if(this.checkGameComplete()) {
			alert('Game Complete!');
		}
	},
	newGameHandler: function() {
		this.collection.generateSolvableMatrix();
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
		
		switch(cell.get('state')) {
		case 1:
			d.$el.drawArc({
				fillStyle: '#888',
				strokeStyle: '#000',
				strokeWidth: 1,
				x: x+d._calculateCellWidth()/2, y: y+d._calculateCellHeight()/2,
				radius: .8*(d._calculateCellWidth()/2),
				fromCenter: true
			});
			break;
		}
		
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
	},
	drawExtra: function(d) {
		this.collection.barriers.each(function(barrier) {
			// assume vertical first, then flip if not
			var x = (barrier.get('col')+1)*d._calculateCellWidth();
			var y = barrier.get('row')*d._calculateCellHeight() + d._calculateCellHeight()/2;
			var height = d._calculateCellHeight();
			var width = 6*d._CELL_PADDING;
			
			if(barrier.get('orientation') == 'h') {
				// var tmp=x;
// 				x=y;
// 				y=tmp;
				x -= d._calculateCellWidth()/2;
				y += d._calculateCellHeight()/2
				tmp=height;
				height=width;
				width=tmp;
			}
			
			switch(barrier.get('type')) {
			case 1:
				d.$el.drawRect({
					fillStyle: '#888',
					strokeStyle: '#333',
					strokeWidth: '2',
					x: x+d.BBOX.minx, y: y+d.BBOX.miny, 
					width: width, height: height,
					fromCenter: true
				});
				break;
			}
			
			
		});
	}
});



game = new SliderGameApp({el: '#game_canvas', dispatcher: dispatcher});
newGameBtnView = new NewGameBtnView({el: '.new-game', dispatcher: dispatcher});

$(document).ready(function() {
	FastClick.attach(document.body);
});