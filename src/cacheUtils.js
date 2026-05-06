// 🔥 GUARDAR CACHE
export const guardarCache = (
  key,
  data
) => {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );
};

// 🔥 LEER CACHE
export const leerCache = (key) => {

  const data =
    localStorage.getItem(key);

  return data
    ? JSON.parse(data)
    : null;
};
