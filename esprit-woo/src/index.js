const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Pusher = require("pusher-js");

const pusher = new Pusher("a29a22e46d485f5f2038", { cluster: "ap3" });
pusher.connection.bind("error", (e) => {
  console.error("Pusher connection error:", e);
});

jQuery(document).ready(($) => {
  function showQR() {
    var selectedPayment = $("input[name='payment_method']:checked").val();
    if (selectedPayment === "esprit_pay") {
      const paymentId = uuidv4();

      $(document).ajaxComplete(async () => {
        $("#place_order").hide();
        const dataURL = await QRCode.toDataURL(`paymentId=${paymentId}&amount=0.009678&address=${data.address}&amountUSD=${data.amount}`);
        // If the qrcode element exists, then don't append it. Needed or multiple qrcodes will get appended.
        if (!$(".esprit-qrcode").length) {
          $(".esprit-container").append(`<img src=${dataURL} class="esprit-qrcode" />`);
          $(".esprit-container").append(
            `<div class="esprit-text-container"><div class="esprit-text-one">Pay with Esprit and earn an instant 2% cashback!</div><div class="esprit-text-two">To pay, scan the QR code with your Esprit App and confirm the payment. Leave this window open during payment.</div></div>`
          );
        }
        // If not subscribed, then subcribe. Needed or will execute multiple subscriptions and callback will be executed multiple times.
        // subscribe to Pusher
        let channels = pusher.allChannels();
        if (!channels.includes(data.paymentId)) {
          const channel = pusher.subscribe("my-channel"); //data.paymentId
          channel.bind("my-event", async (message) => {
            alert(JSON.stringify(message));
            pusher.unsubscribe("my-channel"); //data.paymentId
            $("#place_order").show();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            $("#place_order").click();
          });
        }
      });
    } else {
      $(document).unbind("ajaxComplete");
      $("#place_order").show();
    }
  }
  showQR();

  // On payment method change
  $("form.checkout").on("change", 'input[name="payment_method"]', function () {
    selectedPayment = $(this).val();
    if (selectedPayment === "esprit_pay") {
      showQR();
    } else {
      $(document).unbind("ajaxComplete");
      $("#place_order").show();
    }
    $(document.body).trigger("update_checkout"); // not sure what this does
  });
});
