(() => {
  const tips = document.querySelectorAll(".tech-tip[data-tip]");
  const margin = 18;
  const maxWidth = 320;

  function align(element) {
    const rect = element.getBoundingClientRect();
    const width = Math.min(maxWidth, window.innerWidth - margin * 2);
    const spaceLeft = rect.right;
    const spaceRight = window.innerWidth - rect.left;

    element.classList.toggle(
      "tip-start",
      spaceLeft < width + margin && spaceRight > spaceLeft,
    );
    element.classList.toggle("tip-below", rect.top < 132);
  }

  tips.forEach((element) => {
    element.addEventListener("pointerenter", () => align(element));
    element.addEventListener("focus", () => align(element));
  });
})();
