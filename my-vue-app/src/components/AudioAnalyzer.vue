<template>
  <div>
    <h1>Web Sound Analysis</h1>
    <p>Formant 1: {{ formant1 }} Hz</p>
    <p>Formant 2: {{ formant2 }} Hz</p>
    <p>Tone: {{ tone }} Hz - Note: {{ note }}</p>
    <p>Harmonic Ratio: {{ harmonicRatio }} dB</p>
    <p>Vowel Sound: {{ vowelSound }}</p>
    <p>Number of Harmonics: {{ numHarmonics }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formant1: 'N/A',
      formant2: 'N/A',
      tone: 'N/A',
      harmonicRatio: 'N/A',
      vowelSound: 'N/A',
      numHarmonics: 0,
      note: 'N/A',
    };
  },
  mounted() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const processAudio = () => {
          analyser.getByteFrequencyData(dataArray);

          const formant1Frequency = this.findPeakFrequency(dataArray, audioContext.sampleRate, 200, 400);
          const formant2Frequency = this.findPeakFrequency(dataArray, audioContext.sampleRate, 1800, 2400);
          const toneFrequency = this.findPeakFrequency(dataArray, audioContext.sampleRate, 60, 300);

          this.formant1 = formant1Frequency;
          this.formant2 = formant2Frequency;
          this.tone = toneFrequency;
          this.harmonicRatio = this.calculateHarmonicRatio(dataArray, toneFrequency);
          this.numHarmonics = this.countHarmonics(dataArray, toneFrequency);
          this.note = this.getNoteFromFrequency(toneFrequency);
          this.vowelSound = this.identifyVowelSound(formant1Frequency, formant2Frequency);

          requestAnimationFrame(processAudio);
        };

        processAudio();
      })
      .catch(err => console.error(err));
  },
  methods: {
    findPeakFrequency(dataArray, sampleRate, minFreq, maxFreq) {
      const nyquist = sampleRate / 2;
      const startBin = Math.floor(minFreq / nyquist * dataArray.length);
      const endBin = Math.floor(maxFreq / nyquist * dataArray.length);

      let maxMagnitude = -Infinity;
      let peakBin = startBin;

      for (let i = startBin; i <= endBin; i++) {
        if (dataArray[i] > maxMagnitude) {
          maxMagnitude = dataArray[i];
          peakBin = i;
        }
      }

      return Math.round((peakBin * nyquist) / dataArray.length);
    },
    calculateHarmonicRatio(dataArray, fundamentalFreq) {
      const harmonicSum = dataArray.reduce((acc, val, idx) => {
        return idx % fundamentalFreq === 0 ? acc + val : acc;
      }, 0);
      const noiseSum = dataArray.reduce((acc, val) => acc + val, 0) - harmonicSum;

      return (20 * Math.log10(harmonicSum / (noiseSum || 1))).toFixed(2);
    },
    countHarmonics(dataArray, fundamentalFreq) {
      const threshold = 0.1 * Math.max(...dataArray);
      let count = 0;

      for (let i = fundamentalFreq; i < dataArray.length; i += fundamentalFreq) {
        if (dataArray[i] >= threshold) {
          count++;
        }
      }

      return count;
    },
    identifyVowelSound(f1, f2) {
      if (f1 >= 200 && f1 <= 400 && f2 >= 1800 && f2 <= 2400) {
        return 'И';
      } else if (f1 >= 350 && f1 <= 500 && f2 >= 700 && f2 <= 1200) {
        return 'Э';
      } else if (f1 >= 600 && f1 <= 800 && f2 >= 1000 && f2 <= 1200) {
        return 'А';
      } else if (f1 >= 300 && f1 <= 450 && f2 >= 700 && f2 <= 1000) {
        return 'О';
      } else if (f1 >= 250 && f1 <= 400 && f2 >= 600 && f2 <= 800) {
        return 'У';
      }
      return 'N/A';
    },
    getNoteFromFrequency(frequency) {
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const A4 = 440;
      const semitoneOffset = 12 * Math.log2(frequency / A4);
      const noteIndex = Math.round(semitoneOffset) % 12;
      return noteNames[(noteIndex + 12) % 12];
    }
  }
};
</script>

<style>
h1 {
  font-size: 24px;
  margin-bottom: 16px;
}
p {
  font-size: 18px;
  margin: 8px 0;
}
</style>
