export const getScreenWidthMinusOffset = (offset: number = 228): number => {
  if (typeof window !== "undefined") {
    const widthTotal = window.innerWidth;
    if(widthTotal <= 580){
      return widthTotal;
    }
    return Math.max(0, widthTotal - offset);
  } else {
    console.warn(
      "Window is not defined. Are you running this on the server side?"
    );
    return 0;
  }
};
