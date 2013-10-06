function getMousePos(a,b){var c=a.getBoundingClientRect();return{x:b.clientX-c.left,y:b.clientY-c.top}}function boolToInt(a){return a?1:0}var CellModel=Backbone.Model.extend({defaults:{visited:!1},isVisited:function(){return this.get("visited")},updateCellAddr:function(a,b){this.set("row",a),this.set("col",b)}}),MatrixCollection=Backbone.Collection.extend({initialize:function(a){this.options=a},at:function(a,b){try{return this.models[a][b]}catch(c){return void 0}},getHeight:function(){return this.options.height},getWidth:function(){return this.options.width},setAddr:function(a,b,c){this.models[a][b]=c},_resetAllVisited:function(){this.each(function(a){a&&a.set("visited",!1)})},each:function(a){for(var b=0;b<this.getHeight();b++)for(var c=0;c<this.getWidth();c++)a(this.at(b,c),[b,c],this.collection)},find:function(a){for(var b=0;b<this.getHeight();b++)for(var c=0;c<this.getWidth();c++)if(1==a(this.at(b,c),[b,c],this.collection))return{cell:this.at(b,c),addr:[b,c]};return void 0},filter:function(a){matches=[];for(var b=0;b<this.getHeight();b++)for(var c=0;c<this.getWidth();c++)1==a(this.at(b,c),[b,c],this.collection)&&matches.push({cell:this.at(b,c),addr:[b,c]});return matches},findAllEmptyCells:function(){return this.filter(function(a){return null==a})},findFirstEmptyCell:function(){return this.find(function(a){return null==a})},removeCell:function(a){this._matrix[a.get("row")][a.get("col")]=null},initializeMatrix:function(){for(var a=new Array(this.getHeight()),b=0;b<this.getHeight();b++)a[b]=new Array(this.getWidth());this.models=a},generateMatrix:function(a){for(var b=new Array(this.getHeight()),c=0;c<this.getHeight();c++){b[c]=new Array(this.getWidth());for(var d=0;d<this.getWidth();d++)b[c][d]=new this.modelClass(_.extend({},a[c][d],{row:c,col:d}))}this.models=b}}),CanvasDisplayView=Backbone.View.extend({_backgroundColor:"#000",_CELL_PADDING:2,resizeTimeout:null,events:{click:"_clickHandler"},initialize:function(a){var b=this;this.subclassPreInitialize(a),this.listenTo(dispatcher,"preNewGame",this.newGameHandler),$(window).resize(_.debounce(function(){b.resizeHandler()},100)),this._initializeCanvas(),this.draw(),this.subclassPostInitialize(a)},subclassPreInitialize:function(){},subclassPostInitialize:function(){},_clickHandler:function(a){var b=getMousePos(this.el,a),c=this.getCellAddressFromXY(b.x,b.y);c&&this.options.dispatcher.trigger("cellClicked",{x:b.x,y:b.y,row:c.row,col:c.col})},resizeHandler:function(){this._initializeCanvas(),this.draw()},_initializeCanvas:function(){this.$el[0].height=this.$el.parent().height(),this.$el[0].width=this.$el.parent().width();var a=this.$el.height(),b=this.$el.width(),c=this._calculateInitialCellHeight(a),d=this._calculateInitialCellWidth(b),e=Math.min(c,d);this._CELL_HEIGHT=e,this._CELL_WIDTH=e;var f=this._calculateCanvasSize();Math.round((a-f[0])/2);var g=Math.round((b-f[1])/2);this.BBOX={miny:a-f[0],maxy:this.$el.height(),minx:g,maxx:this.$el.width()-g}},draw:function(){this._drawBackground(),this._drawGameMatrix()},_calculateCanvasSize:function(){var a=this.options.rows*this._calculateCellHeight(),b=this.options.cols*this._calculateCellWidth();return[a,b]},_calculateCellHeight:function(){return this._CELL_HEIGHT+2*this._CELL_PADDING},_calculateCellWidth:function(){return this._CELL_WIDTH+2*this._CELL_PADDING},_drawBackground:function(){this.$el.drawRect({fillStyle:this._backgroundColor,x:0,y:0,width:this.$el.width(),height:this.$el.height(),fromCenter:!1})},_calculateInitialCellHeight:function(a){return Math.floor(a/this.options.rows-2*this._CELL_PADDING)},_calculateInitialCellWidth:function(a){return Math.floor(a/this.options.cols-2*this._CELL_PADDING)},getCellAddressFromXY:function(a,b){return this._withinBBOX(a,b)?{col:Math.floor((a-this.BBOX.minx)/this._calculateCellWidth()),row:Math.floor((b-this.BBOX.miny)/this._calculateCellHeight())}:null},_withinBBOX:function(a,b){return a>this.BBOX.minx&&a<this.BBOX.maxx&&b>this.BBOX.miny&&b<this.BBOX.maxy?!0:!1},_drawGameMatrix:function(){for(var a=0;a<this.options.rows;a++)for(var b=0;b<this.options.cols;b++){var c=a*this._calculateCellHeight()+this.BBOX.miny,d=b*this._calculateCellWidth()+this.BBOX.minx;this._drawCell(c,d,this.collection.at(a,b))}},_drawCell:function(a,b,c){c?this.options.drawCellCallback(b,a,c,this):this.options.drawEmptyCellCallback&&this.options.drawEmptyCellCallback(b,a,this)}});dispatcher=_.extend({},Backbone.Events);var SliderGameCollection=MatrixCollection.extend({modelClass:CellModel,shiftCell:function(a){var b=this.findFirstEmptyCell().addr;a.get("row")==b[0]?this.shiftHorizontal(a.get("row"),a.get("col"),b[1]):a.get("col")==b[1]&&this.shiftVertical(a.get("col"),a.get("row"),b[0])},shiftHorizontal:function(a,b,c){for(var d=c>b?-1:1,e=0;e<Math.abs(b-c);e++){iIdx=c+e*d;var f=this.at(a,iIdx+d);f.set("col",iIdx),this.setAddr(a,iIdx,f),this.setAddr(a,iIdx+d,null)}},shiftVertical:function(a,b,c){for(var d=c>b?-1:1,e=0;e<Math.abs(b-c);e++){iIdx=c+e*d;var f=this.at(iIdx+d,a);f.set("row",iIdx),this.setAddr(iIdx,a,f),this.setAddr(iIdx+d,a,null)}},shiftEmptyUp:function(){var a=this.findFirstEmptyCell().addr,b=this.at(a[0]-1,a[1]);void 0!==b&&this.shiftVertical(a[1],b.get("row"),a[0])},shiftEmptyDown:function(){var a=this.findFirstEmptyCell().addr,b=this.at(a[0]+1,a[1]);void 0!==b&&this.shiftVertical(a[1],b.get("row"),a[0])},shiftEmptyLeft:function(){var a=this.findFirstEmptyCell().addr,b=this.at(a[0],a[1]-1);void 0!==b&&this.shiftHorizontal(a[0],b.get("col"),a[1])},shiftEmptyRight:function(){var a=this.findFirstEmptyCell().addr,b=this.at(a[0],a[1]+1);void 0!==b&&this.shiftHorizontal(a[0],b.get("col"),a[1])},generateRandomMatrix:function(){for(var a=_.shuffle(_.range(0,this.getHeight()*this.getWidth())),b=new Array(this.getHeight()),c=0;c<this.getHeight();c++){b[c]=new Array(this.getWidth());for(var d=0;d<this.getWidth();d++){var e=a[c*this.getWidth()+d];b[c][d]=0!=e?new this.modelClass({row:c,col:d,value:e}):null}}this.models=b},generateOrderedMatrix:function(){for(var a=1,b=new Array(this.getHeight()),c=0;c<this.getHeight();c++){b[c]=new Array(this.getWidth());for(var d=0;d<this.getWidth();d++)b[c][d]=a!=this.getHeight()*this.getWidth()?new this.modelClass({row:c,col:d,value:a}):null,a++}this.models=b},generateSolvableMatrix:function(){var a=this;this.generateOrderedMatrix(),this.shiftCell(this.at(this.getHeight()-1,Math.round(this.getWidth()/2))),this.shiftCell(this.at(Math.round(this.getHeight()/2),Math.round(this.getWidth()/2))),_.times(250,function(){var b=_.random(0,3);switch(b){case 0:a.shiftEmptyUp();break;case 1:a.shiftEmptyDown();break;case 2:a.shiftEmptyLeft();break;case 3:a.shiftEmptyRight()}})}}),NewGameBtnView=Backbone.View.extend({events:{click:"btnClicked"},btnClicked:function(){this.options.dispatcher.trigger("preNewGame")}}),SliderGameApp=Backbone.View.extend({rows:4,cols:4,initialize:function(){var a=this;this.collection=new SliderGameCollection({height:this.rows,width:this.cols}),this.collection.generateSolvableMatrix(),this.display=new CanvasDisplayView({el:this.el,collection:this.collection,dispatcher:this.options.dispatcher,rows:this.rows,cols:this.cols,drawCellCallback:_.bind(this.drawCell,this)}),$(document).keydown(function(b){return a.arrowHandler(b)}),this.listenTo(this.options.dispatcher,"preNewGame",this.newGameHandler),this.listenTo(this.options.dispatcher,"cellClicked",this.clickHandler),this.listenTo(this.options.dispatcher,"moveMade",this.moveMadeHandler)},arrowHandler:function(a){if(_.contains([37,38,39,40],a.keyCode)){switch(a.keyCode){case 37:this.collection.shiftEmptyRight();break;case 38:this.collection.shiftEmptyDown();break;case 39:this.collection.shiftEmptyLeft();break;case 40:this.collection.shiftEmptyUp()}this.display.draw(),this.options.dispatcher.trigger("moveMade")}},clickHandler:function(a){var b=this.collection.at(a.row,a.col);null!=b&&(this.collection.shiftCell(b),this.display.draw(),this.options.dispatcher.trigger("moveMade"))},checkGameComplete:function(){var a=this,b=1,c=!0;return this.collection.find(function(d){if(b<a.rows*a.cols){if(null==d)return c=!1,!0;if(b!=d.get("value"))return c=!1,!0}b++}),c},moveMadeHandler:function(){this.checkGameComplete()&&alert("Game Complete!")},newGameHandler:function(){this.collection.generateSolvableMatrix(),this.display._initializeCanvas(),this.display.draw(),this.options.dispatcher.trigger("newGame")},drawCell:function(a,b,c,d){d.$el.drawRect({fillStyle:"#FFF",x:a+d._CELL_PADDING,y:b+d._CELL_PADDING,width:d._CELL_WIDTH,height:d._CELL_HEIGHT,fromCenter:!1}),d.$el.drawText({fillStyle:"#9cf",strokeStyle:"#25a",strokeWidth:2,x:a+d._calculateCellWidth()/2,y:b+d._calculateCellHeight()/2,fontSize:d._CELL_HEIGHT/2,fontFamily:"Verdana, sans-serif",fromCenter:!0,text:c.get("value").toString()})}});game=new SliderGameApp({el:"#game_canvas",dispatcher:dispatcher}),newGameBtnView=new NewGameBtnView({el:".new-game",dispatcher:dispatcher});