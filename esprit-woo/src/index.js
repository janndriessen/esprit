const QRCode = require("qrcode");

jQuery(function ($) {
  function loadCodModal() {
    console.log("hi");

    var modal =
      '<div class="confirmation-modal">' +
      '<div class="modal-content">' +
      '<canvas id="qrcode" class="qr-code"></canvas>' +
      "<p>Send payment by scanning the QR code with your Flash App</p>" +
      '<button class="confirm-button">CLOSE</button>' +
      "</div>" +
      "</div>";

    $("body").append(modal);

    QRCode.toCanvas(
      document.getElementById("qrcode"),
      "paymentId=d7b120de-b310-41fa-bf7e-490e711d9172&amount=0.009678&address=0x9720e3B1690B5251fBfFd86d3bf15982ef967a4e&amountUSD=0.01",
      (e) => {
        console.log(e.message);
      }
    );

    $(".confirm-button").on("click", function () {
      $(".confirmation-modal").remove();
    });
  }
  loadCodModal();
});
