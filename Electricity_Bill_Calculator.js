    $(function() {
    	// set date format
        $("#previous_date, #current_date").datepicker({ dateFormat: "yy-mm-dd" });
        
        // hide panes at startup
       	hide_panes();
       	
        // analysis object to be used in detailed view
		analysis = new Array();
		analysis_limits = new Array();
		
		// forecasting parameter
		var forecast = false;
	
		// hide results at change to any field
/*		$("#previous_date,#previous_reading,#current_date,#current_reading,#forecast").keydown(function(){
			hide_panes();
		});
*/
		$("#category, #previous_date,#previous_reading,#current_date,#current_reading,#forecast").change(function(){
			hide_panes();
		});
		
        $("#calculate").click(function(){
			hide_panes();
        
        	// assign to variables
        	var cat = $("#category").val();
        	var p_date = parseInt($("#previous_date").val());
        	var p_reading = $("#previous_reading").val();
        	var c_date = $("#current_date").val();
        	var c_reading = parseInt($("#current_reading").val());
        	var c_date_label = $("#current_date_label").html();

			var errors = "";
        	
        	// check for empty dates
        	if(p_date == ""){
        		errors += error("Previous metering date is empty", new Array("#previous_date"));
        	}
        	if(c_date == ""){
        		errors += error(c_date_label.substring(0, c_date_label.length-1) + " is empty", new Array("#current_date"));
        	}
        	
        	// check for numeric inputs of the readings
			if(isNaN(p_reading /1 ) == true || p_reading == "") {
    			errors += error("Previous meter reading should be a number", new Array("#previous_reading"));
			}
			if(isNaN(c_reading /1 ) == true || c_reading == ""){
			    errors += error("Current meter reading should be a number", new Array("#current_reading"));
			}

        	// check for current date less than previous date
			p_date = $("#previous_date").datepicker("getDate");
        	c_date = $("#current_date").datepicker("getDate");
        	if(p_date>=c_date){
        		errors += error("Current date should be later than the previous date", new Array("#previous_date","#current_date"));
        	}
        	
        	// check for current meter reading less than previous meter reading
        	if(p_reading > c_reading){
        		errors += error("Current meter reading is less than the previous meter reading", new Array("#previous_reading", "#current_reading"));
        	}
        	
			if(errors != ""){ // if there are errors
				$("#error-desc").html("<ul>" + errors + "</ul>");
				$("#error").slideDown("slow", function(){});
				return;        	
        	}
        	else{
        		
        		var charges_temp = calculate_bill(cat, c_date, p_date, c_reading, p_reading, forecast);
        		
        		$("#nod").html(charges_temp.nod);
	        	$("#nou").html(addCommas(charges_temp.nou));
	        	$("#uc").html(addCommas(charges_temp.uc.toFixed(2)));
	        	$("#fac").html(addCommas(charges_temp.fac.toFixed(2)));
	        	$("#fc").html(addCommas(charges_temp.fc.toFixed(2)));
	        	$("#tc").html("<b>" + addCommas(charges_temp.tc.toFixed(2)) + "</b>");
    			$("#summary").slideDown("slow", function(){});
    			analysis_limits.push(charges_temp.nou)
    			analysis_limits.push(charges_temp.uc);
    		}
       	});

		$("#reset").click(function(){
			// reset and hide results
			$("#category").val("Domestic");
			$("#previous_date").val("");
			$("#previous_reading").val("");
			$("#current_date").val("");
			$("#current_reading").val("");
			$("#forecast").attr("checked", false);
			hide_panes();
		});
       
		function error(error_msg, element){
			for(var i=0; i<element.length; i++){
				$(element[i]).css("background-color", "#FF3030");
			}
			return "<li>" + error_msg + "</li>";
		}
		
		function hide_panes(){
			$("#summary").hide();
        	$("#detailed").hide();
        	$("#error").hide();
        	
        	// clear errors
        	var elements = new Array("#previous_date", "#current_date", "#previous_reading", "#current_reading");
        	for(var i=0; i<elements.length; i++){
        		$(elements[i]).css("background-color", "#FFFFFF");
        	}
        	
        	// initialize variables
        	nou = 0;
			nod = 0;
			uc = 0;
        	fac = 0;
        	fc = 0;
        	analysis = new Array();
        	analysis_limits = new Array();
		}
		
		// thousand separator
		function addCommas(n){
    		var rx=  /(\d+)(\d{3})/;
		    return String(n).replace(/\d+/, function(w){
	        	while(rx.test(w)){
    	        	w= w.replace(rx, '$1,$2');
        		}
        		return w;
    		});
		}

		$("#forecast").change(function(){
			check_forecast();
		});
		
		$("#forecase").ready(function(){
			check_forecast();
		});
		
		// change metering date value based on check box status
		function check_forecast(){
			if($("#forecast").attr("checked")){
				forecast = true;
				$("#current_date_label").html("Expected metering date:");
				$("#summary-title").html("FORECASTED ELECTRICITY BILL CALCULATION");
			}
			else{
				forecast = false;
				$("#current_date_label").html("Current metering date:");
				$("#summary-title").html("ELECTRICITY BILL CALCULATION");
			}
		}

		
		$("#analyse").click(function(){
			var ana = "<tr><td align=center><b>UNIT BLOCK</b></td><td align=center><b>UNIT CHARGE</b></td><td align=center><b>TOTAL UNIT BLOCK CHARGE</b></td></tr>";
			var unit = "";
			var charges = 0;
			var unit_upper = 0;
			var charges_lower = 0;
			var charges_chart = new Array();
			var max_charge = 0;
			
			for(var i=0; i< analysis.length; i++){
				if(i == (analysis.length-1)){
					unit_upper = analysis_limits[0];
					charges_upper = analysis_limits[1];
				}else{
					unit_upper = analysis[i+1].start;
					charges_upper = analysis[i+1].charges;
				}
				unit = (analysis[i].start+1) + " - " + unit_upper;
				charges = charges_upper - analysis[i].charges;
				charges_chart.push(charges);
				if(charges>max_charge){
					max_charge = charges;
				}
				ana += "<tr><td align=center>" + unit + "</td><td align=center>" + analysis[i].unit_cost.toFixed(2) + "</td><td><div style=width:0; align=left id=c_chart_" + i + ">"  + addCommas(charges.toFixed(2)) + "</div></td></tr>";
			}
			$("#detailed-des").html("<table width=100%>" + ana + "</table>");
			$("#detailed").slideDown("slow", function(){
				
				for(var i=0; i<charges_chart.length; i++){
					$("#c_chart_" + i).animate({
						backgroundColor: "#FF5721",
						width: (charges_chart[i]/max_charge)*100 + "%",
//						textAlign: ,
						color: "#000000"
					}, 1000);
				}
			});
		});
    });