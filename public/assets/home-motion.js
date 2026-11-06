(() => {
  const map = document.querySelector(".home-hero .service-map");
  if (!map) return;

  const svg = map.querySelector(".connectors");
  const [cloudToAI, aiToSecurity] = svg.querySelectorAll(".motion-route");
  const cloud = map.querySelector(".cloud-orbit");
  const ai = map.querySelector(".ai-orbit");
  const security = map.querySelector(".security-orbit");
  const brand = map.querySelector(".map-brand");
  const header = document.querySelector(".site-header");

  function positionRoutes() {
    const frame = map.getBoundingClientRect();
    const [cloudPoint, aiPoint, securityPoint, hub] = [cloud, ai, security, brand].map((node) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.left - frame.left + rect.width / 2, y: rect.top - frame.top + rect.height / 2 };
    });
    svg.setAttribute("viewBox", `0 0 ${frame.width} ${frame.height}`);
    cloudToAI.setAttribute("d", `M ${cloudPoint.x} ${cloudPoint.y} L ${hub.x} ${hub.y} L ${aiPoint.x} ${aiPoint.y}`);
    aiToSecurity.setAttribute("d", `M ${aiPoint.x} ${aiPoint.y} L ${securityPoint.x} ${securityPoint.y}`);
    map.classList.add("has-motion-routes");
  }

  positionRoutes();
  const observer = new ResizeObserver(positionRoutes);
  observer.observe(map);

  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({
    desktop: "(min-width: 761px)",
    mobile: "(max-width: 760px)",
    motion: "(prefers-reduced-motion: no-preference)"
  }, ({ conditions }) => {
    if (!conditions.motion) return;

    const { mobile } = conditions;
    map.classList.add("is-scroll-linked");
    gsap.set([cloudToAI, aiToSecurity], { strokeDashoffset: 1 });
    gsap.set(cloud, { "--orbit-highlight": .35 });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: map,
        start: "clamp(top 86%)",
        end: () => `top ${header.offsetHeight - map.offsetHeight * .14}px`,
        scrub: mobile ? true : .25
      }
    });

    timeline
      .to(cloud, { "--orbit-highlight": 1, duration: .12 }, 0)
      .to(cloudToAI, { strokeDashoffset: 0, duration: .34 }, .12)
      .to(cloud, { "--orbit-highlight": .22, duration: .12 }, .4)
      .to(ai, { "--orbit-highlight": 1, duration: .11 }, .4)
      .to(aiToSecurity, { strokeDashoffset: 0, duration: .33 }, .58)
      .to(ai, { "--orbit-highlight": .22, duration: .12 }, .86)
      .to(security, { "--orbit-highlight": 1, duration: .14 }, .86);

    return () => map.classList.remove("is-scroll-linked");
  });
})();
