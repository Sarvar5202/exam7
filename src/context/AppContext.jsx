import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("nt_dark") === "true");
  const [lang, setLang] = useState(() => localStorage.getItem("nt_lang") || "uz");

  useEffect(() => {
    localStorage.setItem("nt_dark", dark);
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("nt_lang", lang);
  }, [lang]);

  const toggleDark = () => setDark(p => !p);
  const toggleLang = () => setLang(p => p === "uz" ? "ru" : "uz");

  const T = {
    uz: {
      loginLabel: "Login",
      loginPlaceholder: "Loginni kiriting",
      passwordLabel: "Parol",
      passwordPlaceholder: "Parolni kiriting",
      loginBtn: "Kirish",
      loginError: "Login yoki parol noto'g'ri",
      loginSuccess: "Muvaffaqiyatli kirildi",
      copyright: "Copyright © 2024 Najot Ta'lim",
      menu: ["Asosiy", "O'qituvchilar", "Guruhlar", "Talabalar", "Sovg'alar", "Boshqarish"],
      logout: "Chiqish",
      loading: "Yuklanmoqda",
    },
    ru: {
      loginLabel: "Логин",
      loginPlaceholder: "Введите логин",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Введите пароль",
      loginBtn: "Войти",
      loginError: "Неверный логин или пароль",
      loginSuccess: "Успешный вход",
      copyright: "Copyright © 2024 Najot Ta'lim",
      menu: ["Главная", "Учителя", "Группы", "Студенты", "Подарки", "Управление"],
      logout: "Выйти",
      loading: "Загрузка",
    }
  };

  const t = T[lang];

  return (
    <AppContext.Provider value={{ dark, toggleDark, lang, toggleLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
