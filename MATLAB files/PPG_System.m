clear;
close all;
clc;

global coefficient;

coefficient = 1.716*2/3;

s = serialport("COM30",38400);

T = collectData(s,750000);

% save('T4.mat','T')

function res = collectData(s, dats)

    buffSize = 500;

    flush(s)
    PPGBuff = zeros(buffSize,3);
    
    timBuff = ones(1,100)*50;

    IBuff = zeros(1,500);
    GBuff = zeros(1,500);
    
    val = tic;
    pause(1)
    num = tic;
    sec = (num-val);
    spo2cnt = -12;
    tic
    totalPPG = [0 0 0];
    
    counter = 1;
    for j = 1:dats
        
      

      str = "";
      entry = 1;
      while entry    
        data = read(s,1,"char");
        if (data == char(13))
            entry = 0;
        else
            str = str + data;
        end
      end
      new = strsplit(str,' ');
      if size(new,2)==3
          IR = str2double(strtrim(new(1)));
          Red = str2double(strtrim(new(2)));
          Green = str2double(strtrim(new(3)));
          tim = tic;
          totalPPG(counter,:)=[IR Red Green];
          freq = (double(sec)/double(tim - num));
          num = tic;
          counter = counter+1;
      else
      end
      PPGBuff = [PPGBuff(2:end,:);totalPPG(counter-1,:)];
      timBuff = [timBuff(2:end) freq];
      mean(timBuff);
      if mod(j,25) == 0 && j > buffSize
          [RG,RI,hr] = maxim_heart_rate_and_oxygen_saturation(PPGBuff(:,1),size(PPGBuff,1),PPGBuff(:,2),PPGBuff(:,3));
          IBuff = [IBuff(2:end) RI];
          GBuff = [GBuff(2:end) RG];
          hr
          spo2cnt = spo2cnt + 1
      end
      

    end

    res = totalPPG;
end
