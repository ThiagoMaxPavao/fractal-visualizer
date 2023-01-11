class Fractal {
  int renderWidth, renderHeight;
  PGraphics sb;
  double aspectRatio;
  double sbX, sbY, sbWidth;
  double x, y, width;
  
  double moveX1, moveY1;
  boolean moving;
  
  Fractal(int renderWidth, int renderHeight) {
    this.renderWidth = renderWidth;
    this.renderHeight = renderHeight;
    
    sb = createGraphics(renderWidth, renderHeight);
    
    aspectRatio = (double)renderHeight/renderWidth;
    
    sbX = 0.0;
    sbY = 0.0;
    sbWidth = windowWidth();
    
    moving = false;
  }

  double height() {
    return this.width * this.aspectRatio;
  }

  double pixelDensity() {
    return this.renderWidth/this.width;
  }

  void setZoom(double x, double y, double widthValue) {
    this.x = x;
    this.y = y;
    this.width = widthValue;
  }

  void setDefaultZoom() {
    double minX = -2,
           maxX =  2,
           minY = -1.4,
           maxY =  1.4;
    
    double maxWidth = maxX - minX;
    double maxHeight = maxY - minY;
    double maxAspectRatio = maxHeight/maxWidth;
    if(this.aspectRatio > maxAspectRatio) {
      this.x = minX;
      this.width = maxWidth;
      // desired center = 0
      // we want y so that y + height / 2 = desired center
      // then
      this.y = -this.height()/2;
    }
    else {
      this.y = minY;
      this.width = maxHeight/this.aspectRatio; // same as this.height = this.maxHeight
      // desired center = (minX + maxX) / 2
      // we want x so that x + width / 2 = desired center
      // then
      this.x = (minX + maxX - this.width) / 2;
    }
  }
  
  double logN (double x, double n) {
    return (Math.log(x) / Math.log(n));
  }

  color getColor(double x, double y, int iteration) {
    if(iteration == maxIterations)
      return color(0);
    else {
      double smoothed = logN(logN(x * x + y * y, equationPower) / 2, equationPower);  // log_equationPower(log_equationPower(|p|))
      int colorI = (int) (Math.sqrt(iteration + 10 - smoothed) * 256) % colors.length;
      return colors[colorI];
    }
  }

  void render() {
    this.sb.beginDraw();
    this.sb.loadPixels();
    for(int xp = 0; xp < this.renderWidth; xp++)
    for(int yp = 0; yp < this.renderHeight; yp++) {
      double x0 = this.x + xp*this.width/this.renderWidth;
      double y0 = this.y + yp*this.height()/this.renderHeight;
      
      // make sequence
      double x = x0;
      double y = y0;
      int iteration = 0;
      
      if(equationJulia) {
        x0 = equationCR;
        y0 = equationCI;
      }
      
      if(equationPower == 2)
      while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
        double xtemp = x*x - y*y + x0;
        y = 2*x*y + y0;
        x = xtemp;
        
        iteration++;
      }
      else if(equationPower == 3)
      while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
        double xtemp = x*x*x - 3 * x * y * y + x0;
        y =  3 * x * x * y - y * y * y + y0;
        x = xtemp;
        
        iteration++;
      }
      else
      while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
        double rm = Math.pow(x*x + y*y, equationPower/2);
        double tetam = equationPower*Math.atan2(y, x);
        x = rm * Math.cos(tetam) + x0;
        y = rm * Math.sin(tetam) + y0;
        
        iteration++;
      }
      // end make sequence
      
      this.sb.pixels[yp*this.renderWidth + xp] = this.getColor(x, y, iteration);
    }
    this.sb.updatePixels();
    this.sb.endDraw();
  }

  void draw() {
    image(this.sb, (float) this.sbX, (float) this.sbY, (float) this.sbWidth, (float) (this.sbWidth * this.aspectRatio));
    
    if(showBorders) {
      stroke(borderColor);
      strokeWeight(sizeUnit());
      noFill();
      rect((float) this.sbX, (float) this.sbY, (float) this.sbWidth, (float) (this.sbWidth * this.aspectRatio));
    }
  }

  void setupMove(double x, double y) {
    this.moveX1 = x - this.sbX;
    this.moveY1 = y - this.sbY;
    this.moving = true;
  }

  void stopMove() {
    this.moving = false;
  }

  void move(double x, double y) {
    this.sbX = x - this.moveX1;
    this.sbY = y - this.moveY1;
  }

  void scale(double s) {
    if(this.moving) return;
    this.sbX = mouseX*(1-s) + s*this.sbX;
    this.sbY = mouseY*(1-s) + s*this.sbY;
    this.sbWidth *= s;
  }
}
