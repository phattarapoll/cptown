const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwR7s1_THE9-Pm65iup1vPs3kdQGyP0iG24zVK66EHNFYSQNCWVFjyAzUiBYanHhbP/exec';

const startButton = document.getElementById('startButton');
const numberDisplay = document.getElementById('numberDisplay');
const statusText = document.getElementById('statusText');
const resultCard = document.getElementById('predictionCard');
const predictionNumber = document.getElementById('predictionNumber');
const predictionName = document.getElementById('predictionName');
const predictionText = document.getElementById('predictionText');
const wisdomText = document.getElementById('wisdomText');

startButton.addEventListener('click', startPrediction);

async function startPrediction() {
  startButton.disabled = true;
  startButton.classList.remove('hide'); // เผื่อกรณีมีการเริ่มใหม่
  resultCard.classList.remove('show');
  wisdomText.classList.remove('hide');
  
  await animateNumberShuffle();
  
  const randomNumber = getRandomNumber(1, 100);
  showFinalNumber(randomNumber);
  
  statusText.textContent = 'กำลังทำนาย...';
  statusText.classList.add('show');
  
  await new Promise(resolve => setTimeout(resolve, 500)); 
  
  fetchPrediction(randomNumber);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animateNumberShuffle() {
  return new Promise(resolve => {
    numberDisplay.textContent = generateLongRandomNumber();
    numberDisplay.classList.add('spinning');
    numberDisplay.classList.remove('hide');
    wisdomText.classList.add('hide');

    let spinCount = 0;
    const maxSpins = 20;

    const interval = setInterval(() => {
      numberDisplay.textContent = generateLongRandomNumber();
      spinCount++;
      if (spinCount >= maxSpins) {
        clearInterval(interval);
        numberDisplay.classList.remove('spinning');
        resolve();
      }
    }, 100);
  });
}

function generateLongRandomNumber() {
  let longNumber = '';
  for (let i = 0; i < 50; i++) {
    longNumber += Math.floor(Math.random() * 10);
  }
  return longNumber;
}

function showFinalNumber(number) {
  numberDisplay.textContent = number;
  numberDisplay.style.fontSize = '8em';
  numberDisplay.style.color = '#fff';
  numberDisplay.style.textShadow = '0 0 20px #fff, 0 0 30px #fff, 0 0 40px #DAA520';
}

function fetchPrediction(number) {
  const url = `${SCRIPT_URL}?number=${number}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        showPrediction(data.prediction);
      } else {
        showError(data.message);
      }
    })
    .catch(error => {
      showError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    });
}

function showPrediction(prediction) {
  if (prediction) {
    predictionNumber.textContent = `หมายเลข ${prediction.number}`;
    predictionName.textContent = prediction.name;
    predictionText.innerHTML = prediction.prediction.replace(/\n/g, '<br>');
    setTimeout(() => {
      // ซ่อนตัวเลขและสถานะ กำลังทำนาย
      numberDisplay.classList.add('hide');
      statusText.classList.remove('show');
      
      // ซ่อนปุ่มสุ่มคำทำนาย
      startButton.classList.add('hide');
      
      // แสดงผลคำทำนาย
      resultCard.classList.add('show');
    }, 100);
  } else {
    showError('ไม่พบคำทำนายสำหรับหมายเลขนี้');
  }
}

function showError(error) {
  alert('เกิดข้อผิดพลาด: ' + error);
  startButton.disabled = false;
  numberDisplay.classList.remove('hide');
  statusText.classList.remove('show');
}