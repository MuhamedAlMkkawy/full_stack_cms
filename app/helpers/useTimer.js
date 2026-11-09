import { ref, computed } from 'vue';

export function useTimer(initialMinutes = 2, initialSeconds = 0) {
  const minutes = ref(initialMinutes);
  const seconds = ref(initialSeconds);
  const isTimerRunning = ref(false);
  let timer = null;

  // Format minutes and seconds with leading zeros
  const formattedMinutes = computed(() => String(minutes.value).padStart(2, '0'));
  const formattedSeconds = computed(() => String(seconds.value).padStart(2, '0'));

  const startTimer = () => {
    minutes.value = initialMinutes;
    seconds.value = initialSeconds;
    isTimerRunning.value = true;

    timer = setInterval(() => {
      if (seconds.value === 0) {
        if (minutes.value === 0) {
          clearInterval(timer);
          isTimerRunning.value = false;
        } else {
          minutes.value--;
          seconds.value = 59;
        }
      } else {
        seconds.value--;
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      isTimerRunning.value = false;
    }
  };

  return { 
    formattedMinutes, 
    formattedSeconds, 
    isTimerRunning, 
    startTimer, 
    stopTimer
  };
}
