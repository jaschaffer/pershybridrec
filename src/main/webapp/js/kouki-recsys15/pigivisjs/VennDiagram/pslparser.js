/*
*
*  Parser for PSL output to D3 Venn Diagrams
*  @johnodonovan
*  May 3 2018
*/
//var test="test";
//var obj = jQuery.parseJSON( '{ "name": "John" }' );
//alert( obj.name === "John" );

//var text = '{ "name":"John", "age":"39", "city":"New York"}';
//var data = jQuery.parseJSON('{"name":"Interpol","children":[{"name":"People who listen to this artist also listen","children":[{"name":"The National"},{"name":"Radiohead"},{"name":"Guns and Roses"}]},{"name":"Popular artist","children":[{"name":"RadioHead"},{"name":"The Beatles"},{"name":"Queen"},{"name":"The Pogues"}]},{"name":"Similar to the artists","children":[{"name":"The National"},{"name":"Radiohead"},{"name":"Metallica"},{"name":"The Pogues"},{"name":"Nine Inch Nails"}]}]}');

function renderVenn(data,container) {

	//	Nice function for dynamically drawing objects to an SVG
	function makeTextSVG(tag, attrs, body) {
        var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        el.innerHTML = body;
        return el;
    }
	
	
	// iterate over the tree and get the child nodes
	function getNodeByName(name, node){
	    var reduce = [].reduce;
	    function runner(result, node){
	        if(result || !node) return result;
	        return node.name === name && node || //is this the proper node?
	            runner(null, node.children) || //process this nodes children
	            reduce.call(Object(node), runner, result);  //maybe this is some ArrayLike Structure
	    }
	    return runner(null, node);
	}
	
	
	var d = ["pop","cf","co","pop+cf","pop+co","cf+co","cf+co+pop"];
	
	//var target = getNodeByName("Popular artist", data);
	var cf = data.children[0]
	var pop = data.children[1]
	var co = data.children[2]
//	
//	cf.children.push( {name:data.name} );
//	co.children.push( {name:data.name} );
//	pop.children.push( {name:data.name} );
//	
	var center = getCenterOverlap(cf, pop, co);
	//alert("center is: " + center);
	
	var cocf = getOverlap(cf, co);
	var popco = getOverlap(pop, co);
	var popcf = getOverlap(cf, pop);
	
	function getOverlap(a,b){
	
	var overlap = "";
	for (var i = 0; i < a.children.length; i++) {
	    if(a.children[i].name.toLowerCase().trim() !=center.toLowerCase().trim()){   //don't want center artist 
	            for (var j = 0; j < b.children.length; j++) {
	                //alert("a: " + a.children[i].name + "b: " + b.children[j].name);
	              if(a.children[i].name.toLowerCase().trim()==b.children[j].name.toLowerCase().trim()){
	                overlap = overlap + ", " + a.children[i].name;
	                }
	            }
	           // alert("child name is: " + tableChild.children[0].name);
	        }
	//alert("overlap is: " + overlap );
	    }
	return overlap.substring(2, overlap.length);
	
	
	}
	
	
	
	function getCenterOverlap(a,b,c){
		
		var overlap = "";
		for (var i = 0; i < a.children.length; i++){
		            for (var j = 0; j < b.children.length; j++) {
		                for (var k = 0; k < c.children.length; k++) {
		                        //alert("a: " + a.children[i].name + ", b: " + b.children[j].name + ", c: " + c.children[k].name);
		                      if(a.children[i].name.toLowerCase().trim()==b.children[j].name.toLowerCase().trim() && b.children[j].name.toLowerCase().trim()==c.children[k].name.toLowerCase().trim()){
		                        overlap = overlap + ", " + a.children[i].name;
		                        }
		                    }    
		            }
		
		}
		
	//	if ( overlap != "" )
	//		overlap += ",";
	//	overlap += data.name;
	//	
	//	console.log("overlap: " + overlap);
		return overlap.substring(2, overlap.length);
		
		
	}
	
	function stringify(init,a){
	    var s = init + "\n";
	    for(var i = 0; i<a.children.length; i++){
	        if(!isOverlap(a.children[i].name)){
	        s = s + a.children[i].name + ","
	        }
	    }
	    return s.substring(0, s.length-1);
	}
	
	
	function isOverlap(a){
	    if(a.toLowerCase()==center.toLowerCase())
	        return true;
	    if(a.toLowerCase()==cocf.toLowerCase())
	        return true;
	    if(a.toLowerCase()==popco.toLowerCase())
	        return true;
	    if(a.toLowerCase()==popcf.toLowerCase())
	        return true;
	}
	
	var popular = " ";
	var friend = "  ";
	var profile = "   ";
	
	var centerString = data.name;
	if (center != "")
		centerString += ", ";
	
	
	var sets = [
	    {sets:[popular], size: 12, label: stringify("",pop)},
	    {sets:[friend], size: 12, label:  stringify("",cf)},
	    {sets:[profile], size: 12, label: stringify("",co)},
	    {sets: [popular, friend], size: 4, label: popcf},
	    {sets: [popular, profile], size: 4, label: popco, },
	    {sets: [friend, profile], size: 4, label: cocf},
	    {sets: [popular, friend, profile], size: 2, label: centerString + center }
    ];
	
	
	function getSets() {
	    return this.sets;
	}

	var chart = venn.VennDiagram()
	chart.wrap(false) 
	.width(640)
	.height(640);
	
	$("#" + container ).empty();
	$("#" + container ).attr({
		width:1200,
		height:640
	});
	
	var div = d3.select("#" + container).datum(sets).call(chart);
	div.selectAll("text").style("fill", "white");
	div.selectAll(".venn-circle path").style("fill-opacity", .6);
	
	var cotext = makeTextSVG('text', {x: 600, y: 80, 'font-family': 'sans-serif', 'text-anchor':'middle', fill:'black','font-weight':'bold'}, data.children[0].name );
    document.getElementById(container).appendChild(cotext);
    
    var poptext1 = makeTextSVG('text', {x: 335, y: 550, 'font-family': 'sans-serif', 'text-anchor':'middle',fill: 'black','font-weight':'bold'}, data.children[1].name );
    document.getElementById(container).appendChild(poptext1);
    
    var cftext = makeTextSVG('text', {x: 865, y: 550, 'font-family': 'sans-serif', 'text-anchor':'middle', fill: 'black', 'font-weight':'bold'}, data.children[2].name);
    document.getElementById(container).appendChild(cftext);
	
//	var d = document.getElementById('colabel');
//	d.style.position = "absolute";
//	d.style.left = 230+'px';
//	d.style.top = 90+'px';
//	var p = document.getElementById('poplabel');
//	p.style.position = "absolute";
//	p.style.left = 100+'px';
//	p.style.top = 500+'px';
//	var c = document.getElementById('cflabel');
//	c.style.position = "absolute";
//	c.style.left = 320+'px';
//	c.style.top = 500+'px';

}
