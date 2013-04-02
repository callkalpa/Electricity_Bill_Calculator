function calculate_bill(cat, c_date, p_date, c_reading, p_reading, forecast){
	if(cat == "domestic"){
        	var d_units = new Array(1,2,3,4,5,6,7); // domestic units with 30 blocks
		var d_charges = new Array(3, 4.7, 7.5, 21, 24, 24, 36); // charges for each block
		var d_charges_new = new Array(5, 6, 8.5, 15, 20, 24, 26, 26, 26, 32); // new charges for each block
		var d_fc = new Array(30, 60, 90, 315);
		var d_fac = new Array(0.25, 0.35, 0.40);        		
        }
        else{ // religious
		var d_units = new Array(1,2,3,4,5,6,7); // religious units with 30 blocks
		var d_charges = new Array(1.90, 2.80, 2.80, 6.75, 7.50, 7.50, 9.40); // charges for each block
		var d_charges_new = new Array(1.90, 2.50, 2.50, 3.50, 5, 5, 7); // charges for each block
		var d_fc = new Array(30, 60, 60, 180, 180, 180, 240);
		var d_fac = new Array(0);        		
        }

		var nou = 0;
		var nod = 0;
		var uc = 0;
	    	var fac = 0;
    	    	var fc = 0;
        		
	        // calculate and show the summary
    	    	nod = (c_date - p_date)/(24*60*60*1000);
		nou = c_reading - p_reading;
				
				
		if(forecast){
			nou = get_forecast_nou(p_date, c_date, nou, nod);
		}
    		
        		
				// uc calculation
				var nou_temp = nou;
				var i = 1;
				while(nou_temp>0){
				
					// for analysis
					unit_block = new Object();
					unit_block.start = nou-nou_temp;
					unit_block.charges = uc;
					unit_block.unit_cost = d_charges[i-1];
					analysis.push(unit_block);
									
					if(i == d_charges.length){
						uc += nou_temp * d_charges[i-1];
						break;
					}
						
					if(nou_temp >= nod){
						uc += nod*d_charges[i-1];
						nou_temp -= nod;
					}
					else{
						uc += nou_temp * d_charges[i-1];
						break;
					}
						
					i++;
				}

				// 2013 revision us calculation
				var new_uc = 0;
				var k = 0;
				for (k=0; k< d_charges_new.length; k++){
					if(nou <= ((k+1) * nod)){
						new_uc = nou * d_charges_new[k];
						break;
					}
				}
				if(nou>(d_charges_new.length*nod)){
					new_uc = nou * d_charges_new[d_charges_new.length-1];
				}

				// fac calculation
				for(var i=0; i<d_fac.length; i++){
					if(nou<=(nod*d_units[i])){
						fac = uc * d_fac[i];
						new_fac = new_uc * d_fac[i];
						break;
					}
					if(i == d_fac.length-1){
						fac = uc * d_fac[d_fac.length-1];
						new_fac = new_uc * d_fac[d_fac.length-1];
					}
				}
					
				// fc calculation
				for(var i=0; i<d_fc.length; i++){
					if(nou<=(nod*d_units[i])){
						fc = d_fc[i];
						break;
					}
					if(i == d_fc.length-1){
						fc = d_fc[d_fc.length-1];
					}
				}

				charges = new Object();
				charges.nod = nod;
				charges.nou = nou;
				charges.uc = uc;
				charges.fac = fac;
				charges.new_fac = new_fac;
				charges.fc = fc;	
				charges.new_fc = fc;	
				charges.tc = uc + fac + fc;
				charges.new_uc = new_uc;
				charges.new_tc = new_uc + new_fac + fc;
				return charges;
}

		// return forcast no. of units
		function get_forecast_nou(p_date, c_date, nou, nod){
			var now = new Date();
			var average_consumption = nou/((now-p_date)/(24*60*60*1000));
			var forecast_nou = (c_date-p_date)/(24*60*60*1000)*average_consumption;
			return Math.ceil(forecast_nou);
		}	
