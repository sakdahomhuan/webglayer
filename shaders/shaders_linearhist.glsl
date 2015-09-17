<script id="linearhist_vShader" type="x-shader/x-vertex">
	
	attribute float attr;
	attribute vec2 index;
	
	//uniform mat4 mapMatrix;
	uniform mat4 rasterMatrix;
	
	uniform sampler2D filter;
	
	uniform float numfilters;
	varying vec4 col; 

	void main() {
		

		
		gl_Position = vec4((attr*2.)-1., 0., 0., 1.);
  		gl_PointSize = 1.;
  			
  		vec4 rp = rasterMatrix * vec4(index[0],index[1],0.,1.);
  		vec4 fdata = texture2D(filter, vec2(rp[0],rp[1]));  	
  					
  			if (fdata[0]>= ( (pow(2.,numfilters)-1.) / 256.) && numfilters != 0. ){  
  				// data are selected						
				col = vec4(1., 0. , 0., 0.);
			} else if (fdata[2]>0.){
				// data are out of the window
  				col = vec4(0., 0. , 1., 0.);
  		
  			} else if (fdata[1]>0.|| numfilters == 0.) {  
  				// data are unselected	     		   					
				col = vec4(0., 1. , 0., 0.);  			
  			} else {
  				//col = vec4(1., 0. , 0., 0.);
  			}
  				
  				  			
	
		
	}
</script>
    
<script id="linearhist_fShader" type="x-shader/x-fragment">
      precision mediump float;  
	  varying vec4 col; 
 	 
      void main() {
	 			
		gl_FragColor = col;
      }
</script>
