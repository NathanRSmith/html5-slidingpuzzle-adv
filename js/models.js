var CellModel = Backbone.Model.extend({
    defaults: { 'visited':  false },
//    matches: function(cell) { try { return this.get('color') == cell.get('color'); } catch(e) { return false; } },
    isVisited: function() { return this.get('visited'); },
    updateCellAddr: function(row, col) {
        this.set('row', row);
        this.set('col', col);
    }
});

var MatrixCollection = Backbone.Collection.extend({
    initialize: function(options) { this.options = options; },
    at: function(row, col) { try { return this.models[row][col]; } catch(e) { return undefined; } },
    getHeight: function() { return this.options.height; },
    getWidth: function() { return this.options.width; },
    setAddr: function(row, col, val) {
        this._matrix[row][col] = val;
    },
    _resetAllVisited: function() {
        this.each(function(cell) {
            if(cell) { cell.set('visited', false); }
        });
    },
    each: function(callback) {
        for(var i=0; i<this.getHeight(); i++) {
            for(var j=0; j<this.getWidth(); j++) {
                callback(this.at(i,j), [i,j], this.collection);
            }
        }
    },
    removeCell: function(cell) {
        this._matrix[cell.get('row')][cell.get('col')] = null;
    },

    initializeMatrix: function() {
        var mat = new Array(this.getHeight())
        for(var i=0; i<this.getHeight(); i++) {
            mat[i] = new Array(this.getWidth());
        }
        this.models = mat;
    },
    generateMatrix: function(matrix) {
        var mat = new Array(this.getHeight())
        for(var i=0; i<this.getHeight(); i++) {
            mat[i] = new Array(this.getWidth());
            for(var j=0; j<this.getWidth(); j++) {
                mat[i][j] = new this.modelClass(_.extend({}, matrix[i][j], {row: i, col: j}));
            }
        }
        this.models = mat;
    },

});


var SliderGameCollection = MatrixCollection.extend({
    modelClass: CellModel,
    generateRandomMatrix: function() {
        var nums = _.shuffle(_.range(0,16));
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
    }
});