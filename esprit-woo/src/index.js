const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Pusher = require("pusher-js");
const { GelatoRelay } = require("@gelatonetwork/relay-sdk");

const pusher = new Pusher("56bc83149af81d0da2d4", { cluster: "ap1" });
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
        const opts = {
          margin: 0,
        };
        // example: paymentId=e6844694-b556-4133-a501-dafb915beee9&address=0x0ad11e8600b488aeF8F5E591edf32927c586883b&amount=200
        const dataURL = await QRCode.toDataURL(`paymentId=${paymentId}&address=${data.address}&amount=${data.amount}`, opts);
        // If the qrcode element exists, then don't append it. Needed or multiple qrcodes will get appended.
        if (!$(".esprit-container-container").length) {
          $(".esprit-container").append(
            `<div class="esprit-container-container"><img src=${dataURL} class="esprit-qrcode" /><div class="esprit-text-container"><div class="esprit-text-one">Pay with Esprit and earn an instant 2% cashback!</div><div class="esprit-text-two">To pay, scan the QR code with your Esprit App and confirm the payment. Leave this window open during payment.</div></div></div>`
          );
        }
        // If not subscribed, then subcribe. Needed or will execute multiple subscriptions and callback will be executed multiple times.
        let channels = await pusher.allChannels();
        let channelNames = channels.map((i) => i.name);
        if (!channelNames.includes(paymentId)) {
          console.log("pusher channel:", paymentId);
          const channel = pusher.subscribe(paymentId);
          channel.bind("payment-submitted", async (pusherData) => {
            let taskId = pusherData.message;
            console.log("pusher taskId:", taskId); // indicate Pusher message received; this should appear once to indicate we only subscribed once
            await pusher.unsubscribe(paymentId);

            // show process payment message
            $(".esprit-container-container").hide();
            $(".esprit-container").append(
              '<div class="esprit-processing-container"><div class="esprit-processing-one">Payment is processing...</div><div class="esprit-processing-two">(Please do not close this window)</div></div>'
            );
            // poll GelatoRelay for completed txn
            const relay = new GelatoRelay();
            const taskStatusPromise = new Promise((resolve, reject) => {
              const maxRetry = 100;
              let retryNum = 0;
              const interval = setInterval(async () => {
                retryNum++;
                if (retryNum > maxRetry) {
                  clearInterval(interval);
                  reject("Max retry reached");
                }
                const taskStatus = await relay.getTaskStatus(taskId);
                console.log("Task Status", taskStatus);
                if (taskStatus?.taskState == "ExecSuccess") {
                  clearInterval(interval);
                  resolve(taskStatus);
                }
              }, 500);
            });
            const taskStatus = await taskStatusPromise;
            console.log("taskStatus.taskState:", taskStatus.taskState);

            // click Place Order button if success
            // TODO: if taskState == "Cancelled", then display error modal
            if (taskStatus.taskState == "ExecSuccess") {
              $("#place_order").show();
              await new Promise((resolve) => setTimeout(resolve, 1000)); // seems neccessary
              $("#place_order").click();
            }
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
