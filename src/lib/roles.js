export function normalizeRole(val) {
    return String(val || "").trim().toUpperCase();
}

export function getUserRole(user) {
    // sesuaikan dengan struktur data user kamu
    return normalizeRole(user?.data?.division_code || user?.division_code || user?.role);
}

export function hasAnyRole(user, allowed = []) {
    if (!allowed?.length) return true; // jika tidak set, artinya bebas
    const role = getUserRole(user);
    return allowed.map(normalizeRole).includes(role);
}