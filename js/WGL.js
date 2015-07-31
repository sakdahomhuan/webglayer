WGL = function(numrec, url){
	
	GLU.loadShaders(url);		
	var manager  = new Manager("map"); 	
	var rasterer = new Rasterer(numrec);
	var metadata = [];

	manager.num_rec = numrec;
	manager.index = "index";
	manager.r_size = rasterer.size;
	manager.wgl = this;

	this.mcontroller = new MapController(manager);
	this.mcontroller.resize(manager.mapdiv.offsetWidth, manager.mapdiv.offsetHeight);
	
	var dimensions = [];
	var oneDDim = [];
	var filters = [];
		
	var charts = [];
	var mainFilter = new Filter(manager);
	
	
	var index = [];
	for (var i= 0; i<numrec; i++){
		index[i]=rasterer.calc(i);	
	}
	
	var indexta = array2TA2D(index);

	manager.addDataBuffer(indexta, 2, 'index');
	GLU.manager = manager;
	
	/*
	 * 
	 */
	this.addMapDimension = function(data, id){
		manager.addDataBuffer(array2TA(data), 2, 'wPoint');
		var dim = new MapDimension(manager);
		dimensions[id] = dim;
	}
	
	this.addLinearHistDimension = function(m){
		var ta = array2TANormLinear(m , m.num_bins);
		manager.addDataBuffer(ta, 1, m.name);
		var dim = new LinearHistDimension(manager, m);
		dimensions[m.name] = dim;
		oneDDim[m.name]  = m;
		manager.dimnum =  Object.keys(oneDDim).length;
	}
	
	this.addLinearFilter = function(m, res){
		var d = dimensions[m.name];
		if (d == null){
			console.error('Cant set fitler to not defined dimension '+m.name);
		}
		var f = new LinearFilter(manager, m, res);//res);
		d.filter = f; 
	}
	

	
	this.addCharts = function(ch){		
		charts = ch;	
	}

	this.getManager = function(){
		return manager;
	}		

	this.render = function(){		
		
		for (var i in dimensions){
			dimensions[i].render(numrec);
		}
		
	
	}
	
	this.updateCharts = function(){				
			
		//console.log(WGL.readHist());
		//var readout =this.readHist();
		
		for ( var i in charts) {
				var readout = dimensions[i].readPixels();
				if (typeof readout != 'undefined') {
				charts[i].update(readout);
			}
		}		
	}
	
	
	this.filterByExt = function(){
		mainFilter.render(dimensions);
		
		manager.filterTexture = mainFilter.filterTexture;
		this.render();
		this.updateCharts();
	}

	
	this.filterDim = function(id, filter){
		var f = dimensions[id].filter;
		f.createFilteringData(filter);
		f.renderFilter();
		//f.readPixels();

		mainFilter.render(dimensions);
		
		manager.filterTexture = mainFilter.filterTexture;
		this.render();
		this.updateCharts();
	}
	
	
	this.filterHistOld = function(id, f){		
		var h_filter = new Float32Array(f.length * 4);
		// console.log(h_filter.length);
		var j = 0;
		var ch_row = metadata[id].index;
		var m = metadata[id];
		for ( var i in f) {
			var y = ((ch_row + 0.5) / manager.dimnum) * 2 - 1;

			var l = normaliseByMax(f[i][0],manager.max_bins,
					m.min, m.max, m.num_bins);
			h_filter[j++] = l		
			
			h_filter[j++] = y;

			var p = normaliseByMax(f[i][1], manager.max_bins,
					m.min, m.max, m.num_bins);
			
			h_filter[j++] = p;
			console.log("filter "+f[i][0]+" " +f[i][1] + " normalized to "+l+" "+p);
			
			h_filter[j++] = y;
		}

		histFilter.createFilteringData(ch_row, h_filter);
		histFilter.renderFilter();
		
		manager.histFilter = histFilter.filterTexture;
		mainFilter.render();
		manager.filterTexture = mainFilter.filterTexture;
		this.render();
		this.updateCharts();
	
	}
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	function normaliseByMax(value, max_all, this_min, this_max, this_num) {
		/* reduced value to 0-1 */
		// var c = value/ this_max;
		var s = (2/max_all) * ((this_max-this_min) / this_num);
		//var c_size = (this_max-this_min) / (this_num);
		//var v = (value / c_size) / max_all * 2 - 1;
		var v = s * (value - this_min) - 1 ;
		return v;
		// return 0.5;
	}
	function array2TANormOrdinal(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		m.num_bins = m.domain.length;
		m.min = 0.;
		m.max =m.num_bins;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				var bin = m.domain.indexOf(m.data[i]);
				if (bin == -1){
					console.error('data out of range');
				}
				val =  (bin+0.5) /max_bins ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	}
	
	function array2TANormLinear(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins +  (1 /(2*max_bins)) ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	}
	
	
	function array2TANorm(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(3*max_bins)) ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	}
	
	function array2TA2D(pts) {

		pts_ar = new Float32Array(pts.length * 2);
		var i = 0;
		var j = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			pts[i] = null;
		}

		return pts_ar;
	}
	
	function array2TA(pts) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[i] = pts[i];
			pts[i] = null;
		}
		return pts_ar;
	}
	
	function Rasterer(max){
		this.size = Math.ceil(Math.sqrt(max));
		this.calc = function(value) {
			var y = Math.floor(value / this.size);
			var x = value - (this.size * y);

			return [ normalise(x, this.size), normalise(y, this.size) ];
		}
	}
	
	function normalise(value, max) {
		return value / max * 2 - 1 + (2 / (max * 2));
	}
}

