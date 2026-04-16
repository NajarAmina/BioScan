export const save = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const load = (key) => {
    return JSON.parse(localStorage.getItem(key)) || [];
};