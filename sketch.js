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

var quitButton;

//utility
var currentGuess;
var mouseIsClicked = false;
var mouseIsReleased = true;
 
var thePassport;
var stampPagesStart = 2; //first page with stamps on it, start counting from 0
var completionRate = 0;

var messageTimer = 0;
var messageText;

var confettiParticles = [];
var confettiAmount = 0;

//background animation
var bgCircles = [];
var play_bgAnimation = true;

//assets
var numFont;

var countries = []; //import of the csv file
var stampImages = []; //images for the stamps
var stamps = []; //array of the actual stamp objects
var cover_img;
var page_img;
var page50_img;
var page100_img;
var currentPageSkin;
var lock_img;

//tentative/to-do
var button_img;
var rahaLogo;
var Pali_img;
var map_img;

////////// TOOL FUNCTIONS

function collision(x,y,width,height, MODE) {
  var w = width/2;
  var h = height/2;
  var m = w/20; //margin

  if(MODE == CENTER) {
    w = width/2 + m;
    h = height/2 + m;
  } else if (MODE == CORNER) {
    w = width + m;
    h = height + m;
  }

  if (mouseX < x+w && mouseX > x-w && mouseY < y+h && mouseY > y-h) {
    return true;
  }
  return false;
}

function resultMessage(txt) {
  push();
  textSize(displayHeight/15);
  fill(255,0,0);
  textWrap(WORD);
  textAlign(CENTER);
  rectMode(CENTER);
  text(txt,displayWidth/2,displayHeight/2, displayWidth*3/4);
  pop();
}

function messagePopUp(txt) { 
  messageTimer = 100;
  messageText = txt;
  //the message gets displayed by the text manager function at the end of draw().
}

function matchCountry(n) {
  var found = countries.findRow(n, 'NUMBER');
  
  if (found) {
    messageText = 'Success! ' + found.get('COUNTRY');
    messagePopUp(messageText);
    return found.get('COUNTRY');
  } 
  messageText = 'Wrong';
  messagePopUp(messageText);
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

// function deleteNum() {
//   if (currentGuess != null && currentGuess.length() > 0) {
//     currentGuess = currentGuess.substring(0, str.length() - 1);
//  }
// }

// function removeNum() {
//   currentGuess = currentGuess.slice(0,-1);
// }

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
      noStroke();
      rectMode(this.mode);
      rect(this.x,this.y,this.w,this.h);
      this.display_c = this.c;
      pop();
   }
}

class TextButton extends Button {
  constructor (x, y, c, txt, txt_c, txt_s, wrapping) {
    super(x,y);
    this.c = c;
    this.mode = CENTER;
    this.font = 'Georgia';
    this.display_c = this.c;
    this.selected_c = this.c - 100;
    this.txt = txt;
    this.txt_c = txt_c;
    this.txt_s = txt_s;
    push();
    textSize(txt_s);
    this.x_margin = textWidth(txt) / 20;
    this.w = textWidth(txt) + this.x_margin*4;
    if(wrapping) {
      this.w = this.w/2;
    }
    pop();
    this.y_margin = txt_s / 20;
    this.h = txt_s + this.y_margin;
    this.wrap = wrapping;
  }

  displayTextButton() {
    //this.pressed();
    this.display();
    push();
    noStroke(); 
    textSize(this.txt_s);
    rectMode(this.mode);
    textFont(this.font);
    fill(this.txt_c);
    if(this.wrap) {
      textWrap(WORD);
    }
    text(this.txt, this.x - this.w/2 + this.x_margin, this.y + this.y_margin + 10);
    pop();
  }
}

class AchievementButton extends Button {
  constructor(x,y,w,h,c) {
    super(x,y,w,h,c); 
    this.img = lock_img;
    this.mode = CENTER;
    this.locked = true;
    this.chosen = false;
  }

  displayAButton() {
    this.display();
    if(this.locked) {
      push();
      imageMode(this.mode);
      image(this.img, this.x, this.y, this.w, this.h);
      pop();
    } if (this.chosen) {
      push();
      strokeWeight(4);
      stroke(30, 162, 112);
      noFill();
      rectMode(this.mode);
      rect(this.x,this.y,this.w,this.h);
      pop();
    }
  }
}

class ImageButton extends Button {
  constructor(x,y,w,h,c,MODE,img) {
    super(x,y,w,h,c,MODE);
    this.img = img;
  }

  display() {
    push();
    rectMode(this.mode);
    if(this.pressed()){
      tint(255, 120);
    }
    image(this.img, this.x, this.y, this.w, this.h);
    pop();
  }
}

class Stamp extends Button {
  constructor(img, x, y, w, h, country, x_c, y_c, s_c) {
    super(x,y,w,h);
    this.mode = CORNER;
    this.img = img;
    // this.img.resize(this.w);
    this.country = country;
    //_c --> country name text attributes
    this.x_c = x_c;
    this.y_c = y_c;
    this.c_c = 0;
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
    textWrap(WORD);
    fill(this.c_c);
    rectMode(CENTER);
    text(this.country, this.x_c, this.y_c, this.w);
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
    if(this.obtained && this.pressed()) {
      createConfetti(this.x + this.w/2 + random(-2,2), this.y + this.h/2 + random(-2,2));
    }
  }

  exist() {
    if(!this.obtained) {
      //this.displayEmpty();
    } else {
      this.displayStamp();
    }
    
    this.displayText();
    this.flourish();
  }
}

class KeypadNumber extends TextButton {
  constructor(x,y,c,txt,txt_c,txt_s) {
    super(x,y,c,txt,txt_c,txt_s);
    // this.mode = CORNER;
    this.font = numFont;
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
    var spacing = this.w/4;
    var v_spacing = this.h/5;

    this.key[0] = new KeypadNumber(this.x + spacing + this.w/4, this.y + v_spacing*4, 0, 0, 250, spacing*3/5);
    console.log(this.key);
    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
        this.key[i*3+j+1] = new KeypadNumber(this.x + spacing*j + this.w/4, this.y + v_spacing*(3-i), 0, j+1 + i*3, 250, spacing*3/5);
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
    fill(0);
    var border = this.x + this.w/3 - this.w/10;
    rect(border, this.y/3, this.w - border, this.y*4/5);
    rectMode(CENTER);
    fill(255);
    textSize((this.y*3/5));
    textFont(numFont);
    // console.log(numFont);
    text(currentGuess, this.x + this.w/3, this.y);
    pop();
  }

  checkAnswer() {
    if (!currentGuess || currentGuess.length < 6) {
      return;
    }

    var find = matchCountry(currentGuess);
    if(find) {
      console.log("yes!", find);
      //add country to visited countries
      for(var s in stamps) {
        if(stamps[s].country == find) {
          stamps[s].obtained = true;
          checkProgress();
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
    var padButtonY = this.h*9/10;
    this.padButton = new TextButton(displayWidth/2, padButtonY, 200, "Enter Code", 0, this.h*1/15);
    //this.returnText = "Back"; //(this is a smarter solution... maybe for later lol) to exit keypad. Replaces padButton when keypad is active
    this.returnButton = new TextButton(displayWidth/2, padButtonY, 200, "Back", 0, this.h*1/15);
    this.pressed = false; //better way of controlling button presses, especially with overlapping positions/states

    //achievement buttons
    var offset = this.w/4;
    var y_margin = this.y + this.h/5;
    var btnWidth = this.w/6;
    this.skin0 = new AchievementButton(this.x + offset, y_margin, btnWidth, btnWidth, 255);
    this.skin0.locked = false;
    this.skin0.chosen = true;
    this.skin50 = new AchievementButton(this.x + offset*2, y_margin, btnWidth, btnWidth, color(200,50,0));
    this.skin100 = new AchievementButton(this.x + offset*3, y_margin, btnWidth, btnWidth, 0);

  }

  keyPadButtons() {
    if(this.typing){
      this.pad.exist();
      this.returnButton.displayTextButton();
    } else {
      this.padButton.displayTextButton();
    }

    if(this.padButton.pressed() && !this.typing) {
      this.pressed = 'enter';
    }

    if(this.returnButton.pressed() && this.typing) {
      this.pressed = 'back';
      currentGuess = '';
    }

    if(this.pressed == 'enter') {
      this.typing = true;
    } else if (this.pressed == 'back') {
      this.typing = false;
    }
  }

  skinButtons() {
    if(!this.typing){
      this.skin0.displayAButton();
      this.skin50.displayAButton();
      this.skin100.displayAButton();

      if(this.skin0.pressed()) {
        if(!this.skin0.locked) {
          pageSkinChange(page_img, 0);
          this.skin0.chosen = true;
          this.skin50.chosen = false;
          this.skin100.chosen = false;
        }
      }

      if(this.skin50.pressed()) {
        if(!this.skin50.locked) {
          console.log("50 pressed");
          pageSkinChange(page50_img, 220);
          this.skin0.chosen = false;
          this.skin50.chosen = true;
          this.skin100.chosen = false;
        } else if(this.skin50.locked) {
          messagePopUp("Needs 50%");
        }
      }

      if(this.skin100.pressed()){
        if(!this.skin100.locked) {
          pageSkinChange(page100_img, 220);
          this.skin0.chosen = false;
          this.skin50.chosen = false;
          this.skin100.chosen = true;
        } else if(this.skin100.locked) {
          messagePopUp("Needs 100%");
        }

      }
    }
  }

  display() {
    this.pressed = false; //button control

    push();
    rectMode(CENTER);
    image(this.bg,this.x,this.y,this.w,this.h);
    pop();


    this.skinButtons();
    this.keyPadButtons();
 
  }
}

class Page {
  constructor(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.contents = []; //countries in this page
    this.img = currentPageSkin;
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
    this.contents[0] = new TextButton(w/2+w/10, h/3 + h/10, 255, "A Message", 0, h/12);
    this.contents[1] = new TextButton(w/2+w/10, h*2/3 + h/10, 255, "Map", 0, h/10);
  }

  display() {
    push();
    rectMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
    pop();

    for(var s in this.contents) {
      this.contents[s].displayTextButton();
    }

    if(this.contents[0].pressed()) {
      window.open("https://docs.google.com/document/d/1MhqY07yDmt4hhcsVTlJRU4Lv9HMgZqyGg70WoARbAyw/edit?usp=sharing");
    }
    if(this.contents[1].pressed()) {
      window.open("https://drive.google.com/file/d/1DWLU7PTK0G-YzIPQmaK69Y4pT6znJMOj/view?usp=sharing");
    }
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
    this.currentPage = 0; 
    this.pages = [];

    //UI
    var DH = displayHeight;
    push();
    textSize(DH/20);
    this.nextPageButton = new TextButton(w - textWidth("Next")/3, h + textSize(), 200, "Next", 0, DH/20);
    this.prevPageButton = new TextButton(x + textWidth("Back")/2, h + textSize(), 200, "Back", 0, DH/20);
    this.backToCoverButton = new TextButton(x+w/2, y + textSize()/2, color(30, 162, 112), "Cover", 0, DH/20);
    this.quitButton = new TextButton(x+w/2, y + textSize()/2, color(241, 78, 79), "Quit", 0, DH/20);
    pop();
  }

  initPages() {
    this.pages[0] = new Cover(this.x, this.y, this.w, this.h);
    this.pages[0].pad.initiate();
    // console.log(this.pages[0].pad.key);
    // this.pages[1] = new TextPage(this.x, this.y, this.w, this.h);
    this.pages[1] = new MapPage(this.x, this.y, this.w, this.h);

    initStamps(this.x, this.y, abs((this.x-this.w)*2/5), abs((this.y-this.h)/6));

    var pagesEnd = int(countries.getRowCount()/4)+stampPagesStart+1;
    // console.log(stampPagesStart);

    for (var i = stampPagesStart; i < pagesEnd; i++) {
      this.pages[i] = new StampPage(this.x, this.y, this.w, this.h);
      this.pages[i].initPage((i-stampPagesStart)*4);
    }
  }

  UI() {
    //display next page button
    if(this.currentPage < this.pages.length-1) {
      this.nextPageButton.displayTextButton();
      if(this.nextPageButton.pressed() && this.pages[this.currentPage+1]) {
        this.currentPage++;
      }
    }

    //display previous page button
    if(this.currentPage > 0) {
      this.prevPageButton.displayTextButton();
      if(this.prevPageButton.pressed() && this.pages[this.currentPage-1]) {
        this.currentPage--;
      }
    } else if (!this.pages[0].typing) {
      this.quitButton.displayTextButton();
      if(this.quitButton.pressed()) {
        gameState = 0;
      }
    }

    //display back to cover button
    if(this.currentPage != 0) {
      this.backToCoverButton.displayTextButton();
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

  numFont = loadFont('assets/Cube.ttf');

  cover_img = loadImage('assets/Cover.png');
  page_img = loadImage('assets/Page.png');
  page50_img = loadImage('assets/Page50.png');
  page100_img = loadImage('assets/Page100.png');
  lock_img = loadImage('assets/Lock.png');
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
  stampImages[29] = loadImage('assets/Flags/Pakistan.png');
  stampImages[30] = loadImage('assets/Flags/Palestine.png');
  stampImages[31] = loadImage('assets/Flags/Panama.png');
  stampImages[32] = loadImage('assets/Flags/Philippines.png');
  stampImages[33] = loadImage('assets/Flags/Poland.png');
  stampImages[34] = loadImage('assets/Flags/Portugal.png');
  stampImages[35] = loadImage('assets/Flags/Serbia.png');
  stampImages[36] = loadImage('assets/Flags/Singapore.png');
  stampImages[37] = loadImage('assets/Flags/Slovak Republic.png');
  stampImages[38] = loadImage('assets/Flags/South Africa.png');
  stampImages[39] = loadImage('assets/Flags/Spain.png');
  stampImages[40] = loadImage('assets/Flags/Sweden.png');
  // stampImages[41] = loadImage('assets/Flags/Switzerland.png');
  stampImages[41] = loadImage('assets/Flags/Thailand.png');
  stampImages[42] = loadImage('assets/Flags/Trinidad and Tobago.png');
  stampImages[43] = loadImage('assets/Flags/T??rkiye.png');
  stampImages[44] = loadImage('assets/Flags/UAE.png');
  stampImages[45] = loadImage('assets/Flags/UK.png');
  stampImages[46] = loadImage('assets/Flags/Ukraine.png');
  stampImages[47] = loadImage('assets/Flags/USA.png');
  stampImages[48] = loadImage('assets/Flags/Venezuela.png');
  stampImages[49] = loadImage('assets/Flags/Yemen.png');

}

function setup() {
  frameRate(30);
  var DW = displayWidth;
  var DH = displayHeight*4/5;
  createCanvas(displayWidth, displayHeight);
  console.log(DW + " , " + DH);
  // console.log(countries.getRowCount());
  
  bgInit();

  var margin = 15; //factor, aka, use this in multiplication

  currentGuess = str();

  currentPageSkin = page_img;

  thePassport = new Passport(DW/margin, DH/margin, DW*(margin-2)/margin, DH*(margin-2)/margin);
  thePassport.initPages();
  checkProgress();
  
  startButton = new TextButton(DW/2, (DH*4)/10, 250, "Start", 0, DH/13);
  instructionsButton = new TextButton(DW/2, (DH*6)/10, 250, "Instructions", 0, DH/15);
  creditsButton = new TextButton(DW/2, (DH*8)/10, 250, "Get Involved", 0, DH/15);
}

function draw() {
  bgAnimation(play_bgAnimation, 0);

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
      // quitButton.displayTextButton();
      // if(quitButton.pressed()) {
      //   gameState = 0;
      // }
      break;

    case 10:
      if(mouseIsClicked) {
        createConfetti(mouseX, mouseY);
      }
      break;
  }

  displayConfetti();

  //Message timer manager!!
  if(messageTimer > 0) {
    messageTimer--;
    resultMessage(messageText);
    console.log(messageTimer); 
  }
  mouseIsClicked = false;
}

////////// CORE FUNCTIONS

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
  mouseIsReleased = false;
}

function mouseReleased() {
  mouseIsReleased = true;
  mouseIsClicked = false;
}

function touchMoved() {
  // otherwise the display will move around
  // with your touch :(
  //return false;
}

function titleScreen() {
  push();
  textSize(displayHeight/16);
  fill(255);
  textAlign(CENTER);
  textWrap(WORD);
  text("International Day Passport 2023", 0, displayHeight*1/30, displayWidth, displayHeight/3);
  pop();
  
  if (startButton.pressed()) {
    gameState = 3;
  }
  startButton.displayTextButton();

  if (creditsButton.pressed()) {
    // gameState = 2;
    window.open('https://forms.gle/u9CNjaKmug2wZfCg9');
  }
  creditsButton.displayTextButton();
  
  if (instructionsButton.pressed()) {
    // gameState = 1;
    window.open('https://docs.google.com/document/d/1kiV6nBabeheyItm6fD-hESytkpmDcJ26sMypCczG8oM/edit?usp=sharing');
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

    //passport coordinate + margin + position offset
    var temp_x = x + w*1/6 + 3/2*w*(i%2);
    var temp_y = y + h*5/4 + 5/2*h*y_offset;
    var scaleFactor = w / stampImages[i].width;

    stamps[i] = new Stamp(stampImages[i], temp_x, temp_y, w, stampImages[i].height * scaleFactor, countries.get(i, 'COUNTRY'), temp_x + w/2, temp_y + 12/10*h, abs(y-h)*3/5);
  }
}
  

//Background animation
//Raha logo colors - #1EA270, #F14E4F
//In RGB: green (30, 162, 112), red (241, 78, 79).

class ScrollingCircle {
  constructor(red, x, y, r, dir) {
    this.red = red; //false = green, true = red
    this.y = y;
    this.x = x;
    this.r = r;
    this.dy = 0.1*dir; 
  }

  scroll() {
    this.y += this.dy;
    if(this.y > displayHeight + this.r) {
      this.y = -1*this.r;
    }
    if(this.y < -1*this.r) {
      this.y = displayHeight + this.r;
    }
  }

  display() {
    push();
    if(this.red) {
      fill(241, 78, 79);
    } else {
      fill(30, 162, 112);
    }
    noStroke();
    ellipse(this.x, this.y, this.r);
    pop();
  }

  // exist() {
  //   this.display();
  //   this.scroll();
  // }
}

class CircleColumn {
  constructor(k) {
    this.k = k;
    this.circles = [];
  }

  init() {
    var red = true;
    var r = 100;
    var x = this.k * displayWidth/2;
    var y_spacing = r + r;
    var dir = this.k % 2;
    if (dir == 0) dir = -1;
    for(var i = 0; i < 4; i++) {
      this.circles[i] = new ScrollingCircle(red, x, y_spacing*i, r, dir);
      if (red) red = false;
    }
  }

  exist(playing) {
    for(var i = 0; i < this.circles.length; i++) {
      this.circles[i].display();
      if(playing) {
        this.circles[i].scroll();
      }
    }
  }
}

function bgInit() {
  for(var i = 0; i < displayWidth/50; i++) {
    bgCircles[i] = new CircleColumn(i);
    bgCircles[i].init();
  }
}

function bgAnimation(playing, bgColor) {
  background(bgColor);

  for(var i = 0; i < bgCircles.length; i++) {
    bgCircles[i].exist(playing);
  }
}



// Confetti :))
class ConfettiPiece {
  constructor(x, y, dx, dy, a, da, c) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.ddx = 0.99;
    this.dy = dy;
    this.ddy = 1;
    this.maxdy = 1.5;
    this.c = c;
    this.w = 10;
    this.h = 3;
    this.maxh = 3;
    this.a = a; //z-axis plain angle
    this.da = da;
    this.b = 0; //x-axis plain angle
    this.db = dy;
    this.alive = true;
  }

  display() {
    push();
    rectMode(CENTER);
    noStroke();
    fill(this.c);
    translate(this.x, this.y);
    rotate(this.a);
    rect(0, 0, this.w, this.h);
    pop();
  }

  update() {
    this.x += this.dx;
    this.dx *= this.ddx;
    
    this.y += this.dy;
    this.dy += this.ddy;
    if (this.dy > this.maxdy) this.ddy = this.maxdy;

    this.a += this.da;

    this.h += this.maxh*sin(this.b);
    if(this.h > this.maxh) this.h = this.maxh;
    this.b += this.db/10;
    this.db = this.dy;
  }

  exist() {
    this.update();
    this.display();
    
    if(this.y > displayHeight+20) {
      this.alive = false;
    }

    console.log(this);
  }
}

function createConfetti(x, y) {
  console.log("creating @ " + x + ", " + y);
  for(var i = 0; i < 25; i++) {
    var dx = random(-15, 15);
    var dy = random(-30, -1);
    var a = random(6);
    var da = random(1);
    var c = color(random(255), random(255), random(255));
    confettiParticles.push(new ConfettiPiece(x, y, dx, dy, a, da, c));
  }
  // confettiAmount = confettiParticles.length();
}

function displayConfetti() {
  for(var p in confettiParticles) {
    confettiParticles[p].exist();
    if(!confettiParticles[p].alive) {
      delete confettiParticles[p];
    }
  }
}

//Achievement System
function checkProgress() {
  var count = 0;
  for(var s in stamps) {
    if(stamps[s].obtained) {
      count++;
    }
  }

  //progress from 0 to 1, allows for generalizability
  completionRate = count/stamps.length;
  if(completionRate > 0.49) {
    thePassport.pages[0].skin50.locked = false;
  }

  if(completionRate == 1) {
    thePassport.pages[0].skin100.locked = false;
  }
}

function pageSkinChange(skin, txtcolor) {
  for(var i = 1; i < thePassport.pages.length; i++) {
    console.log(thePassport.pages[i].img);
    thePassport.pages[i].img = skin;
    console.log(thePassport.pages[i].img);
  }

  for(var s in stamps) {
    stamps[s].c_c = txtcolor;
  }
}
