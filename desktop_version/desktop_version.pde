import java.awt.*;
import java.awt.datatransfer.*;
import javax.swing.*;
import java.io.*;

Fractal mainFractal;
ArrayList<Fractal> fractals;

int maxIterations = 1000;
int maxValueSq = 1 << 16;

double resolutionScale = 1;

boolean showBorders;
double borderAux;
color borderColor;

color[] colors;

boolean equationJulia;
double equationPower;
double equationCR;
double equationCI;

String notifyText;
long notifyTime = -100000;

void setup() {
  size(500, 500, P2D);
  //fullScreen(P2D);
  
  surface.setTitle("Fractal Visualizer");
  surface.setResizable(true);
  
  initializeColors();
  
  showBorders = false;
  borderAux = 0;
  borderColor = color(0);
  
  setParameters();
  
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

Fractal newRender() {
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
  
  return newF;
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
    if(mainFractal.moving) return;
    double t = timedRender();
    notify("Time to render: " + nf((float)t,0,2) + " s");
  }
  else if(key == 'w' || key == 'W') {
    maxIterations += 250;
    notify("maximum of iterations: " + maxIterations);
  }
  else if(key == 's' || key == 'S') {
    maxIterations -= 250;
    if(maxIterations < 250) maxIterations = 250;
    notify("Maximum of iterations: " + maxIterations);
  }
  else if(key == 'e' || key == 'E') {
    resolutionScale += 0.1;
    notify("Resolution multiplier: " + nf((float) resolutionScale,0,1));
  }
  else if(key == 'd' || key == 'D') {
    resolutionScale -= 0.1;
    if(resolutionScale < 0.1) resolutionScale = 0.1;
    notify("Resolution multiplier: " + nf((float) resolutionScale,0,1));
  }
  else if(key == 'r' || key == 'R') {
    String path = newImagePath();
    save(path);
    notify("Image saved: " + path);
  }
  else if(key == 'f' || key == 'F') {
    String path = newImagePath();
    newRender().sb.get().save(path);
    notify("Image saved: " + path);
  }
  else if(key == 't' || key == 'T') {
    double currentWidth = mainFractal.width * width/mainFractal.sbWidth;
    double currentX = mainFractal.x - mainFractal.sbX/mainFractal.sbWidth * mainFractal.width;
    double currentY = mainFractal.y - (mainFractal.sbY * mainFractal.width)/mainFractal.sbWidth;
    double scale = currentWidth / width;
    double R = currentX + scale * mouseX;
    double I = currentY + scale * mouseY;
    
    StringSelection data = new StringSelection("" + R + " + " + I + "i");
    Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
    clipboard.setContents(data, data);
    notify(nf((float) R, 0, 2) + " + " + nf((float) I, 0, 2) + "i. High precision copied to clipboard.");
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
  rect(0,0,430,40);
  fill(0);
  text(notifyText,10,15);
}

String newImagePath() {
  File[] files = listFiles("data/galeria/");
  int maior = 0;
  for (File i: files){
    String fileName = i.getName();
    String fileNameStart = split(fileName, ".")[0];
    int fileNameNumber = int(fileNameStart);
    if(fileNameNumber > maior)
      maior = fileNameNumber;
  }
  return "data/galeria/" + str(maior+1) + ".png";
}

void setParameters() {
  boolean typeDefined = false;
  boolean powerDefined = false;
  boolean CRDefined = false;
  boolean CIDefined = false;
  
  try {
    String[] lines = loadStrings("equation.txt");
    for(String line : lines) {
      line = line.strip();
      if(line.charAt(0) == '#' || CIDefined) continue;
      
      if(!typeDefined && (line.toLowerCase().equals("mandelbrot") || line.toLowerCase().equals("julia"))) {
        equationJulia = line.toLowerCase().equals("julia");
        typeDefined = true;
      }
      else if(!powerDefined) {
        equationPower = Double.parseDouble(line);
        powerDefined = true;
      }
      else if(!CRDefined) {
        equationCR = Double.parseDouble(line);
        CRDefined = true;
      }
      else if(!CIDefined) {
        equationCI = Double.parseDouble(line);
        CIDefined = true;
      }
    }
  }
  catch(Exception e) {}
  
  if(!typeDefined || !powerDefined || (typeDefined && equationJulia && (!CRDefined || !CIDefined))) { // default values
    equationJulia = false;
    equationPower = 2;
  }
}
