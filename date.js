exports.getDateformatted = function() {
  const today = new Date();

  const option = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("pt-BR", option);
};

exports.getWeekDay = function() {
  const today = new Date();

  const option = {
    weekday: "long"
  };

  return today.toLocaleDateString("pt-BR", option);
};
