const audioElements = document.querySelectorAll(".audio");
let currentAudio = null; // 현재 재생 중인 오디오 저장ㅎ문것
let animationFrameId = null; // 애니메이션 프레임 ID 저장하는 것
let currentCanvas = null; // 현재 비주얼라이저 캔버스 저장하는 것
let currentCtx = null; // 현재 캔버스의 컨텍스트 저장하는 것것

document.querySelectorAll(".image1").forEach(container => {
    const audio = container.querySelector(".audio");
    const canvas = container.querySelector(".visualizer");
    const playButton = container.querySelector(".image");

    const ctx = canvas.getContext("2d");
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawVisualizer() {
        if (!audio.paused) {
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // const barWidth = (canvas.width / bufferLength) * 2.5;
            const barWidth = 8;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const frequency = dataArray[i];
                const r = Math.min(frequency * 2, 255);  // 빨강 (빈도수가 높을수록 강해짐)
                const g = Math.min(255 - frequency, 255);  // 초록 (빈도수가 낮을수록 강해짐)
                const b = Math.min(frequency * 1.5, 255);  // 파랑 (빈도수가 높을수록 강해짐)

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                const barHeight = frequency;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 2;
            }
            animationFrameId = requestAnimationFrame(drawVisualizer);
        } else {
            cancelAnimationFrame(animationFrameId);
        }
    }

    playButton.addEventListener("click", () => {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            cancelAnimationFrame(animationFrameId);
            if (currentCanvas) {
                currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
            }
            // 이전 오디오의 버튼을 재생 버튼으로 되돌리기
            const previousPlayButton = currentCanvas.closest('.image1').querySelector('.image');
            previousPlayButton.src = './image/free-icon-play-3669489.png';
        }

        if (audio.paused) {
            audioContext.resume().then(() => {
                playButton.src = './image/free-icon-pause-3669483.png';
                audio.play();
                drawVisualizer();
                currentAudio = audio;
                currentCanvas = canvas;
                currentCtx = ctx;
            });
        } else {
            playButton.src = './image/free-icon-play-3669489.png';
            audio.pause();
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            currentAudio = null;
            currentCanvas = null;
            currentCtx = null;
        }
    });

    audio.addEventListener("ended", () => {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentAudio = null;
        currentCanvas = null;
        currentCtx = null;
        // 오디오 종료 시 버튼을 재생 버튼으로 변경
        playButton.src = './image/free-icon-play-3669489.png';
    });
});