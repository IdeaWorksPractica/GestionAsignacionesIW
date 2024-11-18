export const getScreenWidthMinusOffset = (offset: number = 228): number => {
  if (typeof window !== "undefined") {
    return Math.max(0, window.innerWidth - offset);
  } else {
    console.warn(
      "Window is not defined. Are you running this on the server side?"
    );
    return 0;
  }
};
