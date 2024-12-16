// Add this script in your HTML or as an external JS file

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#button");
  const salary = document.querySelector("#salary");
  const hours = document.querySelector("#hours");
  const days = document.querySelector("#days");
  const resultRate = document.querySelector("#resultRate");

  button.addEventListener("click", () => {
    const totHours = Number(days.value) * Number(hours.value);
    if (totHours > 0) {
      const rate = Number(salary.value) / totHours;
      resultRate.innerHTML = rate.toFixed(2);
    } else {
      resultRate.innerHTML = "Please enter valid days and hours.";
    }
  });
});

//it needs to grab the salary
//it needs to grab the days
//it needs to grab the hours
//it needs to grab the button
//it needs to multiply days by hours const tothours
//it needs to divide salary by tothours
