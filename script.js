(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const backBtn = document.getElementById("backBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const notesBtn = document.getElementById("notesBtn");
  const counter = document.getElementById("counter");
  const progress = document.getElementById("progress");
  const notesDefault = new URLSearchParams(window.location.search).get("notes") === "1";
  let current = readSlideFromHash();

  prepareSlideContent();

  if (notesDefault) {
    document.body.classList.add("show-notes");
  }

  function prepareSlideContent() {
    slides.forEach((slide) => {
      if (slide.querySelector(":scope > .slide-content")) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "slide-content";

      Array.from(slide.children).forEach((child) => {
        if (!child.classList.contains("notes")) {
          wrapper.appendChild(child);
        }
      });

      slide.insertBefore(wrapper, slide.firstChild);
    });
  }

  function fitActiveSlide() {
    const slide = slides[current];
    const content = slide.querySelector(":scope > .slide-content");

    if (!content) {
      return;
    }

    content.style.setProperty("--fit-scale", "1");

    const styles = window.getComputedStyle(slide);
    const availableWidth = slide.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const availableHeight = slide.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const scale = Math.min(
      1,
      availableWidth / Math.max(content.scrollWidth, 1),
      availableHeight / Math.max(content.scrollHeight, 1)
    );

    content.style.setProperty("--fit-scale", String(Math.max(scale, 0.52)));
  }

  function readSlideFromHash() {
    const raw = window.location.hash.replace("#slide-", "");
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= slides.length) {
      return parsed - 1;
    }
    return 0;
  }

  function showSlide(index, updateHash = true) {
    current = Math.min(Math.max(index, 0), slides.length - 1);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });

    backBtn.disabled = current === 0;
    forwardBtn.disabled = current === slides.length - 1;
    counter.textContent = `${current + 1} / ${slides.length}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;

    const title = slides[current].dataset.title || slides[current].querySelector("h2, h1")?.textContent || "Slide";
    document.title = `${current + 1}. ${title}`;

    if (updateHash) {
      history.replaceState(null, "", `#slide-${current + 1}`);
    }

    window.requestAnimationFrame(fitActiveSlide);
  }

  function next() {
    showSlide(current + 1);
  }

  function previous() {
    showSlide(current - 1);
  }

  backBtn.addEventListener("click", previous);
  forwardBtn.addEventListener("click", next);
  notesBtn.addEventListener("click", () => {
    document.body.classList.toggle("show-notes");
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, button")) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      next();
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previous();
    }

    if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      document.body.classList.toggle("show-notes");
    }
  });

  window.addEventListener("hashchange", () => {
    showSlide(readSlideFromHash(), false);
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(fitActiveSlide);
  });

  showSlide(current, window.location.hash === "");
})();
