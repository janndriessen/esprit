const QRCode = require("qrcode");

jQuery(function ($) {
  function loadCodModal() {
    if ($(".confirmation-modal").length === 0) {
      var selectedPayment = $("input[name='payment_method']:checked").val();
      console.log("loadCodModal, payment method:", selectedPayment);

      var modal =
        '<div class="confirmation-modal">' +
        '<div class="modal-content">' +
        '<canvas id="qrcode" class="qr-code"></canvas>' +
        "<p>Send payment by scanning the QR code with your Flash App</p>" +
        '<button class="confirm-button">CLOSE</button>' +
        "</div>" +
        "</div>";

      if (selectedPayment === "cod") {
        $("body").append(modal);

        QRCode.toCanvas(
          document.getElementById("qrcode"),
          "paymentId=d7b120de-b310-41fa-bf7e-490e711d9172&amount=0.009678&address=0x9720e3B1690B5251fBfFd86d3bf15982ef967a4e&amountUSD=0.01",
          (e) => {
            console.log(e);
          }
        );

        $(".confirm-button").on("click", function () {
          $(".confirmation-modal").remove();
          // $(inputConfirmSel).val("1");
        });
      }
    }
  }
  // On load (on start)
  loadCodModal();

  // On payment method change
  $("form.checkout").on("change", 'input[name="payment_method"]', function () {
    selectedPayment = $(this).val();
    console.log("onChange payment method:", selectedPayment);

    if (selectedPayment === "cod") {
      loadCodModal();
    } else if ($('input[name="confirm_cod"]').length !== 0) {
      $('input[name="confirm_cod"]').remove();
    }
    // Update checkout on payment method change
    $(document.body).trigger("update_checkout");
  });
});
