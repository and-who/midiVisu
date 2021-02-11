let bgColor;
let squareColor;
let displayText;
let startTime;
let minOctave = 4;
let maxOctave = 4;
let noteHistory = {};
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight
let pitch = 0
let pitchColor1;
let pitchColor2;

console.log('hallo');


function setup() { 
  console.log('setup');
  createCanvas(windowWidth, windowHeight);
  osc = new p5.TriOsc();
  env = new p5.Envelope();
  
  bgColor= color(220,220,200);
  squareColor = color(100);
  connectedDeviceText = "";
  displayText="Nothing received";
  
	WebMidi.enable(function (err) {
    if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        console.log("WebMidi enabled!");
      }

    console.log("---");
    console.log("Inputs Ports: ");
    for(i = 0; i< WebMidi.inputs.length; i++){
      console.log(`${i}: ${WebMidi.inputs[i].manufacturer} - ${WebMidi.inputs[i].name}`);
    }
    
    console.log("---");
    console.log("Output Ports: ");
    for(i = 0; i< WebMidi.outputs.length; i++){
      console.log(`${i}: ${WebMidi.inputs[i].manufacturer} - ${WebMidi.inputs[i].name}`);
    }  

    inputSoftware = WebMidi.inputs[0];
    connectedDeviceText=`${WebMidi.inputs[0].manufacturer} - ${WebMidi.inputs[0].name}`

    pitchColor1 = color(0,255,255)
    pitchColor2 = color(255,0,0)

    inputSoftware.addListener('noteon', "all", onNoteOn);
    inputSoftware.addListener('noteoff', "all", onNoteOff);
    inputSoftware.addListener('pitchbend', "all", onPitchBend);
  });
}

const onPitchBend = (e) => {
  pitch = e.value
  console.log(pitch)
}

const onNoteOn = (e) => {
  printInfo(e)

  if(!startTime) {
    startTime = (new Date()).getTime()
  }

  const noteStartTime = (new Date()).getTime() - startTime
  const {name,octave, number} = e.note
  const velocity = e.velocity

  if(octave > maxOctave) {
    maxOctave = octave
  }

  if(octave < minOctave) {
    minOctave = octave
  }

  if(!noteHistory[octave]) {
    noteHistory[octave] = []
  }

  noteHistory[octave].push({
    number,
    name,
    octave,
    velocity,
    startTime: noteStartTime,
    startPitch: pitch,
    endPitch: null,
    endTime: null
  })

  //playSound(number)
}

const onNoteOff = (e) => {
  printInfo(e)
  const noteEndTime = (new Date()).getTime() - startTime
  const {name, octave, number} = e.note

  noteHistory[octave] = noteHistory[octave].map(historyNote => {
    if(historyNote.endTime || historyNote.number !== number) {
      return historyNote;
    } else {
      return {
        ...historyNote,
        endPitch: pitch,
        endTime: noteEndTime
      }
    }
  })

  console.log({noteHistory})
}

const printInfo = (e) => {
  displayText = `Event ${e.type}: ${e.note.name}${e.note.octave}(${e.note.number}) time:${e.timestamp} vel:${e.velocity}`
  console.log(displayText)
}

const playSound = (midiVal) => {
  osc.start();
  freq = midiToFreq(midiVal);
  osc.freq(freq);
  env.ramp(osc, 0, 1.0, 0);
}

const getNoteColor = (number, octave) => {

}

const getOctaveColor = (octave) => {

}

const drawOctaveHistory = (octaveIndex) => {
  if(noteHistory[octaveIndex]){
    const maxTime = (new Date()).getTime() - startTime
    const octaveCount = maxOctave - minOctave + 1
    const baseHeight = windowHeight / (octaveCount + 1)
    const baseY = windowHeight - ((octaveIndex - minOctave +1) * baseHeight)
    const noteStep = baseHeight / 12

    noteHistory[i].forEach(historyNote => {
      const positionX = (historyNote.startTime/(maxTime/100))*(windowWidth/100)
      const positionY = baseY - (((historyNote.number % 12) - 6) * noteStep)
      const diamiter = historyNote.velocity * 72
      const startPitch = historyNote.startPitch
      const endPitch = historyNote.endPitch || pitch
      const pitchNoise = random(startPitch, endPitch);

      noStroke();
      if(pitch!=0 || historyNote.startPitch !== 0 || (historyNote.endPitch && historyNote.endPitch !== 0)){
        fill(pitchColor1);
        ellipse(positionX + (pitchNoise * 10), positionY + (pitchNoise * 10), diamiter, diamiter);
        fill(pitchColor2);
        ellipse(positionX - (pitchNoise * 10), positionY - (pitchNoise * 10), diamiter, diamiter);
      }
      fill(255);
      ellipse(positionX, positionY, diamiter, diamiter);
    })
  }
}

function draw() {
  background(0);
  fill(255);

  for(i = minOctave; i <= maxOctave; i++) {
      drawOctaveHistory(i)
  }


  textAlign(CENTER);
  textSize(20);
  text(connectedDeviceText,width/2,350);
  text(displayText,width/2,100);
}