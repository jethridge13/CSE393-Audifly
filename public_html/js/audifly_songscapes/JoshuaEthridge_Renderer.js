//TODO Assign all songs to this renderer

/*
 * This NoteToPlay object stores rendering information
 * for a note that is still renderable.
 */
function NoteToPlay(initX, initY, initW, initH, initR, initG, initB, initA) {
    this.timeRemaining;
    this.x = initX;
    this.y = initY;
    this.w = initW;
    this.h = initH;
    this.r = initR;
    this.g = initG;
    this.b = initB;
    this.a = initA;
}

/*
 * This is renderer for both MP3 and MIDI music
 * files for the Audifly application.
 */
function JoshuaEthridge_Renderer(initCanvas) {
    this.canvas = initCanvas;
    this.graphicsContext = this.canvas.getContext("2d");

    /*
     * This initializes rendering for the loaded MIDI
     * songscape.
     */
    this.initMIDI = function () {
        this.notes = new Array();
        this.bgColor0MAX = 160;
        this.bgColor0MIN = 120;
        this.bgColor0 = this.bgColor0MIN;
        this.bgInc = 40;
        this.bgIsIncreasing = true;
        this.ALPHA_INC = 1;
        this.Y_VELOCITY = 5;
    };

    /*
     * This method is called each time a note is played
     * and provides a rendered response.
     */
    this.stepMIDI = function (now, end, channel, message, note, velocity) {
        // UPDATE THE RENDERING INFO
        var xInc = this.canvas.width / 16;
        var noteInc = this.canvas.height / 128;
        var x = (xInc * channel) + (xInc / 2);
        var y = this.canvas.height - (noteInc * note);
        var w = xInc;
        var h = noteInc;
        var r = 0;
        var g = (127 - note) * 2;
        var b = (channel * 16) - 1;
        var a = 255;

        // MAKE A NOTE
        var newNote = new NoteToPlay(x, y, w, h, r, g, b, a);
        this.notes.push(newNote);

        // AND REDRAW EVERYTHING
        this.midiDraw();
    };

    /*
     * We'll gradually change the background color, so
     * this method will update it's color gradient.
     */
    this.updateMidiBGColors = function () {
        // FIRST THE TOP LEFT COLOR
        if (this.bgIsIncreasing)
        {
            this.bgColor0++;
            if (this.bgColor0 >= this.bgColor0MAX)
                this.bgIsIncreasing = false;
        }
        else
        {
            this.bgColor0--;
            if (this.bgColor0 <= this.bgColor0MIN)
                this.bgIsIncreasing = true;
        }
    };

    /*
     * This function renders a frame for 
     * the MIDI file being played.
     */
    this.midiDraw = function () {
        // RENDER THE BACKGROUND GRADIENT
        var grd = this.graphicsContext.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grd.addColorStop(0, "rgb(" + this.bgColor0 + "," + this.bgColor0 + "," + this.bgColor0 + ")");
        grd.addColorStop(1, "rgb(" + this.bgColor0 + this.bgInc + "," + this.bgColor0 + this.bgInc + "," + this.bgColor0 + this.bgInc + ")");
        this.graphicsContext.fillStyle = grd;
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateMidiBGColors();

        // AND NOW THE NOTES
        var tempNotes = new Array();
        for (var i = 0; i < this.notes.length; i++)
        {
            var note = this.notes[i];

            // DRAW A FILLED CIRCLE
            this.graphicsContext.fillStyle = "rgba(" + note.r + "," + note.g + "," + note.b + "," + note.a + ")";
            this.graphicsContext.beginPath();
            this.graphicsContext.arc(note.x, note.y, note.w / 2, 0, 2 * Math.PI);
            this.graphicsContext.fill();
            note.a -= this.ALPHA_INC;
            note.y += this.Y_VELOCITY;
            if (note.y < this.canvas.height)
                tempNotes.push(note);
        }
        this.notes = tempNotes;
    };

    /*
     * This is called once when an mp3 soundscape
     * is first loaded.
     */
    this.initMp3 = function () {
        this.changingColorChannelValue = 0;
        this.colorInc = true;
        this.colorToInc = this.BLUE;
        this.PURPLE = 0;
        this.BLACK = 1;
        this.BLUE = 2;
        this.DARKBLUE = 3;
        this.DARKPURPLE = 4;
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        this.colorToInc = this.BLACK;
        this.pastData = [];
        this.pastDataSize = 50;
        this.up = true;
        this.position = this.canvas.height / 2;
        this.side = true;
        this.sidePosition = this.canvas.width / 2;
        this.prevCircle = [];
        this.smallCircleV = -1;
        this.smallCircleVD = -1;
        this.smallCircleH = -1;
    };
 
    /*
     * This function is called each frame while
     * a mp3 sondscape is being played.
     */
    this.stepMp3 = function (frequencyData, timeDomainData) {
        // RENDER THE BACKGROUND
        this.graphicsContext.fillStyle = this.generateBackgroundColor();
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // GET THE REST OF THE RENDERING DATA
        // TEST FUNCTION STARTS HERE
        var binArray = [];
        var binWidth = 3;
        for (var i = 0; i < frequencyData.length / binWidth; i += binWidth) {
            var average = frequencyData[i] + frequencyData[i + 1] +
                    frequencyData[i + 2] + frequencyData[i + 3] +
                    frequencyData[i + 4];
            var average = average / 5;
            binArray.push(average);
        }
        this.pastData.push(binArray);
        if (this.pastData.length > this.pastDataSize) {
            this.pastData.shift();
        }
        for (var i = 0; i < this.pastData.length; i++) {
            var tempArray = this.pastData[i];
            var tempLength = tempArray.length;
            //console.log(tempLength);
            var wInc = this.canvas.width / tempLength;
            var hInc = this.canvas.height / 256;
            var x = 0;
            for (var j = 0; j < tempLength; j++) {

                // NOW USE IT TO RENDER SOMETHING
                //var h = hInc * frequencyData[i];
                var h = hInc * tempArray[j];
                this.graphicsContext.fillStyle =
                        "rgba(255,0,0,0.1)";
                //x, y, width, height
                this.graphicsContext.fillRect(x, 0, Math.ceil(wInc), h);
                x += wInc;
            }
        }
        var binCount = binArray.length;
        // TEST FUNCTION ENDS HERE
        // TIME DOMAIN TEST
        var avg = 0;
        for (var i = 0; i < timeDomainData.length; i++){
            avg += timeDomainData[i];
        }
        avg = avg / timeDomainData.length;
        
        // AVG TEST
        
        var dev = (avg - 128) * 5;
        avg += dev;
        avg = Math.abs(avg);
        
        var lat = Math.abs(dev);
        
        this.graphicsContext.beginPath();
        
        // Moves the circle up and down the canvas
        /*
        if(this.up){
            this.position += 5;
            if(this.position + avg >= this.canvas.height)
                this.up = false;
        } else {
            this.position -= 5;
            if(this.position - avg <= 0)
                this.up = true;
        }
        
        if(this.side) {
            this.sidePosition += 5;
            if(this.sidePosition + avg >= this.canvas.width)
                this.side = false;
        } else {
            this.sidePosition -= 5;
            if(this.sidePosition - avg <= 0)
                this.side = true;
        }
        */
        for(var i = 0; i < this.prevCircle.length; i++){
            this.graphicsContext.beginPath();
            this.graphicsContext.arc(this.prevCircle[i][1], this.prevCircle[i][0], 
            this.prevCircle[i][2], 0, 2 * Math.PI, false);
            var color = "#00";
            var num = Math.ceil(i * 5);
            var hex = num.toString(16);
            if(hex.length === 1)
                color += "0";
            color += hex;
            color += "00";
            //console.log(color);
            this.graphicsContext.fillStyle = color;
            this.graphicsContext.fill();
            //this.graphicsContext.lineWidth = 1;
            //this.graphicsContext.stroke();
        }
        
        var circlePos = [this.position, this.sidePosition, avg];
        this.prevCircle.push(circlePos);
        if(this.prevCircle.length > 50)
            this.prevCircle.shift();
        this.graphicsContext.beginPath();
        this.graphicsContext.arc(this.sidePosition, this.position, 
        avg, 0, 2 * Math.PI, false);
        this.graphicsContext.fillStyle = 'green';
        this.graphicsContext.fill();
        this.graphicsContext.lineWidth = 2;
        this.graphicsContext.stroke();
        
        // Small circles
            if(this.smallCircleV < 0){
                this.smallCircleV = this.canvas.height / 2 + lat;
                
                this.graphicsContext.beginPath();
                this.graphicsContext.arc(this.canvas.width / 2, 
                this.smallCircleV, 50, 0, 2 * Math.PI, false);
                this.graphicsContext.fillStyle = 'green';
                this.graphicsContext.fill();
                this.graphicsContext.lineWidth = 1;
                this.graphicsContext.stroke();
                
                this.smallCircleVD = this.canvas.height / 2 - lat;
                
                this.graphicsContext.beginPath();
                this.graphicsContext.arc(this.canvas.width / 2,
                this.smallCircleVD, 50, 0, 2 * Math.PI, false);
                this.graphicsContext.fillStyle = 'green';
                this.graphicsContext.fill();
                this.graphicsContext.lineWidth = 1;
                this.graphicsContext.stroke();
            } else {
                this.smallCircleV += lat;
                
                this.graphicsContext.beginPath();
                this.graphicsContext.arc(this.canvas.width / 2, 
                this.smallCircleV, 50, 0, 2 * Math.PI, false);
                this.graphicsContext.fillStyle = 'green';
                this.graphicsContext.fill();
                this.graphicsContext.lineWidth = 1;
                this.graphicsContext.stroke();
                
                this.smallCircleVD -= lat;
                
                this.graphicsContext.beginPath();
                this.graphicsContext.arc(this.canvas.width / 2,
                this.smallCircleVD, 50, 0, 2 * Math.PI, false);
                this.graphicsContext.fillStyle = 'green';
                this.graphicsContext.fill();
                this.graphicsContext.lineWidth = 1;
                this.graphicsContext.stroke();
            }
            
        // TIME DOMAIN TEST END
        
        //var binCount = frequencyData.length;
        var wInc = this.canvas.width / binCount;
        var hInc = this.canvas.height / 256;
        var x = 0;

        // AND NOW RENDER EACH BIN COLUMN
         for (var i = 0; i < binCount; i++) {
         // NOW USE IT TO RENDER SOMETHING
         //var h = hInc * frequencyData[i];
         var h = hInc * binArray[i];
         this.graphicsContext.fillStyle =
         "rgba(255,255,0,0.5)";
         //x, y, width, height
         this.graphicsContext.fillRect(x, 0, Math.ceil(wInc), h);
         x += wInc;
         }
    };

    /*
     * This updates our mp3 rendering background
     * color.
     */
    this.generateBackgroundColor = function () {
        if (this.colorInc) {
            this.changingColorChannelValue++;
            if (this.changingColorChannelValue >= 255)
                this.colorInc = false;
        }
        else {
            this.changingColorChannelValue--;
            if (this.changingColorChannelValue <= 0)
            {
                // REVERSE IT
                this.colorInc = true;

                // PICK ANOTHER COLOR TO CHANGE
                this.colorToInc = Math.floor(Math.random() * 5);
            }
        }
        // NOW ASSIGN THE PROPER COLORS
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        if (this.colorToInc === this.PURPLE) {
            this.backgroundRed = Math.floor(this.changingColorChannelValue * .63);
            this.backgroundGreen = Math.floor(this.changingColorChannelValue * .125);
            this.backgroundBlue = Math.floor(this.changingColorChannelValue * .94);
        }
        else if (this.colorToInc === this.BLACK) {
            this.backgroundRed = Math.floor(this.changingColorChannelValue * .192);
            this.backgroundGreen = Math.floor(this.changingColorChannelValue * .310);
            this.backgroundBlue = Math.floor(this.changingColorChannelValue * .310);
        }
        else if (this.colorToInc === this.BLUE) {
            this.backgroundBlue = this.changingColorChannelValue;
        } else if (this.colorToInc === this.DARKBLUE) {
            this.backgroundRed = Math.floor(this.changingColorChannelValue * 0);
            this.backgroundGreen = Math.floor(this.changingColorChannelValue * 0);
            this.backgroundBlue = Math.floor(this.changingColorChannelValue * .4);
        } else {
            this.backgroundRed = Math.floor(this.changingColorChannelValue * .4);
            this.backgroundGreen = Math.floor(this.changingColorChannelValue * 0);
            this.backgroundBlue = Math.floor(this.changingColorChannelValue * .4);
        }
        return "rgb(" + this.backgroundRed
                + "," + this.backgroundGreen
                + "," + this.backgroundBlue
                + ")";
    };
}

