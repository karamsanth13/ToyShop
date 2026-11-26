import { AuthProvider } from "./AuthContext.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";
import { WishlistProvider } from "./WishlistContext.jsx";

export function AppProviders({ children }) {
  return <ThemeProvider><AuthProvider><WishlistProvider>{children}</WishlistProvider></AuthProvider></ThemeProvider>;
}
