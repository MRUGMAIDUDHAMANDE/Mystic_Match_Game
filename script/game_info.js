window.addEventListener("scroll", function () {
  const video = document.querySelector("#gameVideo");
  const scrollPos = window.scrollY;
  const scale = 0.8 + scrollPos / 300;
  video.style.transform = `scale(${Math.min(scale, 1.3)})`;
});

function startGame() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  window.location.href = `game.html?mode=${mode}`;
}
