const questionButton = document.querySelector("[data-question-button]");
const closeModalButton = document.querySelector("[data-im-x-button]");
const insModal = document.querySelector("[data-im]");
const insModalContent = document.querySelector("[data-im-content]");
const emailButton = document.querySelector("[data-im-email-button]");
const dateText = document.querySelector("[data-date-text]");
// Add Cookie - Expires one month post original creation

function setCookie(cname, cvalue) {
  var d = new Date();
  d.setMonth(d.getMonth() + 1); // Set to the next month
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

// Auto-Display Instructions Modal

function checkInsModalStatus() {
  var InsModalShown = getCookie("InsModalShown");
  if (!InsModalShown) {
    insModal.showModal();
    setCookie("InsModalShown", "true");
  }
}

window.addEventListener("load", checkInsModalStatus);

function displayDate() {
  year = new Date().getFullYear();
  dateText.textContent = year;
}

displayDate();

// Modal Interaction

questionButton.addEventListener("click", () => {
  insModal.showModal();
});

closeModalButton.addEventListener("click", (e) => {
  insModal.close();
});

insModalContent.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (e.target === insModal) {
    insModal.close();
  }
});

emailButton.addEventListener("click", () => {
  window.location = "mailto:flagyak@gmail.com?subject=FlagYak%20Feedback";
});
