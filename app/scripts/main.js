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




var SliderGameApp = Backbone.View.extend({
    rows: 4, cols: 4,
    initialize: function(options) {
        this.collection = new SliderGameCollection({height: this.rows, width: this.cols})
        this.collection.generateRandomMatrix();

        this.display = new CanvasDisplayView({
			el: this.el,
            collection: this.collection,
            rows: this.rows, cols: this.cols,
			drawCellCallback: _.bind(this.drawCell, this),
        });

    },
	drawCell: function(x, y, cell, d) {
		d.$el.drawRect({
			fillStyle: '#FFF',
			x: x+d._CELL_PADDING, y: y+d._CELL_PADDING,
            width: d._CELL_WIDTH, height: d._CELL_HEIGHT,
            fromCenter: false
		})
	}
});



game = new SliderGameApp({el: '#game_canvas'});