////////// TO-DO
/*
1.- Build the logic
Booklet
Needs to keep track of how many countries have been added from all the pages
Contains all the pages

Keycodes
Insert code to get country
number display
numpad itself
success message
failure message

Pages
Contain stickers/stamps/whatever
At least 3 color scheemes
Drawing..?

Stamps
One for each country
put in keycode -> select where to put it (confirm message) -> flashy stuff?

OPTIONAL
Pen
Loading screen
Rearranging stickers

*/

////////// VARIABLES

var gameState = 0; //


// Testing
let b1;

// Title Screen
var startButton;
var creditsButton;
var instructionsButton;

var currentGuess;

var mouseIsClicked = false;

var thePassport;
var stampPagesStart = 3; //start counting from 0

//assets

var countries = []; //import of the csv file
var stampImages = []; //images for the stamps
var stamps = []; //array of the actual stamp objects
var cover_img;
var page_img;

//tentative/to-do
var button_img;
var rahaLogo;
var Pali_img;
var map_img;

////////// TOOL FUNCTIONS

function collision(x,y,width,height, MODE) {
  var w = width/2;
  var h = height/2;

  if(MODE == CENTER) {
    w = width/2;
    h = height/2;
  } else if (MODE == CORNER) {
    w = width;
    h = height;
  }

  if (mouseX < x+w && mouseX > x-w && mouseY < y+h && mouseY > y-h) {
    return true;
  }
  return false;
}

function matchCountry(n) {
  var found = countries.findRow(n, 'NUMBER');
  if (found) {
    return found.get('COUNTRY');
  } 
  return false;
}

//adds number at the end of currentGuess string
function addNum(n) {
  if(currentGuess) {
    console.log("hi");
    let arr = [currentGuess, n];
    let separator = '';
    currentGuess = join(arr, separator);
  } else {
    currentGuess = str(n);
  }
}

function deleteNum() {
  if (currentGuess != null && currentGuess.length() > 0) {
    currentGuess = currentGuess.substring(0, str.length() - 1);
 }
}

function removeNum() {
  currentGuess = currentGuess.slice(0,-1);
}

////////// CLASSES

class Button {
  constructor(x,y,w,h,c,MODE) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.w = w;
    this.h = h;
    this.mode = MODE;
    this.display_c = c;
    this.selected_c = c - 100;
  }

   selected() {
    if (collision(this.x, this.y, this.w, this.h,this.mode)) {
      return true;
    }
    return false;
   }

   pressed() {
    if(this.selected() && mouseIsClicked) {
      this.display_c = this.selected_c;
      return true;
    }
    return false;
   }

   display() {
      push();
      fill(this.display_c);
      rectMode(this.mode);
      rect(this.x,this.y,this.w,this.h);
      this.display_c = this.c;
      pop();
   }
}

class TextButton extends Button {
  constructor (x, y, c, txt, txt_c, txt_s) {
    super(x,y);
    this.c = c;
    this.mode = CENTER;
    this.display_c = this.c;
    this.selected_c = this.c - 100;
    this.txt = txt;
    this.txt_c = txt_c;
    this.txt_s = txt_s;
    textSize(txt_s);
    this.x_margin = textWidth(txt) / 20;
    this.w = textWidth(txt) + this.x_margin*2;
    this.y_margin = textSize() / 20;
    this.h = textSize() + this.y_margin;
  }

  displayTextButton() {
    //this.pressed();
    this.display();
    push();
    rectMode(CENTER);
    fill(this.txt_c);
    text(this.txt, this.x - this.w/2 + this.x_margin, this.y + this.y_margin + 10);
    pop();
  }
}

class Stamp extends Button {
  constructor(img, x, y, w, h, country, x_c, y_c, s_c) {
    super(x,y,w,h);
    this.mode = CORNER;
    this.img = img;
    this.country = country;
    this.x_c = x_c;
    this.y_c = y_c;
    // this.w_c = w_c;
    // this.h_c = h_c;
    this.s_c = s_c; //textSize
    this.obtained = localStorage.getItem(country);
  }

  displayEmpty() {
    push();
    noFill();
    strokeWeight(10);
    stroke(0);
    rectMode(CORNER);
    rect(this.x, this.y, this.w, this.h);
    pop();
  }

  displayText() {
    push();
    textSize(this.s_c);
    fill(0);
    rectMode(CENTER);
    text(this.country, this.x_c, this.y_c);
    pop();
  }

  displayStamp() {
    push();
    rectMode(CORNER);
    image(this.img, this.x, this.y, this.w, this.h);
    pop();
  }

  //not priority - creates a cute effect if filled stamp is touched
  flourish() {
  }

  exist() {
    if(!this.obtained) {
      this.displayEmpty();
    } else {
      this.displayStamp();
    }
    
    this.displayText();
  }
}

class KeypadNumber extends TextButton {
  constructor(x,y,c,txt,txt_c,txt_s) {
    super(x,y,c,txt,txt_c,txt_s);
  }

  existKey() {
    this.displayTextButton();
    if(this.pressed()) {
      console.log("you pressed", this.txt);
      addNum(this.txt);
    }
  }

  //debugging
  test() {
    console.log("this exists.");
  }
}

class Keypad {
  constructor(x, y, w, h) { //w and h are the end coordinates of the 1-9 square... too lazy to change it to x1,y1,x2,y2
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.key = [];
    this.active = false;
    
  }

  initiate() {
    var spacing = this.w/3;

    this.key[0] = new KeypadNumber(this.x + spacing, this.y + spacing*4, 0, 0, 250, spacing*3/4);
    console.log(this.key);
    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
        this.key[i*3+j+1] = new KeypadNumber(this.x + spacing*j, this.y + spacing*(3-i), 0, j+1 + i*3, 250, spacing*3/4);
      }
    }
  }

  display() {
    for (var b in this.key) {
      // console.log("a", this.key[b]);
      // console.log("b", this.key[b].existKey());
      // console.log("c", this.key[b].test());
      this.key[b].existKey();
    }

    //Display a box with the current number guess
    push();
    rectMode(CORNER);
    fill(200);
    rect(this.x, this.y/3, this.w, this.y*4/5);
    rectMode(CENTER);
    fill(255);
    textSize((this.y*3/5));
    text(currentGuess, this.x + this.w/2, this.y*2/5);
    pop();
  }

  checkAnswer() {
    if (currentGuess.length < 6) {
      return;
    }

    var find = matchCountry(currentGuess);
    if(find) {
      console.log("yes!", find);
      //add country to visited countries
      for(var s in stamps) {
        if(stamps[s].country == find) {
          stamps[s].obtained = true;
        }
      }
      //save find to cache
      localStorage.setItem(find, true);
      
      //need another state for showing success/error message...
    } else {
      console.log("no...");
      //show error message
    }

    currentGuess = '';
    this.active = false;
  }

  exist() {
    this.display();
    this.checkAnswer();
  }
}

class Cover {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bg = cover_img;
    this.pad = new Keypad(x*9/8, y*4/3, w*7/8, h*7/8);
    this.typing = false;
    this.padButton = new TextButton((w)/2, this.h*3/4, 200, "Enter Code", 0, this.h*1/8);
    this.returnText = "Back"; //to exit keypad. Replaces padButton when keypad is active
    this.returnButton = new TextButton((w)/2, this.h*5/4, 200, "Back", 0, this.h*1/8);
  }

  display() {
    push();
    rectMode(CENTER);
    image(this.bg,this.x,this.y,this.w,this.h);
    pop();

    if(this.typing){
      this.pad.exist();
      this.returnButton.display();

      if(this.returnButton.pressed()) {
        this.typing = false;
      }
    } else {
      this.padButton.display();
    }

    if(this.padButton.pressed() && !this.typing) {
      this.typing = true;
    }

    if(this.returnButton.pressed() && this.typing) {
      this.typing = false;
    }
  }
}

class Page {
  constructor(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.contents = []; //countries in this page
    this.img = page_img;
  }

  initPage() {
  }

  display() {
    push();
    rectMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
    pop();

    for(var s in this.contents) {
      this.contents[s].exist();
    }
  }
}

class StampPage extends Page {
  constructor(x,y,w,h) {
    super(x,y,w,h);
  }

  //takes the index of stamps[] from which to start adding
  initPage(n) { 
    for(var i = 0; i < 4; i++) {
      if(stamps[n+i]) this.contents[i] = stamps[n+i];
    }
  }
}

class MapPage extends Page {
  constructor(x,y,w,h) {
    super(x,y,w,h);
  }
}

class TextPage extends Page {
  constructor(x,y,w,h) {
    super(x,y,w,h);
  }
}

class Passport {
  constructor(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorScheme = 0; //0=default, 1=50% complete, 2=100% complete
    // CHANGE BACK TO 0
    this.currentPage = 4; 
    this.pages = [];

    this.nextPageButton = new Button(w*5/6, h, w/4, h/12, 0, CORNER);
    this.prevPageButton = new Button(x, h, w/4, h/12, 200, CORNER);
    this.backToCoverButton = new Button(x+w/2, y, w/4, h/12, color(255,0,0), CENTER);
  }

  initPages() {
    this.pages[0] = new Cover(this.x, this.y, this.w, this.h);
    this.pages[0].pad.initiate();
    // console.log(this.pages[0].pad.key);
    this.pages[1] = new TextPage(this.x, this.y, this.w, this.h);
    this.pages[2] = new MapPage(this.x, this.y, this.w, this.h);

    initStamps(this.x, this.y, abs((this.x-this.w)/3), abs((this.y-this.h)/6));

    var pagesEnd = int(countries.getRowCount()/4)+stampPagesStart+1;
    // console.log(stampPagesStart);

    for (var i = stampPagesStart; i < pagesEnd; i++) {
      this.pages[i] = new StampPage(this.x, this.y, this.w, this.h);
      this.pages[i].initPage((i-stampPagesStart)*4);
    }
  }

  UI() {
    this.nextPageButton.display();
    if(this.nextPageButton.pressed() && this.pages[this.currentPage+1]) {
      this.currentPage++;
    }

    this.prevPageButton.display();
    if(this.prevPageButton.pressed() && this.pages[this.currentPage-1]) {
      this.currentPage--;
    }

    if(this.currentPage != 0) {
      this.backToCoverButton.display();
      if(this.backToCoverButton.pressed()) {
        this.currentPage = 0;
      }
    }

  }

  displayPassport() {
    this.pages[this.currentPage].display();
    this.UI();
  }
}

///////// Sketch

function preload() {
 countries = loadTable('assets/country_list.csv', 'csv', 'header');

  cover_img = loadImage('assets/Cover.png');
  page_img = loadImage('assets/Page.png');
  map_img = loadImage('assets/Map.jpg');

  stampImages[0] = loadImage('assets/Flags/Algeria.png');
  stampImages[1] = loadImage('assets/Flags/Australia.png');
  stampImages[2] = loadImage('assets/Flags/Bahrain.png');
  stampImages[3] = loadImage('assets/Flags/Brazil.png');
  stampImages[4] = loadImage('assets/Flags/Bulgaria.png');
  stampImages[5] = loadImage('assets/Flags/Canada.png');
  stampImages[6] = loadImage('assets/Flags/China.png');
  stampImages[7] = loadImage('assets/Flags/Colombia.png');
  stampImages[8] = loadImage('assets/Flags/Croatia.png');
  stampImages[9] = loadImage('assets/Flags/Cyprus.png');
  stampImages[10] = loadImage('assets/Flags/Czech Republic.png');
  stampImages[11] = loadImage('assets/Flags/Denmark.png');
  stampImages[12] = loadImage('assets/Flags/Finland.png');
  stampImages[13] = loadImage('assets/Flags/France.png');
  stampImages[14] = loadImage('assets/Flags/Germany.png');
  stampImages[15] = loadImage('assets/Flags/Greece.png');
  stampImages[16] = loadImage('assets/Flags/India.png');
  stampImages[17] = loadImage('assets/Flags/Indonesia.png');
  stampImages[18] = loadImage('assets/Flags/Ireland.png');
  stampImages[19] = loadImage('assets/Flags/Italy.png');
  stampImages[20] = loadImage('assets/Flags/Japan.png');
  stampImages[21] = loadImage('assets/Flags/Jordan.png');
  stampImages[22] = loadImage('assets/Flags/Korea.png');
  stampImages[23] = loadImage('assets/Flags/Lebanon.png');
  stampImages[24] = loadImage('assets/Flags/Malaysia.png');
  stampImages[25] = loadImage('assets/Flags/Mexico.png');
  stampImages[26] = loadImage('assets/Flags/Morocco.png');
  stampImages[27] = loadImage('assets/Flags/Netherlands.png');
  stampImages[28] = loadImage('assets/Flags/New Zealand.png');
  stampImages[29] = loadImage('assets/Flags/Palestine.png');
  stampImages[30] = loadImage('assets/Flags/Pakistan.png');
  stampImages[31] = loadImage('assets/Flags/Panama.png');
  stampImages[32] = loadImage('assets/Flags/Philippines.png');
  stampImages[33] = loadImage('assets/Flags/Poland.png');
  stampImages[34] = loadImage('assets/Flags/Portugal.png');
  stampImages[35] = loadImage('assets/Flags/Saudi Arabia.png');
  stampImages[36] = loadImage('assets/Flags/Serbia.png');
  stampImages[37] = loadImage('assets/Flags/Singapore.png');
  stampImages[38] = loadImage('assets/Flags/Slovak Republic.png');
  stampImages[39] = loadImage('assets/Flags/South Africa.png');
  stampImages[40] = loadImage('assets/Flags/Spain.png');
  stampImages[41] = loadImage('assets/Flags/Sweden.png');
  stampImages[42] = loadImage('assets/Flags/Thailand.png');
  stampImages[43] = loadImage('assets/Flags/Trinidad & Tobago.png');
  stampImages[44] = loadImage('assets/Flags/Türkiye.png');
  stampImages[45] = loadImage('assets/Flags/UAE.png');
  stampImages[46] = loadImage('assets/Flags/UK.png');
  stampImages[47] = loadImage('assets/Flags/Ukraine.png');
  stampImages[48] = loadImage('assets/Flags/USA.png');
  stampImages[49] = loadImage('assets/Flags/Venezuela.png');
  stampImages[50] = loadImage('assets/Flags/Yemen.png');

}

function setup() {
  var DW = displayWidth;
  var DH = displayHeight*4/5;
  createCanvas(displayWidth, displayHeight);
  console.log(DW + " , " + DH);
  // console.log(countries.getRowCount());
  
  var margin = 15; //factor, aka, use this in multiplication

  currentGuess = str();

  thePassport = new Passport(DW/margin, DH/margin, DW*(margin-2)/margin, DH*(margin-2)/margin);
  thePassport.initPages();
  
  startButton = new TextButton(DW/2, (DH*4)/10, 250, "Start", 0, DH/13);
  creditsButton = new TextButton(DW/2, (DH*6)/10, 250, "Credits", 0, DH/15);
  instructionsButton = new TextButton(DW/2, (DH*8)/10, 250, "Instructions", 0, DH/15);

  
}

function draw() {
  background(255,10,255);

  //// Tests
  // b1.display();
  // b1.selected();

  // if(key == 'q') {
  //   localStorage.removeItem('X');
  //   localStorage.removeItem('Y');
  //   console.log("terminated");
  // }

  switch(gameState) {
    case 0:
      titleScreen();
      break;
    case 1:
      //Instructions
      break;
    case 2:
      //Credits
      break;
    case 3:
      //Game
      // console.log(currentGuess);
      thePassport.displayPassport();

      
      break;

    
  }

  mouseIsClicked = false;
}

////////// CORE FUNCTIONS

// function mousePressed() {
// }

// function mouseDragged() {

// }

function deleteCountriesCache() {
  var names = countries.getColumn("COUNTRY");
  for(var c in names) {
    console.log("deleting ", localStorage.getItem(names[c]));
    localStorage.removeItem(names[c]);
  } 

  console.log("cache cleared");
}

function keyPressed() {
  if(keyCode == 81) {
    deleteCountriesCache();
  }
}

function mouseClicked() {
  mouseIsClicked = true;
}

function touchMoved() {
  // otherwise the display will move around
  // with your touch :(
  return false;
}

function titleScreen() {
  if (startButton.pressed()) {
    gameState = 3;
  }
  startButton.displayTextButton();

  if (creditsButton.pressed()) {
    gameState = 2;
  }
  creditsButton.displayTextButton();
  
  if (instructionsButton.pressed()) {
    gameState = 1;
  }
  instructionsButton.displayTextButton();
}


function initStamps(x, y, w, h) {
  console.log(localStorage.getItem('stampSave'));
  for (var i = 0; i < countries.getRowCount(); i++) {
    var y_offset = 0;
    if((i%4 == 2 || i%4 == 3)) {
      y_offset = 1;
    }
    var temp_x = x + w*1/2 + 3/2*w*(i%2);
    var temp_y = y + h*5/4 + 6/2*h*y_offset;

    stamps[i] = new Stamp(stampImages[i], temp_x, temp_y, w, h, countries.get(i, 'COUNTRY'), temp_x, temp_y + 15/10*h, abs(y-h)*3/5);
  }
}




//LocalStorage test stuff
 // // Testing cache storage
  // if(!localStorage.getItem('X')){
  //   b1 = new Button(DW/5,DH/5,DW/3,DH/5,200);
  // } else {
  //   x1 = Number(localStorage.getItem('X'));
  //   y1 = Number(localStorage.getItem('Y'));
  //   //console.log("loaded " + x1 + ", " + y1);
  //   b1 = new Button(x1, y1, DW/3,DH/5,200);
  // }


    // if(b1.selected()) {
  //   b1.x = mouseX-b1.w/2;
  //   b1.y = mouseY-b1.h/2;
  //   console.log("x = " + b1.x);
  //   localStorage.setItem('X',b1.x);
  //   localStorage.setItem('Y',b1.y);
  //   console.log("Set: " + localStorage.getItem('X') + " , " + localStorage.getItem('Y'));
  // }  