(() => {
  try {
    const saved = localStorage.getItem("toyshop-theme");
    const theme = saved === "light" || saved === "dark"
      ? saved
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event("toyshop-theme-change"));
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
