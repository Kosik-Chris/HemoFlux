% function [n_g_ratio_average,n_i_ratio_average,pn_heart_rate] = maxim_heart_rate_and_oxygen_saturation(pun_ir_buffer, n_ir_buffer_length,pun_red_buffer,pun_green_buffer)
function [pn_spo2,pn_heart_rate] = maxim_heart_rate_and_oxygen_saturation(pun_ir_buffer, n_ir_buffer_length,pun_red_buffer,pun_green_buffer)

%{
    * \brief        Calculate the heart rate and SpO2 level
    * \par          Details
    *               By detecting  peaks of PPG cycle and corresponding AC/DC of red/infra-red signal, the an_ratio for the SPO2 is computed.
    *               Since this algorithm is aiming for Arm M0/M3. formaula for SPO2 did not achieve the accuracy due to register overflow.
    *               Thus, accurate SPO2 is precalculated and save longo uch_spo2_table() per each an_ratio.
    *
    * \param(in)    *pun_ir_buffer           - IR sensor data buffer
    * \param(in)    n_ir_buffer_length      - IR sensor data buffer length
    * \param(in)    *pun_red_buffer          - Red sensor data buffer
    * \param(out)    *pn_spo2                - Calculated SpO2 value
    * \param(out)    *pch_spo2_valid         - 1 if the calculated SpO2 value is valid
    * \param(out)    *pn_heart_rate          - Calculated heart rate value
    * \param(out)    *pch_hr_valid           - 1 if the calculated heart rate value is valid
    %}

    % calculates DC mean and subtract DC from ir
    FreqS = 25;
    un_ir_mean =0; 
    BUFFER_SIZE = n_ir_buffer_length;
    for k=1:n_ir_buffer_length
        un_ir_mean = un_ir_mean + pun_ir_buffer(k);
    end
    un_ir_mean = un_ir_mean/n_ir_buffer_length ;

    % remove DC and invert signal so that we can use peak detector as valley detector
    for k=1:n_ir_buffer_length  
        an_i(k) = (pun_ir_buffer(k) - un_ir_mean) ; 
    end
    % 4 pt Moving Average
    for k=1:BUFFER_SIZE-4
        an_i(k)=( an_i(k)+an_i(k+1)+ an_i(k+2)+ an_i(k+3))/4;        
    end
      
    peak_loc = [0 0];
    cnt = 2;
    rise = 1;
    for i = 2:BUFFER_SIZE
        if (rise && (an_i(i)<an_i(i-1))) % Peak
            peak_loc(1,cnt) = i-1;
            cnt= cnt+1;
            rise = 0;
        end

        if (an_i(i)>an_i(i-1) && i-peak_loc(1,cnt-1) > 10) % Through
          rise = 1;
        end
    end
    peak_loc(1) = [];
    peak_loc(1) = [];
    
    pn_heart_rate = ((size(peak_loc,2)-1)*FreqS*60)/(peak_loc(end)-peak_loc(1));
    %  load raw value again for SPO2 calculation : Green(=g), RED(=r) and IR(=i)

    an_i =  pun_ir_buffer ; 
    an_g =  pun_green_buffer ; 
    an_r =  pun_red_buffer ; 

    % find precise min near an_ir_valley_locs
    n_exact_ir_valley_locs_count =size(peak_loc,2); 

    %using exact_ir_valley_locs , find ir-red DC and ir-red AC for SPO2 calibration an_ratio
    %finding AC/DC maximum of raw
    
    an_ir_valley_locs = peak_loc;
    
    n_ratio_average =0; 
    n_i_ratio_count = 1; 
    
    % find max between two valley locations 
    % and use an_ratio betwen AC compoent of Ir & Red and DC compoent of Ir & Red for SPO2 
    for k = 1: n_exact_ir_valley_locs_count-1
        n_r_dc_max= -16777216 ; 
        n_g_dc_max= -16777216;
        n_i_dc_max= -16777216;
        n_r_dc_min= 16777216 ; 
        n_g_dc_min= 16777216;
        n_i_dc_min= 16777216;
        if (an_ir_valley_locs(k+1)-an_ir_valley_locs(k) >5)
            for i= an_ir_valley_locs(k):an_ir_valley_locs(k+1)
                if (an_i(i)> n_i_dc_max)
                    n_i_dc_max =an_i(i);
                end
                if (an_g(i)> n_g_dc_max)
                    n_g_dc_max =an_g(i);
                end
                if (an_r(i)> n_r_dc_max)
                    n_r_dc_max =an_r(i);
                end
                if (an_i(i)< n_i_dc_min)
                    n_i_dc_min =an_i(i);
                end
                if (an_g(i)< n_g_dc_min)
                    n_g_dc_min =an_g(i);
                end
                if (an_r(i)< n_r_dc_min)
                    n_r_dc_min =an_r(i);
                end
            end
            
            n_r_ac = n_r_dc_max- n_r_dc_min;
            n_g_ac = n_g_dc_max- n_g_dc_min;
            n_i_ac = n_i_dc_max- n_i_dc_min;
            n_r_dc = mean([n_r_dc_max n_r_dc_min]);
            n_g_dc = mean([n_g_dc_max n_g_dc_min]);
            n_i_dc = mean([n_i_dc_max n_i_dc_min]);
            
            n_nume = n_r_ac/n_r_dc;
            n_gdenom = n_g_ac/n_g_dc;
            
            n_nume = n_r_ac/n_r_dc;
            n_idenom = n_i_ac/n_i_dc;
            
            if (n_idenom>0  && n_gdenom>0  &&  n_nume ~= 0)
                an_g_ratio(n_i_ratio_count)= n_nume/n_gdenom;
                an_i_ratio(n_i_ratio_count)= n_nume/n_idenom;
%                 an_pindex(n_i_ratio_count)= n_nume;
                n_i_ratio_count = n_i_ratio_count+1;
            end
        end
    end
    
%     pindex = mean(an_pindex);
    
    % choose median value since PPG signal may varies from beat to beat
    [an_g_ratio idx] = sort(an_g_ratio);
    [an_i_ratio idx] = sort(an_i_ratio);
    
    n_middle_idx= floor(n_i_ratio_count/2);

    if (n_middle_idx >1)
        n_g_ratio_average =( an_g_ratio(n_middle_idx-1) +an_g_ratio(n_middle_idx))/2; % use median
        n_i_ratio_average =( an_i_ratio(n_middle_idx-1) +an_i_ratio(n_middle_idx))/2; % use median
    else
        n_g_ratio_average = an_g_ratio(n_middle_idx );
        n_i_ratio_average = an_i_ratio(n_middle_idx );
    end
    
    if ( n_i_ratio_average>.02 && n_i_ratio_average <1.84)
%         pn_spo2 = -45.060*n_g_ratio_average*n_g_ratio_average + 30.354*n_g_ratio_average + 94.845 ;
        pn_spo2 = -62.4*n_i_ratio_average + 124.7 ;
        pch_spo2_valid  = 1;
    
    else
        pn_spo2 =  -999 ; % do not use SPO2 since signal an_ratio is out of range
        pch_spo2_valid  = 0; 
    end
end

