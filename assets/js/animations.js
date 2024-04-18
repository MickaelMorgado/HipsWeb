document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollMagic,
    Observer,
    MotionPathPlugin,
    CustomEase
  );

  var debug = true;
  var tl = gsap.timeline();
  var myTLProgress = 0;
  let path = elements.path;
  let svg = elements.svg;

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

  // Creating a SVG path:

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
    "customEase",
    "M0,0 C0.378,0 0.125,0.3 0.4,0.3 0.539,0.3 0.621,0.316 0.663,0.343 0.734,0.388 0.738,0.604 0.77,0.773 0.783,0.847 0.853,1 1,1 "
  );
  CustomEase.create(
    "testEase",
    "M0,0 C0,0 0.04,0 0.1,0.054 0.155,0.103 0.16,0.3 0.246,0.3 0.397,0.3 0.344,0.3 0.5,0.3 0.692,0.3 0.566,1 0.8,1 0.964,1 1,1 1,1 "
  );

  // Main POS animation:
  tl.to(elements.posAnimation, {
    scrollTrigger: {
      trigger: elements.posArea,
      start: "500px center",
      end: "90% center",
      scrub: 0.4,
      // markers: true,
      onUpdate: (self) => {
        myTLProgress = self.progress;
        let interpolatedIndex = Math.ceil(
          gsap.utils.interpolate(0, 190, myTLProgress)
        );
        updateFrame(interpolatedIndex);
        //console.log(interpolatedIndex);
      },
    },
    motionPath: {
      path: path,
      align: path,
      alignOrigin: [0.5, 0.5],
      reverse: true,
    },
    onUpdate: function () {
      if (myTLProgress < 0.5) {
        scale = 0.8 + myTLProgress * 1;
      } else {
        scale = 1.1 - (myTLProgress - 0.5) * 1;
      }

      console.log(scale);

      gsap.set(elements.posAnimation, { scaleX: scale, scaleY: scale });
    },
    ease: "testEase",
    immediateRender: false,
    /*
    onComplete: function () {
      // Once the animation is complete, reverse the scale back to 1
      tl.to(elements.posAnimation, {
        scale: 1,
        //ease: "customEase",
      });
    },
    */
  });

  // Black POS:
  /*
  tl.to(elements.posBlack2, {
    scrollTrigger: {
      trigger: elements.section2,
      start: "-300px center",
      end: "600px center",
      scrub: 0.4,
      markers: false,
    },
    transformOrigin: "center center",
    scale: 0.9,
    rotation: -5,
    duration: 5,
  });
  */

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
