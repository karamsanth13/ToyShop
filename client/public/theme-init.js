try {
  const savedTheme = localStorage.getItem("toyshop-theme");
  document.documentElement.dataset.theme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
} catch {
  document.documentElement.dataset.theme = "light";
}
