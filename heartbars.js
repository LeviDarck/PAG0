const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audio = document.getElementById('audio');
const src = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 64;

src.connect(analyser);
analyser.connect(audioCtx.destination);

const svg = document.getElementById('heartBars');
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function drawBars() {
  requestAnimationFrame(drawBars);
  analyser.getByteFrequencyData(dataArray);
  svg.innerHTML = '';

  const heartPath = (t) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return [x * 25 + 500, y * 25 + 400]; // Escalado y centrado
  };

  const barsCount = 32;
  for (let i = 0; i < barsCount; i++) {
    const t = (Math.PI * 2 * i) / barsCount;
    const [x, y] = heartPath(t);
    const length = dataArray[i] / 3;

    const dx = x - 500;
    const dy = y - 400;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const ux = dx / dist;
    const uy = dy / dist;

    const x2 = x + ux * length;
    const y2 = y + uy * length;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "line");
    rect.setAttribute("x1", x);
    rect.setAttribute("y1", y);
    rect.setAttribute("x2", x2);
    rect.setAttribute("y2", y2);
    rect.setAttribute("stroke", "red");
    rect.setAttribute("stroke-width", "4");
    rect.setAttribute("stroke-linecap", "round");
    rect.classList.add("bar");

    svg.appendChild(rect);
  }
}

audio.addEventListener('play', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  drawBars();
});
