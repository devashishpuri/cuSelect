	(function($) {
		var selected_options_result;
		var inputIsList = false;
		var allSelected = false;
		var outputOnlyOptions = false;
		$.fn.cuSelect = function(options){
				        //Options
				        //{Start
				        	var settings = $.extend({
				        		options      : {},
				        		onlyOptions  : false,
				        		stepGroups   : 5,
				        		stepOptions  : 15,
				        	}, options);
				        //End}

				        //Global Variables
				        var select_options;
				        var search_results = {};
				        var selected_options = {};
				        var selectedAll = false;
				        var nSelected = 0;
				        var objReference = this;
				        var inputIsArray = false;

				        //Convert To Standard Input
				        if (settings.options.constructor === Array) {
				        	var select_options = {};
				        	select_options['default_subgroup'] = {};
				        	inputIsArray = true;
				        	for( var i=0; i<settings.options.length; i++) {
				        		var key = settings.options[i];
				        		select_options['default_subgroup'][key] = 0;
				        	}
				        }
				        else {
				        	select_options = settings.options;
				        }

				        //Code to append DOM
				        $(this).append(""+
				        	"<button id='selectBox'>Select &nbsp;<b class='caret'></b></button>"+
				        	"<div id='suggestions'>"+
				        		"<span class='scrollTop'>&#8593;</span>"+
				        		"<div id='suggSearchCon'>"+
				        			"<input type='text' id='suggSearch'>"+
				        		"</div>"+
				        		"<div id='suggestionBox'>"+
				        			"<ul>"+
				        				"<li>"+
				        					"<input type='checkbox' id='selectAll'>Select All"+
				        				"</li>"+
				        			"</ul>"+
				        			"<ul id='optionGroupCon'>"+
				        			"</ul>"+
				        		"</div>"+
				        	"</div>"+
				        	"");

				        search_results = select_options;
					       //#######################################
					       //##### Generate Options Logic ##########
					       //#######################################


					       function appendOptions(start, end, uidObject, parent){
					       	str = '';
					       	count = 0;
					       	countOptions = 0;
					       	if(!inputIsArray){
						       	for(var value in uidObject)
						       	{
						       		if(count >= start && count < end){
						       			str += '<li class="optionGroup" id="'+value+'">'+value+'<ul>';

						       			for(subval in uidObject[value]){
						       				if((selected_options[value] && selected_options[value][subval]) || selectedAll)
						       					str += '<li><input type="checkbox" checked>'+ subval +'</li>';
						       				else
						       					str += '<li><input type="checkbox">'+ subval +'</li>';
						       			}
						       			str+= '</ul></li>';
						       		}
						       		count++;
						       	}
						    }
						    else{
						    	str += '<li class="optionGroup hidecuSelectGroup" id="default_subgroup">default_subgroup<ul>';
						    	for( var value in uidObject['default_subgroup']){
						    		if(countOptions >= start && countOptions < end){
						    			if((selected_options['default_subgroup'] && selected_options['default_subgroup'][value]) || selectedAll)
						    				str += '<li><input type="checkbox" checked>'+ value +'</li>';
						    			else
						    				str += '<li><input type="checkbox">'+ value +'</li>';
						    		}
						       		countOptions++;
						    	}
						    	str+= '</ul></li>';
						    }
					       	parent.append(str);
					       }
					       if(inputIsArray)
					       	appendOptions(0, settings.stepOptions, select_options, $(objReference).find('#optionGroupCon'));
					       else
					       	appendOptions(0, settings.stepGroups, select_options, $(objReference).find('#optionGroupCon'));

				    	//#######################################
				        //############ Serach Logic #############
				        //#######################################

				        function search(srchStr){
				        	var cuSelectResObj = {};
				        	for (var value in  select_options)
				        	{
				        		//var subacc = select_options[value];
				        		var gotResult = false;
				        		var matchedOption = {};
				        		var matchedOptionGroup = false;

				        		if(value.indexOf(srchStr)!=-1){
				        			matchedOptionGroup = true;
				        		}
				        		for(var subval in select_options[value])
				        		{
				        			if(matchedOptionGroup){
				        				//matchedOption.push(optionV);
				        				matchedOption[subval] = 0;
				        			}
				        			else if(subval.indexOf(srchStr)!=-1){
				        				matchedOption[subval] = 0;
				        				gotResult = true;
				        			}
				        		}
				        		if(gotResult || matchedOptionGroup){
				        			cuSelectResObj[value] = matchedOption;
				        		}
				        	}
				        	return cuSelectResObj;
				        }

				       //#######################################
				       //############# Events ##################
				       //#######################################

				       $(objReference).find('#selectBox').on('click', function(){
				       	$(objReference).find('#suggestions').fadeToggle(200);
				       });

				       //Input Event
				       var timeoutId = 0;
				       $(objReference).find('#suggSearch').on('input', function(){
				       	clearTimeout(timeoutId);
				       	timeoutId = setTimeout(function(){
				       		search_results = search($(objReference).find('#suggSearch').val().toUpperCase())
				       		$(objReference).find('#optionGroupCon').html('');
				       		appendOptions(0, 5, search_results, $(objReference).find('#optionGroupCon'));
				           //Reset Bounds
				           start = 0; end = 5; step = 5;
				       }, 500);
				       	return true;
				       });

				       //Event on checkboxes
				       $(objReference).find('#optionGroupCon').off('change')    //subaccCon -> optionGroupCon
				       $(objReference).find('#optionGroupCon').on('change', 'input:checkbox', function(){ 
				       	if($(this).is(':checked')){
				       		nSelected++;
				            	var key = $(this).closest('.optionGroup').attr('id');
				            	if(selected_options[key] === null || selected_options[key] === undefined || typeof selected_options[key] != 'object')
				            		selected_options[key] = {};
				            	selected_options[key][$(this).parent().text()] = 1;
				            updateCheckedElements(selected_options);
				        }
				        else{
				        	nSelected--;
				        	delete selected_options[$(this).closest('.optionGroup').attr('id')][$(this).parent().text()];
				        	updateCheckedElements(selected_options);
				        }
				    });
				       function updateCheckedElements(obj){
				         if(nSelected > 1){
				         	$(objReference).find('#selectBox').html(nSelected +' Selected <b class="caret"></b>');
				         }
				         else{
				         	var option = '';
				         	for (key in selected_options)
				         		for( val in selected_options[key])
				         			option = val;
				         	console.log(option);
				         	if(option)
				         		$(objReference).find('#selectBox').html( option +' <b class="caret"></b>');
				         	else
				         		$(objReference).find('#selectBox').html('Select <b class="caret"></b>');
				         } 
				     }
				       //Event on Select All
				       $(objReference).on('change', '#selectAll',function(){
				       	if($(this).is(':checked')){
				       		$(objReference).find('input:checkbox').prop('checked', true);
				       		$(objReference).find('#selectBox').html('All Selected <b class="caret"></b>');
				       		selectedAll = true;
				       	}
				       	else{
				       		$(objReference).find('input:checkbox').prop('checked', false);
				       		$(objReference).find('#selectBox').html('Select <b class="caret"></b>');
				       		selected_options = {};
				       		selectedAll = false;
				       	}
				       });

				       //Event on Scroll
				       var start = 0, end, step;
				       if(inputIsArray)
				       	step = settings.stepOptions;
				       else
				       	step = settings.stepGroups;
				       end = step;
				       $(objReference).find('#suggestions').scroll(function(){
				       	if($(this).scrollTop() >= ($(objReference).find('#suggestionBox').height()-$(objReference).find('#suggSearch').outerHeight())-158){
				       		start = end;
				       		end = end+step;
				       		//console.log('Bounds', start, end, step);
				       		appendOptions(start, end, search_results, $(objReference).find('#optionGroupCon'));
				       	}
				       });

				       
				       $(objReference).on('click', '.scrollTop', function(){
				       	$(this).parent().scrollTop(0);
				       });

				    	//Function To Return Desired Data
				        //{Start
				        	$(objReference).on('cuSelectGet', this, function(){
				        		if(selectedAll) {
				        			allSelected = true;
				        			return;
				        		}
				        		else{
				        			allSelected = false;
				        		}
				        		outputOnlyOptions = settings.onlyOptions;
				        		selected_options_result = selected_options;
				        		inputIsList = inputIsArray;
				        	});
				        //End}
				    }
			    $.fn.cuSelectGet = function(){
			    	$(this).trigger('cuSelectGet');
			    	if(allSelected) {
			    		return 'ALL';
			    	}
			    	if(inputIsList) {
			    		var arr = [];
			    		for( key in selected_options_result['default_subgroup']) {
			    			arr.push(key);
			    		}
			    		return arr;
			    	}
			    	else{
			    		if(outputOnlyOptions){
			    			var arr = [];
			    			for(var value in selected_options_result){
			    				for( var subval in selected_options_result[value]){
			    					arr.push(subval);
			    				}
			    			}
			    			return arr;
			    		}
			    	}
			    	return selected_options_result;
			    }
			}(jQuery));