double a;
double b;

double xvalorMax = 2;
double xvalorMin = -2;
double yvalorMax = 2;
double yvalorMin = -2;

double aClicou;
double bClicou;

double aSoltou;
double bSoltou;

boolean controle;
boolean mudou = true;
boolean mudN = false;
boolean mudS = false;

int xClicouN;
int nMaxAnt;
int xClicouS;
double SAnt;

double nMaxDesenhado;
double SDesenhado;

int nMax = 50;
double somaLim = 700;


int qual=0;

void setup()
{
  size(800,800);
  background(0);
  
  controle = false;
}

void draw()
{
  if(mudou)
  {
    loadPixels();
    
    for(int x = 0; x < width; x++)
    {
      for(int y = 0; y < height; y++)
      {
        a = mepkundouble(x,0,width,xvalorMin,xvalorMax);
        b = mepkundouble(y,0,height,yvalorMin,yvalorMax);
        
        int n = 0;
        
        double aa = 0;
        double bb = 0;
        
        double soma = 0;
        
        while(n < nMax)
        {
          double aaTemp = aa;
          
          if(qual == 0)
          {
            aa = aa*aa - bb*bb + a;
            
            bb = 2*aaTemp*bb + b;
          }
          else if(qual == 1)
          {
            aa = aa*aa*aa - 3*aa*bb*bb   + a;
            
            bb = 3*aaTemp*aaTemp*bb - bb*bb*bb  + b;
          }
          else if(qual == 2)
          {
            aa = aa*aa*aa*aa + bb*bb*bb*bb - 6*aa*aa*bb*bb   + a;
            
            bb = 4*aaTemp*aaTemp*aaTemp*bb - 4*aaTemp*bb*bb*bb  + b;
          }
          else if(qual == 3)
          {
            aa = aa*aa*aa*aa*aa - 10*aa*aa*aa*bb*bb +5*aa*bb*bb*bb*bb   + a;
            
            bb = 5*aaTemp*aaTemp*aaTemp*aaTemp*bb -10*aaTemp*aaTemp*bb*bb*bb +bb*bb*bb*bb*bb   + b;
          }
          
          soma += Math.sqrt((aa*aa + bb*bb));
          
          if(soma > somaLim)
          {
            break;
          }
          
          n++;
        }
        
        double brilho = mepkundouble(n,0,nMax,0,255);
        
        if(n == nMax)
        brilho = 0;
        
        int pixel = x + y*width;
        
        pixels[pixel] = color(Math.round(brilho));
      }
    }
    
    mudou = false;
    SDesenhado = somaLim;
    nMaxDesenhado = nMax;
  }
  
  updatePixels();
  
  if(controle)
  {
    stroke(000, 191, 255);
    noFill();
    strokeWeight(3);
    
    int xCLicou = (int)(mepkundouble(aClicou,xvalorMin,xvalorMax,0,width));
    int yCLicou = (int)(mepkundouble(bClicou,yvalorMin,yvalorMax,0,height));
    rect(xCLicou,yCLicou,mouseX-xCLicou,mouseY-yCLicou);
  }
  
  if(mudN)
  {
    nMax = nMaxAnt + (mouseX - xClicouN);
    
    if(nMax!=nMaxDesenhado)
    mudou = true;
    
    fill(0);
    stroke(255);
    strokeWeight(3);
    
    rect(650,-10,800-650+10,60+10);
    
    fill(255);
    
    textSize(20);
    text("nMax:",666,20);
    
    text(nMax, 700,50);
    
  }
  
  if(mudS)
  {
    somaLim = SAnt + (mouseX - xClicouS);
    
    if(somaLim!=SDesenhado)
    mudou = true;
    
    fill(0);
    stroke(255);
    strokeWeight(3);
    
    rect(650,-10,800-650+10,60+10);
    
    fill(255);
    
    textSize(20);
    text("Soma limite:",666,20);
    
    text((int)somaLim, 700,50);
  }
  
}

void mousePressed()
{
  if(controle == false)
  {
    aClicou = mepkundouble(mouseX,0,width,xvalorMin,xvalorMax);
    bClicou = mepkundouble(mouseY,0,height,yvalorMin,yvalorMax);
    controle = true;
  }
  
  if(mouseButton == CENTER)
  {
    print(aClicou);
    print(" ");
    println(bClicou);
    
    controle = false;
  }
  
  if(mouseButton == RIGHT)
  {
    controle = false;
    xvalorMax = 2;
    xvalorMin = -2;
    yvalorMax = 2;
    yvalorMin = -2;
    
    mudou = true;
  }
}
  
void mouseReleased()
{
  if(controle == true)
  {
    aSoltou = mepkundouble(mouseX,0,width,xvalorMin,xvalorMax);
    bSoltou = mepkundouble(mouseY,0,height,yvalorMin,yvalorMax);
    
    double aCentro = (aSoltou + aClicou)/2;
    double bCentro = (bSoltou + bClicou)/2;
    
    double metadeLado = 0;
    
    if(Math.abs((bClicou - bSoltou)) > Math.abs((aClicou - aSoltou)))
    metadeLado = (bSoltou - bClicou)/2;
    else
    metadeLado = (aSoltou - aClicou)/2;
    
    xvalorMin = aCentro - metadeLado;
    xvalorMax = aCentro + metadeLado;
    yvalorMin = bCentro - metadeLado;
    yvalorMax = bCentro + metadeLado;
    
    controle = false;
    
    mudou = true;
  }
}

void mouseWheel(MouseEvent event) {
  
  mudou = true;
  
  float e = event.getCount();
  
  if(e<0)
  qual--;
  else if(e>0)
  qual++;
  
  if(qual==-1)
  qual = 3;
  else if(qual==4)
  qual = 0;
  
}

void keyPressed()
{
  if (key == 'n' || key == 'N')
  {
    if(mudN)
    {
      mudN = false;
    }
    else
    {
      mudN = true;
      xClicouN = mouseX;
      nMaxAnt = nMax;
    }
    
  }
  
  if (key == 's' || key == 'S')
  {
    if(mudS)
    {
      mudS = false;
    }
    else
    {
      mudS = true;
      xClicouS = mouseX;
      SAnt = somaLim;
    }
    
  }
}

double mepkundouble(double val,double min1, double max1,double min2,double max2)
{
  return max2 - (max1-val)*(max2-min2)*Math.pow((max1-min1),-1);
}
