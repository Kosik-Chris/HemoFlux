/**
 * Function accepts array of characters (string) from the x64 BLE broadcast and returns the decimal
 * result that was broadcasted
 */

//function returns base64 dec value
export function getDecFrom64(cArray) {
  //console.log(cArray);
  let cArrlngth = cArray.length;
  let newArr = cArray.split("=");
  //console.log(newArr[0]);
  let decResult = 0;
  let j = 0;

  
  for(var i = 0; i< newArr[0].length; i++){
    let temp = getSingleDecFrom64(newArr[0][i]);
    let power = Math.pow(64,(newArr[0].length-i));
    decResult = (decResult +(temp*power));
  }

  decResult = decResult/256/4;


  return decResult;
}

function getSingleDecFrom64(c) {
  let result;
  switch (c) {
    //ascii 0
    case '0':
      result = 52;
      break;
    //ascii 1
    case '1':
      result = 53;
      break;
    //ascii 2
    case '2':
      result = 54;
      break;
    //ascii 3
    case '3':
      result = 55;
      break;
    //ascii 4
    case '4':
      result = 56;
      break;
    //ascii 5
    case '5':
      result = 57;
      break;
    //ascii 6
    case '6':
      result = 58;
      break;
    //ascii 7
    case '7':
      result = 59;
      break;
    //ascii 8
    case '8':
      result = 60;
      break;
    //ascii 9
    case '9':
      result = 61;
      break;
    //ascii 65-90 = A-Z
    //ascii A
    case 'A':
      result = 0;
      break;
    //ascii B
    case 'B':
      result = 1;
      break;
    //ascii C
    case 'C':
      result = 2;
      break;
    //ascii D
    case 'D':
      result = 3;
      break;
    //ascii E
    case 'E':
      result = 4;
      break;
    //ascii F
    case 'F':
      result = 5;
      break;
    //ascii G
    case 'G':
      result = 6;
      break;
    //ascii H
    case 'H':
      result = 7;
      break;
    //ascii I
    case 'I':
      result = 8;
      break;
    //ascii J
    case 'J':
      result = 9;
      break;
    //ascii K
    case 'K':
      result = 10;
      break;
    //ascii L
    case 'L':
      result = 11;
      break;
    //ascii M
    case 'M':
      result = 12;
      break;
    //ascii N
    case 'N':
      result = 13;
      break;
    //ascii O
    case 'O':
      result = 14;
      break;
    //ascii P
    case 'P':
      result = 15;
      break;
    //ascii Q
    case 'Q':
      result = 16;
      break;
    //ascii R
    case 'R':
      result = 17;
      break;
    //ascii S
    case 'S':
      result = 18;
      break;
    //ascii T
    case 'T':
      result = 19;
      break;
    //ascii U
    case 'U':
      result = 20;
      break;
    //ascii V
    case 'V':
      result = 21;
      break;
    //ascii W
    case 'W':
      result = 22;
      break;
    //ascii X
    case 'X':
      result = 23;
      break;
    //ascii Y
    case 'Y':
      result = 24;
      break;
    //ascii Z
    case 'Z':
      result = 25;
      break;
    //ascii a-z, 97-122
    //ascii a
    case 'a':
      result = 26;
      break;
    //ascii b
    case 'b':
      result = 27;
      break;
    //ascii c
    case 'c':
      result = 28;
      break;
    //ascii d
    case 'd':
      result = 29;
      break;
    //ascii e
    case 'e':
      result = 30;
      break;
    //ascii f
    case 'f':
      result = 31;
      break;
    //ascii g
    case 'g':
      result = 32;
      break;
    //ascii h
    case 'h':
      result = 33;
      break;
    //ascii i
    case 'i':
      result = 34;
      break;
    //ascii j
    case 'j':
      result = 35;
      break;
    //ascii k
    case 'k':
      result = 36;
      break;
    //ascii l
    case 'l':
      result = 37;
      break;
    //ascii m
    case 'm':
      result = 38;
      break;
    //ascii n
    case 'n':
      result = 39;
      break;
    //ascii o
    case 'o':
      result = 40;
      break;
    //ascii p
    case 'p':
      result = 41;
      break;
    //ascii q
    case 'q':
      result = 42;
      break;
    //ascii r
    case 'r':
      result = 43;
      break;
    //ascii s
    case 's':
      result = 44;
      break;
    //ascii t
    case 't':
      result = 45;
      break;
    //ascii u
    case 'u':
      result = 46;
      break;
    //ascii v
    case 'v':
      result = 47;
      break;
    //ascii w
    case 'w':
      result = 48;
      break;
    //ascii x
    case 'x':
      result = 49;
      break;
    //ascii y
    case 'y':
      result = 50;
      break;
    //ascii z
    case 'z':
      result = 51;
      break;
    //ascii +
    case '+':
      result = 62;
      break;
    //ascii /
    case '/':
      result = 63;
      break;
  }
  return result;
}
