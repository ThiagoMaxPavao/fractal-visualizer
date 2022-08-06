Fractal mainFractal;
ArrayList<Fractal> fractals;

int maxIterations = 2000;
int maxValueSq = 65536; //1 << 16

double resolutionScale = 1;

boolean showBorders;
double borderAux;
color borderColor;

color[] colors;

boolean equationJulia = false;
double equationPower = 2;
double equationCR = 0;
double equationCI = 0;

String notifyText;
long notifyTime = -100000;

void setup() {
  size(1000, 1000, P2D);
  //fullscreen();
  
  surface.setTitle("Fractal Visualizer");
  surface.setResizable(true);
  
  initializeColors();
  
  showBorders = false;
  borderAux = 0;
  borderColor = color(0);
  
  mainFractal = new Fractal((int) (width*resolutionScale), (int) (height*resolutionScale));
  mainFractal.setDefaultZoom();
  mainFractal.render();
  
  fractals = new ArrayList<Fractal>();
  fractals.add(mainFractal);
}

void draw() {
  background(0);
  
  for(int i = 0; i < fractals.size(); i++)
    fractals.get(i).draw();
  
  updateBorderColor();
  notifyShow();
}

double timedRender() {
  double t1 = millis();
  newRender();
  double t2 = millis();
  return (t2-t1)/1000;
}

void newRender() {
  Fractal newF = new Fractal((int) (width*resolutionScale), (int) (height*resolutionScale));
  
  double currentWidth = mainFractal.width * width/mainFractal.sbWidth;
  double currentX = mainFractal.x - mainFractal.sbX/mainFractal.sbWidth * mainFractal.width;
  double currentY = mainFractal.y - (mainFractal.sbY * mainFractal.width)/mainFractal.sbWidth;
  
  newF.setZoom(currentX, currentY, currentWidth);
  newF.render();
  
  double newPD = newF.pixelDensity();
  
  // insert sorted crescent by pixelDensity
  boolean inserted = false;
  for(int i = 0; i < fractals.size() && !inserted; i++)
    if(newPD < fractals.get(i).pixelDensity()) {
      fractals.add(i, newF);
      inserted = true;
    }
  
  if(!inserted)
    fractals.add(newF);
}

void mousePressed() {
  for(int i = 0; i < fractals.size(); i++)
    fractals.get(i).setupMove(mouseX, mouseY);
}

void mouseDragged() {
  for(int i = 0; i < fractals.size(); i++)
    fractals.get(i).move(mouseX, mouseY);
}

void mouseReleased() {
  for(int i = 0; i < fractals.size(); i++)
    fractals.get(i).stopMove();
}

void mouseWheel(MouseEvent event) {
  double e = event.getCount();
  if(e < 0)
    for(int i = 0; i < fractals.size(); i++)
      fractals.get(i).scale(1.1);
  else
    for(int i = 0; i < fractals.size(); i++)
      fractals.get(i).scale(0.9);
}

void keyPressed() {
  if(key == 'q' || key == 'Q') {
    showBorders = !showBorders;
    notify(showBorders ? "Showing borders." : "Disabling borders.");
  }
  else if(key == 'a' || key == 'A') {
    double t = timedRender();
    notify("Time to render: " + nf((float)t,0,2) + " s");
  }
}

void updateBorderColor() {
  borderAux += 0.1;
  borderColor = color((int) ((Math.sin(borderAux)+1)*128));
}

void initializeColors() {
  JSONArray json = loadJSONArray("colorArray.json");
  JSONArray c;
  
  colors = new color[2048];
  
  for(int i = 0; i<2048; i++) {
    c = json.getJSONArray(i);
    colors[i] = color(c.getFloat(0), c.getFloat(1), c.getFloat(2));
  }
}

float sizeUnit() {
  return (float) Math.sqrt(width*width + height*height) / 300;
}

int windowWidth() {
  return width;
}

void notify(String message) {
  notifyText = message;
  notifyTime = millis();
}

void notifyShow() {
  if(millis() - notifyTime > 5000) return;
  fill(200);
  noStroke();
  textSize(20);
  textAlign(LEFT, CENTER);
  rect(0,0,200,40);
  fill(0);
  text(notifyText,10,15);
}
