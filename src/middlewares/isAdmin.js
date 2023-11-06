const isAdminOrPremium  = (req, res, next) => {
  const allowedRoles = ["admin", "premium"];
  console.log(req.session.user);

  if (req.session.user && allowedRoles.includes(req.session.user.rol)) {
    // Si el usuario es administrador o premium, permite el acceso
    next();
  } else {
    // Si el usuario no es administrador ni premium, responde con un error de acceso no autorizado
    res.status(403).json({ status: "error", message: "Access forbidden" });
  }
};

export default isAdminOrPremium ;