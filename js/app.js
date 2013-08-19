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
            rows: this.rows, cols: this.cols,
            collection: this.collection
        });

    },
});