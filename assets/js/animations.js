document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, CustomEase);

  // Debug flag
  const debug = false;

  // Adding debug styles
  if (debug) {
    elements.posAnimation.classList.add("d-pos-animation");
    elements.posAnimationSVGWrapper.classList.add("d-pos-animation-svg");
    elements.posAnimationPointWrapper.classList.add("d-point-debugger");
  }

  const frameStart = 143;
  const frameEnd = 300;
  const animationLength = frameEnd - frameStart;

  // Smooth Animation variables
  const container = elements.smoothContent;
  const height = container.clientHeight;
  elements.body.style.height = height + "px";

  // Generate frame elements
  const generateFrames = () => {
    const container = elements.posAnimation;
    for (let i = frameStart; i <= frameEnd; i++) {
      const frame = document.createElement("div");
      frame.classList.add("js-generated-frame");
      frame.style.backgroundImage = `url('./assets/images/Render0099-10000${i}.png')`;
      frame.style.visibility = "hidden";
      container.appendChild(frame);
    }
  };

  // Call the function to generate frames
  generateFrames();

  const frames = document.querySelectorAll(".js-generated-frame");

  const updateFrame = (index) => {
    if (index >= animationLength) {
      return;
    } else {
      frames.forEach((frame, idx) => {
        frame.style.visibility = idx === index ? "visible" : "hidden";
      });
    }
  };

  const path = elements.path;
  const svg = elements.svg;

  let fromElement = elements.posArea;
  let toElement = elements.path;
  let anchors = [];
  const pointElements = elements.posAnimationPoints;

  for (let i = 0; i < pointElements.length; i++) {
    let relativePoint = MotionPathPlugin.getRelativePosition(
      elements.posAnimationSVGWrapper,
      pointElements[i]
    );
    anchors.push({ x: relativePoint.x, y: relativePoint.y });
  }

  let matrix = MotionPathPlugin.convertCoordinates(fromElement, toElement);
  let converted = anchors.map((p) => matrix.apply(p));
  let rawPath = MotionPathPlugin.arrayToRawPath(converted, { curviness: 2 });

  path.setAttribute("d", MotionPathPlugin.rawPathToString(rawPath));

  for (let i = 0; i < converted.length; i++) {
    createSVG("circle", svg, {
      cx: converted[i].x,
      cy: converted[i].y,
      r: 0.5,
      fill: debug ? "red" : "none",
    });
  }

  function createSVG(type, container, attributes) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", type),
      reg = /([a-z])([A-Z])/g,
      p;
    for (p in attributes) {
      element.setAttributeNS(
        null,
        p.replace(reg, "$1-$2").toLowerCase(),
        attributes[p]
      );
    }
    container.appendChild(element);
    return element;
  }

  CustomEase.create(
    "oldEase",
    "M0,0 C0.378,0 0.125,0.3 0.4,0.3 0.539,0.3 0.621,0.316 0.663,0.343 0.734,0.388 0.738,0.604 0.77,0.773 0.783,0.847 0.853,1 1,1 "
  );
  CustomEase.create(
    "newEase",
    "M0,0 C0,0 0.051,0.001 0.07,0.021 0.096,0.049 0.105,0.146 0.157,0.146 0.2,0.146 0.255,0.148 0.28,0.16 0.334,0.184 0.309,0.3 0.38,0.3 0.531,0.3 0.36,0.3 0.516,0.3 0.874,0.3 0.608,1 0.87,1 1.034,1 1,1 1,1 "
  );
  const easeScale = [0, 1, 0.4, 0.4, 1, 0.8, 0];

  const tl = gsap.timeline();

  tl.to(elements.posAnimation, {
    scrollTrigger: {
      trigger: elements.posArea,
      start: "500px center",
      end: "90% center",
      scrub: 0.4,
      onUpdate: (self) => {
        // Get the transformed Y position of the container during scroll
        const transformedY = gsap.getProperty(container, "y") * -1;

        // Calculate the new top offset for posAnimation
        const newPosAnimationTop = transformedY;

        // Set the new top offset for posAnimation
        elements.posAnimation.style.top = `${newPosAnimationTop}px`;

        // Your code to use the newPosAnimationTop value as needed
        console.log(`${newPosAnimationTop}px`);

        const minScale = 0.75;
        const maxScale = 1.2;
        const progress = self.progress;
        const easeIndex = progress * (easeScale.length - 1);
        const easeIndexFloor = Math.floor(easeIndex);
        const easeIndexFraction = easeIndex - easeIndexFloor;

        if (easeIndexFloor >= 0 && easeIndexFloor < easeScale.length - 1) {
          const easedProgress =
            easeScale[easeIndexFloor] +
            easeIndexFraction *
              (easeScale[easeIndexFloor + 1] - easeScale[easeIndexFloor]);
          const scale = minScale + easedProgress * (maxScale - minScale);

          gsap.set(elements.posAnimation, { scale: scale });

          let interpolatedIndex = Math.ceil(
            gsap.utils.interpolate(0, animationLength, progress * 3.07)
          );
          updateFrame(interpolatedIndex);
        }
      },
    },
    motionPath: {
      path: path,
      align: path,
      alignOrigin: [0.5, 0.5],
      reverse: true,
    },
    ease: "newEase",
    immediateRender: false,
  });

  gsap.to(container, {
    y: -height / 2,
    scrollTrigger: {
      trigger: elements.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
    },
  });

  const contentElements = elements.contents;

  contentElements.forEach((contentElement, index) => {
    gsap.to(contentElement, {
      x: "0",
      opacity: 1,
      duration: 2,
      scrollTrigger: {
        trigger: contentElement.parentElement,
        start: "-25% center",
        end: "25% center",
        scrub: 1,
        id: `contentAnimation-${index}`,
      },
    });
  });
});
