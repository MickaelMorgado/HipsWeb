// Function to get coordinates of an element:
const getCoords = (elem) => {
  const box = elem.getBoundingClientRect();
  return {
    x: box.top + pageYOffset,
    y: box.left + pageXOffset,
  };
};

document.addEventListener("DOMContentLoaded", (event) => {
  const frameStart = 143; // 133;
  const frameCount = 300; // 226;

  let isFirstSectionScrolled = false;
  let isSecondSectionScrolled = false;

  // Function to generate and append frame elements
  const generateFrames = () => {
    const container = elements.posAnimation;

    for (let i = frameStart; i <= frameCount; i++) {
      const frame = document.createElement("div");
      frame.classList.add("js-generated-frame");
      frame.style.backgroundImage = `url('./assets/images/Render0099-10000${i}.png')`;
      frame.style.visibility = "hidden";
      container.appendChild(frame);
    }
  };

  // Call the function to generate frames:
  generateFrames();

  // Get all frame elements:
  const frames = document.querySelectorAll(".js-generated-frame");

  // Function to update the frame at a given index:
  window.updateFrame = (index) => {
    if (index >= frameCount - frameStart) {
      return;
    } else {
      frames.forEach((frame, idx) => {
        frame.style.visibility = idx === index ? "visible" : "hidden"; // Show the frame at the given index, hide others
      });
    }
  };

  // Animate frames based on scroll position:
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;

    if (scrollTop > 0) {
      elements.posAnimationIdle.style.display = "none";
      elements.posAnimation.style.display = "block";
    } else {
      elements.posAnimationIdle.style.display = "block";
      elements.posAnimation.style.display = "none";
    }

    /*
    requestAnimationFrame(() => {
      updateFrame(frameIndex);
    });
    */
  });
});
