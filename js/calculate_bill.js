function calculate_bill(cat, c_date, p_date, c_reading, p_reading, forecast){

	/* slot - number of smallest blocks (for example from 31-90 in religious category there are two 30 blocks) within the relavant block 
	 * ec - energy charge
	 * fc - fixed cost
	 * fac - fuel adjustment charge
	 */

	var charges = new Object();
	charges.nou = 0;
	charges.nod = 0;
	charges.uc = 0;
	charges.fac = 0;
    	charges.fc = 0;
        		
    	charges.nod = (c_date - p_date)/(24*60*60*1000);
	charges.nou = c_reading - p_reading;
	
	if(forecast){
		charges.nou = get_forecast_nou(p_date, c_date, charges.nou, charges.nod);
	}

	var data = new Array(); // to hold values for blocks
			
	if(cat == "domestic"){
		if(charges.nou < charges.nod * 2){ // below 60 units
			data.push({slot:1, ec : 3.00, fc : 30, fac : 0.25}); // 0-30
			data.push({slot:1, ec : 4.70, fc : 60, fac : 0.35}); // 31-60
		}
		else{ // above 60 units
			data.push({slot:2, ec : 10.00, fc : 0, fac : 0}); // 0-60
			data.push({slot:1, ec : 12.00, fc : 90, fac : 0.10}); // 61-90
			data.push({slot:1, ec : 26.50, fc : 315, fac : 0.40}); // 91-120
			data.push({slot:2, ec : 30.50, fc : 315, fac : 0.40}); // 121-180
			data.push({slot:1, ec : 42.00, fc : 420, fac : 0.40}); // above 180
		}

        }
        else{ // religious
		data.push({slot : 1, ec: 1.90, fc : 30, fac : 0}); // 0-30
		data.push({slot : 2, ec: 2.80, fc : 60, fac : 0}); // 31-90
  		data.push({slot : 1, ec: 6.75, fc : 180, fac : 0}); // 91-120
  		data.push({slot : 2, ec: 7.50, fc : 180, fac : 0}); // 121-180
  		data.push({slot : 1, ec: 9.40, fc : 240, fac : 0}); // above 180
	}
        
  	var temp = Math.floor(charges.nou/charges.nod);
	var nou_temp = charges.nou;
	var increment = 0; // to hold the value for usage charge for the block
  	
  	for(var i = 0; i < data.length; i++){
		if(data[i].slot * charges.nod < nou_temp){
			increment = data[i].slot * charges.nod * data[i].ec;
      			charges.uc += increment;
			feed_analyse(charges.nou, nou_temp, increment, data[i].ec);
      			nou_temp = nou_temp - data[i].slot * charges.nod;
    		}else{
			increment = nou_temp * data[i].ec;
      			charges.uc += increment;
			charges.fac = charges.uc * data[i].fac;
      			charges.fc = data[i].fc;
			feed_analyse(charges.nou, nou_temp, increment, data[i].ec);
      			nou_temp = 0;
      			break;
    		}
    
  	}
  
  	if(nou_temp != 0){
		increment = nou_temp * data[data.length - 1].ec;
    		charges.uc += increment;
		charges.fac = data[data.length-1].fac;
    		charges.fc = data[data.length-1].fc;
		feed_analyse(charges.nou, nou_temp, increment, data[data.length-1].ec);
  	}
  
	charges.tot = charges.uc + charges.fac + charges.fc;
	return charges;

}

// add data to analyse
function feed_analyse(nou, nou_temp, uc_block, unit_charge){
	unit_block = new Object();
	unit_block.start = nou-nou_temp;
	unit_block.charges = uc_block;
	unit_block.unit_cost = unit_charge;
	analysis.push(unit_block);
}

// return forcast no. of units
function get_forecast_nou(p_date, c_date, nou, nod){
	var now = new Date();
	var average_consumption = nou/((now-p_date)/(24*60*60*1000));
	var forecast_nou = (c_date-p_date)/(24*60*60*1000)*average_consumption;
	return Math.ceil(forecast_nou);
}	
