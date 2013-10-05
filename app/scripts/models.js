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
        this.models[row][col] = val;
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
	find: function(callback) {
        for(var i=0; i<this.getHeight(); i++) {
            for(var j=0; j<this.getWidth(); j++) {
                if(callback(this.at(i,j), [i,j], this.collection) == true) {
                	return {cell: this.at(i,j), addr: [i, j]};
                }
            }
        }
		return undefined;
	},
	filter: function(callback) {
		matches = []
        for(var i=0; i<this.getHeight(); i++) {
            for(var j=0; j<this.getWidth(); j++) {
                if(callback(this.at(i,j), [i,j], this.collection) == true) {
                	matches.push({cell: this.at(i,j), addr: [i, j]});
                }
            }
        }
		return matches;
	},
	findAllEmptyCells: function() { return this.filter(function(cell, addr) { return cell == null; }); },
	findFirstEmptyCell: function() { return this.find(function(cell, addr) { return cell == null; }); },
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