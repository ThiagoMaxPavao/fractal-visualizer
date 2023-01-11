import java.util.*;

int maxIterations = 1000;
int maxValueSq = 1 << 16;

double resolutionScale = 1;

boolean showBorders = false;
double borderAux;
color borderColor;

color[] colors;

boolean equationJulia = false;
double equationPower;
double equationCR;
double equationCI;

int fps = 60;
double initalPower = 1.001;
double powerIncrement = 0.001;
int videoWidth = 3840;
int videoHeight = 2160;
int currentFrame;

// usando video export: comecando 12:30 08/08 - 10 horas e meia para 31%, cancelado.
// salvando frames: comecando 11:00 08/08 - previsão de termino, 19:00 12/08

void setup() {
  size(200, 200, P2D);
  
  setCurrentFrame();
  println("Initializing (" + timestamp() + "), currentFrame = " + currentFrame);
  
  surface.setTitle("Fractal Video Maker");
  
  initializeColors();
}

void draw() {
  equationPower = initalPower + powerIncrement * (currentFrame-1);
  Fractal fractal = new Fractal(videoWidth, videoHeight);
  fractal.setDefaultZoom();
  fractal.render();
  fractal.sb.get().save("data/frames/" + (currentFrame) + ".png");
  println("Saved (" + timestamp() + "): " + currentFrame);
  currentFrame++;
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

void setCurrentFrame() {
  File[] files = listFiles("data/frames/");
  if(files.length == 0) {
    currentFrame = 1;
    return;
  }
  
  int maior = 1;
  for (File i: files){
    String fileName = i.getName();
    String fileNameStart = split(fileName, ".")[0];
    int fileNameNumber = int(fileNameStart);
    if(fileNameNumber > maior)
      maior = fileNameNumber;
  }
  currentFrame = maior+1;
}

String timestamp() {
  Calendar now = Calendar.getInstance();
  return String.format("%1$td/%1$tm/%1$ty %1$tH:%1$tM:%1$tS", now);
}
