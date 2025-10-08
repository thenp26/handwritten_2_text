
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const predictButton = document.getElementById('predict-button');
const clearButton = document.getElementById('clear-button');
const resultSpan = document.getElementById('result');

let isDrawing = false;
let model;

ctx.lineWidth = 20;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

async function loadModel() {
    console.log("Loading model...");
    model = await tf.loadLayersModel('web_model/model.json');
    console.log("Model loaded!");
}
loadModel();

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseout', () => { isDrawing = false; });

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resultSpan.textContent = '...';
});

predictButton.addEventListener('click', async () => {
    if (!model) return;
    
    // Create a temporary canvas to resize the drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Invert colors and draw the 280x280 canvas onto the 28x28 canvas
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0,0,28,28);
    tempCtx.drawImage(canvas, 0, 0, 28, 28);
    
    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    let tensor = tf.browser.fromPixels(imageData, 1) // 1 channel for grayscale
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims(0);

    const prediction = model.predict(tensor);
    const predictedDigit = prediction.argMax(-1).dataSync()[0];
    resultSpan.textContent = predictedDigit;
});
