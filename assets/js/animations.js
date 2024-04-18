document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollMagic,
    Observer,
    MotionPathPlugin,
    CustomEase
  );

  var debug = false;
  var tl = gsap.timeline();
  let path = elements.path;
  let svg = elements.svg;

  // Adding some debug styles:
  if (debug) {
    elements.posAnimation.classList.add("d-pos-animation");
    elements.posAnimationSVGWrapper.classList.add("d-pos-animation-svg");
    elements.posAnimationPointWrapper.classList.add("d-point-debugger");
  }

  // Fix Coordinates:
  let fromElement = elements.posArea;
  let toElement = elements.path;
  let anchors = [];

  // Define an array of point elements
  let pointElements = elements.posAnimationPoints;

  // Iterate over the point elements
  for (let i = 0; i < pointElements.length; i++) {
    let relativePoint = MotionPathPlugin.getRelativePosition(
      elements.posAnimationSVGWrapper,
      pointElements[i]
    );
    // Add the relative position to the anchors array
    anchors.push({ x: relativePoint.x, y: relativePoint.y });
  }
  let matrix = MotionPathPlugin.convertCoordinates(fromElement, toElement);
  let converted = anchors.map((p) => matrix.apply(p));
  let rawPath = MotionPathPlugin.arrayToRawPath(converted, { curviness: 2 });

  path.setAttribute("d", MotionPathPlugin.rawPathToString(rawPath));

  // place the converted points as <circle> elements
  for (let i = 0; i < converted.length; i++) {
    createSVG("circle", svg, {
      cx: converted[i].x,
      cy: converted[i].y,
      r: 0.5,
      fill: debug ? "red" : "none",
    });
  }

  // helper function for creating SVG elements
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

  // Ease to control speed of vertical position progress:
  CustomEase.create(
    "oldEase",
    "M0,0 C0.378,0 0.125,0.3 0.4,0.3 0.539,0.3 0.621,0.316 0.663,0.343 0.734,0.388 0.738,0.604 0.77,0.773 0.783,0.847 0.853,1 1,1 "
  );
  CustomEase.create(
    "newEase",
    "M0,0 C0,0 0.039,0.001 0.058,0.021 0.084,0.049 0.068,0.145 0.119,0.146 0.244,0.146 0.159,0.3 0.267,0.3 0.418,0.3 0.344,0.3 0.5,0.3 0.692,0.3 0.566,1 0.8,1 0.964,1 1,1 1,1 "
  );
  const easeScale = [0, 1, 0, 0, 1, 0, 0];

  // Main POS animation:
  tl.to(elements.posAnimation, {
    scrollTrigger: {
      trigger: elements.posArea,
      start: "500px center",
      end: "90% center",
      scrub: 0.4,
      onUpdate: (self) => {
        const minScale = 0.8; // Minimum scale
        const maxScale = 1.2; // Maximum scale
        const progress = self.progress;
        const easeIndex = progress * (easeScale.length - 1); // Calculate the index in the easeScale array
        const easeIndexFloor = Math.floor(easeIndex);
        const easeIndexFraction = easeIndex - easeIndexFloor; // Get the fractional part

        // Check if easeIndexFloor is within the valid range
        if (easeIndexFloor >= 0 && easeIndexFloor < easeScale.length - 1) {
          const easedProgress =
            easeScale[easeIndexFloor] +
            easeIndexFraction *
              (easeScale[easeIndexFloor + 1] - easeScale[easeIndexFloor]); // Interpolate between easing values
          const scale = minScale + easedProgress * (maxScale - minScale); // Interpolate between minScale and maxScale based on the eased progress

          // SCALE ANIMATION:
          gsap.set(elements.posAnimation, { scale: scale });

          // FRAME ANIMATION:
          let interpolatedIndex = Math.ceil(
            gsap.utils.interpolate(0, 190, progress)
          );
          console.log(interpolatedIndex);
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

  // Content Animations:
  const contentElements = elements.contents;

  contentElements.forEach((contentElement, index) => {
    gsap.to(contentElement, {
      x: "100%",
      opacity: 1,
      duration: 1,
      scrollTrigger: {
        trigger: contentElement.parentElement,
        start: "-25% center",
        end: "25% center",
        scrub: 1,
        id: `contentAnimation-${index}`,
      },
    });
  });

  // var scene = new ScrollMagic.Scene({
  //   duration: h,
  //   triggerHook: 0.2,
  // })
  //   .setTween(tl)
  //   .addTo(controller);
});
